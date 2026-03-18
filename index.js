const { Client, GatewayIntentBits, Collection } = require('@jubbio/core');
const fs = require('fs');
const path = require('path');

// FETCH POLYFILL - Node.js eski versiyonları için
try {
  if (!globalThis.fetch) {
    globalThis.fetch = require('node-fetch');
    console.log('✅ fetch polyfill yüklendi');
  }
} catch (e) {
  console.log('⚠️ node-fetch yüklü değil, fetch kullanılamayacak');
  globalThis.fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,              // Sunucu bilgileri için
    GatewayIntentBits.GuildMessages,       // Mesajları okumak için
    GatewayIntentBits.MessageContent,      // Mesaj içeriğini okumak için
    GatewayIntentBits.GuildVoiceStates,    // SES İÇİN - ÇOK ÖNEMLİ!
    GatewayIntentBits.GuildMembers         // Üye bilgileri için
  ]
});

// Koleksiyonlar
client.commands = new Collection();
client.queue = new Map();        // Müzik kuyruğu
client.cooldowns = new Collection(); // Spam koruması

// ===== API TOKEN =====
const BOT_TOKEN = '9ad08124af59f0853aeda02a62ac722c26c43d7578e0981d8927d3b9e26ad900';
const APP_ID = '552486601809203200'; // Application ID

// ===== KOMUTLARI YÜKLE =====
const commandsPath = path.join(__dirname, 'src', 'commands');
console.log(`📁 Komutlar yükleniyor: ${commandsPath}`);

try {
  if (!fs.existsSync(commandsPath)) {
    console.error('❌ src/commands klasörü bulunamadı!');
    process.exit(1);
  }

  const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
  
  if (commandFiles.length === 0) {
    console.error('❌ src/commands klasöründe .js dosyası bulunamadı!');
    process.exit(1);
  }

  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    try {
      const command = require(filePath);
      
      if (command.name) {
        client.commands.set(command.name, command);
        console.log(`✅ Yüklendi: ${command.name}`);
      } else {
        console.log(`⚠️ ${file} geçersiz komut formatı: 'name' eksik`);
      }
    } catch (err) {
      console.error(`❌ ${file} yüklenirken hata:`, err.message);
    }
  }
  
  console.log(`📊 Toplam ${client.commands.size} komut başarıyla yüklendi`);
} catch (error) {
  console.error('❌ Komutlar yüklenirken kritik hata:', error.message);
  process.exit(1);
}

