const { Client, GatewayIntentBits } = require('@jubbio/core');
const { joinVoiceChannel, createAudioPlayer, createAudioResource } = require('@jubbio/voice');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates
  ]
});

const BOT_TOKEN = process.env.BOT_TOKEN;

let player = createAudioPlayer();
let connection = null;
let queue = [];

client.on('ready', () => {
  console.log('✅ BOT ÇALIŞIYOR!');
  console.log(`📢 Bot adı: ${client.user?.username}`);
  console.log(`📢 Komutlar: !katil !cal !dur !gec !sira !yardim !ping`);
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;
  if (!message.content.startsWith('!')) return;

  const args = message.content.slice(1).split(' ');
  const command = args[0].toLowerCase();

  // !ping - TEST
  if (command === 'ping') {
    await message.reply('🏓 PONG! BOT ÇALIŞIYOR!');
  }

  // !katil - SES KANALINA KATIL
  else if (command === 'katil') {
    const voiceChannel = message.member?.voice?.channel;
    
    if (!voiceChannel) {
      return message.reply('❌ Önce bir ses kanalına girmelisin!');
    }

    try {
      connection = joinVoiceChannel({
        channelId: voiceChannel.id,
        guildId: message.guild.id,
        adapterCreator: message.guild.voiceAdapterCreator
      });
      
      await message.reply(`✅ **${voiceChannel.name}** kanalına katıldım!`);
    } catch (error) {
      await message.reply(`❌ Hata: ${error.message}`);
    }
  }

  // !cal - MÜZİK ÇAL
  else if (command === 'cal') {
    if (!connection) {
      return message.reply('❌ Önce !katil yazıp beni kanala çağır!');
    }

    const url = args[1];
    if (!url) {
      return message.reply('❌ Lütfen YouTube URL\'si ver! Örnek: !cal https://youtu.be/...');
    }

    queue.push(url);
    
    if (queue.length === 1) {
      await message.reply('🎵 Müzik yükleniyor...');
      try {
        const resource = createAudioResource(url);
        player.play(resource);
        connection.subscribe(player);
        await message.reply('🎵 Müzik çalıyor!');
      } catch (error) {
        await message.reply('❌ Müzik çalınamadı: ' + error.message);
        queue.shift();
      }
    } else {
      await message.reply(`🎵 Şarkı kuyruğa eklendi! Kuyrukta ${queue.length} şarkı var.`);
    }
  }

  // !dur - MÜZİĞİ DURDUR
  else if (command === 'dur') {
    player.stop();
    queue = [];
    await message.reply('⏹️ Müzik durduruldu ve kuyruk temizlendi!');
  }

  // !gec - SONRAKİ ŞARKIYA GEÇ
  else if (command === 'gec') {
    if (queue.length <= 1) {
      queue = [];
      player.stop();
      return message.reply('⏹️ Kuyrukta başka şarkı yok, müzik durduruldu.');
    }
    
    queue.shift();
    const nextUrl = queue[0];
    try {
      const resource = createAudioResource(nextUrl);
      player.play(resource);
      await message.reply('⏭️ Sonraki şarkıya geçildi!');
    } catch (error) {
      await message.reply('❌ Geçiş hatası: ' + error.message);
    }
  }

  // !sira - KUYRUKTAKİ ŞARKILAR
  else if (command === 'sira') {
    if (queue.length === 0) return message.reply('📭 Kuyruk boş!');
    
    let siraList = '';
    queue.forEach((url, index) => {
      const shortUrl = url.length > 30 ? url.substring(0, 30) + '...' : url;
      siraList += `${index + 1}. ${shortUrl}\n`;
    });
    
    await message.reply(`📋 **Kuyruktaki şarkılar (${queue.length}):**\n${siraList}`);
  }

  // !yardim - YARDIM MENÜSÜ
  else if (command === 'yardim') {
    await message.reply(`
📋 **MÜZİK BOTU KOMUTLARI:**
!ping - Bot test
!katil - Ses kanalına katıl
!cal <url> - Müzik çal (YouTube)
!dur - Müziği durdur
!gec - Sonraki şarkıya geç
!sira - Kuyruktaki şarkılar
!yardim - Bu menü
    `);
  }
});

client.login(BOT_TOKEN).catch(err => {
  console.error('❌ Bot başlatılamadı:', err.message);
});
