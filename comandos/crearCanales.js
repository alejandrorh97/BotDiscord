var db = require('megadb');
var {canalreacciones,server} = require('../config.json')
var {Permissions} = require('discord.js')

module.exports = {
	nombre: "crearmateria",
	descripcion: "Crear la categoria, canales texto y voz",
	args: true,
	admins: true,
	soloServer: true,
	borrable: false,
	usos: "-n [nombre de la materia] -r [rol para la materia] -e [emoji para la reaccion]",
	ejecutar(cliente, message, args) {
		//sacamos los parametros
		var nombre = [];
		var rol = [];
		var emoji = [];
		var cual = "";
		for (var i = 0; i < args.length; i++) {
			if (args[i].startsWith("-")) {
				cual = args[i];
				continue;
			}
			switch (cual) {
				case "-n":
					nombre.push(args[i]);
					break;
				case "-r":
					rol.push(args[i]);
					break;
				case "-e":
					emoji.push(args[i]);
					break;
			}
		}
		
		if (nombre.length === 0 && rol.length === 0 && emoji.length === 0 ){
			message.reply("No has puesto ningun parametro valido");
			return;
		}
		var concatenado = nombre.join(" ");
		//asignamos los roles
		var promesas = [];
		var roles = [];
		for (var i of rol) {
			var cual = cliente.roles.get(i);
			if (cual) {
				roles.push({type: 'role', id: cual, allow: [Permissions.FLAGS.VIEW_CHANNEL]});
			} else {
				//se manda a crear los roles
				promesas.push(
					message.guild.roles
						.create({
							data: {
								name: i,
							},
						})
						.then((respuesta) => {
							cliente.roles.set(
								respuesta["name"],
								respuesta["id"]
							);
							roles.push({type: 'role', id: respuesta["id"], allow: [Permissions.FLAGS.VIEW_CHANNEL]});
						})
						.catch( error => {
							throw error;
						})
				);
			}
		}
		//creo la categoria
		Promise.all(promesas).then((respuesta) => {
			roles.push({type: 'member', id: cliente.user.id, allow: [Permissions.FLAGS.VIEW_CHANNEL]});
			roles.push({type: 'role', id: server, deny: [Permissions.FLAGS.VIEW_CHANNEL]});
			message.guild.channels
				.create(concatenado, {
					type: "category",
					permissionOverwrites: roles,
				})
				.then( categoria => {
					//creo el canal de texto
					message.guild.channels
						.create("texto " + concatenado, {
							type: "text",
							permissionOverwrites: roles,
						})
						.then((channel) => {
							channel.setParent(categoria.id);

							//crear el mensaje para que reaccionen
							let reacciones = cliente.channels.cache.get(
								canalreacciones
							);
							reacciones.messages
								.fetch({ limit: 1 })
								.then((mensaje) => {
									let msjReaccion = mensaje.first();
									let contenido = msjReaccion.content;
									contenido += `\n\n${emoji[0]}: ${concatenado}`;
									msjReaccion.edit(contenido);
									msjReaccion.react(emoji[0]);
									let materia = new db.crearDB('reacciones');
									materia.push('materias', {
										materia: concatenado,
										emoji: emoji[0],
										rol: rol[0]
									});
								});
						});
					message.guild.channels
						.create("voz " + concatenado, {
							type: "voice",
							permissionOverwrites: roles,
						})
						.then((channel) => {
							channel.setParent(categoria.id);
						});
					message.reply("Se han creado los canales y el rol");
				});
		});
	}
};
