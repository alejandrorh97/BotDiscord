const DB = require('../db');
const { prefix } = require('../config.json');
const { MessageCollector } = require("discord.js");
const { enviarRespuesta, enviarLog, enviarMensaje } = require('../utils');


module.exports = {
    nombre: 'modrecordatorio',
    descripcion: 'Modificar un recordatorio existente',
    args: true,
    admins: true,
    soloServer: true,
    borrable: true,
    categoria: "recordatorio",
    usos: '-m [rol de la materia]',
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
                enviarRespuesta(mensaje, "Solo una materia a la vez");
                return;
            }

            var materias = Array.from(cliente.reacciones.values()).find(materia => materia === mensaje.mentions.roles.first().name);
            if (!materias) {
                enviarRespuesta(mensaje, `Solo puedes modificar recordatorios de materias que actualmente estan en curso\nUsa el comando ${prefix}materias para ver las que estan disponibles`);
                return;
            }
            var db = new DB();
            db.conectar()
            var contenido = await db.getRecordatoriosMateria(mensaje.mentions.roles.first().toString());
            var pos = 1;
            materia = mensaje.mentions.roles.first().name;
            var bandera = false;
            var msj = ` Seleccione el recordatorio a modificar para la materia **${materia}**:\n`;
            //Se imprimen las actividades por la materia mencionada
            var informacion = []
            for (var i of contenido) {
                m = Object.values(i)
                msj = msj + (`**${pos}-**Fecha:${m[1]}\tHora:${m[6]}\tActividad:${m[4]}\tMensaje:${m[5]}\tCanal: ${m[7]}\n`);
                pos++
                informacion.push(m);
            }
            var respuesta = enviarRespuesta(mensaje, msj);

            var filter = (m) => {
                return m.author.id === mensaje.author.id;
            };

            var colector = new MessageCollector(mensaje.channel, {
                filter: filter,
                max: 1,
                time: 1000 * 60,
            });
            //Colecta la posicion
            colector.on('collect', msj => {
                var contenido = msj.content;
                if (!isNaN(contenido)) {
                    if (parseInt(contenido, 10) > 0 && parseInt(contenido, 10) < pos) {
                        colector.stop();
                        msj.delete();
                        bandera = false;
                    } else {
                        enviarRespuesta(mensaje, "A ingresado una actividad no valida");
                        bandera = true;
                    }
                } else {
                    enviarRespuesta(mensaje, 'Debe ingresar la posicion que desea en numero')
                    msj.delete();
                    bandera = true;
                }
            });

            colector.on("end", async (mensajes, estado) => {

                var respuestaMensaje = await respuesta;

                respuestaMensaje.delete();
                if (bandera === false) {
                    if (estado === "time") {
                        enviarRespuesta(mensaje, "Haz tardado demasiado en ingresar los nombre, comando cancelado :skull_crossbones:");
                        return;
                    }

                    respuesta = enviarRespuesta(mensaje, `\nIngresa las modificaciones de la manera siguiente -f [fecha del recordatorio] -r [recordatorio] -n [nota del recordatorio] -d [donde enviar el mensaje]`);
                    var posicion = "";
                    for (var m of mensajes) {
                        posicion = (m[1].content);
                    }
                    //Guarda la actividad seleccionada
                    informacion = informacion[(posicion - 1)];
                    //Colecta la modificacion
                    var colector = new MessageCollector(mensaje.channel, {
                        filter:filter,
                        max: 1,
                        time: 1000 * 90,
                    });

                    colector.on('collect', msj => {
                        var contenido = msj.content;
                        colector.stop;
                        msj.delete();
                    });

                    colector.on("end", async (msj, estado) => {
                        
                            respuestaMensaje = await respuesta;
                            respuestaMensaje.delete();
                            if (estado === "time") {
                                enviarRespuesta(mensaje, "Haz tardado demasiado en ingresar los cambios a realizar, comando cancelado :skull_crossbones:");
                                return;
                            }

                            var fecha = [];
                            var recordatorio = [];
                            var nota = [];
                            var donde = [];
                            var vector = "";
                            for (var m of msj) {
                                vector = m[1].content;
                            }

                            vector = vector.split(" ");

                            for (const arg of vector) {
                                if (arg.startsWith('-')) {
                                    cual = arg;
                                    continue;
                                }
                                switch (cual) {
                                    case '-f':
                                        fecha.push(arg);
                                        break;
                                    case '-r':
                                        recordatorio.push(arg);
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
                            if (fecha.length === 0) {
                                fecha.push(informacion[1]);
                            }
                            if (fecha.length > 1) {
                                enviarRespuesta(mensaje, "Solo una fecha a la vez");
                                return;
                            }
                            if (recordatorio.length === 0) {
                                recordatorio.push(informacion[4]);
                            }
                            if (nota.length === 0) {
                                nota.push(informacion[5])
                            }
                            if (donde.length === 0) {
                                donde.push(informacion[7]);
                            }
                            if (donde.length > 1) {
                                enviarRespuesta(mensaje, "Solo un canal a la vez")
                                return;
                            }

                            var id = informacion[0];
                            var idcanal = donde[0].split("<#");
                            idcanal = idcanal[1].split(">");
                            idcanal = idcanal[0];
                            donde = donde[0];
                            var usuario = mensaje.author.username
                            fecha = fecha.join('').split('/');
                            recordatorio = recordatorio.join(' ');
                            nota = nota.join(' ');
                            fecha = new Date(fecha[2], fecha[1] - 1, fecha[0]);
                            await db.updateRecordatorio({
                                id: id,
                                fecha: `${fecha.toISOString().slice(0, 10)}`,
                                fechanode: `0 0 ${fecha.getDate()} ${fecha.getMonth() + 1} *`,
                                materia: informacion[3],
                                actividad: recordatorio,
                                mensaje: nota,
                                hora: '00:00',
                                canal: donde,
                                idcanal: idcanal,
                                usuario: usuario
                            });
                            enviarRespuesta(mensaje, `Se han guardado los cambios para tu recordatorio`);

                    });
                }
            });
        } catch (error) {
            console.error(`Error al procesar el comando ${this.nombre} \n${error}`);
			enviarLog(cliente, error, this.nombre, mensaje.author.username);
        }


    }
};