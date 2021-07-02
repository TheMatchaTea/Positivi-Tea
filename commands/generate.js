const Discord = require("discord.js");
const fs = require("fs");

const { prefix, embed } = require('../config.json');
const { titles, usage } = require('../lines.json');

const embeds = require("../embeds.js")

module.exports = {
  name: "generate",
  aliases: ["gen", "random"],
  description: "Generates a random positive quote!",
  usage: `\`${prefix} ${usage.generate}\``,
  execute(msg, args, client) {
    return fs.readFile("./content/quotes.txt", 'utf-8', (err, quotes) => {
      if (err) {
        return embeds.error(`${err}`, msg.channel);
        throw err;
      }

      let quotesArray = quotes.split('%');
      quotesArray = quotesArray.filter(quote => quote !== '\n');
      const randomQuoteIndex = Math.floor(Math.random() * quotesArray.length);
      const randomQuote = quotesArray[randomQuoteIndex];
      return embeds.common(titles.positive, randomQuote, msg.channel);
    });
  }
}
