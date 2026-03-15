module.exports = {
  name: 'stop',
  description: 'Müziği durdurur ve kanaldan çıkar',
  cooldown: 3,
  async execute(message, args, client) {
    const voiceChannel = message.member?.voice?.channel;
    if (!voiceChannel) {
      return message.reply('❌ Önce ses kanalına gir!');
    }

    const serverQueue = client.queue.get(message.guild.id);
    if (!serverQueue) {
      return message.reply('❌ Çalan müzik yok!');
    }

    serverQueue.songs = [];
    serverQueue.player.stop();
    serverQueue.connection.destroy();
    client.queue.delete(message.guild.id);
    
    await message.reply('⏹️ **Müzik durduruldu ve kanaldan çıktım!**');
  }
};
