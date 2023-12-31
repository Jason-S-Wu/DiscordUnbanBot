const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('unban-info')
    .setDescription('Shows the unban list.')
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
    .setDMPermission(false),

  async execute(interaction) {
    const server = interaction.guild;

    /*
        The unban list is a JSON file that looks like this:
        [
            { 'server': 'serverID', 'user': 'userID', 'roles': ['roleID', 'roleID'], 'alias': 'alias' },
        ]
    */

    const unbanListPath = path.join(__dirname, '/../../data/unbanList.json');
    if (!fs.existsSync(unbanListPath)) {
      fs.writeFileSync(unbanListPath, JSON.stringify([]));
    }
    // read the unban list
    const unbanList = JSON.parse(fs.readFileSync(unbanListPath));

    // get the users from the unban list
    const users = unbanList.filter((entry) => entry.server === server.id);

    if (users.length === 0) {
      await interaction.reply('The unban list is empty.');
    } else {
      const reply = users
        .map((user) => {
          const member = server.members.cache.get(user.user)
            ? `User: ${server.members.cache.get(user.user).user.tag}`
            : `ID: ${user.user} — Not Currently In The Server`;
          const roles = user.roles.map((role) => server.roles.cache.get(role).name).join(', ');
          return `${member}\nAlias: ${user.alias}\nRoles: ${roles}`;
        })
        .join('\n\n');
      await interaction.reply(`\`\`\`${reply}\`\`\``);
    }
  },
};
