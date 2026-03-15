const config = require('../config');

module.exports = {
  name: 'stop',
  description: 'Müziği durdurur ve kanaldan çıkar',
  aliases: ['dur', 'leave', 'git', 'ayril'],
  cooldown: 3,
  
  async execute(message, args, client) {
    const voiceChannel = message.member?.voice?.channel;
    if (!voiceChannel) {
      return message.reply(config.messages.notInVoiceChannel);
    }

    // DJ rolü kontrolü
    const djRoleId = client.djRoles?.get(message.guild.id);
    if (config.djRole.enabled && config.djRole.requiredFor.includes('stop') && djRoleId) {
      if (!message.member.roles.cache.has(djRoleId) && !message.member.permissions.has('ADMINISTRATOR')) {
        return message.reply(config.messages.needDjRole);
      }
    }

    const serverQueue = client.queue?.get(message.guild.id);
    if (!serverQueue) {
      return message.reply(config.messages.noMusicPlaying);
    }

    serverQueue.songs = [];
    serverQueue.player.stop();
    
    if (serverQueue.connection && config.voice.leaveOnStop) {
      serverQueue.connection.destroy();
    }
    
    client.queue.delete(message.guild.id);
    
    return message.reply(config.messages.stopped);
  }
};
