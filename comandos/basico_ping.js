const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	datos: {
        discord: new SlashCommandBuilder()
		.setName('ping')
		.setDescription('Pong'),
        informacion: {
            admins: false,
            categoria: "Basico",
            admins: true,
            privado: false
        }
    },
	async ejecutar(interaction, datos) {
        console.log(datos);
		return interaction.reply('Pong!');
	},
};