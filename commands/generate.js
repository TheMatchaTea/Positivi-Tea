const Discord = require("discord.js");
const fs = require("fs");

const { prefix, embed } = require('../config.json');
const { titles } = require('../lines.json');

module.exports = {
  name: "generate",
  aliases: ["gen", "random"],
  description: "Generates a random positive quote!",
  execute(msg, args, client) {
    return fs.readFile("./content/quotes.txt", 'utf-8', (err, quotes) => {
      if (err) {
        const errorEmbed = new Discord.MessageEmbed()
                                      .setColor(embed)
                                      .setTitle(titles.permaError)
                                      .setDescription(`${err}`);
        return msg.channel.send(errorEmbed);
        throw err;
      }

      let quotesArray = quotes.split('%');
      const randomQuoteIndex = Math.floor(Math.random() * quotesArray.length);
      const randomQuote = quotesArray[randomQuoteIndex];
      const genEmbed = new Discord.MessageEmbed()
                               .setColor(embed)
                               .setTitle(titles.positive)
                               .setDescription(randomQuote);
      msg.channel.send(genEmbed);
    });
  }
}
