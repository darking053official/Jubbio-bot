module.exports = {
  name: 'skip',
  description: 'Sonraki şarkıya geçer',
  aliases: ['gec', 'next'],
  
  async execute(message, args, client) {
    const serverQueue = client.queue.get(message.guild.id);
    
    if (!serverQueue || !serverQueue.songs.length) {
      return message.reply('❌ **Çalan müzik yok!**');
    }

    serverQueue.player?.stop();
    await message.reply('⏭️ **Geçiliyor...**');
  }
};
