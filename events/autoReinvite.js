const { Events } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');

module.exports = {
  name: Events.GuildMemberRemove,
  async execute(member) {
    const autoUnbanPath = path.join(__dirname, '/../data/autoUnban.json');
    if (!fs.existsSync(autoUnbanPath)) {
      fs.writeFileSync(autoUnbanPath, JSON.stringify([]));
    }
    const autoUnbanList = JSON.parse(fs.readFileSync(autoUnbanPath));
    const server = autoUnbanList.find((entry) => entry.server === member.guild.id);

    if (server && server.autoUnban) {
      const unbanListPath = path.join(__dirname, '/../data/unbanList.json');
      if (!fs.existsSync(unbanListPath)) {
        fs.writeFileSync(unbanListPath, JSON.stringify([]));
      }
      const unbanList = JSON.parse(fs.readFileSync(unbanListPath));
      const user = unbanList.find((entry) => entry.server === member.guild.id && entry.user === member.id);
      if (user) {
        try {
          await member.guild.members.unban(user.user, `User is in the unban list.`);
        } catch (e) {
          console.log('User Not Banned!');
        }

        let channel = member.guild.channels.cache;

        channel = channel.find((c) => c.type === 0); // text channel

        const invite = await channel
          .createInvite({
            maxAge: 0,
            maxUses: 1,
            unique: true,
            reason: `User is in the unban list.`,
          })
          .catch(console.error);

        // send the invite to the user
        try {
          await member.send(`You have been unbanned from ${member.guild.name}.\nInvite link: \n${invite.url}`);
        } catch (e) {
          console.log(e);
        }
      }
    }
  },
};
