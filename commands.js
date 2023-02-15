//Datei-Einstellungen
const dotenv = require("dotenv").config();
const token = process.env["TOKEN"];
const clientId= process.env["CLIENT_ID"]
const { REST, SlashCommandBuilder, Routes, PermissionFlagsBits } = require("discord.js");
//Commands
const commands = [
	new SlashCommandBuilder()
	.setName("log-channel")
	.setDescription("Provide the channel, my logs should be send in")
	.setDescriptionLocalizations({"de": "Lege den Kanal fest, in den die Logs gesendet werden sollen!"})
	.addChannelOption(option => option.setName("channel").setNameLocalizations({"de": "kanal"}).setDescription("The log-channel").setDescriptionLocalizations({"de": "Der Log-Kanal"}).setRequired(true))
	.setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
].map(command => command.toJSON());
const rest = new REST({ version: '10' }).setToken(token);

// Construct and prepare an instance of the REST module

// and deploy your commands!
(async () => {
	try {
		console.log(`Started refreshing ${commands.length} application (/) commands.`);
		// The put method is used to fully refresh all commands in the guild with the current set
		const data = await rest.put(
			Routes.applicationCommands(clientId),
			{ body: commands },
		);
		console.log(`Successfully reloaded ${data.length} application (/) commands.`);
	} catch (error) {
		// And of course, make sure you catch and log any errors!
		console.error(error);
	}
})();