const { Client, GatewayIntentBits, Collection } = require('@jubbio/core');
const fs = require('fs');
const path = require('path');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates
  ]
});

client.commands = new Collection();
client.queue = new Map(); // Kuyruk sistemi
client.cooldowns = new Collection(); // Cooldown sistemi

const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);
  if (command.name) {
    client.commands.set(command.name, command);
    console.log(`✅ Komut yüklendi: ${command.name}`);
  }
}

client.on('ready', () => {
  console.log('=================================');
  console.log('✅ MÜZİK BOTU ÇALIŞIYOR!');
  console.log(`📢 Bot adı: ${client.user?.username}`);
  console.log(`📢 Bot ID: ${client.user?.id}`);
  console.log(`📢 Yüklenen komut: ${client.commands.size}`);
  console.log('=================================');
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;
  if (!message.content.startsWith('!')) return;

  const args = message.content.slice(1).trim().split(/ +/);
  const commandName = args.shift().toLowerCase();

  const command = client.commands.get(commandName);
  if (!command) return;

  // Cooldown kontrolü
  if (!client.cooldowns.has(command.name)) {
    client.cooldowns.set(command.name, new Collection());
  }

  const now = Date.now();
  const timestamps = client.cooldowns.get(command.name);
  const cooldownAmount = (command.cooldown || 3) * 1000;

  if (timestamps.has(message.author.id)) {
    const expirationTime = timestamps.get(message.author.id) + cooldownAmount;
    if (now < expirationTime) {
      const timeLeft = (expirationTime - now) / 1000;
      return message.reply(`⏱️ ${timeLeft.toFixed(1)} saniye bekle!`);
    }
  }

  try {
    await command.execute(message, args, client);
    timestamps.set(message.author.id, now);
    setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);
  } catch (error) {
    console.error(error);
    message.reply('❌ Hata oluştu!');
  }
});

// Token kontrolü
const BOT_TOKEN = process.env.BOT_TOKEN || 'c8cdb437d9bff10e41c5cebd4600473ced13285936de75ec6ab4397c50613cc0';
if (!BOT_TOKEN) {
  console.error('❌ Token bulunamadı!');
  process.exit(1);
}

client.login(BOT_TOKEN);
