//se cargan las cosas necesarias
const Discord = require("discord.js");
const {
    prefix,
    token,
    server,
    canallogs,
    mensajereaccion,
} = require("./config.json");
const fs = require("fs");

//se crea los objetos necesarios
const cliente = new Discord.Client({
    partials: ["MESSAGE", "CHANNEL", "REACTION"],
});
cliente.commands = new Discord.Collection();

//se cargan los comandos necesarios
const comandos = fs
    .readdirSync("./commands")
    .filter((file) => file.endsWith(".js"));
for (let archivo of comandos) {
    let comando = require(`./commands/${archivo}`);
    cliente.commands.set(comando.nombre, comando);
}

//este se ejecuta cuando ya esta listo
cliente.on("ready", (estado) => {
    console.log("Ya estos conectado a discord");
    cliente.user
        .setPresence({
            activity: { type: "LISTENING", name: "Me estan haciendo" },
            status: "online",
        })
        .then()
        .catch(console.error);

    //guardamos el nombre de los canales y sus ids
    cliente.canales = new Map();
    var canales = cliente.guilds.cache.get(server).channels.cache;
    for (let canal of canales) {
        if (canal[1].type === "text") {
            cliente.canales.set(canal[1].name, canal[0]);
        }
    }

    cliente.rolsitos = new Map();
    var roles = cliente.guilds.cache.get(server).roles.cache;
    for (var i of roles) {
        cliente.rolsitos.set(i[1].name, i[0]);
    }

    cliente.reacciones = new Map();
    fs.readFile(
        "reacciones.json",
        "utf8",
        function readFileCallback(err, data) {
            if (err) {
                console.log(err);
            } else {
                let reacciones = JSON.parse(data); //now it an object
                for (var i of reacciones.tabla) {
                    var r = i.reaccion.split(" ");
                    cliente.reacciones.set(r[0], r[1]);
                }
            }
        }
    );
});

//este se ejecuta cuando se ha mandado un nuevo mensaje
cliente.on("message", (mensaje) => {
    if (mensaje.author.bot) return; //si el mensaje es de un bot lo ignora
    let contenido = mensaje.content;
    if (contenido.startsWith(prefix)) {
        let argumentos = contenido.slice(prefix.length).trim().split(" "); // se extreaen los argumentos
        let cual = argumentos.shift().toLocaleLowerCase(); //se extrae que comando es

        if (!cliente.commands.has(cual)) {
            mensaje.reply("No era un comando :face_with_monocle:");
            return;
        }

        let comando = cliente.commands.get(cual);

        //ver si solo admins
        if (comando.admins) {
            //aqui se mira si es un mensaje en privado al bot
            var perms = mensaje.member.hasPermission("ADMINISTRATOR");
            if (!perms) {
                mensaje.reply(
                    "Me dijeron que no te hiciera caso :wink: :ok_hand:"
                );
				if (mensaje.channel.type !== "dm") {
					mensaje.delete(); //se borra el mensaje del que lo envio para mantener algo limpio
				}
				return
            }
        }

        //se mira si se puede borrar el comando
        if (comando.borrable) {
            //aqui se mira si es un mensaje en privado al bot
            if (mensaje.channel.type !== "dm") {
                mensaje.delete(); //se borra el mensaje del que lo envio para mantener algo limpio
            }
        }

        if (comando.soloServer && mensaje.channel.type === "dm") {
            return mensaje.reply(
                "Solo puedes usar este comando en un servidor, no en mensaje privado :face_with_monocle:"
            );
        }

        if (comando.args && !argumentos.length) {
            return mensaje.channel.send(
                `No has dado ningun argumento ${mensaje.author} :triumph:`
            );
        }

        try {
            comando.ejecutar(cliente, mensaje, argumentos);
        } catch (error) {
            //se notifica del error
            console.error(`hubo un error ${error}`);
            mensaje.reply("Por alguna razon hubo un error :man_shrugging:");
            let texto = `hubo un error al procesar un comando`;
            texto += `\n\tComando ejecutado: ${mensaje.content} 
			\n\tError ${error}
			\n-------------------------------------------`;
            cliente.guilds.cache
                .get(server)
                .channels.cache.get(canallogs)
                .send(texto);
        }
    }
});

cliente.on("channelCreate", (evento) => {});

cliente.on("messageReactionAdd", (reaccion, usuario) => {
    if (reaccion.message.id === mensajereaccion) {
        var e = reaccion._emoji.name;
        var quien = cliente.guilds.cache
            .get(server)
            .members.cache.get(usuario.id);
        var rol = cliente.reacciones.get(e);
        quien.roles.add(cliente.rolsitos.get(rol));
    }
});

cliente.on("messageReactionRemove", (reaccion, usuario) => {
    if (reaccion.message.id === mensajereaccion) {
        var e = reaccion._emoji.name;
        var quien = cliente.guilds.cache
            .get(server)
            .members.cache.get(usuario.id);
        var rol = cliente.reacciones.get(e);
        quien.roles.remove(cliente.rolsitos.get(rol));
    }
});

//aqui ya se conecta el bot a discord
cliente.login(token);
