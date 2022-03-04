const Discord = require("discord.js");
const config = require("./config.json");

//cliente de discord
const cliente = new Discord.Client({
    partials: ["MESSAGE", "CHANNEL", "REACTION"],
    intents: new Discord.Intents(32767),
});

//eventos de discord

cliente.on("ready", () => {
    console.log("Conectado a discord");
    //fijar estado del bot
    cliente.user.setPresence({
        activities: [{ name: `reconstruyendo el bot :v`, type: "LISTENING" }],
        status: "online",
    });

    //enviar mensaje de que esta conectado
    if (config.modo !== "test") {
        var canalLogs = cliente.guilds.cache
            .get(config.server)
            .channels.cache.get(config.canallogs);
        canalLogs.send("Ya estamos conectados");
    }
});

cliente.on("interactionCreate", (interaccion) => {
    
});

cliente.login(config.token);
