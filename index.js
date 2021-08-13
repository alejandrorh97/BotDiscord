const Discord = require("discord.js");
const {
	prefix,
	token,
	server,
	canallogs,
	mensajereaccion,
} = require("./config.json");
const fs = require("fs");
const { enviarMensaje } = require("./utils");
const db = require("megadb");
const cron = require("node-cron");

//Creamos los objetos necesarios
const cliente = new Discord.Client({
	partials: ["MESSAGE", "CHANNEL", "REACTION"],
	intents: new Discord.Intents(32767),
});

cliente.comandos = new Discord.Collection();

//cargamos los comandos
let comandos = fs
	.readdirSync("./comandos")
	.filter((file) => file.endsWith(".js"));
for (let archivo of comandos) {
	let comando = require(`./comandos/${archivo}`);
	cliente.comandos.set(comando.nombre, comando);
}

//evento que se ejecuta al estar conectado a discord
cliente.on("ready", async () => {
	//cargar roles y guardar los id
	try {
		cliente.user.setPresence({
			activities: [{ name: `comandos en ${prefix}`, type: "LISTENING" }],
			status: "online"
		});

		cliente.roles = new Discord.Collection();
		let roles = cliente.guilds.cache.get(server).roles.cache;
		for (let rol of roles) {
			cliente.roles.set(rol[1].name, rol[0]);
		}

		cliente.reacciones = new Discord.Collection();
		let reacciones = new db.crearDB("reacciones");
		let materias = await reacciones.obtener("materias");
		for (let materia of materias) {
			cliente.reacciones.set(materia.emoji, materia.rol);
		}
		let { formatearFecha, formatearHora } = require("./utils");
		let date = new Date();
		/*enviarMensaje({
		cliente: cliente,
		canal: canallogs,
		server: server,
		mensaje: `Conectado: ${formatearFecha(date)} ${formatearHora(date)}`,
	});*/
		console.log("Ya estamos conectado a discord");
	} catch (error) {
		console.error(`No se ha podido cargar completamente el bot\n${error}`);
	}
});

cliente.on("messageCreate", async (mensaje) => {
	try {
		if (mensaje.author.bot) return; //si es mensaje de un bot se ignora
		let contenido = mensaje.content;
		if (contenido.startsWith(prefix)) {
			//extraer los argumentos
			let argumentos = contenido.slice(prefix.length).trim().split(" ");
			let borrable = mensaje.channel.type === "dm" ? true : false;
			let cual = argumentos.shift().toLowerCase();

			//ver si existe el comando
			if (!cliente.comandos.has(cual)) {
				if (!borrable) {
					await mensaje.delete(); //se borra el mensaje del que lo envio para mantener algo limpio
				}
				mensaje.channel.send(`<@${mensaje.author.id}> No era un comando :face_with_monocle:
            \nUsa el comando ${prefix}ayuda para ver los comandos disponibles`);
				return;
			}

			let comando = cliente.comandos.get(cual);

			if (comando.soloServer && mensaje.channel.type === "dm") {
				mensaje.channel.send(
					`<@${mensaje.author.id}> Solo puedes usar este comando en un servidor, no en mensaje privado :face_with_monocle:`
				);
				return;
			}

			//controlar que los comandos que solo admins pueden ejecutar
			if (comando.admins) {
				var permisos = mensaje.member.permissions.has("ADMINISTRATOR");
				if (!permisos) {
					if (!borrable) {
						await mensaje.delete(); //se borra el mensaje del que lo envio para mantener algo limpio
					}
					mensaje.channel.send(
						`<@${mensaje.author.id}>Me dijeron que no te hiciera caso :wink: :ok_hand:`
					);
				}
			}

			//se mira si se puede borrar el mensaje
			if (comando.borrable) {
				if (!borrable) await mensaje.delete();
			}

			//si el comando necesita argumentos y no se envio nada
			if (comando.args && !argumentos.length) {
				mensaje.channel.send(`<@${mensaje.author.id}> No has dado ningun argumento :triumph:
            \nEsta es la forma de usar el comando:\n ${comando.usos}`);
				return;
			}

			comando.ejecutar(cliente, mensaje, argumentos);
		}
	} catch (error) {
		console.error(`Hubo un error al procesar el mensaje ${error}`);
		mensaje.channel.send(`<@${mensaje.author.id}> Hubo un error al procesar el comando :man_shrugging:`);
		enviarMensaje({
			cliente: cliente,
			server: server,
			canal: canallogs,
			mensaje: `Comando Ejecutado ${mensaje.content}
                \n\tError ${error}
                \n--------------------------------------`,
		});
	}
});

cliente.on("messageReactionAdd", async (reaccion, usuario) => {
	if (usuario.bot) return;
	try {
		if (reaccion.message.id === mensajereaccion) {
			var emoji = reaccion._emoji.name;
			var quien = cliente.guilds.cache
				.get(server)
				.members.cache.get(usuario.id);
			var rol = cliente.reacciones.get(emoji);
			console.log({emoji, quien, rol});
			quien.roles.add(cliente.roles.get(rol));
		}
	} catch (error) {
		console.error(`1: Hubo un error al procesar la reaccion ${error}`);
		enviarMensaje({
			cliente: cliente,
			server: server,
			canal: canallogs,
			mensaje: `1: Error al tratar de agregar un rol ${usuario.username}
                \n\tError ${error}
                \n--------------------------------------`,
		});
	}
});


cliente.on("messageReactionRemove", async (reaccion, usuario) => {
	if (usuario.bot) return;
	try {
		if (reaccion.message.id === mensajereaccion) {
			var emoji = reaccion._emoji.name;
			var quien = cliente.guilds.cache
				.get(server)
				.members.cache.get(usuario.id);
			var rol = cliente.reacciones.get(emoji);
			quien.roles.remove(cliente.roles.get(rol));
		}
	} catch (error) {
		console.error(`1: Hubo un error al procesar la reaccion ${error}`);
		enviarMensaje({
			cliente: cliente,
			server: server,
			canal: canallogs,
			mensaje: `1: Error al tratar de agregar un rol ${usuario.username}
                \n\tError ${error}
                \n--------------------------------------`,
		});
	}
});

cliente.on('roleDelete', (rol) =>{
	cliente.roles.delete(rol.name);
});

cliente.on('roleCreate', (rol) =>{
	cliente.roles.set(rol.name, rol.id);
});

cliente.on('roleUpdate', (rol) => {

});

cliente.login(token);
