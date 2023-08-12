const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { clientId } = require('../../config.json');
const fs = require('node:fs');
const path = require('node:path');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('spam-roles')
    .setDescription('Spams roles below the highest role of the bot.')
    .addIntegerOption((option) =>
      option.setName('times').setDescription('How many times to spam roles.').setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .setDMPermission(false),

  async execute(interaction) {
    const times = interaction.options.getInteger('times');
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
      botSpamList[serverIndex] = { server: server.id, botSpam: true };
      fs.writeFileSync(botSpamPath, JSON.stringify(botSpamList));
    } else {
      // if it is not in the list, add it
      botSpamList.push({ server: server.id, botSpam: true });
      fs.writeFileSync(botSpamPath, JSON.stringify(botSpamList));
    }

    await interaction.reply(`Spamming roles!`);

    for (let i = 0; i < times; i++) {
      // get the index of the first role below the bot's highest role using the client ID without using the cache
      const manager = interaction.guild.roles;

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
      await interaction.guild.members.cache.get(clientId).roles.add(new_role);
    }
  },
};
