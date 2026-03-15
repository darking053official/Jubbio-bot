const { joinVoiceChannel, getVoiceConnection } = require('@jubbio/voice');
const config = require('../../config');

module.exports = {
  name: 'join',
  description: 'Botu ses kanalına çağırır',
  aliases: ['gel', 'katil', 'j'],
  cooldown: 2,
  
  async execute(message, args, client) {
    const voiceChannel = message.member?.voice?.channel;
    
    // Kullanıcı ses kanalında mı?
    if (!voiceChannel) {
      return message.reply(config.messages.notInVoiceChannel);
    }

    // Bot yetkilerini kontrol et
    const permissions = voiceChannel.permissionsFor(message.client.user);
    if (!permissions.has('CONNECT')) {
      return message.reply('❌ **Ses kanalına bağlanma iznim yok!**');
    }
    if (!permissions.has('SPEAK')) {
      return message.reply('❌ **Ses kanalında konuşma iznim yok!**');
    }

    try {
      // Varsa eski bağlantıyı temizle
      const oldConnection = getVoiceConnection(message.guild.id);
      if (oldConnection) {
        oldConnection.destroy();
      }

      // Yeni bağlantı oluştur
      const connection = joinVoiceChannel({
        channelId: voiceChannel.id,
        guildId: message.guild.id,
        adapterCreator: message.guild.voiceAdapterCreator,
        selfDeaf: config.voice?.selfDeaf || false,
        selfMute: config.voice?.selfMute || false
      });

      // Kuyruk sistemini başlat (yoksa)
      if (!client.queue) client.queue = new Map();
      
      // Eğer bu sunucu için kuyruk yoksa oluştur
      if (!client.queue.has(message.guild.id)) {
        const queueConstruct = {
          textChannel: message.channel,
          voiceChannel: voiceChannel,
          connection: connection,
          songs: [],
          volume: config.defaultVolume || 50,
          playing: false,
          player: null
        };
        client.queue.set(message.guild.id, queueConstruct);
      } else {
        // Var olan kuyruğa connection'ı ekle
        const serverQueue = client.queue.get(message.guild.id);
        serverQueue.connection = connection;
        serverQueue.voiceChannel = voiceChannel;
      }

      // Başarılı mesajı
      const joinMessage = config.messages?.joinedVoice || '✅ **Ses kanalına katıldım!**';
      return message.reply(`${joinMessage} 🎧 **${voiceChannel.name}**`);
      
    } catch (error) {
      console.error('Join komutu hatası:', error);
      return message.reply(`❌ **Kanala katılamadım:** ${error.message}`);
    }
  }
};
