const servers = require("../index.js");

module.exports = {
  name: "ready",
  once: true,
  execute(client) {
    client.user.setPresence({
      activity: {
        name: "<3 help"
      },
      status: "online"
    })
    .then(console.log(`Ready! Logged in as ${client.user.tag}`)).catch(console.error);
    servers.Table.sync();
  }
}
