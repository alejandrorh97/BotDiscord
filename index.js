const Discord = require("discord.js");
const config = require("./config.json");
const fs = require("fs");
const { enviarLog, enviarMensaje } = require("./utils");
const megadb = require("megadb");
const sql = require("./db");
const { formatearFecha, formatearHora } = require("./utils");
var activo = false;

//Creamos los objetos necesarios
const cliente = new Discord.Client({
    partials: ["MESSAGE", "CHANNEL", "REACTION"],
    intents: new Discord.Intents(32767),
});

cliente.comandos = new Discord.Collection();

//cargamos los comandos
let comandos = fs
    .readdirSync("./comandos")
    .filter((file) => file.endsWith(".js"));
for (let archivo of comandos) {
    let comando = require(`./comandos/${archivo}`);
    cliente.comandos.set(comando.nombre, comando);
}

//evento que se ejecuta al estar conectado a discord
cliente.on("ready", async () => {
    //cargar roles y guardar los id
    try {
        cliente.user.setPresence({
            activities: [{ name: `comandos en ${config.prefix}`, type: "LISTENING" }],
            status: "online",
        });

        cliente.roles = new Discord.Collection();
        let roles = cliente.guilds.cache.get(config.server).roles.cache;
        for (let rol of roles) {
            cliente.roles.set(rol[1].name, rol[0]);
        }

        cliente.reacciones = new Discord.Collection();
        let materiasdb = new megadb.crearDB(config.db);
        let materias = await materiasdb.obtener("materias");
        for (let materia of materias) {
            cliente.reacciones.set(materia.emoji, materia.rol);
        }
		if (true){
            let date = new Date();
		enviarMensaje({
			cliente: cliente,
			canal: config.canallogs,
			server: config.server,
			mensaje: `Conectado: ${formatearFecha(date)} ${formatearHora(date)}`,
		});
        }
        activo = true;
        console.log("Ya estamos conectado a discord");
        fs.appendFile(
            "historialComandos.txt",
            `\n---------------------${new Date().toLocaleString()}`,
            (error) => {
                if (error) console.error(error);
            }
        );
    } catch (error) {
        console.error(
            `index: No se ha podido cargar completamente el bot\n${error}`
        );
    }
});

cliente.on("messageCreate", async (mensaje) => {
    try {
        if (mensaje.author.bot) return; //si es mensaje de un bot se ignora
        if (mensaje.channel.type === "DM") {
            mensaje.channel.send(
                "Solo puedes usar comandos en servers donde este yo"
            );
            return;
        }
        let contenido = mensaje.content;
        if (contenido.startsWith(config.prefix)) {
            fs.appendFile(
                "historialComandos.txt",
                `\n${new Date().toLocaleString()} Quien: ${
                    mensaje.author.username
                } Comando: ${mensaje.content}`,
                (error) => {
                    if (error) console.error(error);
                }
            );
            //extraer los argumentos
            let argumentos = contenido.slice(config.prefix.length).trim().split(" ");
            let borrable = mensaje.channel.type === "dm" ? true : false;
            let cual = argumentos.shift().toLowerCase();

            //ver si existe el comando
            if (!cliente.comandos.has(cual)) {
                if (!borrable) {
                    await mensaje.delete(); //se borra el mensaje del que lo envio para mantener algo limpio
                }
                mensaje.channel
                    .send(`<@${mensaje.author.id}> No era un comando :face_with_monocle:
            \nUsa el comando ${config.prefix}ayuda para ver los comandos disponibles`);
                return;
            }

            let comando = cliente.comandos.get(cual);

            //controlar que los comandos que solo admins pueden ejecutar
            if (comando.admins) {
                var permisos = mensaje.member.permissions.has("ADMINISTRATOR");
                if (!permisos) {
                    if (!borrable) {
                        await mensaje.delete(); //se borra el mensaje del que lo envio para mantener algo limpio
                    }
                    mensaje.channel.send(
                        `<@${mensaje.author.id}>Me dijeron que no te hiciera caso :wink: :ok_hand:`
                    );
                    return;
                }
            }

            //se mira si se puede borrar el mensaje
            if (comando.borrable) {
                if (!borrable) await mensaje.delete();
            }

            //si el comando necesita argumentos y no se envio nada
            if (comando.args && !argumentos.length) {
                mensaje.channel
                    .send(`<@${mensaje.author.id}> No has dado ningun argumento :triumph:
Esta es la forma de usar el comando:\n ${comando.ejemplo}`);
                return;
            }
            comando.ejecutar(cliente, mensaje, argumentos);
        }
    } catch (error) {
        mensaje.channel.send(
            `<@${mensaje.author.id}> Hubo un error al procesar el comando :man_shrugging:`
        );
        enviarLog({
            cliente: cliente,
            error: error,
            lugar: "index.mensajeRecibo",
            quien: mensaje.author.username,
            comando: mensaje,
        });
    }
});

