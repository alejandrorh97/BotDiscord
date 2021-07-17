
const {MessageEmbed, TextChannel} = require('discord.js');


module.exports = {
    nombre: "msj",
    descripcion: "Tendria que mandar un msj a otro canal :v ",

ejecutar (cliente,message,args){
    
    cliente.channels.cache.get(cliente.canales.get("pruebas")).send(args);
    //console.log(cliente.canales.get("pruebas"));
 },
};