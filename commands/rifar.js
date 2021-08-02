const { MessageCollector } = require("discord.js");
const { prefix } = require("../config.json");

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
		for (arg of args) {
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
		if (isNaN(grupos)) {
			mensaje.reply("Ingresa una cantidad de grupos valido :rage:");
			return;
		}
		if (isNaN(cuantos)) {
			mensaje.reply("Ingresa una cantidad de personas valido :rage:");
			return;
		}

		var respuesta = mensaje.reply(
			`Ingresa ${
				cuantos * grupos
			} nombres que formaran los grupos, si faltan usa el comodin "vacio"`
		);

		var filter = (m) => {
			return m.author.id === mensaje.author.id;
		};
		var colector = new MessageCollector(mensaje.channel, filter, {
			max: cuantos * grupos,
			time: 1000 * (cuantos * 15)
		});

		colector.on("end", async (mensajes, estado) => {
			// mensajes es un una coleccion de mensajes
			try {
				var respuestaMensaje = await respuesta;
				//este if es para controlar si se acabo el tiempo y mandarle el mensaje
				respuestaMensaje.delete();
				if (estado === "time") {
					mensaje.reply(
						"Haz tardado demasiado en ingresar los nombre, comando cancelado :skull_crossbones:"
					);
					return;
				}
				var promesas = [];
				var quienes = [];
				for (var m of mensajes) {
					quienes.push(m[1].content);
					promesas.push(m[1].delete());
				}
				respuesta = mensaje.reply("Estoy viendo como se distribuyen los grupos espera... :thinking:");
				respuestaMensaje = await respuesta;
				await Promise.all(promesas);
				await respuestaMensaje.delete();
				var txt = "Los grupos quedan de la siguiente forma";
				for(let i = 0; i < grupos;i++){
					txt += `\n\tGrupo ${i+1}`;
					for (let j = 0; j < cuantos; j++) {
						let item = quienes.splice(Math.floor(Math.random * quienes.lenth),1);
						txt += `\n\t\t${item}`;
					}
				}
				mensaje.reply(txt);
			} catch (error) {
				console.log(error);
			}
		});
	},
};
