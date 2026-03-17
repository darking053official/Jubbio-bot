module.exports = {
  name: 'help',
  description: 'Tüm komutları listeler',
  cooldown: 3,
  
  async execute(interaction, client) {
    const commands = client.commands.map(cmd => `/${cmd.name} - ${cmd.description || 'Açıklama yok'}`);
    
    const helpMessage = `
🎵 **MÜZİK BOTU KOMUTLARI** 🎵

${commands.join('\n')}

📌 **Toplam ${commands.length} komut**
    `;
    
    await interaction.reply(helpMessage);
  }
};
