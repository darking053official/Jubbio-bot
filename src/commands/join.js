const { joinVoiceChannel } = require('@jubbio/voice');

module.exports = {
  name: 'join',
  description: 'Botu ses kanalına çağırır',
  aliases: ['gel', 'katil'],
  
  async execute(message, args, client) {
    const voiceChannel = message.member?.voice?.channel;
    if (!voiceChannel) {
      return message.reply('❌ **Önce bir ses kanalına girmelisin!**');
    }

    try {
      const connection = joinVoiceChannel({
        channelId: voiceChannel.id,
        guildId: message.guild.id,
        adapterCreator: message.guild.voiceAdapterCreator
      });

      // Kuyruk yoksa oluştur
      if (!client.queue.has(message.guild.id)) {
        client.queue.set(message.guild.id, {
          connection: connection,
          songs: []
        });
      }

      await message.reply(`✅ **${voiceChannel.name}** kanalına katıldım!`);
    } catch (error) {
      await message.reply(`❌ **Hata:** ${error.message}`);
    }
  }
};
