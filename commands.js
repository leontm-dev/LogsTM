//Datei-Einstellungen
const dotenv = require("dotenv").config();
const token = process.env["TOKEN"];
const clientId= process.env["CLIENT_ID"]
const { REST, SlashCommandBuilder, Routes, PermissionFlagsBits } = require("discord.js");
//Commands
const commands = [
	
].map(command => command.toJSON());
const rest = new REST({ version: '10' }).setToken(token);
rest.put(Routes.applicationCommand(clientId), { body: commands })
	.then((data) => console.log(`Es wurde erfolgreich ${data.length} Commands ins System gespeist!`))
	.catch(console.error);