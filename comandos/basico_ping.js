const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	datos: {
        discord: new SlashCommandBuilder()
		.setName('ping')
		.setDescription('Pong'),

        informacion: {
            admins: false,
            categoria: "Basico"
        }
    },
	async ejecutar(interaction) {
		return interaction.reply('Pong!');
	},
};