const { MessageCollector } = require("discord.js");
const { enviarRespuesta, enviarLog } = require("../utils");
const {prefix} = require('../config.json');

module.exports = {
	nombre: "rifar",
	descripcion: "Comando para crear grupos y rifar quien va con quien",
	args: true,
	admins: false,
	soloServer: true,
	borrable: true,
    categoria: "ayuda",
	usos: `-g: cuantos grupos
    -c: cuantas personas en un grupo`,
    ejemplo: `${prefix}rifar -g 2 -c 3
    Que serian 2 grupos de 3 integrantes`,
	ejecutar(cliente, mensaje, args) {
        try {
            var grupos = 0;
            var cuantos = 0;
            var cual = "";
            for (arg of args) {
                if (arg.startsWith("-")) {
                    cual = arg;
                    continue;
                }
                switch (cual) {
                    case "-g":
                        grupos = parseInt(arg);
                        break;
                    case "-c":
                        cuantos = parseInt(arg);
                        break;
                }
            }
            if (isNaN(grupos)) {
                enviarRespuesta(
                    mensaje,
                    "Ingresa una cantidad de grupos valido :rage:"
                );
                return;
            }
            if (isNaN(cuantos)) {
                enviarRespuesta(
                    mensaje,
                    "Ingresa una cantidad de personas valido :rage:"
                );
                return;
            }
            var total = cuantos * grupos;
    
            var respuesta = enviarRespuesta(
                mensaje,
                `Ingresa ${total} nombres que formaran los grupos, si faltan usa el comodin "no hay mas" para empezar a rifar`
            );
    
            var filter = (m) => {
                return m.author.id === mensaje.author.id;
            };
            var colector = new MessageCollector(mensaje.channel, {
                filter: filter,
                max: total,
                time: 1000 * (15 * cuantos),
            });
    
            colector.on("collect", (msj) => {
                var contenido = msj.content;
                if (contenido === "no hay mas") {
                    colector.stop();
                    msj.delete();
                }
            });
    
            colector.on("end", async (mensajes, estado) => {
                var respuestaMensaje = await respuesta;
                //este if es para controlar si se acabo el tiempo y mandarle el mensaje
                respuestaMensaje.delete();
                if (estado === "time") {
                    enviarRespuesta(
                        mensaje,
                        "Haz tardado demasiado en ingresar los nombre, comando cancelado :skull_crossbones:"
                    );
                    return;
                }
                var promesas = [];
                var quienes = [];
                for (var m of mensajes) {
                    if (m[1].content === "no hay mas") {
                        break;
                    }
                    quienes.push(m[1].content);
                    promesas.push(m[1].delete());
                }
                respuestaMensaje = await enviarRespuesta(
                    mensaje,
                    "Estoy viendo como se distribuyen los grupos espera... :thinking:"
                );
                await Promise.all(promesas);
                await respuestaMensaje.delete();
                var gp = [];
                for (let i = 0; i < grupos; i++) {
                    gp.push([]);
                }
                while (total !== 0) {
                    for (let i = 0; i < grupos; i++) {
                        let item = quienes.splice(
                            Math.floor(Math.random() * quienes.length),
                            1
                        )[0];
                        if (item) {
                            gp[i].push(item);
                        } else {
                            gp[i].push("cupo vacio");
                        }
                        total--;
                    }
                }
    
                let txt = `<@${mensaje.author.id}> Los grupos quedan formados de la siguiente manera`;
                for (let i = 0; i < gp.length; i++) {
                    txt += `\n\tGrupo ${i + 1}`;
                    for (let j of gp[i]) {
                        txt += `\n\t\t${j}`;
                    }
                    txt += `\n`;
                }
                mensaje.channel.send(txt);
            });
        } catch (error) {
            enviarLog({
                cliente: cliente,
                error: error,
                lugar: "comando -> rifar",
                quien: mensaje.author.username,
                comando: mensaje
            });
        }
	},
};