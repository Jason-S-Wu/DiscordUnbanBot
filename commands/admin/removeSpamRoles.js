const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');
module.exports = {
  data: new SlashCommandBuilder()
    .setName('remove-spam-roles')
    .setDescription('Removes all roles named BOT_ROLE_SPAM.')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .setDMPermission(false),

  async execute(interaction) {
    const server = interaction.guild;

    const botSpamPath = path.join(__dirname, '/../../data/botSpam.json');
    if (!fs.existsSync(botSpamPath)) {
      fs.writeFileSync(botSpamPath, JSON.stringify([]));
    }

    // read the autoUnban list
    const botSpamList = JSON.parse(fs.readFileSync(botSpamPath));

    // check if the server is already in the autoUnban list and update the entry if it is
    const serverIndex = botSpamList.findIndex((entry) => entry.server === server.id);
    if (serverIndex !== -1) {
      botSpamList[serverIndex] = { server: server.id, botSpam: false };
      fs.writeFileSync(botSpamPath, JSON.stringify(botSpamList));
    }

    const roles = interaction.guild.roles.cache.filter((role) => role.name === 'BOT_ROLE_SPAM');
    await interaction.reply(`Removed ${roles.size} roles.`);
    roles.forEach((role) => role.delete());
  },
};
