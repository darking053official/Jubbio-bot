module.exports = {
  token: process.env.BOT_TOKEN || '9ad08124af59f0853aeda02a62ac722c26c43d7578e0981d8927d3b9e26ad900',
  prefix: '!',
  defaultVolume: 50,
  maxQueueSize: 100,
  
  djRole: {
    enabled: true,
    roleName: 'DJ',
    requiredFor: ['skip', 'stop', 'pause', 'queue'],
    adminBypass: true
  },
  
  voice: {
    selfDeaf: false,
    selfMute: false,
    leaveOnEmpty: true,
    leaveOnStop: true,
    leaveOnFinish: false
  },
  
  messages: {
    notInVoiceChannel: '❌ **Önce bir ses kanalına girmelisin!**',
    noMusicPlaying: '❌ **Şu an müzik çalmıyor!**',
    queueEmpty: '📭 **Kuyruk boş!**',
    needDjRole: '❌ **Bu komut için DJ rolü gerekiyor!**',
    joinedVoice: '✅ **Ses kanalına katıldım!**',
    leftVoice: '👋 **Kanal terk edildi!**',
    addedToQueue: '🎵 **Şarkı kuyruğa eklendi!**',
    nowPlaying: '▶️ **Şimdi çalıyor:**',
    paused: '⏸️ **Müzik duraklatıldı!**',
    resumed: '▶️ **Müzik devam ediyor!**',
    stopped: '⏹️ **Müzik durduruldu!**',
    skipped: '⏭️ **Sonraki şarkıya geçildi!**',
    djRoleSet: '✅ **DJ rolü ayarlandı:**',
    djRoleRemoved: '✅ **DJ rolü kaldırıldı!**',
    commandError: '❌ **Komut çalıştırılırken hata oluştu!**'
  },
  
  emojis: {
    play: '▶️',
    pause: '⏸️',
    stop: '⏹️',
    skip: '⏭️',
    queue: '📋',
    music: '🎵',
    error: '❌',
    success: '✅'
  }
};
