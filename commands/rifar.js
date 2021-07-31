const {MessageCollector} = require("discord.js");
const {prefix} = require('../config.json');
module.exports = {
	nombre: "rifar",
	descripcion: "Comando para crear grupos y rifar con quien van",
	args: true,
	soloServer: true,
	borrable: true,
	usos: `-grupos [Cuantos grupos hay que formar] -cuantos [cuanto va a haber en cada grupo]`,
	ejecutar(cliente, mensaje, args) {
		var grupos = 0;
		var cuantos = 0;
		var cual = "";
		for(arg of args){
			if (arg.startsWith("-")) {
				cual = arg;
				continue;
			}
			switch (cual) {
				case "-grupos":
					grupos = parseInt(arg);
					break;
				case "-cuantos":
					cuantos = parseInt(arg);
					break;
			}
		}
		if (isNaN(grupos)){
			mensaje.reply("Ingresa un numero de grupos valido :rage:");
			return;
		}
		if (isNaN(cuantos)){
			mensaje.reply("Ingresa un numero de personas valido :rage:");
			return;
		}
		mensaje.reply(`Ingresa ${cuantos * grupos} nombres que formaran los grupos, si faltan usa el comodin "vacio"`)
		var filter = m => {
			return m.author.id === mensaje.author.id;
		}
		var colector = new MessageCollector(mensaje.channel, filter, {
			max: cuantos * grupos,
			time: 1000 * 60 
		});

		colector.on('end', mensajes => {
			// mensajes es un una coleccion de mensajes
			for(var m of mensajes){
				console.log(m)
			}
		});
	}
};