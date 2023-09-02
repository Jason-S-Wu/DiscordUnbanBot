const { Events } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');

module.exports = {
  name: Events.GuildMemberAdd,
  async execute(member) {
    const unbanListPath = path.join(__dirname, '/../data/unbanList.json');
    if (!fs.existsSync(unbanListPath)) {
      fs.writeFileSync(unbanListPath, JSON.stringify([]));
    }
    // read the unban list
    const unbanList = JSON.parse(fs.readFileSync(unbanListPath));

    // if member is in the unban list add the roles back
    const user = unbanList.find((entry) => entry.server === member.guild.id && entry.user === member.id);
    if (user) {
      try {
        await member.roles.add(user.roles, `User is in the unban list.`);
      } catch (e) {
        console.log(e);
      }
    }
  },
};
