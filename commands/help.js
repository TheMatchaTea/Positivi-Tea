const Discord = require('discord.js');

const { prefix, embed } = require('../config.json');
const { titles, error } = require('../lines.json');

const embeds = require('../embeds.js');

module.exports = {
  name: 'help',
  description: 'Lists all commands and their descriptions',
  aliases: ['commands'],
  usage: `\`${prefix} help (optional: command name)\``,
  cooldown: 3,
  execute(msg, args) {
    const data  = [];
    const { commands } = msg.client;

    // send a list of all commands for help if there are no other arguments
    if (!args.length) {
      const helpEmbed = new Discord.MessageEmbed()
                              .setColor(embed)
                              .setTitle('Positivi-Tea: Help')
                              .setDescription(`(You can send \`${prefix} help [command name]\` to get info on a specific command)`);

      for (const cmd of commands.values()) {
        helpEmbed.addField(`\`${cmd.name}\``, cmd.description);
      }

      return (msg.channel.send(helpEmbed))
        .then()
        .catch(error => {
          console.error(`Could not send message to ${msg.author.tag}.\n`, error);
          return embeds.error(error.helpMsgFailed, msg.channel);
        })
    }

    const name = args[0].toLowerCase();
    const command = commands.get(name) || commands.find(c => c.aliases && c.aliases.includes(name));

    // if an invalid command is given as an argument
    if(!command) return embeds.error(error.helpInvalidCommand, msg.channel);

    const detailedEmbed = new Discord.MessageEmbed()
                                     .setColor(embed)
                                     .setTitle(`Positivi-Tea: Help >> ${command.name}`)

    if (command.usage) detailedEmbed.addField("Usage", `\`${prefix} ${command.name} ${command.usage}\``, true);
    if (command.aliases) detailedEmbed.addField("Aliases", command.aliases.join(', '), true);
    if (command.description) detailedEmbed.setDescription(command.description);

    detailedEmbed.addField("Cooldown", `${command.cooldown || 3} second(s)`);

    return msg.channel.send(detailedEmbed);
  }
}
