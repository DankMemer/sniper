const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v9");

const { token, application_id } = require("../config.json");

const guild = process.argv[2];

const commands = [
	{
		name: "snipe",
		description: "Shows the last deleted message from a specified channel!",
		options: [
			{
				type: 7, // text channel
				name: "channel",
				description: "The channel to snipe",
			},
		],
	},
	{
		name: "editsnipe",
		description: "Shows the last edited message from a specified channel!",
		options: [
			{
				type: 7, // text channel
				name: "channel",
				description: "The channel to snipe",
			},
		],
	},
	{
		name: "reactionsnipe",
		description:
			"Shows the last removed reaction from a specified channel!",
		options: [
			{
				type: 7, // text channel
				name: "channel",
				description: "The channel to snipe",
			},
		],
	},
];

const rest = new REST({ version: "9" }).setToken(token);

(async () => {
	try {
		console.log("[sniper] :: Started refreshing application (/) commands.");

		await rest.put(
			guild
				? Routes.applicationGuildCommands(application_id, guild)
				: Routes.applicationCommands(application_id),
			{
				body: commands,
			}
		);

		console.log(
			"[sniper] :: Successfully reloaded application (/) commands."
		);
	} catch (error) {
		console.error(error);
	}
})();
