var {canalreacciones} = require('../config.json')
module.exports = {
	nombre: "msj",
	descripcion: "Tendria que mandar un msj a otro canal :v ",
	ejecutar(cliente, message, args) {
		let texto = args.join(" ");
		cliente.channels.cache.get(canalreacciones).send(texto);
	}
};
