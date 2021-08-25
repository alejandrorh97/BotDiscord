const {enviarLog} = require('../utils');
module.exports = {
    nombre: "portada",
    descripcion: "Te envia una portada para tu trabajo",
    args: false,
    admins: false,
    soloServer: false,
    borrable: true,
    categoria: "ayuda",
    usos: "solo llamalo :v",
    ejecutar(cliente, mensaje, args) {
        try {
            var txt = "";
            if (
                mensaje.author.id === "240558868038549504" ||
                mensaje.author.id === "688544642408513573"
            ) {
                txt = `Aqui tiene amo y señor <@${mensaje.author.id}>`;
            } else {
                txt = `Aqui tenes tu portada <@${mensaje.author.id}`;
            }
            txt += "<:giveplz:871890147149496340>";
            mensaje.channel.send({
                content: txt,
                files: ["./recursos/portada.docx"]
            });
        } catch (error) {
            enviarLog({
                cliente: cliente,
                error: error,
                lugar: "comando -> portada",
                quien: mensaje.author.username,
                comando:mensaje
            })
        }
    },
};
