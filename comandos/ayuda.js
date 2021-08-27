const { prefix } = require("../config.json");
const { MessageEmbed, MessageActionRow, MessageSelectMenu } = require("discord.js");
const {enviarLog} = require('../utils');

module.exports = {
    nombre: "ayuda",
    descripcion: "Lista todos los comando disponibles.",
    args: false,
    admins: false,
    borrable: true,
    soloServer: false,
    usos: "comando",
    categoria: "inicio",
    ejemplo: `${prefix}ayuda ping`,
    async ejecutar(cliente, mensaje, args) {
        try {
            var comandos = cliente.comandos;

            if(!args.length){
                var color = "";
                if(mensaje.member.permissions.has('ADMINISTRATOR')){
                    color = "GOLD";
                }
                else {
                    color = "BLUE";
                }
                var inicio = new MessageEmbed();
                inicio.setTitle("Comandos Disponibles");
                inicio.setDescription("Selecciona una categoria");
                inicio.setColor(color);
                inicio.setFooter("Tienes 1 minuto para ver los comandos antes de borrar este mensaje");

                var categorias = new Map();
                var listado = [];
                for (const comando of comandos.values()) {
                    if (comando.admins && !mensaje.member.permissions.has('ADMINISTRATOR')) continue;
                    if (categorias.has(comando.categoria)) {
                        let mensaje = categorias.get(comando.categoria);
                        let descripcion = `${comando.descripcion}`;
                        if (comando.ejemplo) descripcion += `\nEjemplo:\n${comando.ejemplo}\n`;
                        mensaje.addField(comando.nombre, descripcion);
                    }
                    else {
                        let embebido = new MessageEmbed();
                        embebido.setTitle(`Categoria ${comando.categoria}`);
                        let descripcion = `${comando.descripcion}`;
                        if (comando.ejemplo) descripcion += `\nEjemplo:\n${comando.ejemplo}\n`;
                        embebido.addField(`${prefix}${comando.nombre}`, descripcion);
                        embebido.setFooter("Tienes 1 minuto para ver los comandos antes de borrar este mensaje");
                        embebido.setColor(color);
                        categorias.set(comando.categoria, embebido);
                        listado.push({
                            label: comando.categoria,
                            value: comando.categoria
                        });
                    }
                }
                for (const embebido of categorias.values()) {
                    embebido.addField("Mas informacion", `Utiliza "${prefix}ayuda comando" para obtener mas informacion sobre ese comando`);
                }

                var menu = new MessageActionRow();
                var opciones = new MessageSelectMenu();
                opciones.setCustomId('ayudaOpcion');
                opciones.setPlaceholder("Selecciona la categoria");
                opciones.addOptions(listado);
                menu.addComponents(opciones);
    
                var respuesta = await mensaje.channel.send({embeds: [inicio], components: [menu]});
                var filtro = (interaccion) => interaccion.customId === 'ayudaOpcion' && interaccion.user.id === mensaje.author.id;
                var opcionselect = respuesta.createMessageComponentCollector({filtro, time: 1000 * 60});
    
                opcionselect.on('collect', i => {
                    opcionselect.resetTimer();
                    respuesta.edit({embeds: [categorias.get(i.values[0])]});
                    i.deferUpdate();
                });
    
                opcionselect.on('end', recolectado => {
                    respuesta.delete()
                });
            }
            else if (args.length >= 2){
                var error = new MessageEmbed();
                error.setTitle("Error");
                error.setDescription("Solo puedes ver la informacion de un comando a la vez");
                error.setColor("RED");
                mensaje.channel.send({embeds: [error]});
                return;
            }
            else {
                var comando = comandos.get(args[0]);
                if (comando) {
                    var embebido = new MessageEmbed();
                    embebido.setTitle(`Comando ${comando.nombre}`);
                    embebido.addField(`Descripcion`, comando.descripcion);
                    if (comando.ejemplo) embebido.addField(`Ejemplo`, comando.ejemplo);
                    embebido.setColor("GREEN");
                    mensaje.channel.send({embeds: [embebido]});
                    return;
                }
                else {
                    var error = new MessageEmbed();
                    error.setTitle("Error 404");
                    error.setDescription("No existe el comando ");
                    error.setColor("RED");
                    mensaje.channel.send({embeds: [error]});
                    return;
                }
            }

        }
        catch (error) {
            enviarLog({
				cliente: cliente,
				lugar: "comando -> ayuda",
				error: error,
				quien: mensaje.author.username,
				comando: mensaje
			})
        }
    }
};
