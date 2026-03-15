const { Client, GatewayIntentBits } = require('@jubbio/core');
const config = require('./config'); // config.js'i yükle

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates
  ]
});

client.on('ready', () => {
  console.log(`✅ Bot çalışıyor!`);
  console.log(`📢 Prefix: ${config.prefix}`);
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;
  if (!message.content.startsWith(config.prefix)) return;

  const args = message.content.slice(config.prefix.length).trim().split(/ +/);
  const commandName = args.shift().toLowerCase();

  // ... komutlar
});

client.login(config.token);
