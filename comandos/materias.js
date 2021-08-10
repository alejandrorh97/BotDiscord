const db = require('megadb');
const {MessageEmbed} = require('discord.js');
module.exports = {
	nombre: 'materias',
	descripcion: 'Muestra las materias del ciclo actual',
    args: false,
	admins: false,
    soloServer: true,
	borrable: true,
	usos: "Solo llamalo",
	async ejecutar(cliente,mensaje, args) {
        var datos = new db.crearDB('reacciones');
        var materias = await datos.obtener('materias');
        let embebido = new MessageEmbed();
        embebido.setTitle("Materias Disponibles");
        for (const materia of materias) {
            embebido.addField(materia.materia, `Rol: ${materia.rol}`);
        }
        embebido.setColor('GOLD');
        mensaje.channel.send(embebido);
	}
};