const Discord = require("discord.js");

const { prefix, embed } = require("../config.json");
const { error, content, titles, usage } = require("../lines.json");

const servers = require("../index.js");
const embeds = require("../embeds.js");

const intervals = ["NEVER", "DAILY", "HOURLY", "WEEKLY", "TEST"];

module.exports = {
  name: "reminders",
  aliases: ["remind"],
  description: "Set positive quotes to be sent at an interval.",
  usage: `\`${prefix} ${usage.reminders[0]}, ${prefix} ${usage.reminders[1]}, ${prefix} ${usage.reminders[2]}, ${prefix} ${usage.reminders[3]}\``,
  execute(msg, args, client) {
    if (!msg.guild.member(msg.author).hasPermission("MANAGE_GUILD") && msg.author.id != process.env.MY_ID) {
      // if the user does not have permission to use this command
      return embeds.error(`${error.permissionNotGranted[0]} \`MANAGE SERVER\` ${error.permissionNotGranted[1]}`, msg.channel);

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

        const embedMsg = `${intervalInfoMsg}\nUse \`${prefix} ${usage.reminders[1]}\` to set reminders or change reminder interval.\nUse \`${prefix} ${usage.reminders[2]}\` to configure the channel reminders are sent to.`;
        const embedFooter = "Interval options: HOURLY, DAILY, WEEKLY, NEVER";

        return embeds.footer("Configure Reminders", embedMsg, msg.channel, embedFooter);
      }
      else if(args.length === 2) {
        switch(args[0]) {
          case "set":
          // set the interval duration for remindersSet

            let desiredInterval = args[1].toUpperCase();

            if (!intervals.includes(desiredInterval)) {
              // if the user did not give a valid input for the interval
              console.log("invalid interval");

              return embeds.error(error.intervalError, msg.channel);
            }
            else {
              // if the user gave a valid input
              servers.Table.update({ interval: desiredInterval }, { where: { server_id: msg.guild.id } }).then(updatedInterval => {
                let reminderNotif = `Your server positivity reminders have been set to: \`${desiredInterval}\``
                if (desiredInterval !== "NEVER" && desiredInterval !== undefined) {
                  reminderNotif += `. Positive reminders will be sent to ${msg.guild.channels.cache.get(server.message_channel).toString()}!`
                }

                return embeds.common(titles.success, reminderNotif, msg.channel);
              }).catch(error => console.error(error));
            }
            break;
          case "channel":
            // set the channel to send reminders
            const channelMentions = msg.mentions.channels;
            if (channelMentions.size > 1) return embeds.error(error.providedChannelError, msg.channel);
            const channelKey = channelMentions.firstKey();
            servers.Table.update(
              { message_channel: channelKey.toString() },
              { where: { server_id: msg.guild.id } }
            ).then(updatedChannel => {
              return embeds.common(titles.success, `Positive reminders will be sent to ${msg.guild.channels.cache.get(channelKey).toString()} from now on!`, msg.channel);
            }).catch(err => {
              console.error(err);
              return embeds.error("Channel could not be updated.", msg.channel);
            })
            break;
          case "role":
            // choose a role to ping for reminders
            const roleMentions = msg.mentions.roles;
            if (roleMentions.size > 1) return embeds.error(error.providedRoleError, msg.channel);
            const roleKey = roleMentions.firstKey();
            // TODO: add a column to the table to add roles
            break;
          default:
            // if the user misused the reminders command
            return embeds.error(`${error.commandMisuseError[0]} \`reminders\` ${error.commandMisuseError[1]} \`${prefix} ${usage.reminders[0]}, ${prefix} ${usage.reminders[1]}\``, msg.channel);
            break;
        }
      }
      else {
        // if the user misused the reminders command
        return embeds.error(`${error.commandMisuseError[0]} \`reminders\` ${error.commandMisuseError[1]} \`${prefix} ${usage.reminders[0]}, ${prefix} ${usage.reminders[1]}\``, msg.channel);
      }
    }).catch(error => {
      console.error(error);
      // if server cannot be located in db
      return embeds.error(error.serverNotFound, msg.channel);
    });
  }
}
