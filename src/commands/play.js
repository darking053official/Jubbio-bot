const { createAudioPlayer, createAudioResource, AudioPlayerStatus } = require('@jubbio/voice');

module.exports = {
  name: 'play',
  description: 'Müzik çalar veya kuyruğa ekler',
  cooldown: 3,
  options: [
    {
      name: 'url',
      description: 'YouTube video URL\'si',
      type: 3,
      required: true
    }
  ],
  
  async execute(interaction, client) {
    const url = interaction.options.getString('url');
    const serverQueue = client.queue.get(interaction.guild.id);

    // URL kontrolü
    if (!url.includes('youtu.be/') && !url.includes('youtube.com/')) {
      return interaction.reply({ 
        content: '❌ **Geçersiz YouTube URL\'si!**', 
        ephemeral: true 
      });
    }

    // Bot kanalda mı?
    if (!serverQueue || !serverQueue.connection) {
      return interaction.reply({ 
        content: '❌ **Önce /join yazıp beni kanala çağır!**', 
        ephemeral: true 
      });
    }

    // Player yoksa oluştur
    if (!serverQueue.player) {
      serverQueue.player = createAudioPlayer();
      serverQueue.connection.subscribe(serverQueue.player);
    }

    // Kuyruğa ekle
    if (!serverQueue.songs) serverQueue.songs = [];
    serverQueue.songs.push(url);

    // Şarkı başlat
    if (serverQueue.songs.length === 1) {
      await interaction.reply(`⏳ **Müzik yükleniyor...**`);
      await playSong(interaction.guild.id, client);
    } else {
      await interaction.reply(`📋 **Şarkı kuyruğa eklendi!**\n📊 **Sıradaki şarkı sayısı:** ${serverQueue.songs.length}`);
    }
  }
};

async function playSong(guildId, client) {
  const serverQueue = client.queue.get(guildId);
  if (!serverQueue || !serverQueue.songs || !serverQueue.songs.length) return;

  try {
    const resource = createAudioResource(serverQueue.songs[0]);
    serverQueue.player.play(resource);

    // Şarkı bittiğinde
    serverQueue.player.removeAllListeners(AudioPlayerStatus.Idle);
    serverQueue.player.once(AudioPlayerStatus.Idle, () => {
      if (serverQueue.loop) {
        // Tek şarkıyı döngüye al
        playSong(guildId, client);
      } else if (serverQueue.loopQueue) {
        // Tüm kuyruğu döngüye al
        const firstSong = serverQueue.songs.shift();
        serverQueue.songs.push(firstSong);
        playSong(guildId, client);
      } else {
        // Normal sıradaki şarkıya geç
        serverQueue.songs.shift();
        playSong(guildId, client);
      }
    });

    // Hata durumunda
    serverQueue.player.removeAllListeners('error');
    serverQueue.player.once('error', (error) => {
      console.error('Player hatası:', error);
      serverQueue.songs.shift();
      playSong(guildId, client);
    });

  } catch (error) {
    console.error('Şarkı çalma hatası:', error);
    serverQueue.songs.shift();
    playSong(guildId, client);
  }
      }
