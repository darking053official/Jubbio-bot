const { joinVoiceChannel, getVoiceConnection } = require('@jubbio/voice');

module.exports = {
  name: 'join',
  description: 'Botu ses kanalına çağırır',
  cooldown: 2,
  
  async execute(interaction, client) {
    await interaction.deferReply({ ephemeral: true }); // Uzun sürecek, beklet
    try {
      // ===== 1. SUNUCU KONTROLÜ =====
      if (!interaction.guild) {
        return interaction.editReply('❌ Bu komut sadece sunucularda kullanılabilir.');
      }

      // ===== 2. API ÜZERİNDEN ÜYE BİLGİSİNİ ÇEK (EN GARANTİLİ) =====
      // Dökümandaki /bot/guilds/{guild_id}/members/{user_id} endpoint'ini kullanıyoruz.
      const memberResponse = await fetch(
        `https://gateway.jubbio.com/api/v1/bot/guilds/${interaction.guild.id}/members/${interaction.user.id}`,
        {
          headers: {
            'Authorization': `Bot ${client.token}`,
          },
        }
      );

      if (!memberResponse.ok) {
        console.error(`API Hatası (Üye Bilgisi): ${memberResponse.status}`);
        return interaction.editReply('❌ Üye bilgilerin alınamadı. Botun yetkilerini kontrol et.');
      }

      const memberData = await memberResponse.json();
      const voiceChannelId = memberData.voice?.channel_id; // API'den gelen voice bilgisi

      console.log(`🔊 API'den gelen ses kanal ID: ${voiceChannelId || 'YOK'}`);

      if (!voiceChannelId) {
        return interaction.editReply('❌ **Önce bir ses kanalına girmelisin!** (Bot seni göremiyor)');
      }

      // Kanal objesini al (ID'den)
      const voiceChannel = interaction.guild.channels.cache.get(voiceChannelId);
      if (!voiceChannel) {
        return interaction.editReply('❌ Ses kanalı bulunamadı.');
      }

      // ===== 3. BOT YETKİLERİNİ KONTROL ET =====
      const botMember = await interaction.guild.members.fetchMe();
      const permissions = voiceChannel.permissionsFor(botMember);
      if (!permissions.has('Connect') || !permissions.has('Speak')) {
        return interaction.editReply('❌ Botun bu kanala bağlanma/konuşma izni yok.');
      }

      // ===== 4. ESKİ BAĞLANTIYI TEMİZLE =====
      getVoiceConnection(interaction.guild.id)?.destroy();

      // ===== 5. YENİ BAĞLANTI =====
      joinVoiceChannel({
        channelId: voiceChannel.id,
        guildId: interaction.guild.id,
        adapterCreator: interaction.guild.voiceAdapterCreator,
      });

      await interaction.editReply(`✅ **${voiceChannel.name}** kanalına katıldım!`);
    } catch (error) {
      console.error('❌ JOIN HATASI:', error);
      await interaction.editReply('❌ **Bir hata oluştu.**');
    }
  }
};
