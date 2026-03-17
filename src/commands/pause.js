module.exports = {
  name: 'pause',
  description: 'Çalan müziği duraklatır',
  cooldown: 2,
  
  async execute(interaction, client) {
    const serverQueue = client.queue.get(interaction.guild.id);
    
    if (!serverQueue || !serverQueue.player) {
      return interaction.reply({ 
        content: '❌ **Çalan müzik yok!**', 
        ephemeral: true 
      });
    }

    serverQueue.player.pause();
    await interaction.reply('⏸️ **Müzik duraklatıldı!** /resume ile devam edebilirsin.');
  }
};
