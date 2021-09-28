const { Client, Intents, MessageEmbed } = require("discord.js");
const client = new Client({
	intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES],
});
const { token } = require("../config.json");

const snipes = {};

client.on("ready", () => {
	console.log(`[sniper] :: Logged in as ${client.user.tag}.`);
});

client.on("messageDelete", async (message) => {
	snipes[message.guild.id] = {
		author: message.author,
		content: message.content,
		createdAt: message.createdTimestamp,
	};
});

client.on("interactionCreate", async (interaction) => {
	if (interaction.isCommand() && interaction.commandName === "snipe") {
		const snipe = snipes[interaction.guildId];

		await interaction.reply(
			snipe
				? {
						embeds: [
							new MessageEmbed()
								.setDescription(snipe.content)
								.setAuthor(snipe.author.tag)
								.setTimestamp(snipe.createdAt),
						],
				  }
				: "There's nothing to snipe!"
		);
	}
});

client.login(token);
