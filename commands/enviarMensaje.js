module.exports = {
	nombre: "msj",
	args: true,
    admins: true,
    soloServer: true,
    borrable: true,
    usos: ``,
	descripcion: "Manda un mensaje hacia un canal",
	ejecutar(cliente, message, args) {
		let texto = args.join(" ");
		cliente.channels.cache.get(canalreacciones).send(texto);
	}
};
