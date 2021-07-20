const { Client, MessageEmbed } = require("discord.js");

module.exports = {
	nombre: "crearmateria",
	descripcion: "Crear la categoria, canales texto y voz",
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
			}
		}
		var concatenado = nombre.join(" ");
		//asignamos los roles
        var promesas = []
		var roles = [];
		for (var i of rol) {
            var cuak = cliente.rolsitos.get(i);
			if (cuak) {
				roles.push({ id: cliente.rolsitos.get(i) });
			} else {
                //se manda a crear los roles
				promesas.push(message.guild.roles
					.create({
						data: {
							name: i,
						}
					})
					.then((respuesta) => {
						cliente.rolsitos.set(
							respuesta["name"],
							respuesta["id"]
						);
						roles.push({ id: respuesta["id"] });
					}));
			}
		}
		//creo la categoria
		Promise.all(promesas).then(respuesta =>{
            message.guild.channels
			.create(concatenado, {
				type: "category",
				permissionOverwrites: roles,
			})
			.then((respuesta) => {
				//creo el canal de texto
				message.guild.channels
					.create("texto " + concatenado, {
						type: "text",
						permissionOverwrites: roles,
					})
					.then((channel) => {
						let category = cliente.channels.cache.find(
							(c) => c.name == concatenado && c.type == "category"
						);

						if (!category)
							throw new Error("No existia la categoria");
						channel.setParent(category.id);
					});
				message.guild.channels
					.create("voz " + concatenado, {
						type: "voice",
						permissionOverwrites: roles,
					})
					.then((channel) => {
						let category = cliente.channels.cache.find(
							(c) => c.name == concatenado && c.type == "category"
						);
						if (!category)
							throw new Error("No existia la categoria");
						channel.setParent(category.id);
					});
			})
			.catch(resultado => {
				message.reply("Al parecer hubo un error");
			});
        });
	},
};
