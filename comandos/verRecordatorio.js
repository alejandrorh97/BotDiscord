const DB = require('../db');
const { prefix } = require('../config.json');
const { MessageCollector } = require("discord.js");
const { enviarRespuesta, enviarLog, enviarMensaje } = require('../utils');


module.exports = {
    nombre: 'recordatorios',
    descripcion: 'Ver recordatorios existentes por materia y fecha o solo materia o fecha',
    args: true,
    admins: false,
    soloServer: true,
    borrable: true,
    categoria: "recordatorio",
    usos: '-m [rol de la materia] -f [fecha] ',
    ejemplo: `${prefix}recordatorios -m @prueba -f 12/02/2021`,
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
                enviarRespuesta(mensaje, "Solo una fecha a la vez");
                return;
            }
            if (materia.length===0 && fecha.length===0){
                enviarRespuesta(mensaje,"No a ingresado una materia o fecha");
                return;
            }
            
            if (materia.length > 0) {
                var materias = Array.from(cliente.reacciones.values()).find(materia => materia === mensaje.mentions.roles.first().name);
                if (!materias) {
                    enviarRespuesta(mensaje, `Solo puedes modificar recordatorios de materias que actualmente estan en curso\nUsa el comando ${prefix}materias para ver las que estan disponibles`);
                    return;
                }
            }

            var db = new DB();
            if (materia != "" && fecha != "") {
                var fechas = fecha.join('').split('/');
                fechas = new Date(fechas[2], fechas[1]-1, fechas[0]);
                fechas = `${fechas.toISOString().slice(0,10)}`;
                var contenido = await db.getRecordatoriosFM(mensaje.mentions.roles.first().toString(),fechas);
                materia = mensaje.mentions.roles.first().name;
                var msj = ` Recordatorios para la materia **${materia}** con la fecha: ${fecha[0]} \n`;
            }
            else if (fecha != "") {
                var fechas = fecha.join('').split('/');
                fechas = new Date(fechas[2], fechas[1]-1, fechas[0]);
                fechas = `${fechas.toISOString().slice(0,10)}`;
                var contenido = await db.getRecordatoriosFecha(fechas);
                var msj = ` Recordatorios para la fecha **${fecha[0]}**:\n`;
            }
            else if (materia != "") {
                var contenido = await db.getRecordatoriosMateria(mensaje.mentions.roles.first().toString());
                materia = mensaje.mentions.roles.first().name;
                var msj = ` Recordatorios para la materia **${materia}**:\n`;
            }
            //Se imprimen las actividades por la materia mencionada
            
            if (contenido.length > 0) {
                var pos = 1;
                for (var i of contenido) {
                    if (fecha!=""){
                        msj = msj + (`**${pos}-** **Fecha:** ${i.fecha.toLocaleString().split(' ')[0]}\t**Hora:** ${i.hora}\t**Actividad:** ${i.actividad}\t**Mensaje:** ${i.mensaje}\t**Canal:** ${i.canal}\n`);
                    }else{
                        msj = msj + (`**${pos}-** **Fecha:** ${i.fecha.toLocaleString().split(' ')[0]}\t**Hora:** ${i.hora}\t**Actividad:** ${i.actividad}\t**Mensaje:** ${i.mensaje}\t**Canal:** ${i.canal}\n`);
                    }
                    msj += "\n"
                    pos++
                }
                enviarRespuesta(mensaje, msj);
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
            enviarLog({
                cliente: cliente,
                error: error,
                lugar: "comando -> recodatorios",
                quien: mensaje.author.username,
                comando: mensaje
            });
        }
    }
}