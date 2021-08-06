const sqlite = require("sqlite3");

module.exports = {
	enviarMensaje({ cliente, server, canal, mensaje }) {
		cliente.guilds.cache
			.get(server)
			.channels.cache.get(canal)
			.send(mensaje);
	},
	formatearHora(date) {
		var hours = date.getHours();
		var minutes = date.getMinutes();
		var ampm = hours >= 12 ? "pm" : "am";
		hours = hours % 12;
		hours = hours ? hours : 12; // the hour '0' should be '12'
		minutes = minutes < 10 ? "0" + minutes : minutes;
		var strTime = hours + ":" + minutes + " " + ampm;
		return strTime;
	},
	formatearFecha(fecha) {
		return `${fecha.getDate()}-${fecha.getMonth() + 1
			}-${fecha.getFullYear()} `;
	},
	horaNode(hora) {
		var str = "";
		if (hora.includes("pm")) {
			vector=hora.split("pm");
			vector=vector[0].split(":");
			return ((parseInt(vector[0],10)+12).toString()+":"+vector[1]);
		}
	}
}