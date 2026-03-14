const { Client, GatewayIntentBits } = require('@jubbio/core');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, getVoiceConnection } = require('@jubbio/voice');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.DirectMessages
  ]
});

// TOKEN - Render'da environment variable'dan al
const BOT_TOKEN = process.env.BOT_TOKEN;

let player = createAudioPlayer();
let connection = null;
let queue = [];

client.on('ready', () => {
  console.log(`✅ ${client.user?.username} is online!`);
  console.log(`✅ Bot ID: ${client.user?.id}`);
  console.log(`✅ Komutlar: !katil, !cal, !dur, !gec, !sira, !yardim`);
});

// MESAJ KOMUTLARI
client.on('messageCreate', async (message) => {
  // Bot kendi mesajına cevap vermesin
  if (message.author.bot) return;
  
  // Sadece ! ile başlayan mesajları işle
  if (!message.content.startsWith('!')) return;

  const args = message.content.slice(1).split(' ');
  const command = args[0].toLowerCase();

  // !katil - Ses kanalına katıl (DÜZELTİLMİŞ)
  if (command === 'katil') {
    try {
      // Guild kontrolü - özel mesajda çalışmasın
      if (!message.guild) {
        return message.reply('❌ Bu komut sadece sunucularda kullanılabilir!');
      }

      // Üyeyi fetch et
      const member = await message.guild.members.fetch(message.author.id).catch(() => null);
      
      if (!member) {
        return message.reply('❌ Sunucuda üye olarak bulunamadın!');
      }

      const voiceChannel = member.voice.channel;
      
      if (!voiceChannel) {
        return message.reply('❌ Önce bir ses kanalına girmelisin!');
      }

      // Varsa eski bağlantıyı temizle
      const oldConnection = getVoiceConnection(message.guild.id);
      if (oldConnection) {
        oldConnection.destroy();
      }

      // Yeni bağlantı oluştur
      connection = joinVoiceChannel({
        channelId: voiceChannel.id,
        guildId: message.guild.id,
        adapterCreator: message.guild.voiceAdapterCreator,
        selfDeaf: false,
        selfMute: false
      });

      await message.reply(`✅ **${voiceChannel.name}** kanalına katıldım!`);
      
    } catch (error) {
      console.error('❌ Katılma hatası:', error);
      await message.reply(`❌ Kanala katılamadım: ${error.message}`);
    }
  }

  // !cal - Müzik çal
  else if (command === 'cal') {
    try {
      // Guild kontrolü
      if (!message.guild) {
        return message.reply('❌ Bu komut sadece sunucularda kullanılabilir!');
      }

      // Bağlantı kontrolü
      if (!connection) {
        return message.reply('❌ Önce !katil yazıp beni kanala çağır!');
      }

      const url = args[1];
      if (!url) {
        return message.reply('❌ Lütfen bir YouTube URL\'si ver! Örnek: !cal https://youtu.be/...');
      }

      // URL'yi kuyruğa ekle
      queue.push(url);
      
      // Eğer çalan müzik yoksa hemen başlat
      if (queue.length === 1) {
        await message.reply('🎵 Müzik yükleniyor...');
        
        try {
          const resource = createAudioResource(url);
          player.play(resource);
          connection.subscribe(player);
          await message.reply('🎵 Müzik çalıyor!');
        } catch (error) {
          await message.reply('❌ Müzik çalınamadı: ' + error.message);
          queue.shift(); // Hata olursa kuyruktan çıkar
        }
      } else {
        await message.reply(`🎵 Şarkı kuyruğa eklendi! Kuyrukta ${queue.length} şarkı var.`);
      }
    } catch (error) {
      console.error('❌ Çalma hatası:', error);
      await message.reply('❌ Bir hata oluştu: ' + error.message);
    }
  }

  // !dur - Müziği durdur
  else if (command === 'dur') {
    try {
      if (!connection) {
        return message.reply('❌ Zaten kanalda değilim!');
      }
      
      player.stop();
      queue = [];
      await message.reply('⏹️ Müzik durduruldu ve kuyruk temizlendi!');
    } catch (error) {
      await message.reply('❌ Hata: ' + error.message);
    }
  }

  // !gec - Sonraki şarkıya geç
  else if (command === 'gec') {
    try {
      if (!connection) {
        return message.reply('❌ Kanalda değilim!');
      }
      
      if (queue.length <= 1) {
        queue = [];
        player.stop();
        return message.reply('⏹️ Kuyrukta başka şarkı yok, müzik durduruldu.');
      }
      
      // İlk şarkıyı çıkar
      queue.shift();
      const nextUrl = queue[0];
      
      const resource = createAudioResource(nextUrl);
      player.play(resource);
      await message.reply('⏭️ Sonraki şarkıya geçildi!');
    } catch (error) {
      await message.reply('❌ Geçiş hatası: ' + error.message);
    }
  }

  // !sira - Kuyruğu göster
  else if (command === 'sira') {
    if (queue.length === 0) {
      return message.reply('📭 Kuyruk boş!');
    }
    
    let siraList = '';
    queue.forEach((url, index) => {
      // URL'yi kısalt göster
      const shortUrl = url.length > 30 ? url.substring(0, 30) + '...' : url;
      siraList += `${index + 1}. ${shortUrl}\n`;
    });
    
    await message.reply(`📋 **Kuyruktaki şarkılar (${queue.length}):**\n${siraList}`);
  }

  // !yardim - Yardım menüsü
  else if (command === 'yardim') {
    await message.reply(`
📋 **MÜZİK BOTU KOMUTLARI:**
!katil - Ses kanalına katıl
!cal <url> - Müzik çal (YouTube)
!dur - Müziği durdur
!gec - Sonraki şarkıya geç
!sira - Kuyruğu göster
!yardim - Bu menü
    `);
  }
});

// Botu başlat
if (!BOT_TOKEN) {
  console.error('❌ BOT_TOKEN bulunamadı! Render environment variables kontrol et.');
  process.exit(1);
}

client.login(BOT_TOKEN).catch(err => {
  console.error('❌ Login hatası:', err.message);
});
