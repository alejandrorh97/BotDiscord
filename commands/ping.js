module.exports = {
	nombre: 'ping',
	descripcion: 'Ping!',
    args: false,
    soloServer: false,
	usos: "",
	ejecutar(mensaje, args) {
		mensaje.channel.send('Pong.');
	},
};