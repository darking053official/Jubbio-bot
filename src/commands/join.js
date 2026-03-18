const { joinVoiceChannel } = require('@jubbio/voice');
const { Room, AudioTrack } = require('livekit-client');

module.exports = {
  name: 'join',
  description: 'Botu ses kanalına çağırır',
  cooldown: 2,
  
  async execute(interaction, client) {
    await interaction.deferReply();
    
    try {
      console.log('🔊 JOIN KOMUTU ÇALIŞTI');
      
      if (!interaction.guild) {
        return interaction.editReply('❌ Bu komut sadece sunucularda kullanılabilir.');
      }

      // ===== 1. ÜYEYİ API'DEN ÇEK =====
      const memberResponse = await fetch(
        `https://gateway.jubbio.com/api/v1/bot/guilds/${interaction.guild.id}/members/${interaction.user.id}`,
        { headers: { 'Authorization': `Bot ${client.token}` } }
      );

      if (!memberResponse.ok) {
        return interaction.editReply('❌ Üye bilgileri alınamadı.');
      }

      const memberData = await memberResponse.json();
      const voiceChannelId = memberData.voice?.channel_id;

      if (!voiceChannelId) {
        return interaction.editReply('❌ Önce bir ses kanalına girmelisin!');
      }

      // ===== 2. OP 4 MESAJI GÖNDER (WebSocket üzerinden) =====
      // Bu kısım Jubbio'nun WebSocket'ine direkt erişim gerektirir
      // @jubbio/voice zaten bunu yapıyor olmalı
      
      const connection = joinVoiceChannel({
        channelId: voiceChannelId,
        guildId: interaction.guild.id,
        adapterCreator: interaction.guild.voiceAdapterCreator,
      });

      // ===== 3. KUYRUK OLUŞTUR =====
      if (!client.queue) client.queue = new Map();
      client.queue.set(interaction.guild.id, {
        connection: connection,
        songs: [],
        livekitRoom: null,
        livekitToken: null
      });

      await interaction.editReply(`✅ Ses kanalına katıldım! LiveKit ile ses iletilecek.`);

    } catch (error) {
      console.error('❌ JOIN HATASI:', error);
      await interaction.editReply(`❌ Hata: ${error.message}`);
    }
  }
};
