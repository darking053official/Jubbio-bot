module.exports = {
  name: 'resume',
  description: 'Duraklatılmış müziği devam ettirir',
  cooldown: 2,
  
  async execute(interaction, client) {
    const serverQueue = client.queue.get(interaction.guild.id);
    
    if (!serverQueue || !serverQueue.player) {
      return interaction.reply({ 
        content: '❌ **Çalan müzik yok!**', 
        ephemeral: true 
      });
    }

    serverQueue.player.unpause();
    await interaction.reply('▶️ **Müzik devam ediyor!**');
  }
};
