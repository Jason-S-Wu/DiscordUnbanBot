const { Events } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');

module.exports = {
  name: Events.GuildMemberUpdate,
  async execute(member) {
    // if server is in the autoUntimeout list remove the timeout

    const autoUntimeoutPath = path.join(__dirname, '/../data/autoUntimeout.json');
    if (!fs.existsSync(autoUntimeoutPath)) {
      fs.writeFileSync(autoUntimeoutPath, JSON.stringify([]));
    }
    // read the autoUntimeout list
    const autoUntimeoutList = JSON.parse(fs.readFileSync(autoUntimeoutPath));

    // if server is in the autoUntimeout list remove the timeout
    const server = autoUntimeoutList.find((entry) => entry.server === member.guild.id);
    if (server && server.autoUntimeout) {
      member.timeout(null);
    }
  },
};
