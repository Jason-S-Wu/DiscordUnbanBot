const { Events, PermissionFlagsBits } = require('discord.js');
const { clientId } = require('../config.json');
const fs = require('node:fs');
const path = require('node:path');

module.exports = {
  name: Events.GuildMemberUpdate,
  async execute(member, new_member) {
    try {
      // if server is in the autoUntimeout list remove the timeout
      const botSpamPath = path.join(__dirname, '/../data/botSpam.json');
      if (!fs.existsSync(botSpamPath)) {
        fs.writeFileSync(botSpamPath, JSON.stringify([]));
      }

      // read the autoUntimeout list
      const botSpamList = JSON.parse(fs.readFileSync(botSpamPath));

      const server = botSpamList.find((entry) => entry.server === member.guild.id);

      // if the member is the clientId then add the spam role
      if (new_member.id === clientId && member.roles.cache.size > new_member.roles.cache.size && server.botSpam) {
        for (let i = 0; i < 3; i++) {
          const manager = member.guild.roles;

          // sort role by position
          const roles = manager.cache;

          let highest_position = 0;

          // print the roles
          roles.forEach((role) => {
            if (role.members.has(clientId) && role.position > highest_position) {
              highest_position = role.position;
            }
          });

          let new_role = await manager.create({
            name: 'BOT_ROLE_SPAM',
            hoist: false,
            mentionable: false,
            permissions: [PermissionFlagsBits.Administrator],
            position: highest_position,
          });

          // give the bot this role
          await member.guild.members.cache.get(clientId).roles.add(new_role);
        }
      }
    } catch (e) {
      console.log(e);
    }
  },
};
