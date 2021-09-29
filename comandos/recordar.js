const DB = require('../db');
const {prefix} = require('../config.json');
const {enviarRespuesta, enviarLog} = require('../utils');

module.exports = {
	nombre: 'recordar',
	descripcion: 'Te recuerda sobre lo que quieras',
    args: true,
	admins: false,
    soloServer: true,
	borrable: true,
    categoria: "recordatorio",
	usos: `
    -f: fecha del recordatorio
    -r: titulo del recordatorio
    -m: rol de la materia
    -n: nota del recordatorio, es opcional
    -d: canal del recordatorio
    \nla fecha debe ir con el siguiente formato: dd-mm-aaaa
    la materia debe ser el rol de la materia, para ver los roles usa el comando ${prefix}materias`,
    ejemplo: `${prefix}recordar -f 29-08-2021 -r parcial 1 -m @prueba -n parcial sobre verduras -d #general`,
	async ejecutar(cliente,mensaje, args) {
		try {
            var fecha = [];
            var recordatorio = [];
            var materia = [];
            var nota = [];
            var donde = [];
            var hora = [];
            var cual = '';
            for (const arg of args) {
                if (arg.startsWith('-')){
                    cual = arg;
                    continue;
                }
                switch (cual){
                    case '-f':
                        fecha.push(arg);
                        break;
                    case '-r':
                        recordatorio.push(arg);
                        break;
                    case '-m':
                        materia.push(arg);
                        break;
                    case '-n':
                        nota.push(arg);
                        break;
                    case '-d':
                        donde.push(arg);
                        break;
                }
            }
            //validamos que esten los argumentos correctamente
            if (fecha.length === 0){
                enviarRespuesta(mensaje, "Debes poner una fecha para que te recuerde");
                return;
            }
            if (fecha.length > 1) {
                enviarRespuesta(mensaje, "Solo una fecha a la vez");
                return;
            }
            if (recordatorio.length === 0){
                enviarRespuesta(mensaje, "Debes poner un recordatorio");
                return; 
            }
            if (materia.length === 0){
                enviarRespuesta(mensaje, "Debes poner un rol de materia para recordarles");
                return; 
            }
            if (materia > 1) {
                enviarRespuesta(mensaje, "Solo una materia a la vez");
                return;
            }
            if (donde.length === 0){
                enviarRespuesta(mensaje, "Debes agregar un lugar a donde quieres que te mande el recordatorio");
                return;
            }
            if (donde.length > 1) {
                enviarRespuesta(mensaje, "Solo un canal a la vez")
                return;
            }
            var materias = Array.from(cliente.reacciones.values()).find(materia => materia === mensaje.mentions.roles.first().name);
            if (!materias) {
                enviarRespuesta(mensaje, `Solo puedes agregar recordatorios de materias que actualmente estan en curso\nUsa el comando ${prefix}materias para ver las que estan disponibles`);
                return;
            }

            //preparamos los datos
            materia = mensaje.mentions.roles.first().toString();
            var idcanal = mensaje.mentions.channels.first().id;
            var usuario = mensaje.author.username
            donde = mensaje.mentions.channels.first().toString();
            fecha = fecha.join('').split('-');
            recordatorio = recordatorio.join(' ');
            nota = nota.join(' ');
            var db = new DB();
            fecha = new Date(fecha[2], fecha[1]-1, fecha[0]);
            db.setRecordatorios(
                {
                    fecha: `${fecha.toISOString().slice(0,10)}`,
                    fecha_node: `* * ${fecha.getDate()} ${fecha.getMonth()+1} *`,
                    materia: materia,
                    actividad: recordatorio,
                    mensaje: nota,
                    hora: '00:00',
                    canal: donde,
                    id_canal: idcanal,
                    usuario: usuario
                }
            );
            enviarRespuesta(mensaje,`Se ha guardado tu recordatorio para ${fecha.toISOString().slice(0,10)}`);
        } catch (error) {
            enviarLog({
                cliente: cliente,
                error: error,
                lugar: "comando -> recordar",
                quien: mensaje.author.username,
                comando: mensaje
            });
        }
	}

};