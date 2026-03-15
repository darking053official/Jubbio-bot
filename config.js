module.exports = {
  // Bot token'ı (Render'dan environment variable olarak da alabilirsin)
  token: process.env.BOT_TOKEN || 'c8cdb437d9bff10e41c5cebd4600473ced13285936de75ec6ab4397c50613cc0',
  
  // Bot ayarları
  prefix: '!',
  defaultVolume: 50,
  maxQueueSize: 100,
  
  // DJ rolü ayarları (opsiyonel)
  djRole: {
    enabled: false,
    roleName: 'DJ'
  },
  
  // Mesajlar
  messages: {
    notInVoiceChannel: '❌ Önce bir ses kanalına girmelisin!',
    noPermission: '❌ Bu komutu kullanma iznin yok!',
    noMusicPlaying: '❌ Şu an müzik çalmıyor!'
  }
};
