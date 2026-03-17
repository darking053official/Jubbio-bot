const { Client, GatewayIntentBits, Collection } = require('@jubbio/core');
const fs = require('fs');
const path = require('path');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMembers
  ]
});

// Koleksiyonlar
client.commands = new Collection();
client.queue = new Map();        // Müzik kuyruğu
client.cooldowns = new Collection(); // Spam koruması
client.settings = new Map();      // Sunucu ayarları

// Komutları src/commands klasöründen yükle
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

// Slash komutlarını kaydet
client.on('ready', async () => {
  console.log('=================================');
  console.log('✅ MÜZİK BOTU ÇALIŞIYOR!');
  console.log(`📢 Bot adı: ${client.user?.username}`);
  console.log(`📢 Bot ID: ${client.user?.id}`);
  console.log(`📢 Komut sayısı: ${client.commands.size}`);
  console.log('=================================');
  
  const commands = [];
  client.commands.forEach(cmd => {
    commands.push({
      name: cmd.name,
      description: cmd.description || `${cmd.name} komutu`,
      options: cmd.options || []
    });
  });
  
  try {
    await client.application.commands.set(commands);
    console.log(`✅ ${commands.length} slash komut kaydedildi`);
    console.log(`📢 /yardim yazıp komutları görebilirsin`);
  } catch (error) {
    console.error('❌ Slash komut kaydetme hatası:', error.message);
  }
});

// Slash komutlarını dinle
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isCommand()) return;
  
  const command = client.commands.get(interaction.commandName);
  if (!command) return;
  
  // Cooldown kontrolü
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
      await interaction.followUp(errorMsg);
    } else {
      await interaction.reply(errorMsg);
    }
  }
});

// Token
const BOT_TOKEN = '9ad08124af59f0853aeda02a62ac722c26c43d7578e0981d8927d3b9e26ad900';
if (!BOT_TOKEN) {
  console.error('❌ Token bulunamadı!');
  process.exit(1);
}

client.login(BOT_TOKEN).catch(err => {
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

process.on('SIGINT', () => {
  console.log('\n👋 Bot kapatılıyor...');
  client.queue?.forEach((queue) => {
    if (queue.connection) queue.connection.destroy();
  });
  client.destroy();
  process.exit(0);
});
