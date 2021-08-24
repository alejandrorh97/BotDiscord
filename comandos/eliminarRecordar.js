const DB = require('../db');
const { prefix } = require('../config.json');
const { MessageCollector } = require("discord.js");
const { enviarRespuesta, enviarLog, enviarMensaje } = require('../utils');

module.exports = {
    nombre: 'delrecordatorio',
    descripcion: 'eliminar un recordatorio existente',
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
            db.conectar()
            var contenido = await db.getRecordatoriosMateria(mensaje.mentions.roles.first().toString());
            var pos = 1;
            materia = mensaje.mentions.roles.first().name;
            var bandera = false;
            var msj = ` Seleccione el recordatorio a eliminar para la materia **${materia}**:\n`;
            //Se imprimen las actividades por la materia mencionada
            var informacion = []
            for (var i of contenido) {
                m = Object.values(i)
                msj = msj + (`**${pos}-**Fecha:${m[1]}\tHora:${m[6]}\tActividad:${m[4]}\tMensaje:${m[5]}\tCanal: ${m[7]}\n`);
                pos++
                informacion.push(m);
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
                    respuesta = enviarRespuesta(mensaje,`\nEsta seguro de eliminar el recordatorio?\nFecha:${informacion[1]}\tHora:${informacion[6]}\tActividad:${informacion[4]}\tMensaje:${informacion[5]}\tCanal: ${informacion[7]} \nS: para si\nN: para no`);

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
                            await db.deleteRecordatorio({
                                id: informacion[0]
                            });
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
            enviarLog(cliente, error, this.nombre, mensaje.author.username);
        }

    }
}