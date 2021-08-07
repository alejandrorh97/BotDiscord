const db = require('megadb');
module.exports = {
	nombre: 'materias',
	descripcion: 'Muestra las materias del ciclo actual',
    args: false,
	admins: false,
    soloServer: true,
	borrable: true,
	usos: "Solo llamalo",
	async ejecutar(cliente,mensaje, args) {
		var texto = "Las materias disponibles son:"
        var datos = new db.crearDB('reacciones');
        var materias = await datos.obtener('materias');
        for (let materia of materias) {
            texto += `\n\tMateria: ${materia.materia} \t\t\tRol: ${materia.rol}`
        }
        mensaje.reply(texto);
	}
};