const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus } = require('@jubbio/voice');

module.exports = {
  name: 'play',
  description: 'Müzik çalar',
  aliases: ['p', 'cal'],
  
  async execute(message, args, client) {
    const voiceChannel = message.member?.voice?.channel;
    if (!voiceChannel) {
      return message.reply('❌ **Ses kanalına gir!**');
    }

    const url = args[0];
    if (!url) {
      return message.reply('❌ **YouTube URL\'si ver!**');
    }

    let serverQueue = client.queue.get(message.guild.id);

    if (!serverQueue) {
      const connection = joinVoiceChannel({
        channelId: voiceChannel.id,
        guildId: message.guild.id,
        adapterCreator: message.guild.voiceAdapterCreator
      });

      const queueConstruct = {
        textChannel: message.channel,
        voiceChannel: voiceChannel,
        connection: connection,
        songs: [],
        player: createAudioPlayer()
      };

      connection.subscribe(queueConstruct.player);
      client.queue.set(message.guild.id, queueConstruct);
      serverQueue = queueConstruct;
    }

    serverQueue.songs.push(url);

    if (serverQueue.songs.length === 1) {
      playSong(message.guild.id, client);
      await message.reply(`▶️ **Çalıyor:** ${url}`);
    } else {
      await message.reply(`📋 **Kuyruğa eklendi!** (Sıra: ${serverQueue.songs.length})`);
    }
  }
};

async function playSong(guildId, client) {
  const serverQueue = client.queue.get(guildId);
  
  if (!serverQueue || !serverQueue.songs.length) {
    if (serverQueue?.connection) serverQueue.connection.destroy();
    client.queue.delete(guildId);
    return;
  }

  try {
    const resource = createAudioResource(serverQueue.songs[0]);
    serverQueue.player.play(resource);

    serverQueue.player.once(AudioPlayerStatus.Idle, () => {
      serverQueue.songs.shift();
      playSong(guildId, client);
    });

  } catch (error) {
    console.error(error);
    serverQueue.songs.shift();
    playSong(guildId, client);
  }
                           }
