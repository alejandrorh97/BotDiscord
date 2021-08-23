const DB = require('../db');
const { prefix } = require('../config.json');
const { MessageCollector } = require("discord.js");
const { enviarRespuesta, enviarLog, enviarMensaje } = require('../utils');


module.exports = {
    nombre: 'recordatorios',
    descripcion: 'Ver recordatorios existentes por materia y fecha o solo materia o fecha',
    args: true,
    admins: true,
    soloServer: true,
    borrable: true,
    categoria: "recordatorio",
    usos: '-m [rol de la materia] -f [fecha] ',
    async ejecutar(cliente, mensaje, args) {
        try {
            var materia = [];
            var fecha = [];
            var cual = '';

            for (const arg of args) {
                if (arg.startsWith('-')) {
                    cual = arg;
                    continue;
                }
                switch (cual) {
                    case '-m':
                        materia.push(arg);
                        break;
                    case '-f':
                        fecha.push(arg);
                        break;
                }
            }

            if (materia.length > 1) {
                enviarRespuesta(mensaje, "Solo una materia a la vez");
                return;
            }
            if (fecha.length > 1) {
                enviarRespuesta(mensaje, "Solo una fecha a la vez")
            }
            if (materia.length > 0) {
                var materias = Array.from(cliente.reacciones.values()).find(materia => materia === mensaje.mentions.roles.first().name);
                if (!materias) {
                    enviarRespuesta(mensaje, `Solo puedes modificar recordatorios de materias que actualmente estan en curso\nUsa el comando ${prefix}materias para ver las que estan disponibles`);
                    return;
                }
            }

            var db = new DB();
            db.conectar()
            if (materia != "" && fecha != "") {
                var contenido = await db.getRecordatoriosMateriaFecha(mensaje.mentions.roles.first().toString(),fecha[0]);
                var pos = 1;
                materia = mensaje.mentions.roles.first().name;
                var msj = ` Recordatorios para la materia **${materia}** con la fecha: ${fecha[0]} \n`;
            }
            else if (fecha != "") {
                var contenido = await db.getRecordatoriosFecha(fecha[0]);
                var pos = 1;
                var msj = ` Recordatorios para la fecha **${fecha[0]}**:\n`;
            }
            else if (materia != "") {
                var contenido = await db.getRecordatoriosMateria(mensaje.mentions.roles.first().toString());
                var pos = 1;
                materia = mensaje.mentions.roles.first().name;
                var msj = ` Recordatorios para la materia **${materia}**:\n`;
            }
            //Se imprimen las actividades por la materia mencionada
            
            var informacion = []
            if (contenido.length > 0) {
                for (var i of contenido) {
                    m = Object.values(i)
                    if (fecha!=""){
                        msj = msj + (`**${pos}-**Fecha:${m[1]}\tHora:${m[6]}\tMateria:${m[3]}\tActividad:${m[4]}\tMensaje:${m[5]}\tCanal: ${m[7]}\n`);
                    }else{
                        msj = msj + (`**${pos}-**Fecha:${m[1]}\tHora:${m[6]}\tActividad:${m[4]}\tMensaje:${m[5]}\tCanal: ${m[7]}\n`);
                    }
                    
                    pos++
                    informacion.push(m);
                }
                var respuesta = enviarRespuesta(mensaje, msj);
            } else {
                if (materia != "" && fecha != "") {
                    enviarRespuesta(mensaje, `No hay recordatorios para **${materia}** con fecha:${fecha[0]}`)
                }
                else if (materia != "") {
                    enviarRespuesta(mensaje, `No hay recordatorios para **${materia}**`)
                }
                else if (fecha != "") {
                    enviarRespuesta(mensaje, `No hay recordatorios con fecha: **${fecha[0]}**`)
                }
            }

        } catch (error) {
            console.error(`Error al procesar el comando ${this.nombre} \n${error}`);
            enviarLog(cliente, error, this.nombre, mensaje.author.username);
        }
    }
}