const { Client, Intents, MessageEmbed } = require("discord.js");
const client = new Client({
	intents: [
		Intents.FLAGS.GUILDS,
		Intents.FLAGS.GUILD_MESSAGES,
		Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
	],
	partials: ["MESSAGE", "REACTION", "USER"],
});
const { token } = require("../config.json");

const snipes = {};
const editSnipes = {};
const reactionSnipes = {};

const formatEmoji = (emoji) => {
	return !emoji.id || emoji.available
		? emoji.toString() // bot has access or unicode emoji
		: `[:${emoji.name}:](${emoji.url})`; // bot cannot use the emoji
};

client.on("ready", () => {
	console.log(`[sniper] :: Logged in as ${client.user.tag}.`);
});

client.on("messageDelete", async ({ partial, channel, author, content, createdAt, attachments }) => {
	if (message.partial || (message.embeds.length && !message.content)) return; // content is null or deleted embed

	snipes[message.channel.id] = {
		author: author.tag,
		content,
		createdAt,
		image: attachments.first()
			? attachments.first().proxyURL
			: null,
	};
});

client.on(
	"messageUpdate",
	async ({ channel, author, content }, { editedAt }) => {
		if (!content) return;
		editSnipes[channel.id] = { author: author.tag, content, editedAt };
	}
);

client.on(
	"messageReactionRemove",
	async ({ partial, emoji, message }, author) => {
		if (partial) return;
		reactionSnipes[reaction.message.channel.id] = {
			author: author.tag,
			emoji,
			messageURL: message.url,
			createdAt: Date.now(),
		};
	}
);

client.on("interactionCreate", async (interaction) => {
	if (!interaction.isCommand()) return;

	const channel =
		interaction.options.getChannel("channel") || interaction.channel;

	if (interaction.commandName === "snipe") {
		const snipe = snipes[channel.id];

		if (!snipe) return interaction.reply("There's nothing to snipe!");

		const embed = new MessageEmbed()
			.setAuthor(snipe.author)
			.setFooter(`#${channel.name}`)
			.setTimestamp(snipe.createdAt);
		snipe.content ? embed.setDescription(snipe.content) : null;
		snipe.image ? embed.setImage(snipe.image) : null;

		await interaction.reply({ embeds: [embed] });
	} else if (interaction.commandName === "editsnipe") {
		const snipe = editSnipes[channel.id];

		await interaction.reply(
			snipe
				? {
						embeds: [
							new MessageEmbed()
								.setDescription(snipe.content)
								.setAuthor(snipe.author)
								.setFooter(`#${channel.name}`)
								.setTimestamp(snipe.editedAt),
						],
				  }
				: "There's nothing to snipe!"
		);
	} else if (interaction.commandName === "reactionsnipe") {
		const snipe = reactionSnipes[channel.id];

		await interaction.reply(
			snipe
				? {
						embeds: [
							new MessageEmbed()
								.setDescription(
									`reacted with ${formatEmoji(
										snipe.emoji
									)} on [this message](${snipe.messageURL})`
								)
								.setAuthor(snipe.author)
								.setFooter(`#${channel.name}`)
								.setTimestamp(snipe.createdAt),
						],
				  }
				: "There's nothing to snipe!"
		);
	}
});

client.login(token);
