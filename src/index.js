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
const Paginator = require("./paginator");

const snipes = {};
const editSnipes = {};
const reactionSnipes = {};

const formatEmoji = (emoji) => {
	return !emoji.id || emoji.available
		? emoji.toString() // bot has access or unicode emoji
		: `[:${emoji.name}:](${emoji.url})`; // bot cannot use the emoji
};

process.on("unhandledRejection", console.error); // prevent exit on error

client.on("ready", () => {
	console.log(`[sniper] :: Logged in as ${client.user.tag}.`);
});

client.on("messageDelete", async (message) => {
	if (message.partial) return; // content is null or deleted embed

	snipes[message.channel.id] = {
		author: message.author.tag,
		content: message.content,
		embeds: message.embeds,
		attachments: [...message.attachments.values()].map((a) => a.proxyURL),
		createdAt: message.createdTimestamp,
	};
});

client.on("messageUpdate", async (oldMessage, newMessage) => {
	if (oldMessage.partial) return; // content is null

	editSnipes[oldMessage.channel.id] = {
		author: oldMessage.author.tag,
		content: oldMessage.content,
		createdAt: newMessage.editedTimestamp,
	};
});

client.on("messageReactionRemove", async (reaction, user) => {
	if (reaction.partial) reaction = await reaction.fetch();

	reactionSnipes[reaction.message.channel.id] = {
		user: user.tag,
		emoji: reaction.emoji,
		messageURL: reaction.message.url,
		createdAt: Date.now(),
	};
});

client.on("interactionCreate", async (interaction) => {
	if (!interaction.isCommand()) return;

	const channel =
		interaction.options.getChannel("channel") || interaction.channel;

	if (interaction.commandName === "snipe") {
		const snipe = snipes[channel.id];

		if (!snipe) return interaction.reply("There's nothing to snipe!");

		const type = interaction.options.getString("options");

		if (type === "embeds") {
			if (!snipe.embeds.length)
				return interaction.reply("The message has no embeds!");
			const paginator = new Paginator(
				snipe.embeds.map((e) => ({ embeds: [e] }))
			);
			await paginator.start({ interaction });
		} else if (type === "attachments") {
			if (!snipe.attachments.length)
				return interaction.reply("The message has no embeds!");
			const paginator = new Paginator(
				snipe.attachments.map((a) => ({ content: a }))
			);
			await paginator.start({ interaction });
		} else {
			const embed = new MessageEmbed()
				.setAuthor({ name: snipe.author })
				.setFooter({ text: `#${channel.name}` })
				.setTimestamp(snipe.createdAt);
			if (snipe.content) embed.setDescription(snipe.content);
			if (snipe.attachments.length) embed.setImage(snipe.attachments[0]);
			if (snipe.attachments.length || snipe.embeds.length)
				embed.addField(
					"Extra Info",
					`*Message also contained \`${snipe.embeds.length}\` embeds and \`${snipe.attachments.length}\` attachments.*`
				);

			await interaction.reply({ embeds: [embed] });
		}
	} else if (interaction.commandName === "editsnipe") {
		const snipe = editSnipes[channel.id];

		await interaction.reply(
			snipe
				? {
						embeds: [
							new MessageEmbed()
								.setDescription(snipe.content)
								.setAuthor({ name: snipe.author })
								.setFooter({ text: `#${channel.name}` })
								.setTimestamp(snipe.createdAt),
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
								.setAuthor({ name: snipe.user })
								.setFooter({ text: `#${channel.name}` })
								.setTimestamp(snipe.createdAt),
						],
				  }
				: "There's nothing to snipe!"
		);
	}
});

client.login(token);
