const DB = require('../db');
const { prefix } = require('../config.json');
const { MessageCollector } = require("discord.js");

module.exports = {
    nombre: 'delrecordatorio',
    descripcion: 'eliminar un recordatorio existente',
    args: true,
    admins: false,
    soloServer: true,
    borrable: true,
    usos: '-m [rol de la materia]',
    async ejecutar(cliente, mensaje, args) {
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

        if (materia > 1) {
            mensaje.reply("Solo una materia a la vez");
            return;
        }

        for (var rol of cliente.reacciones.values()) {
            if (rol !== mensaje.mentions.roles.first().name) {
                mensaje.reply(`Solo puedes modificar recordatorios de materias que actualmente estan en curso\nUsa el comando ${prefix}materias para ver las que estan disponibles`);
                return;
            }
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
        var respuesta = mensaje.reply(msj);


        var filter = (m) => {
            return m.author.id === mensaje.author.id;
        };

        var colector = new MessageCollector(mensaje.channel, filter, {
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
                mensaje.reply('Debe ingresar la posicion que desea en numero')
                msj.delete();
                bandera = true;
            }
        });

        colector.on("end", async (mensajes, estado) => {
            try {
                var respuestaMensaje = await respuesta;

                respuestaMensaje.delete();
                if (bandera === false) {
                    if (estado === "time") {
                        mensaje.reply("Haz tardado demasiado en ingresar un valor, comando cancelado :skull_crossbones:");
                        return;
                    }
                    var posicion = "";
                    for (var m of mensajes) {
                        posicion = (m[1].content);
                    }
                    //Guarda la actividad seleccionada
                    informacion = informacion[(posicion - 1)];
                    respuesta = mensaje.reply(`\nEsta seguro de eliminar el recordatorio?\nFecha:${informacion[1]}\tHora:${informacion[6]}\tActividad:${informacion[4]}\tMensaje:${informacion[5]}\tCanal: ${informacion[7]} \nS: para si\nN: para no`);

                    //Empieza la recoleccion confirmacion para eliminar
                    var colector = new MessageCollector(mensaje.channel, filter, {
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
                        try {
                            respuestaMensaje = await respuesta;
                            respuestaMensaje.delete();
                            if (estado === "time") {
                                mensaje.reply("Haz tardado demasiado en ingresar los cambios a realizar, comando cancelado :skull_crossbones:");
                                return;
                            }

                            if (confirmacion === "S" || confirmacion === "s") {
                                await db.deleteRecordatorio({
                                    id: informacion[0]
                                });
                                mensaje.reply("Se a eliminado el recordatorio")
                            } else if (confirmacion === "N" || confirmacion === "n") {
                                mensaje.reply("No se a eliminado el recordatorio");
                            } else {
                                mensaje.reply("Ha ingresado una opcion no valida");
                            }
                        } catch (error) {
                            console.log(error);
                        }
                    });


                }
            } catch (error) {
                console.log(error);
            }
        });
    }
}