// ===== SLASH KOMUTLARINI REST API İLE KAYDET =====
async function registerSlashCommands() {
  try {
    console.log('📡 REST API ile slash komutlar kaydediliyor...');
    
    const commands = [];
    client.commands.forEach(cmd => {
      commands.push({
        name: cmd.name,
        description: cmd.description || `${cmd.name} komutu`,
        options: cmd.options || []
      });
    });

    // Dökümantasyondaki doğru endpoint
    const url = `https://gateway.jubbio.com/api/v1/applications/${APP_ID}/commands`;
    
    console.log(`📝 ${commands.length} komut kaydediliyor...`);
    
    // PUT metodu ile toplu kayıt
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Authorization': `Bot ${BOT_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(commands)
    });

    if (response.ok) {
      const data = await response.json();
      console.log(`✅ ${data.length} slash komut başarıyla kaydedildi!`);
      console.log(`📢 /yardim yazıp komutları görebilirsin`);
    } else {
      const text = await response.text();
      console.log(`❌ REST API hatası (${response.status}):`, text);
      
      // POST ile tek tek dene
      console.log('🔄 POST ile tek tek kayıt deneniyor...');
      for (const cmd of commands) {
        const postResponse = await fetch(url, {
          method: 'POST',
          headers: {
            'Authorization': `Bot ${BOT_TOKEN}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(cmd)
        });
        
        if (postResponse.ok) {
          console.log(`✅ /${cmd.name} kaydedildi`);
        } else {
          console.log(`❌ /${cmd.name} kaydedilemedi`);
        }
        await new Promise(resolve => setTimeout(resolve, 1000)); // Rate limit
      }
    }
  } catch (error) {
    console.error('❌ REST API bağlantı hatası:', error.message);
  }
}

// ===== BOT HAZIR OLDUĞUNDA =====
client.once('ready', () => {
  console.log('=================================');
  console.log('✅ MÜZİK BOTU ÇALIŞIYOR!');
  console.log(`📢 Bot adı: ${client.user?.username}`);
  console.log(`📢 Bot ID: ${client.user?.id}`);
  console.log(`📢 Komut sayısı: ${client.commands.size}`);
  console.log('=================================');
  
  // 3 saniye bekle, sonra komutları kaydet
  setTimeout(registerSlashCommands, 3000);
});

// ===== GATEWAY BAĞLANTISI =====
client.on('ready', () => {
  console.log('🔌 Gateway bağlantısı kuruldu: wss://realtime.jubbio.com');
});

// ===== SLASH KOMUTLARINI DİNLE =====
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isCommand()) return;
  
  const command = client.commands.get(interaction.commandName);
  if (!command) {
    return interaction.reply({ 
      content: '❌ **Komut bulunamadı!**', 
      ephemeral: true 
    });
  }
  
  // ===== COOLDOWN KONTROLÜ =====
  if (!client.cooldowns.has(command.name)) {
    client.cooldowns.set(command.name, new Collection());
  }

  const now = Date.now();
  const timestamps = client.cooldowns.get(command.name);
  const cooldownAmount = (command.cooldown || 2) * 1000;

  if (timestamps.has(interaction.user.id)) {
    const expirationTime = timestamps.get(interaction.user.id) + cooldownAmount;
    if (now < expirationTime) {
      const timeLeft = (expirationTime - now) / 1000;
      return interaction.reply({ 
        content: `⏱️ **${timeLeft.toFixed(1)} saniye** beklemelisin!`, 
        ephemeral: true 
      });
    }
  }

  // ===== KOMUTU ÇALIŞTIR =====
  try {
    console.log(`🎵 Komut çalıştırıldı: /${command.name} - ${interaction.user.username}`);
    await command.execute(interaction, client);
    timestamps.set(interaction.user.id, now);
    setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);
  } catch (error) {
    console.error(`❌ /${command.name} hatası:`, error);
    
    const errorMsg = { 
      content: '❌ **Komut çalıştırılırken hata oluştu!**', 
      ephemeral: true 
    };
    
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp(errorMsg).catch(() => {});
    } else {
      await interaction.reply(errorMsg).catch(() => {});
    }
  }
});

// ===== MESAJ KOMUTLARI (OPSİYONEL) =====
client.on('messageCreate', async (message) => {
  if (message.author.bot) return;
  if (!message.content.startsWith('!')) return;

  const args = message.content.slice(1).trim().split(/ +/);
  const commandName = args.shift().toLowerCase();

  // Sadece belirli prefix komutları çalışsın
  if (commandName === 'ping') {
    await message.reply('🏓 Pong!');
  }
});

// ===== BOTU BAŞLAT =====
if (!BOT_TOKEN) {
  console.error('❌ Token bulunamadı!');
  process.exit(1);
}

client.login(BOT_TOKEN).catch(err => {
  console.error('❌ Bot başlatılamadı:', err.message);
  process.exit(1);
});

// ===== HATA YAKALAMA =====
process.on('uncaughtException', (error) => {
  console.error('❌ Beklenmeyen hata:', error);
});

process.on('unhandledRejection', (error) => {
  console.error('❌ Promise hatası:', error);
});

process.on('SIGINT', () => {
  console.log('\n👋 Bot kapatılıyor...');
  client.queue?.forEach((queue) => {
    if (queue.connection) queue.connection.destroy();
  });
  client.destroy();
  process.exit(0);
});
