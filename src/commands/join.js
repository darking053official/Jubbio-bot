const { joinVoiceChannel } = require('@jubbio/voice');

module.exports = {
  name: 'join',
  description: 'Botu ses kanalına çağırır',
  aliases: ['gel', 'katil'],
  
  async execute(message, args, client) {
    try {
      // ÜYEYİ FETCH ET (cache sorununu çözer)
      const member = await message.guild.members.fetch(message.author.id);
      const voiceChannel = member.voice?.channel;
      
      console.log('👤 Kullanıcı:', member.user.username);
      console.log('🔊 Ses kanalı:', voiceChannel?.name || 'YOK');
      
      if (!voiceChannel) {
        return message.reply('❌ **Ses kanalında değilsin!**');
      }

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
      
    } catch (error) {
      console.error('❌ Join hatası:', error);
      await message.reply(`❌ **Hata:** ${error.message}`);
    }
  }
};
