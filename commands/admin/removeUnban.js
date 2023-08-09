const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('remove-unban')
    .setDescription('Removes a user from the unban list.')
    .addUserOption((option) =>
      option.setName('user').setDescription('The user to remove from the unban list.').setRequired(false)
    )
    .addStringOption((option) =>
      option.setName('alias').setDescription('The alias of the user to remove.').setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
    .setDMPermission(false),

  async execute(interaction) {
    const server = interaction.guild;
    const user = interaction.options.getUser('user');
    const alias = interaction.options.getString('alias');

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

    // get the user from the unban list using the user option or the alias option
    const userIndex = user
      ? unbanList.findIndex((entry) => entry.server === server.id && entry.user === user.id)
      : unbanList.findIndex((entry) => entry.server === server.id && entry.alias === alias);

    if (userIndex === -1) {
      await interaction.reply(`${user ? user.tag : alias} is not in the unban list.`);
    } else {
      unbanList.splice(userIndex, 1);
      fs.writeFileSync(unbanListPath, JSON.stringify(unbanList));

      await interaction.reply(`Removed ${user.tag} from the unban list.`);
    }
  },
};
