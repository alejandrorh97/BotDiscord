const {enviarRespuesta, enviarLog} = require('../utils');
const mariadb = require('../db');

module.exports = {
	nombre: 'estatus',
	descripcion: 'Para ver estado del bot',
    args: false,
	admins: true,
    soloServer: true,
	borrable: true,
	categoria: "gestion",
	usos: "",
	async ejecutar(cliente,mensaje, args) {
		try {
			var db = new mariadb();
            var estado = await db.ping();
            if(estado) {
                enviarRespuesta(mensaje, "Base de datos disponible");
            }
            else {
                enviarRespuesta(mensaje, "Base de datos no disponible");
            }
		} catch (error) {
			console.error(`Error al procesar el comando ${this.nombre} \n${error}`);
			enviarLog({
                cliente: cliente,
                error: error,
                lugar: "comando -> ping",
                quien: mensaje.author.username,
                comando: mensaje
            });
		}
	}
};