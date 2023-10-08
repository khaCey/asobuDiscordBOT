require('dotenv').config();
const { Client, GatewayIntentBits } = require("discord.js");
const schedule = require('node-schedule');
const { inappropriateWords } = require('./src/constants.js'); 

const discordToken = process.env.DISCORD_TOKEN;
const allowedChannels = process.env.ALLOWED_CHANNELS.split(',');

const commandHandlers = {
  'sub':          require('./src/commands/subCommand'),
  'unsub':        require('./src/commands/unsubCommand'),
  'clear':        require('./src/commands/clearCommand'),
  'del':          require('./src/commands/deleteDMCommand'),
  'append':       require('./src/commands/appendCommand'),
  'mimic':        require('./src/commands/mimicCommand'),
  'debugDayPass': require('./src/commands/debugCommand')
}

const sendDailyMessages = require('./src/tasks/sendDailyMessages');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.once('ready', () => {
  console.log('Discord bot is ready!');
});

client.on('messageCreate', async (message) => {
  // Chat moderation: Delete messages with inappropriate words
  const messageContent = message.content.toLowerCase();
  if (inappropriateWords.some(word => messageContent.includes(word))) {
    message.delete();
    message.author.send('Your message contained inappropriate language and was deleted.');
    return;  // Skip further processing
  }
  
  if (!allowedChannels.includes(message.channel.id) || !message.content.startsWith("/") || message.author.bot) {
    console.log("ignore");
    return;
  }
  let args = message.content.slice(1).split(' ');
  const command = args.shift().toLowerCase();

  if (commandHandlers[command]) {
    await commandHandlers[command](message, args, client);
  }
});

const job = schedule.scheduleJob({ hour: 18, minute: 0, second: 0, tz: 'Asia/Tokyo' }, async function() {
  await sendDailyMessages(client);
});

client.login(discordToken);
