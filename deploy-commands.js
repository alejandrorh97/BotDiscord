const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { token } = require('./config.json');
const fs = require('fs');

const comandos = [];
const comandosArchivos = fs.readdirSync('./comandos').filter(file => file.endsWith('.js'));

// Place your client and guild ids here
const clientId = '868247004407562280';
const guildId = '860627511300587560';

for (const file of comandosArchivos) {
	const comando = require(`./comandos/${file}`);
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
