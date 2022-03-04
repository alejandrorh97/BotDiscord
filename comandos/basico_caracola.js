const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	datos: {
        discord: new SlashCommandBuilder()
		.setName('caracola')
		.setDescription('Vamos a probar tu suerte')
        .addStringOption(opciones => 
            opciones.setName("pregunta")
            .setDescription("Tu pinche pregunta")
            .setRequired(false)
        )
        ,
        informacion: {
            admins: false,
            categoria: "Basico"
        }
    },
	async ejecutar(interaction, data) {
		if(data.length === 0){
            interaction.reply("Va pa saber");
            return;
        }
        var respuestas = [
            "No lo se tu dime :detective:",
            "Ya veremos dijo el ciego",
            "Si te bañaras talves",
            "Joder claro que si",
            "No lo creo",
            "Yo que se",
            "No, porque arrunaria la sagrada linea del tiempo :crocodile:",
            "Si, asi lo decidio la sagrada linea del tiempo :crocodile:",
            "Acaso quieres que explote el universo",
            "Dejame lo anoto en mi maquina de escribir",
            "con 1% de esfuerzo 99% de fe",
            "https://youtu.be/dQw4w9WgXcQ",
            "No preguntes, Solo gozalo",
            "A veces cuando planeas una cosa, te sale otra completamente diferente",
            "Andate a dormir",
            "Esta ya no es hora de preguntar",
            "Preguntale a este señor https://twitter.com/jcpenya",
            "Estas aburrido va?",
            "Tene $5 y no preguntes mas",
            "Imagen khabi",
            "Imagen 9k",
            "Imagen risitas",
            "Imagen kun",
            "Solo soy bot",
            "Claro que no, ¿Qué somos monos?",
            "No me pagan lo suficiente para ser el bot de este servidor",
            "He visto cosas",
            "Como dice la cancion \"Toxicidad fuera, mala vibra fuera, si me llamas gordo te doy la mano\"",
            "Claro que si (campo no pagado por los p*tos de claro)",
            ":thumbsup:",
            ":regional_indicator_s::regional_indicator_i::regional_indicator_m::regional_indicator_o::regional_indicator_n:",
            "si, que puede salir mal",
            "como regalo de navidad",
            "Si, total no me afecta :v",
            "dele para delante mi loco usted puede :first_place:"
        ];
        let r = respuestas.splice(Math.floor(Math.random() * respuestas.length), 1).join(' ');
        interaction.reply(r);
        return;
	},
};