module.exports = {
  name: 'volume',
  description: 'Ses seviyesini ayarlar (0-100)',
  cooldown: 3,
  options: [
    {
      name: 'seviye',
      description: 'Ses seviyesi (0-100)',
      type: 4,
      required: true,
      min_value: 0,
      max_value: 100
    }
  ],
  
  async execute(interaction, client) {
    const serverQueue = client.queue.get(interaction.guild.id);
    
    if (!serverQueue) {
      return interaction.reply({ 
        content: '❌ **Bot ses kanalında değil!**', 
        ephemeral: true 
      });
    }

    const volume = interaction.options.getInteger('seviye');
    serverQueue.volume = volume;
    
    // Volume desteği varsa
    if (serverQueue.player?.state?.resource?.volume) {
      serverQueue.player.state.resource.volume.setVolume(volume / 100);
    }

    await interaction.reply(`🔊 **Ses seviyesi %${volume} olarak ayarlandı!**`);
  }
};
