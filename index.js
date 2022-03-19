const Discord = require("discord.js");
const config = require("./config.json");
const fs = require('fs');
const DB = require('./db.js');


//cliente de discord
const cliente = new Discord.Client({
    partials: ["MESSAGE", "CHANNEL", "REACTION"],
    intents: new Discord.Intents(32767),
});

cliente.comandos = new Discord.Collection();

let comandos = fs.readdirSync('./comandos').filter( archivo => archivo.endsWith('.js'));
for(const archivo of comandos){
    const comando = require(`./comandos/${archivo}`);
    cliente.comandos.set(comando.datos.discord.name, comando);
}

//conectado a discord
cliente.on("ready", async () => {
    console.log("Conectado a discord");
    //fijar estado del bot
    cliente.user.setPresence({
        activities: [{ name: `reconstruyendo el bot :v`, type: "LISTENING" }],
        status: "online",
    });

    //traer los roles del server
    let roles = cliente.guilds.cache.get(config.server).roles.cache;
    cliente.roles = new Discord.Collection();
    for(let rol of roles){
        cliente.roles.set(rol[1].name, rol[0]);
    }

    //cargar los emojis con su respectivo rol
    cliente.reacciones = new Discord.Collection();
    let materias = await new DB().getMaterias();
    for(let materia of materias){
        cliente.reacciones.set(materia.emoji, materia.rol);
    }
    
    //enviar mensaje de que esta conectado
    if (config.modo !== "test") {
        var canalLogs = cliente.guilds.cache
            .get(config.server)
            .channels.cache.get(config.canallogs);
        canalLogs.send("Ya estamos conectados");
    }
});

cliente.on('messageCreate', mensaje => {
    console.log(mensaje.content);
});


//responder a los comandos
cliente.on("interactionCreate", (interaccion) => {
    if(interaccion.isCommand()){
        const comando = cliente.comandos.get(interaccion.commandName);
        if(comando.datos.informacion.admins){
            if(!interaccion.member.permissions.has("ADMINISTRATOR")){
                interaccion.reply({content: "No tienes permisos para ejecutar este comando :ninja:", ephemeral: true})
                return;
            }
        }
        comando.ejecutar(interaccion, interaccion.options.data);
    }
});


//dar y quitar roles
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


cliente.login(config.token);
