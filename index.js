const Discord = require("discord.js");
const { prefix, token, server, mensajereaccion } = require("./config.json");
const fs = require("fs");
const { enviarLog, enviarMensaje } = require("./utils");
const db = require("megadb");

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
			status: "online",
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
		const cron = require("node-cron");
		cron.schedule("0 10 * * *", (hora) => {
			enviarMensaje(
				{
					cliente: cliente,
					server: server,
					canal: '875857711684788255',
					mensaje: "estamos probando los recordatorios"
				}
			);
		});
		console.log("Ya estamos conectado a discord");
		fs.appendFile(
			"historialComandos.txt",
			`\n---------------------${new Date().toLocaleString()}`,
			(error) => {
				if (error) console.error(error);
			}
		);
	} catch (error) {
		console.error(
			`index: No se ha podido cargar completamente el bot\n${error}`
		);
	}
});

cliente.on("messageCreate", async (mensaje) => {
	try {
		if (mensaje.author.bot) return; //si es mensaje de un bot se ignora
		if (mensaje.channel.type === "DM") {
			mensaje.channel.send(
				"Solo puedes usar comandos en servers donde este yo"
			);
			return;
		}
		let contenido = mensaje.content;
		if (contenido.startsWith(prefix)) {
			fs.appendFile(
				"historialComandos.txt",
				`\n${new Date().toLocaleString()} Quien: ${
					mensaje.author.username
				} Comando: ${mensaje.content}`,
				(error) => {
					if (error) console.error(error);
				}
			);
			//extraer los argumentos
			let argumentos = contenido.slice(prefix.length).trim().split(" ");
			let borrable = mensaje.channel.type === "dm" ? true : false;
			let cual = argumentos.shift().toLowerCase();

			//ver si existe el comando
			if (!cliente.comandos.has(cual)) {
				if (!borrable) {
					await mensaje.delete(); //se borra el mensaje del que lo envio para mantener algo limpio
				}
				mensaje.channel
					.send(`<@${mensaje.author.id}> No era un comando :face_with_monocle:
            \nUsa el comando ${prefix}ayuda para ver los comandos disponibles`);
				return;
			}

			let comando = cliente.comandos.get(cual);

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
				mensaje.channel
					.send(`<@${mensaje.author.id}> No has dado ningun argumento :triumph:
Esta es la forma de usar el comando:\n ${comando.ejemplo}`);
				return;
			}
			comando.ejecutar(cliente, mensaje, argumentos);
		}
	} catch (error) {
		mensaje.channel.send(
			`<@${mensaje.author.id}> Hubo un error al procesar el comando :man_shrugging:`
		);
		enviarLog({
			cliente: cliente,
			error: error,
			lugar: "index.mensajeRecibo",
			quien: mensaje.author.username,
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
			quien.roles.add(cliente.roles.get(rol));
		}
	} catch (error) {
		enviarLog({
			cliente: cliente,
			error: error,
			lugar: "index.darRol",
			quien: usuario.username,
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
		enviarLog({
			cliente: cliente,
			error: error,
			lugar: "index.quitarRol",
			quien: usuario.username,
		});
	}
});

cliente.login(token);
