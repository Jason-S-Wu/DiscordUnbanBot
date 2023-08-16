const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('unmute-mode')
    .setDescription('If mode is on, it will automatically remove any mutes/deafens.')
    .addBooleanOption((option) => option.setName('mode').setDescription('The mode to set.').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
    .setDMPermission(false),

  async execute(interaction) {
    const mode = interaction.options.getBoolean('mode');
    const server = interaction.guild;

    /*
    The autoUnmute list is a JSON file that looks like this:
    [
        { 'server': 'serverID', 'autoUnmute': false },
    ]
    */

    const unmuteListPath = path.join(__dirname, '/../../data/autoUnmute.json');
    if (!fs.existsSync(unmuteListPath)) {
      fs.writeFileSync(unmuteListPath, JSON.stringify([]));
    }

    // read the autoUnmute list
    const unmuteList = JSON.parse(fs.readFileSync(unmuteListPath));

    // check if the server is already in the autoUnmute list and update the entry if it is
    const serverIndex = unmuteList.findIndex((entry) => entry.server === server.id);
    if (serverIndex !== -1) {
      unmuteList[serverIndex] = { server: server.id, autoUnmute: mode };
      fs.writeFileSync(unmuteListPath, JSON.stringify(unmuteList));
      await interaction.reply(`autoUnmute mode for \`${server.name}\` has been updated to \`${mode}\`.`);
      return;
    }

    // add the server to the autoUnmute list
    unmuteList.push({ server: server.id, autoUnmute: mode });
    fs.writeFileSync(unmuteListPath, JSON.stringify(unmuteList));

    await interaction.reply(`autoUnmute mode for \`${server.name}\` has been set to \`${mode}\`.`);
  },
};
