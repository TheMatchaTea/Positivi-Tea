const Discord = require("discord.js");

const { prefix, embed } = require("../config.json");
const { titles, content } = require("../lines.json");
const servers = require("../index.js");

module.exports = {
  name: "guildCreate",
  execute(guild, client) {
    if (guild.available) {
      servers.Table.create({
        server_id: `${guild.id}`,
        message_channel: `${guild.systemChannelID}`,
        interval: "NEVER"
      }).then(newServer => {
        console.log("new server created: ", newServer.server_id, newServer.message_channel, newServer.interval);
        const enterEmbed = new Discord.MessageEmbed()
                                 .setColor(embed)
                                 .setTitle(titles.welcome)
                                 .setDescription(content.welcomeMessage[0] + guild.name + content.welcomeMessage[1]);

        guild.systemChannel.send(enterEmbed);
      });
    }
  }
};
