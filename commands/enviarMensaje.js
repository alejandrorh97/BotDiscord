module.exports = {
	nombre: "msj",
	args: true,
    admins: true,
    soloServer: true,
    borrable: true,
    usos: ``,
	descripcion: "Manda un mensaje hacia un canal",
	ejecutar(cliente, message, args) {
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

		var canales = message.mentions.channels;
		var quienes = "";
		if(message.mentions.everyone){
			quienes = "@everyone";
		}
		else if (message.mentions.users.first()){
			quienes = message.mentions.users.first().toString();
		}
		else if (message.mentions.roles.first()){
			quienes = message.mentions.roles.first().toString();
		}
		canales.forEach(element => {
			element.send(`${quienes} ${mensaje.join(' ')}`);
		});

	}
};
