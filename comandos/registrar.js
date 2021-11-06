const {enviarLog} = require('../utils');
const megadb = require("megadb");

module.exports = {
	nombre: 'registrar',
	descripcion: 'Registra tu nombre para algunas funciones extras, No usaremos tus datos para nada malo :v',
    args: true,
	admins: false,
    soloServer: false,
	borrable: true,
	categoria: "gestion",
	usos: "-n Tu nombre -a Tu apellidos -c Tu carnet",
	ejecutar(cliente,mensaje, args) {
		try {
            var nombre = [];
            var apellido = [];
            var carnet = "";
			var cual = "";
            for (const arg of args) {
                if (arg.startsWith('-')){
                    cual = arg;
                    continue;
                }
                switch(cual){
                    case '-n':
                        nombre.push(arg);
                        break;
                    case '-a':
                        apellido.push(arg);
                        break;
                    case '-c':
                        carnet = arg;
                        break;
                }
            }
            nombre = nombre.join(' ');
            apellido = apellido.join(' ');

            if(nombre.length === 0 || apellido.length === 0 || carnet === 0){
                mensaje.channel.send(`<@${mensaje.author.id}> da tus datos bien >:v`);
                return;
            }

            var sujetos = new megadb.crearDB('sujetos');
            sujetos.establecer(mensaje.author.id, {
                nombre: nombre,
                apellido: apellido,
                carnet: carnet
            })
            mensaje.channel.send(`<@${mensaje.author.id}> tus datos se han guardado`);
		} catch (error) {
            enviarLog({
                cliente: cliente,
                lugar: "registrar",
                error: error,
                quien: mensaje.author.username,
                comando: mensaje
            })
		}
	}
};