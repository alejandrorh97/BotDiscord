const { prefix } = require("../config.json");
const { MessageEmbed } = require("discord.js");
const {enviarLog} = require('../utils');

module.exports = {
    nombre: "ayuda",
    descripcion: "Lista todos los comando disponibles.",
    args: false,
    admins: false,
    borrable: true,
    soloServer: false,
    usos: "comando",
    ejemplo: `${prefix}ayuda ping`,
    ejecutar(cliente, mensaje, args) {
        try {
            let { comandos } = mensaje.client;
            let embebido = new MessageEmbed();
            if (!args.length) {
                embebido.setTitle("Comandos disponibles");
                for (let comando of comandos) {
                    //ver si solo admins
                    if (comando[1].admins && !mensaje.member.permissions.has('ADMINISTRATOR')) {
                        continue;
                    }
                    let value = `${comando[1].descripcion}`;
                    if (comando[1].ejemplo) value += `\nEjemplo:\n${comando[1].ejemplo}\n`;
                    embebido.addField(
                        `${prefix}${comando[1].nombre}`,
                        value
                    );
                }
                embebido.addField(
                    "Mas informacion",
                    `Utiliza ${prefix}ayuda comando para obtener mas informacion sobre ese comando`
                );
            } else if (args.length >= 2) {
                embebido.addField("Error", "Muchos parametros solo 1");
            } else {
                if (comandos.has(args[0])) {
                    comando = comandos.get(args[0]);
                    embebido.setTitle(`Comando ${args[0]}`);
                    embebido.addField("Descripcion", comando.descripcion);
                    embebido.addField("Uso", `${comando.usos}`);
                    if (comando.ejemplo) embebido.addField('Ejemplo', `${comando.ejemplo}`);
                } else {
                    embebido.addField("No existe el comando", args[0]);
                }
            }
            if(mensaje.member.permissions.has('ADMINISTRATOR')){
                embebido.setColor("RED");
            }
            else {
                embebido.setColor("BLUE");
            }
            
            mensaje.channel.send({embeds: [embebido]});
        } catch (error) {
            enviarLog({
				cliente: cliente,
				lugar: "comando -> ayuda",
				error: error,
				quien: mensaje.author.username,
				comando: mensaje.content
			})
        }
    }
};
