const { joinVoiceChannel, getVoiceConnection } = require('@jubbio/voice');

module.exports = {
  name: 'join',
  description: 'Botu ses kanalına çağırır',
  cooldown: 2,
  
  async execute(interaction, client) {
    // Önce beklet (uzun sürebilir)
    await interaction.deferReply();
    
    try {
      // ===== DETAYLI LOG =====
      console.log('=================================');
      console.log('🔊 JOIN KOMUTU ÇALIŞTI');
      console.log(`👤 Kullanıcı: ${interaction.user.username} (${interaction.user.id})`);
      console.log(`🌍 Sunucu: ${interaction.guild?.name || 'YOK'} (${interaction.guild?.id || 'YOK'})`);
      
      // ===== 1. SUNUCU KONTROLÜ =====
      if (!interaction.guild) {
        console.log('❌ Sunucu yok (DM)');
        return interaction.editReply('❌ **Bu komut sadece sunucularda kullanılabilir!**');
      }

      // ===== 2. ÜYEYİ FETCH ET (EN ÖNEMLİ KISIM) =====
      console.log('🔄 Üye fetch ediliyor...');
      let member;
      try {
        member = await interaction.guild.members.fetch(interaction.user.id);
        console.log(`✅ Üye fetch edildi: ${member.user.username}`);
      } catch (fetchError) {
        console.error('❌ Member fetch hatası:', fetchError.message);
        return interaction.editReply('❌ **Üye bilgilerin alınamadı! Bot sunucuda mı?**');
      }

      // ===== 3. SES KANALI KONTROLÜ =====
      const voiceChannel = member.voice?.channel;
      console.log(`🔊 Ses kanalı: ${voiceChannel?.name || 'YOK'} (${voiceChannel?.id || 'YOK'})`);
      
      if (!voiceChannel) {
        return interaction.editReply('❌ **Önce bir ses kanalına girmelisin!**');
      }

      // ===== 4. BOT YETKİLERİNİ KONTROL ET =====
      const botMember = await interaction.guild.members.fetchMe();
      const permissions = voiceChannel.permissionsFor(botMember);
      
      console.log('🔐 Yetki kontrolü:');
      console.log(`- Bağlan (Connect): ${permissions.has('Connect') ? '✅' : '❌'}`);
      console.log(`- Konuş (Speak): ${permissions.has('Speak') ? '✅' : '❌'}`);
      
      if (!permissions.has('Connect')) {
        return interaction.editReply('❌ **Ses kanalına bağlanma iznim yok!**');
      }
      if (!permissions.has('Speak')) {
        return interaction.editReply('❌ **Ses kanalında konuşma iznim yok!**');
      }

      // ===== 5. ESKİ BAĞLANTIYI TEMİZLE =====
      const oldConnection = getVoiceConnection(interaction.guild.id);
      if (oldConnection) {
        console.log('🔄 Eski bağlantı temizleniyor...');
        oldConnection.destroy();
      }

      // ===== 6. YENİ BAĞLANTI =====
      console.log(`🔗 Bağlanıyor: ${voiceChannel.name}`);
      const connection = joinVoiceChannel({
        channelId: voiceChannel.id,
        guildId: interaction.guild.id,
        adapterCreator: interaction.guild.voiceAdapterCreator,
        selfDeaf: false,
        selfMute: false
      });

      // ===== 7. KUYRUK SİSTEMİ =====
      if (!client.queue) client.queue = new Map();
      client.queue.set(interaction.guild.id, {
        connection: connection,
        songs: [],
        player: null,
        volume: 50
      });

      console.log(`✅ Başarıyla ${voiceChannel.name} kanalına katıldı!`);
      console.log('=================================');
      
      await interaction.editReply(`✅ **${voiceChannel.name}** kanalına katıldım! 🎧`);

    } catch (error) {
      console.error('❌ JOIN HATASI:', error);
      console.error('Hata detayı:', error.stack);
      
      let errorMessage = '❌ **Bir hata oluştu!**';
      if (error.message.includes('Missing Access')) {
        errorMessage = '❌ **Botun yetkisi yok! Botu sunucudan çıkarıp yeniden ekle.**';
      } else if (error.message.includes('Missing Permissions')) {
        errorMessage = '❌ **Ses kanalına bağlanma iznim yok!**';
      }
      
      await interaction.editReply(errorMessage);
    }
  }
};
