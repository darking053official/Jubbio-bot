module.exports = {
  token: process.env.BOT_TOKEN || 'c8cdb437d9bff10e41c5cebd4600473ced13285936de75ec6ab4397c50613cc0',
  prefix: '!',
  defaultVolume: 50,
  maxQueueSize: 100,
  
  djRole: {
    enabled: true,
    roleName: 'DJ',
    requiredFor: ['skip', 'stop', 'pause', 'queue']
  },
  
  voice: {
    selfDeaf: false,
    selfMute: false,
    leaveOnEmpty: true,
    leaveOnStop: true
  },
  
  messages: {
    notInVoiceChannel: '❌ **Önce bir ses kanalına girmelisin!**',
    noPermission: '❌ **Bu komutu kullanma iznin yok!**',
    noMusicPlaying: '❌ **Şu an müzik çalmıyor!**',
    alreadyInVoice: '✅ **Zaten ses kanalındayım!**',
    joinedVoice: '✅ **Ses kanalına katıldım!**',
    leftVoice: '👋 **Kanal terk edildi!**',
    queueEmpty: '📭 **Kuyruk boş!**',
    addedToQueue: '🎵 **Şarkı kuyruğa eklendi!**',
    nowPlaying: '▶️ **Şimdi çalıyor:**',
    paused: '⏸️ **Müzik duraklatıldı!**',
    resumed: '▶️ **Müzik devam ediyor!**',
    stopped: '⏹️ **Müzik durduruldu!**',
    skipped: '⏭️ **Sonraki şarkıya geçildi!**',
    volumeSet: '🔊 **Ses seviyesi ayarlandı:**',
    djRoleSet: '✅ **DJ rolü ayarlandı:**',
    djRoleRemoved: '✅ **DJ rolü kaldırıldı!**',
    needDjRole: '❌ **Bu komut için DJ rolü gerekiyor!**',
    commandError: '❌ **Komut çalıştırılırken hata oluştu!**'
  }
};
