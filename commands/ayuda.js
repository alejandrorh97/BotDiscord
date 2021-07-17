const { prefix } = require("../config.json");
const {MessageEmbed} = require('discord.js');

module.exports = {
	nombre: "ayuda",
	descripcion: "Lista todos los comando disponibles.",
	args: false,
	soloServer: false,
	usos: "[comando]",
	ejecutar(cliente,mensaje, args) {
		let datos = [];
		let { commands } = mensaje.client;
		let embebido = new MessageEmbed();
		embebido.setColor("RED");
		if (!args.length) {
			embebido.setTitle("Comandos disponibles");
			for (let comando of commands){
				embebido.addField(`${prefix}${comando[1].nombre}`,comando[1].descripcion);
			}
			embebido.addField("Mas informacion",`Utiliza ${prefix}ayuda [comando] para obtener mas informacion sobre ese comando`);
		}
		else if(args.length >= 2){
			embebido.addField("Error","Muchos parametros solo 1");
		}
		else {
			if(commands.has(args[0])){
				comando = commands.get(args[0])
				embebido.setTitle(`Comando ${args[0]}`);
				embebido.addField("Descripcion",comando.descripcion);
				embebido.addField("Uso",`${prefix}${args[0]} ${comando.usos}`);
			}
			else{
				embebido.addField("No existe el comando","");
			}
		}
		mensaje.channel.send(embebido);
	},
};
