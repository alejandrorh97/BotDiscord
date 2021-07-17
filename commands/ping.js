module.exports = {
	nombre: 'ping',
	descripcion: 'Ping!',
    args: false,
    soloServer: false,
	usos: "",
	ejecutar(cliente,mensaje, args) {
		mensaje.channel.send('Pong.');
	},
};