module.exports = {
  name: 'djrole',
  description: 'DJ rolü ayarlar veya gösterir (geçici)',
  aliases: ['dj', 'djrol'],
  cooldown: 3,
  
  async execute(message, args, client) {
    // Admin kontrolü
    if (!message.member.permissions.has('ADMINISTRATOR')) {
      return message.reply('❌ **Bu komutu sadece yöneticiler kullanabilir!**');
    }

    // DJ rolü map'ini başlat (yoksa)
    if (!client.djRoles) client.djRoles = new Map();

    // Eğer argüman yoksa mevcut DJ rolünü göster
    if (args.length === 0) {
      const currentDjRoleId = client.djRoles.get(message.guild.id);
      
      if (!currentDjRoleId) {
        return message.reply('ℹ️ **Henüz bir DJ rolü ayarlanmamış!**\nKullanım: `!djrole @rol` veya `!djrole sil`');
      }

      const role = message.guild.roles.cache.get(currentDjRoleId);
      if (!role) {
        client.djRoles.delete(message.guild.id);
        return message.reply('⚠️ **Kayıtlı DJ rolü bulunamadı, sıfırlandı!**');
      }

      return message.reply(`🎧 **Mevcut DJ rolü:** ${role.name}`);
    }

    // Rolü silme
    if (args[0].toLowerCase() === 'sil' || args[0].toLowerCase() === 'remove' || args[0].toLowerCase() === 'kaldır') {
      client.djRoles.delete(message.guild.id);
      return message.reply('✅ **DJ rolü kaldırıldı!** Artık herkes müzik komutlarını kullanabilir.');
    }

    // Rolü bul
    let role = null;
    
    // Rol ID'si ile
    if (args[0].match(/^[0-9]+$/)) {
      role = message.guild.roles.cache.get(args[0]);
    } 
    // Rol mention ile
    else if (args[0].startsWith('<@&') && args[0].endsWith('>')) {
      const roleId = args[0].slice(3, -1);
      role = message.guild.roles.cache.get(roleId);
    }
    // Rol ismi ile
    else {
      const roleName = args.join(' ');
      role = message.guild.roles.cache.find(r => r.name.toLowerCase() === roleName.toLowerCase());
    }

    // Rol bulunamadıysa
    if (!role) {
      return message.reply('❌ **Rol bulunamadı!**\nDoğru kullanım: `!djrole @rol` veya `!djrole "Rol İsmi"`');
    }

    // Rolü kaydet
    client.djRoles.set(message.guild.id, role.id);
    
    return message.reply(`✅ **DJ rolü başarıyla ayarlandı!**\n🎧 **Yeni DJ rolü:** ${role.name}\n⚠️ **Not:** Bu ayar geçicidir, bot yeniden başlayınca sıfırlanır.`);
  }
};
