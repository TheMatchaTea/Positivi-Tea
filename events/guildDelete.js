const Discord = require("discord.js");

const servers = require("../index.js");

module.exports = {
  name: "guildDelete",
  execute(guild, client) {
    servers.Table.destroy({ where: { server_id: guild.id } }).then(() => {
      console.log(`Left server ${guild.name}`);
    });
  }
}
