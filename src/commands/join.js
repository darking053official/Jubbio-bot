const { joinVoiceChannel } = require('@jubbio/voice');

module.exports = {
  name: 'join',
  description: 'Botu ses kanalına çağırır',
  aliases: ['gel', 'katil'],
  
  async execute(message, args, client) {
    try {
      // SUNUCU KONTROLÜ
      if (!message.guild) {
        return message.reply('❌ **Bu komut sadece sunucularda kullanılabilir!**');
      }

      // KULLANICI KONTROLÜ
      if (!message.member) {
        return message.reply('❌ **Üye bilgisi alınamadı!**');
      }

      // VOICE KANAL KONTROLÜ (direkt)
      const voiceChannel = message.member.voice?.channel;
      
      console.log('👤 Kullanıcı:', message.author?.username || 'Bilinmiyor');
      console.log('🔊 Ses kanalı:', voiceChannel?.name || 'YOK');
      console.log('🌍 Sunucu:', message.guild?.name || 'YOK');
      
      if (!voiceChannel) {
        return message.reply('❌ **Önce bir ses kanalına girmelisin!**');
      }

      // BAĞLANTI
      const connection = joinVoiceChannel({
        channelId: voiceChannel.id,
        guildId: message.guild.id,
        adapterCreator: message.guild.voiceAdapterCreator
      });

      if (!client.queue) client.queue = new Map();
      client.queue.set(message.guild.id, {
        connection: connection,
        songs: []
      });

      await message.reply(`✅ **${voiceChannel.name}** kanalına katıldım!`);
      console.log(`✅ Başarılı: ${voiceChannel.name}`);
      
    } catch (error) {
      console.error('❌ Join hatası:', error);
      await message.reply(`❌ **Hata:** ${error.message || 'Bilinmeyen hata'}`);
    }
  }
};
