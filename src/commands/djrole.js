const config = require('../../config');

module.exports = {
  name: 'djrole',
  description: 'DJ rolü ayarlar',
  aliases: ['dj', 'djrol', 'setdj'],
  cooldown: 5,
  
  async execute(message, args, client) {
    if (!message.member.permissions.has('ADMINISTRATOR')) {
      return message.reply('❌ **Bu komutu sadece yöneticiler kullanabilir!**');
    }

    if (!client.djRoles) client.djRoles = new Map();

    if (args.length === 0) {
      const currentDjRoleId = client.djRoles.get(message.guild.id);
      if (!currentDjRoleId) return message.reply('ℹ️ **DJ rolü ayarlanmamış!**');
      
      const role = message.guild.roles.cache.get(currentDjRoleId);
      return message.reply(`🎧 **Mevcut DJ rolü:** ${role?.name || 'Bilinmiyor'}`);
    }

    if (['sil', 'remove', 'kaldır'].includes(args[0].toLowerCase())) {
      client.djRoles.delete(message.guild.id);
      return message.reply(config.messages.djRoleRemoved);
    }

    let role = null;
    if (args[0].match(/^[0-9]+$/)) {
      role = message.guild.roles.cache.get(args[0]);
    } else if (args[0].startsWith('<@&')) {
      const roleId = args[0].slice(3, -1);
      role = message.guild.roles.cache.get(roleId);
    } else {
      const roleName = args.join(' ');
      role = message.guild.roles.cache.find(r => r.name.toLowerCase() === roleName.toLowerCase());
    }

    if (!role) return message.reply('❌ **Rol bulunamadı!**');

    client.djRoles.set(message.guild.id, role.id);
    return message.reply(`${config.messages.djRoleSet} ${role.name}`);
  }
};
