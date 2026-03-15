const config = require('../config');

module.exports = {
  name: 'resume',
  description: 'Duraklatılmış müziği devam ettirir',
  aliases: ['devam', 'continue'],
  cooldown: 3,
  
  async execute(message, args, client) {
    const voiceChannel = message.member?.voice?.channel;
    if (!voiceChannel) {
      return message.reply(config.messages.notInVoiceChannel);
    }

    const serverQueue = client.queue?.get(message.guild.id);
    if (!serverQueue || serverQueue.songs.length === 0) {
      return message.reply(config.messages.noMusicPlaying);
    }

    serverQueue.player.unpause();
    return message.reply(config.messages.resumed);
  }
};
