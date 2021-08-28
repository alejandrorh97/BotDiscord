var megadb = require("megadb");
var { prefix, canalReaccionesId, server,db } = require("../config.json");
var { Permissions } = require("discord.js");
const {enviarLog, enviarRespuesta} = require('../utils');

module.exports = {
	nombre: "crearmateria",
	descripcion: "Crear la categoria, canales texto y voz",
	args: true,
	admins: true,
	soloServer: true,
	borrable: false,
	categoria: "materia",
	usos: "-n: nombre de la materia \n-r: nombre del rol para la materia \n-e: emoji para la reaccion",
	ejemplo: `${prefix}crearmateria -n Introduccion a la programacion -r introProgra -e 💻`,
	async ejecutar(cliente, mensaje, args) {
		try{
			//sacamos los parametros
			var nombre = [];
			var rol = [];
			var emoji = "";
			var cual = "";
			for (let arg of args) {
				if (arg.startsWith("-")) {
					cual = arg;
					continue;
				}
				switch (cual) {
					case "-n":
						nombre.push(arg);
						break;
					case "-r":
						rol.push(arg);
						break;
					case "-e":
						emoji = arg;
						break;
				}
			}
			nombre = nombre.join(" ");

			if (nombre.length === 0 || rol.length === 0 || emoji.length === 0) {
				mensaje.reply(`No has ingresado correctamente los argumentos
				${this.usos}`);
			}
			let roles = [];
			for (let r of rol) {
				var cual = cliente.roles.get(r);
				if (cual) {
					roles.push({type: 'role', id: cual, allow: [Permissions.FLAGS.VIEW_CHANNEL]})
				}
				else {
					var respuesta = await mensaje.guild.roles.create(
						{
							name: r,
							mentionable: true
						}
					);
					cliente.roles.set(respuesta['name'], respuesta['id']);
					roles.push({type: 'role', id: respuesta['id'], allow: [Permissions.FLAGS.VIEW_CHANNEL]});
				}
			}
			roles.push({type: 'member', id: cliente.user.id, allow: [Permissions.FLAGS.VIEW_CHANNEL]});
			roles.push({type: 'role', id: server, deny: [Permissions.FLAGS.VIEW_CHANNEL]});
			let categoria = await mensaje.guild.channels.create(nombre, {
				type: 'GUILD_CATEGORY',
				permissionOverwrites: roles
			});
			let txt = await mensaje.guild.channels.create(`texto ${nombre}`,{
				type: "GUILD_TEXT",
				permissionOverwrites: roles,
			});
			txt.setParent(categoria.id);
			let canalReacciones = cliente.channels.cache.get(canalReaccionesId);
			let mensajes = await canalReacciones.messages.fetch({limit: 1});
			let msj = mensajes.first();
			let contenido = msj.content;
			contenido += `\n\n${emoji}: ${nombre}`;
			msj.edit(contenido);
			msj.react(emoji);
			let materias = new megadb.crearDB(db);
			materias.push('materias', {
				materia: nombre,
				emoji: emoji,
				rol: rol[0]
			});
			let voz = await mensaje.guild.channels.create(`voz ${nombre}`,{
				type: "GUILD_VOICE",
				permissionOverwrites: roles,
			});
			voz.setParent(categoria.id);
			enviarRespuesta(mensaje, "Se han creado las materias y todo lo demas");
		}
		catch(error) {
			enviarLog({
				cliente: cliente,
				lugar: "comando -> crearMateria",
				error: error,
				quien: mensaje.author.username,
				comando: mensaje
			})
		}
}

};
