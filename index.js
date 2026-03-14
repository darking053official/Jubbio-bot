const { Client, GatewayIntentBits } = require('@jubbio/core');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates
  ]
});

const BOT_TOKEN = process.env.BOT_TOKEN;

client.on('ready', () => {
  console.log(`✅ ${client.user?.username} is online!`);
  console.log(`✅ Bot ID: ${client.user?.id}`);
});

// KOMUTLARI KAYDET
client.on('ready', async () => {
  try {
    await client.application.commands.set([
      {
        name: 'katil',
        description: 'Ses kanalına katıl'
      },
      {
        name: 'cal',
        description: 'Müzik çal',
        options: [
          {
            name: 'url',
            description: 'YouTube URL',
            type: 3,
            required: true
          }
        ]
      }
    ]);
    console.log('✅ Slash komutları kaydedildi!');
  } catch (error) {
    console.log('❌ Komut kaydedilemedi:', error.message);
  }
});

// Slash komutlarını dinle
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isCommand()) return;

  if (interaction.commandName === 'katil') {
    const member = interaction.member;
    
    if (!member) {
      return interaction.reply('❌ Üye bilgisi alınamadı!');
    }

    const voiceChannel = member.voice?.channel;
    
    if (!voiceChannel) {
      return interaction.reply('❌ Önce bir ses kanalına girmelisin!');
    }

    await interaction.reply(`✅ **${voiceChannel.name}** kanalına katılma isteği alındı!`);
    
    // NOT: @jubbio/voice paketi sorunlu olduğu için
    // şimdilik sadece mesaj gönderiyoruz
  }

  if (interaction.commandName === 'cal') {
    const url = interaction.options.getString('url');
    await interaction.reply(`🎵 Müzik çalınıyor: ${url} (ses desteği yakında)`);
  }
});

// ! ile başlayan komutlar
client.on('messageCreate', async (message) => {
  if (message.author.bot) return;
  if (!message.content.startsWith('!')) return;

  const args = message.content.slice(1).split(' ');
  const command = args[0].toLowerCase();

  if (command === 'katil') {
    const voiceChannel = message.member?.voice?.channel;
    
    if (!voiceChannel) {
      return message.reply('❌ Önce bir ses kanalına girmelisin!');
    }

    await message.reply(`✅ **${voiceChannel.name}** kanalına katılma isteği alındı! (ses desteği yakında)`);
  }

  if (command === 'cal') {
    const url = args[1];
    if (!url) {
      return message.reply('❌ URL gerekli!');
    }
    await message.reply(`🎵 Müzik çalınıyor: ${url} (ses desteği yakında)`);
  }

  if (command === 'yardim') {
    await message.reply(`
📋 **KOMUTLAR:**
!katil - Ses kanalına katıl
!cal <url> - Müzik çal
!yardim - Bu menü
    `);
  }
});

client.login(BOT_TOKEN);
