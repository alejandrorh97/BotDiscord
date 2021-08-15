const {enviarLog} = require('../utils');

module.exports = {
	nombre: "msj",
	args: true,
    admins: true,
    soloServer: true,
    borrable: true,
    usos: "-d [canal donde se va enviar el mensaje] -q [Opcional, A quien mencionar] -m [El mensaje a enviarse]",
	descripcion: "Manda un mensaje hacia un canal",
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
