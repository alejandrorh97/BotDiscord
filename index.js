//se cargan las cosas necesarias
const Discord = require('discord.js');
const {prefix, token} = require('./config.json');
const fs = require('fs');

//se crea los objetos necesarios
const cliente = new Discord.Client();
cliente.commands = new Discord.Collection();
cliente.canales = new Map();
cliente.rolesitos = new Map();

//se cargan los comandos necesarios
const comandos = fs.readdirSync("./commands").filter(file => file.endsWith('.js'));
for(let archivo of comandos){
    let comando = require(`./commands/${archivo}`);
    cliente.commands.set(comando.nombre,comando);
}

//este se ejecuta cuando ya esta listo
cliente.on('ready',(estado)=>{
    console.log("Ya estos conectado a discord");
    cliente.user.setPresence({ activity: { type: "LISTENING" ,name: 'Me estan haciendo'}, 
        status: 'online' })
    .then()
    .catch(console.error);
    var canales = new Map();
    for (var canal of cliente.channels.cache){
        if(canal[1].type === 'text'){
            canales.set(canal[1].name,canal[0]);
        }
    }
    cliente.canales = canales;

    //var rolesitos = [];
    console.log(cliente.guilds.cache.get('860627511300587560').roles.cache) 
    //for (var rol of cliente.guilds.cache){
        
    //}
});

//este se ejecuta cuando se ha mandado un nuevo mensaje
cliente.on('message',(mensaje) => {

    let contenido = mensaje.content;
    if(!contenido.startsWith(prefix) || mensaje.author.bot) return; //si no es un comando se ignora

    let argumentos = contenido.slice(prefix.length).trim().split(' '); // se extreaen los argumentos
    let cual = argumentos.shift().toLocaleLowerCase(); //se extrae que comando es
    
    //aqui se mira si es un mensaje en privado al bot
    if(mensaje.channel.type !== "dm"){
        mensaje.delete(); //se borra el mensaje del que lo envio para mantener algo limpio
    }

    if (!cliente.commands.has(cual)){
        mensaje.reply("No era un comando");
        return;
    }

    let comando = cliente.commands.get(cual);

    if(comando.soloServer && mensaje.channel.type === 'dm'){
        return mensaje.reply("Solo puedes usar este comando en un servidor, no en mensaje privado");
    }

    if(comando.args && !argumentos.length){
        return mensaje.channel.send(`No has dado ningun argumento ${mensaje.author}`);
    }


    try{
        comando.ejecutar(cliente,mensaje, argumentos);
    }
    catch(error){
        console.error(`hubo un error ${error}`);
        mensaje.reply("Por alguna razon hubo un error ¯\_(ツ)_/¯");
    }
});

//aqui ya se conecta el bot a discord
cliente.login(token);