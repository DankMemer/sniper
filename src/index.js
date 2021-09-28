const { Client, Intents, MessageEmbed } = require("discord.js");
const client = new Client({
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES],
});
const { token } = require("../config.json");

const snipes = {};
const esnipes = {};

client.on("ready", () => {
  console.log(`[sniper] :: Logged in as ${client.user.tag}.`);
});

client.on("messageDelete", async message => {
  snipes[message.guild.id] = {
    author: message.author,
    content: message.content,
    channel: message.channel.id,
    createdAt: message.createdTimestamp,
  };
});
client.on("messageUpdate", async (OldMessage, NewMessage) => {
  esnipes[message.guild.id] = {
    author: message.author,
    oldcontent: OldMessage.content,
    newcontent: NewMessage.content,
    channel: message.channel.id,
  };
});
client.on("interactionCreate", async (interaction) => {
  if (interaction.isCommand()) {
    if (interaction.commandName == "snipe") {
      const snipe = snipes[interaction.guildId];

      await interaction.reply(
        snipe
          ? {
              embeds: [
                new MessageEmbed()
                  .setDescription(snipe.content)
                  .setAuthor(snipe.author.tag)
                  .setFooter(`Sniped from : <#${snipe.channel}`)
                  .setTimestamp(snipe.createdAt),
              ],
            }
          : "There's nothing to snipe!"
      );
    } else if (interaction.commandName == "esnipe") {
      const snipe = esnipes[interaction.guildId];

      await interaction.reply(
        snipe
          ? {
              embeds: [
                new MessageEmbed()
                  .setDescription(
                    `Old Message:\n${snipe.oldcontent}\nNewMessage:${snipe.newcontent}`
                  )
                  .setAuthor(snipe.author.tag)
                  .setFooter(`Sniped from : <#${snipe.channel}`),
              ],
            }
          : "There's nothing to esnipe!"
      );
    }
  }
});

client.login(token);
