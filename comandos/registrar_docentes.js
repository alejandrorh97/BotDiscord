const {enviarRespuesta, enviarLog, enviarMensaje} = require('../utils');
const megadb = require("megadb");

module.exports = {
	nombre: 'registrardoc',
	descripcion: 'Registra tu nombre para algunas funciones extras, No usaremos tus datos para nada malo :v',
    args: true,
	admins: false,
    soloServer: false,
	borrable: true,
	categoria: "gestion",
	usos: "-n Nombre del docente -m materia que da -r rol que se asigno",
	ejecutar(cliente,mensaje, args) {
		try {
            var nombre = [];
            var materia = [];
            var rol = ""
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
                    case '-m':
                        materia.push(arg);
                        break;
                    case '-r':
                        rol = arg;
                        break
                }
            }
            nombre = nombre.join(' ');
            materia = materia.join(' ');
            var sujetos = new megadb.crearDB('docentes');
            sujetos.establecer(rol, {
                nombre: nombre,
                materia: materia
            })
            mensaje.channel.send(`<@${mensaje.author.id}> datos del docente guardados`);
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