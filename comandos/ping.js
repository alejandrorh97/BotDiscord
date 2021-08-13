/*
	args: se usa para saber si el comando necesita argumentos,
		si no se proporciona ninguno mande el mensaje que no introdujo argumentos
	
	soloserver: se usa para que el comando solo funcione en un servidor y no en un mensaje privado

	borrable: se usa para borrar el mensaje de la persona y dejar un poco limpio
*/
const {enviarRespuesta, enviarLog} = require('../utils');

module.exports = {
	nombre: 'ping',
	descripcion: 'Ping!',
    args: false,
	admins: false,
    soloServer: false,
	borrable: false,
	usos: "",
	ejecutar(cliente,mensaje, args) {
		try {
			enviarRespuesta(mensaje, 'Pong.');
		} catch (error) {
			console.error(`Error al procesar el comando ${this.nombre} \n${error}`);
			enviarLog(cliente, error, this.nombre, mensaje.author.username);
		}
	}
};