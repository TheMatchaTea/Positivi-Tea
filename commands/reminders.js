const Discord = require("discord.js");

const { prefix, embed } = require("../config.json");
const { error, content, titles, usage } = require("../lines.json");

const servers = require("../index.js");

const intervals = ["NEVER", "DAILY", "HOURLY", "WEEKLY", "TEST"];

module.exports = {
  name: "reminders",
  aliases: ["remind"],
  description: "Set positive quotes to be sent at an interval.",
  usage: usage.reminders,
  execute(msg, args, client) {
    if (!msg.guild.member(msg.author).hasPermission("MANAGE_GUILD") && msg.author.id != process.env.MY_ID) {
      // if the user does not have permission to use this command
      const errorEmbed = new Discord.MessageEmbed()
                                    .setColor(embed)
                                    .setTitle(titles.error)
                                    .setDescription(`${error.permissionNotGranted[0]} \`MANAGE SERVER\` ${error.permissionNotGranted[1]}`);

      return msg.channel.send(errorEmbed);

    }
    servers.Table.findOne({ where: { server_id: `${msg.guild.id}` } }).then(server => {
      // if we have no arguments show configuring messages
      if (args.length < 1) {
        // if reminders are not configured
        let intervalInfoMsg;
        if (server.interval === "NEVER") {
          intervalInfoMsg = `${msg.guild.name} ${content.remindersNotSet}`;
        }
        else {
          intervalInfoMsg = `${msg.guild.name} ${content.remindersSet[0]} ${server.interval} ${content.remindersSet[1]} Positive reminders are being sent to ${msg.guild.channels.cache.get(server.message_channel).toString()}!`;
        }

        const embedMsg = `${intervalInfoMsg}\nUse \`${prefix} reminders set [INTERVAL]\` to set reminders or change reminder interval.`;
        const embedFooter = "Interval options: HOURLY, DAILY, WEEKLY, NEVER";

        const remindEmbed = new Discord.MessageEmbed()
                                       .setColor(embed)
                                       .setTitle("Configure Reminders")
                                       .setDescription(embedMsg)
                                       .setFooter(embedFooter);

        return msg.channel.send(remindEmbed);
      }
      else if(args.length === 2 && args[0] === "set") {
        let desiredInterval = args[1].toUpperCase();

        if (!intervals.includes(desiredInterval)) {
          // if the user did not give a valid input for the interval
          console.log("invalid interval");
          const errorEmbed = new Discord.MessageEmbed()
                                        .setColor(embed)
                                        .setTitle(titles.error)
                                        .setDescription(error.intervalError);

          return msg.channel.send(errorEmbed);
        }
        else {
          // if the user gave a valid input
          servers.Table.update({ interval: desiredInterval }, { where: { server_id: msg.guild.id } }).then(updatedInterval => {
            let reminderNotif = `Your server positivity reminders have been set to: \`${desiredInterval}\``
            if (desiredInterval !== "NEVER" && desiredInterval !== undefined) {
              reminderNotif += `. Positive reminders will be sent to ${msg.guild.channels.cache.get(server.message_channel).toString()}!`
            }
            const successEmbed = new Discord.MessageEmbed()
                                            .setColor(embed)
                                            .setTitle(titles.success)
                                            .setDescription(reminderNotif);

            return msg.channel.send(successEmbed);
          }).catch(error => console.error(error));
        }
      }
      else {
        // if the user misused the reminders command
        const errorEmbed = new Discord.MessageEmbed()
                                      .setColor(embed)
                                      .setTitle(titles.error)
                                      .setDescription(`${error.commandMisuseError[0]} \`reminders\` ${error.commandMisuseError[1]} \`${prefix} ${usage.reminders[0]}, ${prefix} ${usage.reminders[1]}\``);

        return msg.channel.send(errorEmbed);
      }
    }).catch(error => {
      console.error(error);
      // if server cannot be located in db
      const errorEmbed = new Discord.MessageEmbed()
                                    .setColor(embed)
                                    .setTitle(titles.error)
                                    .setDescription(error.serverNotFound);

      return msg.channel.send(errorEmbed);
    });
  }
}