cliente.on("messageReactionAdd", async (reaccion, usuario) => {
    if (usuario.bot) return;
    try {
        if (reaccion.message.id === config.mensajereaccion) {
            var emoji = reaccion._emoji.name;
            var quien = cliente.guilds.cache
                .get(config.server)
                .members.cache.get(usuario.id);
            var rol = cliente.reacciones.get(emoji);
            quien.roles.add(cliente.roles.get(rol));
        }
    } catch (error) {
        enviarLog({
            cliente: cliente,
            error: error,
            lugar: "index.darRol",
            quien: usuario.username,
            accion: "Dar Rol",
        });
    }
});

cliente.on("messageReactionRemove", async (reaccion, usuario) => {
    if (usuario.bot) return;
    try {
        if (reaccion.message.id === config.mensajereaccion) {
            var emoji = reaccion._emoji.name;
            var quien = cliente.guilds.cache
                .get(config.server)
                .members.cache.get(usuario.id);
            var rol = cliente.reacciones.get(emoji);
            quien.roles.remove(cliente.roles.get(rol));
        }
    } catch (error) {
        enviarLog({
            cliente: cliente,
            error: error,
            lugar: "index.quitarRol",
            quien: usuario.username,
            accion: "Quitar Rol",
        });
    }
});


// job que ve si hay eventos semanales
const cron = require("node-cron");
cron.schedule("0 10 * * 7", async (hora) => {
    if(!activo) return;
    try {
        const conexion = new sql();
        const recordatorios = await conexion.getRecordatoriosSemanales();
        if (recordatorios.length > 0) {
            var cual = "";
            var mensaje = `**<@&${config.sobreviviente}>**\nEstos son los recordatorios para la semana\n`;
            for (const recordatorio of recordatorios) {
                if (cual !== recordatorio.materia) {
                    cual = recordatorio.materia;
                    mensaje += `\n\nLos recordatorios para **${cual}** son los siguientes`;
                }
                mensaje += `\n\t**Actividad**: ${recordatorio.actividad}`;
                mensaje += `\n\t**Fecha**: ${formatearFecha(recordatorio.fecha)}`;
                if (recordatorio.mensaje)
                    mensaje += `\n\t**Nota**: ${recordatorio.mensaje}`;
                mensaje += `\n`;
            }
            enviarMensaje({
                cliente: cliente,
                server: config.server,
                canal: config.canalrecordatorios,
                mensaje: mensaje
            });
            console.log(`Recordatorios semanales enviados ${hora.toLocaleString()}`);
        }
        else {
            enviarMensaje({
                cliente: cliente,
                server: config.server,
                canal: config.canalrecordatorios,
                mensaje: "No hay actividades para esta semana"
            })
        }
    } catch (error) {
        enviarLog({
            cliente: cliente,
            error: error,
            lugar: `Enviar recordatorio`
        })
    }
});

//job ver si hay evento diario 
cron.schedule("*/1 * * * *", async (hora) => {
    if(!activo) return;
    try {
        const conexion = new sql();
        const recordatoriosD = await conexion.getRecordatoriosDiarios();
        if (recordatoriosD.length > 0) {
            var cual = "";
            var fecha = "";
            var mensaje = "";
            var id = "";
            for (const recordatorio of recordatoriosD) {
                if (cual !== recordatorio.materia) {
                    if (cual !== "") {
                        enviarMensaje({
                            cliente: cliente,
                            server: config.server,
                            canal: id,
                            mensaje: mensaje
                        });
                    }
                    id = recordatorio.id_canal;
                    cual = recordatorio.materia;
                    mensaje = "Recordatorios Diarios\n";
                    mensaje += `\nLos recordatorios para ${cual} son los siguientes`;
                }
                else if (fecha !== recordatorio.fecha) {
                    fecha = recordatorio.fecha;
                    mensaje += `\nLos recordatorios para ${cual} de mañana son:`;
                }
                mensaje += `\n\t**Actividad**: ${recordatorio.actividad}`;
                mensaje += `\n\t**Fecha**: ${formatearFecha(recordatorio.fecha)}`;
                if (recordatorio.mensaje)
                    mensaje += `\n\t**Nota**: ${recordatorio.mensaje}`;
                mensaje += `\n\n`;
                enviarMensaje({
                    cliente: cliente,
                    server: config.server,
                    canal: id,
                    mensaje: mensaje
                });
            }
            console.log(`Recordatorios diarios enviados ${hora.toLocaleString()}`);
        }
    } catch (error) {
        enviarLog({
            cliente: cliente,
            error: error,
            lugar: `Enviar recordatorio`
        })
    };
});

cliente.login(config.token);
