const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { token, clientId, guildId } = require('./config.json');
const fs = require('fs');
const {prefix} = require('./config.json');

const comandos = [];
const comandosArchivos = fs.readdirSync('./comandos').filter(file => file.endsWith('.js'));

// Place your client and guild ids here

for (const file of comandosArchivos) {
	const comando = require(`./comandos/${file}`);
    comando.datos.discord.setName(`${prefix}${comando.datos.discord.name}`);
	comandos.push(comando.datos.discord.toJSON());
}

const rest = new REST({ version: '9' }).setToken(token);


(async () => {
	try {
		console.log('Refrescando comandos');

		await rest.put(
			Routes.applicationGuildCommands(clientId, guildId),
			{ body: comandos },
		);

		console.log('Comandos actualizados');
	} catch (error) {
		console.error(error);
	}
})();
