const DB = require('../db');
const {prefix} = require('../config.json');

module.exports = {
	nombre: 'recordar',
	descripcion: 'Te recuerda sobre lo que quieras',
    args: true,
	admins: false,
    soloServer: true,
	borrable: true,
	usos: `-f [fecha del recordatorio] -r [nombre del recordatorio] -m [rol de la materia] -n [nota opcional] -d [canal donde enviar el recordatorio]
    \nla fecha debe ir con el siguiente formato: dd/mm/aaaa
    \nla materia debe ser el rol de la materia, para ver los roles usa el comando `,
	async ejecutar(cliente,mensaje, args) {
		var fecha = [];
        var recordatorio = [];
        var materia = [];
        var nota = [];
        var donde = [];
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
            mensaje.reply("Debes poner una fecha para que te recuerde");
            return;
        }
        if (fecha.length > 1) {
            mensaje.reply("Solo una fecha a la vez");
            return;
        }
        if (recordatorio.length === 0){
            mensaje.reply("Debes poner un recordatorio");
            return; 
        }
        if (materia.length === 0){
            mensaje.reply("Debes poner un rol de materia para recordarles");
            return; 
        }
        if (materia > 1) {
            mensaje.reply("Solo una materia a la vez");
            return;
        }
        if (donde.length === 0){
            mensaje.reply("Debes agregar un lugar a donde quieres que te mande el recordatorio");
            return;
        }
        if (donde.length > 1) {
            mensaje.reply("Solo un canal a la vez")
            return;
        }

        for(var rol of cliente.reacciones.values()){
            if (rol !== mensaje.mentions.roles.first().name) {
                mensaje.reply(`Solo puedes agregar recordatorios de materias que actualmente estan en curso\nUsa el comando ${prefix}materias para ver las que estan disponibles`);
                return;
            }
        }
        //preparamos los datos
        materia = mensaje.mentions.roles.first().toString();
        var idcanal = mensaje.mentions.channels.first().id;
        var usuario = mensaje.author.username
        donde = mensaje.mentions.channels.first().toString();
        fecha = fecha.join('').split('/');
        recordatorio = recordatorio.join(' ');
        nota = nota.join(' ');
        var db = new DB();
        db.conectar();
        fecha = new Date(fecha[2], fecha[1]-1, fecha[0]);
        await db.setRecordatorios(
            {
                fecha: `${fecha.toISOString().slice(0,10)}`,
                fechanode: `0 0 ${fecha.getDate()} ${fecha.getMonth()+1} *`,
                materia: materia,
                actividad: recordatorio,
                mensaje: nota,
                hora: '00:00',
                canal: donde,
                idcanal: idcanal,
                usuario: usuario
            }
        );
        mensaje.reply(`Se ha guardado tu recordatorio para ${fecha.toISOString().slice(0,10)}`);
	}

};