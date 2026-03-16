module.exports = {
  name: 'pause',
  description: 'Müziği duraklatır',
  aliases: ['durdur'],
  
  async execute(message, args, client) {
    const serverQueue = client.queue.get(message.guild.id);
    
    if (!serverQueue || !serverQueue.songs.length) {
      return message.reply('❌ **Çalan müzik yok!**');
    }

    serverQueue.player?.pause();
    await message.reply('⏸️ **Duraklatıldı!**');
  }
};
