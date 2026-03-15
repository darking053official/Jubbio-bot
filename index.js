const { Client, GatewayIntentBits, Collection } = require('@jubbio/core');
const fs = require('fs');
const path = require('path');
const config = require('./config');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates
  ]
});

// Koleksiyonlar
client.commands = new Collection();
client.queue = new Map();
client.djRoles = new Map();
client.cooldowns = new Collection();

// Komutları src/commands klasöründen yükle
const commandsPath = path.join(__dirname, 'src', 'commands');
console.log(`📁 Komutlar yükleniyor: ${commandsPath}`);

try {
  // Klasör var mı kontrol et
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
        console.log(`✅ Komut yüklendi: ${command.name} (${file})`);
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

// Bot hazır
client.on('ready', () => {
  console.log('=================================');
  console.log('✅ MÜZİK BOTU ÇALIŞIYOR!');
  console.log(`📢 Bot adı: ${client.user?.username}`);
  console.log(`📢 Bot ID: ${client.user?.id}`);
  console.log(`📢 Komut sayısı: ${client.commands.size}`);
  console.log(`📢 Prefix: ${config.prefix}`);
  console.log('=================================');
});

// Mesajları dinle
client.on('messageCreate', async (message) => {
  // Bot kendi mesajlarını yoksay
  if (message.author.bot) return;
  
  // Prefix kontrolü
  if (!message.content.startsWith(config.prefix)) return;

  // Argümanları ayır
  const args = message.content.slice(config.prefix.length).trim().split(/ +/);
  const commandName = args.shift().toLowerCase();

  // Komutu bul (isim veya alias ile)
  const command = client.commands.get(commandName) || 
                  client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

  if (!command) return;

  // Cooldown kontrolü
  if (!client.cooldowns.has(command.name)) {
    client.cooldowns.set(command.name, new Collection());
  }

  const now = Date.now();
  const timestamps = client.cooldowns.get(command.name);
  const cooldownAmount = (command.cooldown || config.advanced?.commandCooldown || 3) * 1000;

  if (timestamps.has(message.author.id)) {
    const expirationTime = timestamps.get(message.author.id) + cooldownAmount;
    if (now < expirationTime) {
      const timeLeft = (expirationTime - now) / 1000;
      return message.reply(`⏱️ **${timeLeft.toFixed(1)} saniye** beklemen gerekiyor!`);
    }
  }

  // Komutu çalıştır
  try {
    console.log(`🎵 Komut çalıştırılıyor: ${command.name} - ${message.author.username}`);
    await command.execute(message, args, client);
    
    // Cooldown'u kaydet
    timestamps.set(message.author.id, now);
    setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);
    
  } catch (error) {
    console.error(`❌ ${command.name} komutu hatası:`, error);
    
    // Hata mesajı gönder
    const errorMsg = config.messages?.commandError || '❌ **Komut çalıştırılırken hata oluştu!**';
    await message.reply(errorMsg).catch(() => {});
  }
});

// Botu başlat
if (!config.token) {
  console.error('❌ config.js içinde token bulunamadı!');
  process.exit(1);
}

client.login(config.token).then(() => {
  console.log('🔌 Bot başlatılıyor...');
}).catch(err => {
  console.error('❌ Bot başlatılamadı:', err.message);
  process.exit(1);
});

// Hata yakalama
process.on('uncaughtException', (error) => {
  console.error('❌ Beklenmeyen hata:', error);
});

process.on('unhandledRejection', (error) => {
  console.error('❌ Promise hatası:', error);
});

// Çıkış temizliği
process.on('SIGINT', () => {
  console.log('\n👋 Bot kapatılıyor...');
  
  // Tüm bağlantıları kapat
  client.queue?.forEach((queue, guildId) => {
    if (queue.connection) {
      queue.connection.destroy();
    }
  });
  
  client.destroy();
  process.exit(0);
});
