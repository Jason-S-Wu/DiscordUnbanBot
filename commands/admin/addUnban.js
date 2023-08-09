const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');

// the command needs 3 arguments: the user to unban, the roles to add back, and an alias for the user
module.exports = {
  data: new SlashCommandBuilder()
    .setName('add-unban')
    .setDescription('Adds a user to the unban list.')
    .addUserOption((option) => option.setName('user').setDescription('The user to unban.').setRequired(true))
    .addStringOption((option) =>
      option.setName('roles').setDescription('All the roles to add back to user.').setRequired(true)
    )
    .addStringOption((option) => option.setName('alias').setDescription('The alias for the user.').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
    .setDMPermission(false),

  async execute(interaction) {
    const server = interaction.guild;
    const user = interaction.options.getUser('user');
    const alias = interaction.options.getString('alias');
    const roles_raw = interaction.options.getString('roles');

    // parse roles from the string the id starts with <@& and ends with > and the id is between those
    const roles = roles_raw.match(/<@&(\d+)>/g).map((role) => server.roles.cache.get(role.match(/<@&(\d+)>/)[1]));

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

    // check if the user is already in the unban list and update the entry if it is
    const userIndex = unbanList.findIndex((entry) => entry.server === server.id && entry.user === user.id);
    if (userIndex !== -1) {
      unbanList[userIndex] = { server: server.id, user: user.id, roles: roles.map((role) => role.id), alias: alias };
      fs.writeFileSync(unbanListPath, JSON.stringify(unbanList));
      await interaction.reply(`Updated ${user.tag} in the unban list.`);
      return;
    }

    // add the user to the unban list
    unbanList.push({ server: server.id, user: user.id, roles: roles.map((role) => role.id), alias: alias });
    fs.writeFileSync(unbanListPath, JSON.stringify(unbanList));

    await interaction.reply(`Added \`${user.tag}\` to the unban list. With alias \`${alias}\``);
  },
};
