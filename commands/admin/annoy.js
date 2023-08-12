const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { joinVoiceChannel } = require('@discordjs/voice');

// leave and join the given voice channel quickly
module.exports = {
  data: new SlashCommandBuilder()
    .setName('annoy')
    .setDescription('Annoys the given voice channel.')
    .addChannelOption((option) =>
      option.setName('channel').setDescription('The voice channel to annoy.').setRequired(true)
    )
    .addIntegerOption((option) =>
      option.setName('times').setDescription('How many times to annoy the channel.').setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .setDMPermission(false),

  async execute(interaction) {
    const channel = interaction.options.getChannel('channel');
    const times = interaction.options.getInteger('times');

    // check if the channel is a voice channel
    if (channel.type !== 2) {
      await interaction.reply('The channel needs to be a voice channel.');
      return;
    }

    for (let i = 0; i < times; i++) {
      // join the voice channel
      const connection = joinVoiceChannel({
        channelId: channel.id,
        guildId: channel.guild.id,
        adapterCreator: channel.guild.voiceAdapterCreator,
      });

      // leave the voice channel
      connection.destroy();
    }

    await interaction.reply(`Annoying ${channel.name}!`);
  },
};
