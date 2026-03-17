const { joinVoiceChannel, getVoiceConnection } = require('@jubbio/voice');

module.exports = {
  name: 'join',
  description: 'Botu ses kanalına çağırır',
  cooldown: 2,
  
  async execute(interaction, client) {
    await interaction.deferReply();
    
    try {
      // ÖNCE GELİŞMİŞ LOG
      console.log('👤 Kullanıcı:', interaction.user.username);
      console.log('🌍 Sunucu:', interaction.guild?.name || 'YOK');
      
      // Guild kontrolü
      if (!interaction.guild) {
        return interaction.editReply('❌ **Bu komut sadece sunucularda kullanılabilir!**');
      }

      // Üyeyi fetch et (cache sorununu çözer)
      const member = await interaction.guild.members.fetch(interaction.user.id);
      console.log('👤 Member fetch edildi:', member.user.username);
      
      const voiceChannel = member.voice?.channel;
      console.log('🔊 Ses kanalı:', voiceChannel?.name || 'YOK');
      
      if (!voiceChannel) {
        return interaction.editReply('❌ **Önce bir ses kanalına girmelisin!**');
      }

      // Botun yetkilerini kontrol et
      const permissions = voiceChannel.permissionsFor(interaction.guild.members.me);
      if (!permissions.has('Connect')) {
        return interaction.editReply('❌ **Ses kanalına bağlanma iznim yok!**');
      }
      if (!permissions.has('Speak')) {
        return interaction.editReply('❌ **Ses kanalında konuşma iznim yok!**');
      }

      // Varsa eski bağlantıyı temizle
      const oldConnection = getVoiceConnection(interaction.guild.id);
      if (oldConnection) oldConnection.destroy();

      // Yeni bağlantı
      const connection = joinVoiceChannel({
        channelId: voiceChannel.id,
        guildId: interaction.guild.id,
        adapterCreator: interaction.guild.voiceAdapterCreator,
        selfDeaf: false,
        selfMute: false
      });

      // Kuyruk oluştur
      if (!client.queue) client.queue = new Map();
      client.queue.set(interaction.guild.id, {
        connection: connection,
        songs: [],
        player: null
      });

      await interaction.editReply(`✅ **${voiceChannel.name}** kanalına katıldım! 🎧`);
      
    } catch (error) {
      console.error('❌ Join hatası:', error);
      await interaction.editReply(`❌ **Hata:** ${error.message}`);
    }
  }
};
