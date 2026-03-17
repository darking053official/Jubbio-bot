const { joinVoiceChannel, getVoiceConnection } = require('@jubbio/voice');

module.exports = {
  name: 'join',
  description: 'Botu ses kanalına çağırır',
  cooldown: 2,
  
  async execute(interaction, client) {
    const voiceChannel = interaction.member?.voice?.channel;
    
    if (!voiceChannel) {
      return interaction.reply({ 
        content: '❌ **Önce bir ses kanalına girmelisin!**', 
        ephemeral: true 
      });
    }

    try {
      // Varsa eski bağlantıyı temizle
      const oldConnection = getVoiceConnection(interaction.guild.id);
      if (oldConnection) oldConnection.destroy();

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
        player: null,
        volume: 50,
        loop: false,
        loopQueue: false
      });

      await interaction.reply(`✅ **${voiceChannel.name}** kanalına katıldım! 🎧`);
    } catch (error) {
      console.error('Join hatası:', error);
      await interaction.reply({ 
        content: `❌ **Hata:** ${error.message}`, 
        ephemeral: true 
      });
    }
  }
};
