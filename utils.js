const { canallogs, server } = require('./config.json')

module.exports = {
	enviarMensaje({ cliente, server, canal, mensaje }) {
		try {
			cliente.guilds.cache
				.get(server)
				.channels.cache.get(canal)
				.send(mensaje);
		}
		catch (error) {
			console.error(`Error Utils.enviarMensaje \n${error}`);
		}
	},
	enviarRespuesta(mensajeds, mensaje) {
		try {
			return mensajeds.channel.send(`<@${mensajeds.author.id}> ${mensaje}`);
		} catch (error) {
			console.error(`Error Utils.enviarRespuesta \n${error}`);
		}
	},
	enviarLog({ cliente, error, lugar, quien, comando , accion}) {
		try {
			var menciones = new Map();
			let mensaje = "-------------------------------------------";
			mensaje += `\n\tFecha: ${new Date().toLocaleString()}`;
			mensaje += `\n\tLugar: ${lugar}`;
			if (quien) mensaje += `\n\tQuien: ${quien}`;
			if (accion) mensaje += `\n\tAccion: ${accion}`;
			if (comando){
				var comand = comando.content;
				comando.channel.send("No se que hiciste mal pero explote");
				if (comando.mentions.channels.first()) {
					for (const iterator of comando.mentions.channels) {
						menciones.set(`#${iterator[0]}`,iterator[1].name);
					}
				}
				if (comando.mentions.everyone) {
					comand=comand.replace(`@everyone`,`\\@everyone`);
				}
				if (comando.mentions.users.first()) {
					for (const iterator of comando.mentions.users) {
						menciones.set(`@!${iterator[0]}`,iterator[1].username);
					}
				}
				if (comando.mentions.roles.first()) {
					for (const iterator of comando.mentions.roles) {
						menciones.set(`@&${iterator[0]}`,iterator[1].name);
					}
				}
	
				for (const iterator of menciones) {
					if (iterator[0].startsWith('#')){
						comand=comand.replace(`<${iterator[0]}>`,`#${iterator[1]}`);
					}
					else if(iterator[0].startsWith('@!')){
						comand=comand.replace(`<${iterator[0]}>`,`@${iterator[1]}`);
					}
					else if(iterator[0].startsWith('@&')){
						comand=comand.replace(`<${iterator[0]}>`,`@${iterator[1]}`);
					}
					
				}
				mensaje+=`\n\tComando: ${comand}`;
			}
			
			cliente.guilds.cache
				.get(server)
				.channels.cache.get(canallogs)
				.send(mensaje);
			console.error("\n----------------------------------------------------");
			console.error(`${new Date().toLocaleString()} Error: ${error}`);
			console.error("----------------------------------------------------");
		} catch (error) {
			console.error(`Error Utils.enviarLog \t${error}`);
		}
	},

	formatearHora(date) {
		try {
			var hours = date.getHours();
			var minutes = date.getMinutes();
			var ampm = hours >= 12 ? "pm" : "am";
			hours = hours % 12;
			hours = hours ? hours : 12; // the hour '0' should be '12'
			minutes = minutes < 10 ? "0" + minutes : minutes;
			var strTime = hours + ":" + minutes + " " + ampm;
			return strTime;
		} catch (error) {
			console.error(`Error Utils.formatearHora \n${error}`);
		}
	},
	formatearFecha(fecha) {
		try {
			return `${fecha.getDate()}-${fecha.getMonth() + 1
				}-${fecha.getFullYear()} `;
		} catch (error) {
			console.error(`Error Utils.formatearFecha \n${error}`);
		}
	},
	horaNode(hora) {
		try {
			if (hora.includes("pm")) {
				vector = hora.split("pm");
				vector = vector[0].split(":");
				return ((parseInt(vector[0], 10) + 12).toString() + ":" + vector[1]);
			}
		} catch (error) {
			console.error(`Error Utils.horaNode \n${error}`);
		}
	}
}