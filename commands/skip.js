module.exports = {
  name: 'skip',
  description: 'Sonraki şarkıya geçer',
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

    serverQueue.player.stop();
    await message.reply('⏭️ **Sonraki şarkıya geçiliyor...**');
  }
};
