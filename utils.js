const {canallogs,server} = require('./config.json')

module.exports = {
	enviarMensaje({ cliente, server, canal, mensaje }) {
		try{
			cliente.guilds.cache
			.get(server)
			.channels.cache.get(canal)
			.send(mensaje);
		}
		catch(error){
			console.error(`Error Utils.enviarMensaje \n${error}`);
		}
	},
	enviarRespuesta(mensajeds, mensaje){
		try {
			return mensajeds.channel.send(`<@${mensajeds.author.id}> ${mensaje}`);
		} catch (error) {
			console.error(`Error Utils.enviarRespuesta \n${error}`);
		}
	},
	enviarLog({cliente, error, lugar, quien, comando}){
		try {
			let mensaje = "-------------------------------------------";
			mensaje += `\n\t${new Date().toLocaleString()}`;
			mensaje += `\n\tLugar: ${lugar}`;
			mensaje += `\n\tError: ${error}`;
			if (quien) mensaje += `\n\tQuien: ${quien}`;
			if (comando) mensaje += `\n\tComando: ${comando}`;
			console.error(mensaje);
			cliente.guilds.cache
				.get(server)
				.channels.cache.get(canallogs)
				.send(mensaje);
		} catch (error) {
			console.error(`Error Utils.enviarLog \n${error}`);
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
				vector=hora.split("pm");
				vector=vector[0].split(":");
				return ((parseInt(vector[0],10)+12).toString()+":"+vector[1]);
			}
		} catch (error) {
			console.error(`Error Utils.horaNode \n${error}`);
		}
	}
}