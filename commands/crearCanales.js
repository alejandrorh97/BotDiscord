var fs = require("fs");
var {canalreacciones,server} = require('../config.json')
var {Permissions} = require('discord.js')

module.exports = {
	nombre: "crearmateria",
	descripcion: "Crear la categoria, canales texto y voz",
	args: true,
	soloServer: true,
	borrable: false,
	usos: "-n [nombre de la materia] -r [rol para la materia] -e [emoji para la reaccion]",
	ejecutar(cliente, message, args) {
		//ver si puede solo admins
		var perms = message.member.hasPermission("ADMINISTRATOR");
		if (!perms) {
			return message.reply(
				"Me dijeron que no te hiciera caso :wink: :ok_hand:"
			);
		}
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
			var cual = cliente.rolsitos.get(i);
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
							cliente.rolsitos.set(
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

							//guardamos el canal
							cliente.canales.set(channel.name, channel);

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
									fs.readFile('reacciones.json','utf8',function c(err, data){
										if(err){
											console.log(err);
										}
										else {
											let reacciones = JSON.parse(data);
											let reaccion = `${emoji[0]} ${rol[0]}`
											reacciones.tabla.push({reaccion: reaccion});
											fs.writeFile('reacciones.json',JSON.stringify(reacciones),'utf8',function(err) {
												if (err) throw err;
												cliente.reacciones.set(emoji[0],rol[0]);
												}
											);
										}
									});
								});
						});
					message.guild.channels
						.create("voz " + concatenado, {
							type: "voice",
							permissionOverwrites: roles,
						})
						.then((channel) => {
							let category = cliente.channels.cache.find(
								(c) =>
									c.name == concatenado &&
									c.type == "category"
							);
							if (!category)
								throw new Error("No existia la categoria");
							channel.setParent(category.id);
						});
					message.reply("Se han creado los canales y el rol");
				})
				.catch((resultado) => {
					throw resultado;
				});
		});
	}
};
