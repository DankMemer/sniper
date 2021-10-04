const {
	CommandInteraction,
	ButtonInteraction,
	InteractionCollector,
	Message,
	MessageActionRow,
	MessageButton,
	MessageEditOptions,
} = require("discord.js");

module.exports = class Paginator {
	/**
	 * @param {MessageEditOptions[]} data Array with edit options for each page.
	 */
	constructor(data) {
		if (!data?.length)
			throw new TypeError("Paginator data must have at least one value.");

		this.data = data;
		this.currentPage = null; // 0-indexed
		this.row = new MessageActionRow().addComponents(
			new MessageButton()
				.setCustomId("first")
				.setLabel("<<")
				.setStyle("PRIMARY"),
			new MessageButton()
				.setCustomId("previous")
				.setLabel("<")
				.setStyle("PRIMARY"),
			new MessageButton()
				.setCustomId("currentPage")
				.setStyle("SECONDARY")
				.setDisabled(true),
			new MessageButton()
				.setCustomId("next")
				.setLabel(">")
				.setStyle("PRIMARY"),
			new MessageButton()
				.setCustomId("last")
				.setLabel(">>")
				.setStyle("PRIMARY")
		);
		this.stopRow = new MessageActionRow().addComponents(
			new MessageButton()
				.setCustomId("stop")
				.setLabel("Stop")
				.setStyle("DANGER")
		);
	}

	/**
	 * Starts the paginator.
	 * @param {object} options
	 * @param {CommandInteraction} options.interaction
	 * @param {number=} options.time
	 * @returns {Promise<Message>}
	 */
	async start({ interaction, time = 30000 }) {
		let message = await interaction.reply({
			...this.getPage(0),
			fetchReply: true,
		});

		const filter = (i) => {
			return i.user.id === interaction.user.id;
		};
		const collector = message.createMessageComponentCollector({
			time,
			filter,
			componentType: "BUTTON",
		});
		collector.on("collect", (i) => this.onClicked(i, collector));
		collector.on("end", () => this.onEnd(interaction));
	}

	/**
	 * Listener for when a button is clicked.
	 * @param {ButtonInteraction} interaction
	 * @param {InteractionCollector} collector
	 * @returns {Promise<void>}
	 */
	async onClicked(interaction, collector) {
		if (interaction.customId === "first") {
			if (this.currentPage === 0) {
				interaction.deferUpdate();
				return;
			}
			await interaction.update(this.getPage(0));
		} else if (interaction.customId === "previous") {
			if (this.currentPage === 0) {
				interaction.deferUpdate();
				return;
			}
			await interaction.update(this.getPage(this.currentPage - 1));
		} else if (interaction.customId === "next") {
			if (this.currentPage === this.data.length - 1) {
				interaction.deferUpdate();
				return;
			}
			await interaction.update(this.getPage(this.currentPage + 1));
		} else if (interaction.customId === "last") {
			if (this.currentPage === this.data.length - 1) {
				interaction.deferUpdate();
				return;
			}
			await interaction.update(this.getPage(this.data.length - 1));
		} else if (interaction.customId === "stop") {
			collector.stop();
		}
	}

	/**
	 * Listener for when the collector ends.
	 * @param {CommandInteraction} interaction
	 * @returns {Promise<void>}
	 */
	async onEnd(interaction) {
		this.row.components.forEach((component) => component.setDisabled(true));
		await interaction.editReply({ components: [this.row] });
	}

	/**
	 * Gets the send options for a page.
	 * @param {number} number
	 */
	getPage(number) {
		this.currentPage = number;
		this.row.components
			.find((component) => component.customId === "currentPage")
			.setLabel(`${number + 1}/${this.data.length}`);
		return { ...this.data[number], components: [this.row, this.stopRow] };
	}
};
