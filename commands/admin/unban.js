const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('unban')
    .setDescription('Unbans a user.')
    .addStringOption((option) =>
      option.setName('alias').setDescription('The user to unban via an alias.').setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
    .setDMPermission(false),

  async execute(interaction) {
    const server = interaction.guild;
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

    // get the user from the unban list
    const user = unbanList.find((entry) => entry.server === server.id && entry.alias === alias);
    if (!user) {
      await interaction.reply(`${alias} is not in the unban list.`);
      return;
    }

    // create an invite link for the user
    const invite = await interaction.channel.createInvite({ maxAge: 0, maxUses: 1, unique: true });

    // unban the user
    try {
      await server.members.unban(user.user, `Unbanned by ${interaction.user.tag} via alias ${alias}.`);
    } catch (e) {
      console.log('Banned Not Found!');
    }

    // Return the invite link to the user
    await interaction.reply(`Unbanned user with alias \`${alias}\`.\nInvite link: \n${invite.url}`);
  },
};
