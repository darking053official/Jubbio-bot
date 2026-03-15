module.exports = {
  name: 'djrole',
  description: 'DJ rolü ayarlar',
  cooldown: 10,
  async execute(message, args, client) {
    // Sadece yöneticiler kullanabilir
    if (!message.member.permissions.has('ADMINISTRATOR')) {
      return message.reply('❌ Bu komutu sadece yöneticiler kullanabilir!');
    }

    const roleName = args.join(' ');
    if (!roleName) {
      return message.reply('❌ Rol adı gerekli!');
    }

    const role = message.guild.roles.cache.find(r => r.name === roleName);
    if (!role) {
      return message.reply('❌ Böyle bir rol bulunamadı!');
    }

    // Rolü kaydet (şimdilik message'a ekleyelim)
    if (!client.djRoles) client.djRoles = new Map();
    client.djRoles.set(message.guild.id, role.id);
    
    await message.reply(`✅ **DJ rolü başarıyla ayarlandı:** ${role.name}`);
  }
};
