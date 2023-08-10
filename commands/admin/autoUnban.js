const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('unban-mode')
    .setDescription('If mode is on, it will automatically unban any banned user in the list.')
    .addBooleanOption((option) => option.setName('mode').setDescription('The mode to set.').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
    .setDMPermission(false),

  async execute(interaction) {
    const mode = interaction.options.getBoolean('mode');
    const server = interaction.guild;

    /*
        The autoUnban list is a JSON file that looks like this:
        [
            { 'server': 'serverID', 'autoUnban': false },
        ]
        */

    const unbanListPath = path.join(__dirname, '/../../data/autoUnban.json');
    if (!fs.existsSync(unbanListPath)) {
      fs.writeFileSync(unbanListPath, JSON.stringify([]));
    }

    // read the autoUnban list
    const unbanList = JSON.parse(fs.readFileSync(unbanListPath));

    // check if the server is already in the autoUnban list and update the entry if it is
    const serverIndex = unbanList.findIndex((entry) => entry.server === server.id);
    if (serverIndex !== -1) {
      unbanList[serverIndex] = { server: server.id, autoUnban: mode };
      fs.writeFileSync(unbanListPath, JSON.stringify(unbanList));
      await interaction.reply(`autoUnban mode for \`${server.name}\` has been updated to \`${mode}\`.`);
      return;
    }

    // add the server to the autoUnban list
    unbanList.push({ server: server.id, autoUnban: mode });
    fs.writeFileSync(unbanListPath, JSON.stringify(unbanList));

    await interaction.reply(`autoUnban mode for \`${server.name}\` has been set to \`${mode}\`.`);
  },
};
