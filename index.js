const Discord = require('discord.js');
const fs = require('fs');
const { Sequelize, DataTypes } = require('sequelize');

const { prefix, embed } = require('./config.json');
const { content, error, titles } = require('./lines.json');

const client = new Discord.Client();
client.commands = new Discord.Collection();
client.cooldowns = new Discord.Collection();

/* --- DATABASE CONFIG --- */

const sqlize = new Sequelize('database', 'user', 'password', {
  host: 'localhost',
  dialect: 'sqlite',
  logging: false,
  storage: 'db.sqlite'
});

const Servers = sqlize.define("Servers", {
  server_id: {
    type: DataTypes.STRING,
    allowNull: false,
    primaryKey: true
  },
  message_channel: {
    type: DataTypes.STRING,
    allowNull: true
  },
  interval: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: "NEVER"
  }
})

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
const eventFiles = fs.readdirSync('./events').filter(file => file.endsWith('.js'));

/* -- COMMAND HANDLING -- */

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  client.commands.set(command.name, command);
}

/* -- EVENT HANDLING -- */

for (const file of eventFiles) {
  const event = require(`./events/${file}`);
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args, client));
  }
  else {
    client.on(event.name, (...args) => event.execute(...args, client));
  }
}

/* -- POSITIVE REMINDERS -- */

const intervals = {
  NEVER: 0,
  HOURLY: 3600000,
  DAILY: 86400000,
  WEEKLY: 604800000,
  TEST: 60000
};

function sendReminder(duration) {
  Servers.findAll({
    where: {
      interval: duration
    }
  })
  .then(servers => {
    if (servers || server.length > 0) {
      servers.forEach((server, i) => {
        client.guilds.fetch(server.server_id)
              .then(guild => {
                fs.readFile("./content/quotes.txt", 'utf-8', (err, quotes) => {
                  if (err) {
                    throw err;
                  }

                  let quotesArray = quotes.split('%');
                  const randomQuoteIndex = Math.floor(Math.random() * quotesArray.length);
                  const randomQuote = quotesArray[randomQuoteIndex];
                  const genEmbed = new Discord.MessageEmbed()
                                           .setColor(embed)
                                           .setTitle("Here is your reminder:")
                                           .setDescription(randomQuote);
                });
                guild.systemChannel.send(genEmbed);
              })
              .catch(error => console.error(error));
      });
    }
  }).catch(error => console.error(error));
}


setInterval(function(){ sendReminder("HOURLY")}, intervals.HOURLY);
setInterval(function(){ sendReminder("DAILY")}, intervals.DAILY);
setInterval(function(){ sendReminder("WEEKLY")}, intervals.WEEKLY);
setInterval(function(){ sendReminder("TEST")}, intervals.TEST);

client.login(process.env.TOKEN);

exports.Table = Servers;
