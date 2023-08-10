const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('untimeout-mode')
    .setDescription('If mode is on, it will automatically remove any timeouts.')
    .addBooleanOption((option) => option.setName('mode').setDescription('The mode to set.').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
    .setDMPermission(false),

  async execute(interaction) {
    const mode = interaction.options.getBoolean('mode');
    const server = interaction.guild;

    /*
    The autoUntimeout list is a JSON file that looks like this:
    [
        { 'server': 'serverID', 'autoUntimeout': false },
    ]
    */

    const unbanListPath = path.join(__dirname, '/../../data/autoUntimeout.json');
    if (!fs.existsSync(unbanListPath)) {
      fs.writeFileSync(unbanListPath, JSON.stringify([]));
    }

    // read the autoUntimeout list
    const unbanList = JSON.parse(fs.readFileSync(unbanListPath));

    // check if the server is already in the autoUntimeout list and update the entry if it is
    const serverIndex = unbanList.findIndex((entry) => entry.server === server.id);
    if (serverIndex !== -1) {
      unbanList[serverIndex] = { server: server.id, autoUntimeout: mode };
      fs.writeFileSync(unbanListPath, JSON.stringify(unbanList));
      await interaction.reply(`autoUntimeout mode for \`${server.name}\` has been updated to \`${mode}\`.`);
      return;
    }

    // add the server to the autoUntimeout list
    unbanList.push({ server: server.id, autoUntimeout: mode });
    fs.writeFileSync(unbanListPath, JSON.stringify(unbanList));

    await interaction.reply(`autoUntimeout mode for \`${server.name}\` has been set to \`${mode}\`.`);
  },
};
