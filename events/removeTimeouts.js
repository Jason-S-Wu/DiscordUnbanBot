const { Events } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');

module.exports = {
  name: Events.GuildMemberUpdate,
  async execute(member, new_member) {
    try {
      // if server is in the autoUntimeout list remove the timeout
      const autoUntimeoutPath = path.join(__dirname, '/../data/autoUntimeout.json');
      if (!fs.existsSync(autoUntimeoutPath)) {
        fs.writeFileSync(autoUntimeoutPath, JSON.stringify([]));
      }

      // read the autoUntimeout list
      const autoUntimeoutList = JSON.parse(fs.readFileSync(autoUntimeoutPath));

      const unbanListPath = path.join(__dirname, '/../data/unbanList.json');
      if (!fs.existsSync(unbanListPath)) {
        fs.writeFileSync(unbanListPath, JSON.stringify([]));
      }

      // read the unban list
      const unbanList = JSON.parse(fs.readFileSync(unbanListPath));

      // if member is in the unban list add the roles back
      const user = unbanList.find((entry) => entry.server === member.guild.id && entry.user === member.id);

      if (user && user.roles.length != new_member.roles.cache.size - 1) {
        await member.roles.add(user.roles, `User is in the unban list.`);
      }

      // if server is in the autoUntimeout list remove the timeout
      const server = autoUntimeoutList.find((entry) => entry.server === member.guild.id);
      if (server && server.autoUntimeout) {
        member.timeout(null);
      }
    } catch (e) {
      console.log(e);
    }
  },
};
