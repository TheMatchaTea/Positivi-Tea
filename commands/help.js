const Discord = require('discord.js');

const { prefix, embed } = require('../config.json');
const { titles } = require('../lines.json');

module.exports = {
  name: 'help',
  description: 'Lists all commands and their descriptions',
  aliases: ['commands'],
  usage: '[command name]',
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
          const errorEmbed = new Discord.MessageEmbed().setColor(embed)
                                                       .setTitle(titles.error)
                                                       .setDescription("Could not send help message!");
          msg.channel.send(errorEmbed);
        })
    }

    const name = args[0].toLowerCase();
    const command = commands.get(name) || commands.find(c => c.aliases && c.aliases.includes(name));

    // if an invalid command is given as an argument
    if(!command) {
      const errorEmbed = new Discord.MessageEmbed().setColor(embed)
                                                   .setTitle(titles.error)
                                                   .setDescription("That's not a valid command! Please give a valid command.")
      return msg.channel.send(errorEmbed);
    }

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
