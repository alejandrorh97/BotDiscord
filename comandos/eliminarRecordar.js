const DB = require('../db');
const { prefix } = require('../config.json');
const { MessageCollector } = require("discord.js");
const { enviarRespuesta, enviarLog, enviarMensaje } = require('../utils');

module.exports = {
    nombre: 'delrecordatorio',
    descripcion: 'eliminar un recordatorio existente',
    args: true,
    admins: false,
    soloServer: true,
    borrable: true,
    categoria: "recordatorio",
    usos: '-m [rol de la materia]',
    ejemplo: `${prefix}modrecordatorio -m @prueba`,
    async ejecutar(cliente, mensaje, args) {
        try {
            var materia = [];
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
                }
            }

            if (materia.length > 1) {
                enviarRespuesta(mensaje,"Solo una materia a la vez");
                return;
            }
            if (materia.length===0){
                enviarRespuesta(mensaje,"No a ingresado una materia");
                return;
            }

            var materias = Array.from(cliente.reacciones.values()).find(materia => materia === mensaje.mentions.roles.first().name);
            if (!materias) {
                enviarRespuesta(mensaje, `Solo puedes eliminar recordatorios de materias que actualmente estan en curso\nUsa el comando ${prefix}materias para ver las que estan disponibles`);
                return;
            }

            var db = new DB();
            var contenido = await db.getRecordatoriosMateria(mensaje.mentions.roles.first().toString());
            var pos = 1;
            materia = mensaje.mentions.roles.first().name;
            var bandera = false;
            var msj = ` Seleccione el recordatorio a eliminar para la materia **${materia}**:\n`;
            //Se imprimen las actividades por la materia mencionada
            var informacion = []
            for (var i of contenido) {
                msj = msj + (`**${pos}-** **Fecha:** ${i.fecha.toLocaleString().split(' ')[0]}\t**Hora:** ${i.hora}\t**Actividad:** ${i.actividad}\t**Mensaje:** ${i.mensaje}\t**Canal:** ${i.canal}\n`);
                pos++
                informacion.push(i);
            }
            var respuesta = enviarRespuesta(mensaje,msj);


            var filter = (m) => {
                return m.author.id === mensaje.author.id;
            };

            var colector = new MessageCollector(mensaje.channel, {
                filter:filter,
                max: 1,
                time: 1000 * 60,
            });
            //Colecta la posicion
            colector.on('collect', msj => {
                var contenido = msj.content;
                if (!isNaN(contenido)) {
                    colector.stop();
                    msj.delete();
                    bandera = false;
                } else {
                    enviarRespuesta(mensaje,'Debe ingresar la posicion que desea en numero')
                    msj.delete();
                    bandera = true;
                }
            });

            colector.on("end", async (mensajes, estado) => {

                var respuestaMensaje = await respuesta;

                respuestaMensaje.delete();
                if (bandera === false) {
                    if (estado === "time") {
                        enviarRespuesta(mensaje,"Haz tardado demasiado en ingresar un valor, comando cancelado :skull_crossbones:");
                        return;
                    }
                    var posicion = "";
                    for (var m of mensajes) {
                        posicion = (m[1].content);
                    }
                    //Guarda la actividad seleccionada
                    informacion = informacion[(posicion - 1)];
                    respuesta = enviarRespuesta(mensaje,`\nEsta seguro de eliminar el recordatorio?\nFecha:${informacion.fecha.toLocaleString().split(' ')[0]}\tHora:${informacion.hora}\tActividad:${informacion.actividad}\tMensaje:${informacion.mensaje}\tCanal: ${informacion.canal} \nS: para si\nN: para no`);
                    //Empieza la recoleccion confirmacion para eliminar
                    var colector = new MessageCollector(mensaje.channel, {
                        filter:filter,
                        max: 1,
                        time: 1000 * 90,
                    });
                    var confirmacion = "";
                    colector.on('collect', msj => {
                        confirmacion = msj.content;
                        colector.stop;
                        msj.delete();
                    });

                    colector.on("end", async (msj, estado) => {

                        respuestaMensaje = await respuesta;
                        respuestaMensaje.delete();
                        if (estado === "time") {
                            enviarRespuesta(mensaje,"Haz tardado demasiado en ingresar la respuesta, comando cancelado :skull_crossbones:");
                            return;
                        }

                        if (confirmacion === "S" || confirmacion === "s") {
                            db = new DB();
                            await db.deleteREcordatorio(informacion.id);
                            enviarRespuesta(mensaje,"Se a eliminado el recordatorio")
                        } else if (confirmacion === "N" || confirmacion === "n") {
                            enviarRespuesta(mensaje,"No se a eliminado el recordatorio");
                        } else {
                            enviarRespuesta(mensaje,"Ha ingresado una opcion no valida");
                        }

                    }); 

                } 

            });
        } catch (error) {
            console.error(`Error al procesar el comando ${this.nombre} \n${error}`);
            enviarLog({
                cliente: cliente,
                error: error,
                lugar: "comando -> delrecodatorio",
                quien: mensaje.author.username,
                comando: mensaje
            });
        }

    }
}