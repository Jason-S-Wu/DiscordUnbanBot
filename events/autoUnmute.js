const { Events } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');

module.exports = {
  name: Events.VoiceStateUpdate,
  async execute(member, new_member) {
    try {
      // if server is in the autoUnmute list remove the timeout
      const autoUnmutePath = path.join(__dirname, '/../data/autoUnmute.json');
      if (!fs.existsSync(autoUnmutePath)) {
        fs.writeFileSync(autoUnmutePath, JSON.stringify([]));
      }

      // read the autoUnmute list
      const autoUnmuteList = JSON.parse(fs.readFileSync(autoUnmutePath));

      // if server is in the autoUnmute list remove the timeout
      const server = autoUnmuteList.find((entry) => entry.server === member.guild.id);
      if (server.autoUnmute && (new_member.serverMute || new_member.serverDeaf)) {
        new_member.setMute(false);
        new_member.setDeaf(false);
      }
    } catch (e) {
      console.log(e);
    }
  },
};
