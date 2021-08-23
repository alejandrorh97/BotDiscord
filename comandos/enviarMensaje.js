const {enviarLog} = require('../utils');
const {prefix} = require('../config.json');

module.exports = {
	nombre: "msj",
	args: true,
    admins: true,
    soloServer: true,
    borrable: true,
	categoria: "gestion",
    usos: `-d: el canal donde enviar el mensaje
		-q: a quien mencionar, este es opcional
		-m: el mensaje`,
	descripcion: "Manda un mensaje hacia un canal",
	ejemplo: `${prefix}msj -d #bienvenidos -q @prueba -m esto es el mensaje`,
	ejecutar(cliente, mensaje, args) {
		try {
			var cual = "";
			var mensaje = [];
			for(var arg of args){
				if (arg.startsWith("-")) {
					cual = arg;
					continue;
				}
				switch (cual) {
					case '-m':
						mensaje.push(arg);
						break;
				}
			}
	
			var canales = mensaje.mentions.channels;
			var quienes = "";
			if(mensaje.mentions.everyone){
				quienes = "@everyone";
			}
			else if (mensaje.mentions.users.first()){
				quienes = mensaje.mentions.users.first().toString();
			}
			else if (mensaje.mentions.roles.first()){
				quienes = mensaje.mentions.roles.first().toString();
			}
			canales.forEach(element => {
				element.send(`${quienes} ${mensaje.join(' ')}`);
			});
		} catch (error) {
			enviarLog({
				cliente: cliente,
				error: error,
				lugar: "comando -> enviarMensaje",
				quien: mensaje.author.username,
				comando: mensaje.content
			})
		}
	}
};
