const db = require("megadb");
const { MessageEmbed } = require("discord.js");
const { enviarRespuesta, enviarLog } = require("../utils");
module.exports = {
	nombre: "materias",
	descripcion: "Muestra las materias del ciclo actual",
	args: false,
	admins: false,
	soloServer: true,
	borrable: true,
	categoria: "materia",
	usos: "Solo llamalo",
	async ejecutar(cliente, mensaje, args) {
		try {
			var datos = new db.crearDB("reacciones");
			var materias = await datos.obtener("materias");
			if (materias.length !== 0) {
				let embebido = new MessageEmbed();
				embebido.setTitle("Materias Disponibles");
				for (const materia of materias) {
					embebido.addField(materia.materia, `Rol: ${materia.rol}`);
				}
				embebido.setColor("GOLD");
				mensaje.channel.send({embeds: [embebido]});
			}
			else {
				enviarRespuesta(mensaje, "No hay materia actualmente");
			}

		} catch (error) {
			enviarLog({
				cliente: cliente,
				error: error,
				lugar: "comando -> materia",
				quien: mensaje.author.username,
				comando: mensaje
			})
		}
        
	},
};
