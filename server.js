require('dotenv').config();
const express = require('express');
const { google } = require('googleapis');
const userLevels = {};
const { Client, GatewayIntentBits } = require("discord.js");
const discordToken = process.env.DISCORD_TOKEN;
const allowedChannels = process.env.ALLOWED_CHANNELS.split(',');

const handleSubCommand = require('./src/commands/subCommand');
const handleConfirmCommand = require('./src/commands/confirmCommand');
const handleUnsubCommand = require('./src/commands/unsubCommand');
const handleDeleteDMCommand = require('./src/commands/deleteDMCommand');
const handleAppendCommand = require('./src/commands/appendCommand');
const scheduleDailyTask = require('./src/scheduling/dailyTask');

const app = express();

app.get("/", async(req, res) => {
  const auth = new google.auth.GoogleAuth({
    keyFile: "credentials.json",
    scopes: "https://www.googleapis.com/auth/spreadsheets"
  });

  const client = await auth.getClient();

  const googleSheets = google.sheets({ version: "v4", auth: "client"});

  const metaData = await googleSheets.spreadsheets.get({
    auth,
    spreadsheetId
  })
  
  const getRows = await googleSheets.spreadsheets.values.get({
    auth,
    spreadsheetId,
    range: "N2!A:B",
  });
  
  console.log("logging");
  res.send(getRows.data.values);
})

app.listen(5338, (req, res) => console.log('Running on 5338'));


const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    // Add other intents as needed
  ],
});

client.once('ready', () => {
  console.log('Discord bot is ready!');
});

client.on('messageCreate', async (message) => {

  console.log(message.content);
  if (!allowedChannels.includes(message.channel.id) || !message.content.startsWith("/") || message.author.bot) {
    console.log("ignore");
    return; // Ignore messages from other channels
  }

  if (message.content.startsWith('/sub')) {
    let level = "";
    if(message.content.split(' ')[1]){ 
      level = message.content.split(' ')[1].toUpperCase(); // Convert to uppercase
    }
    userLevels[message.author.id] = level; // Store the level
    await handleSubCommand(message, level);
  } else if (message.content.startsWith('/confirm')) {
    let level;
    if (message.content.split(' ').length > 1) {
      level = message.content.split(' ')[1].toUpperCase(); // Convert to uppercase
    } else {
      level = userLevels[message.author.id]; // Retrieve the stored level
    }
    if (!level) {
      return message.reply('No previous level found. Please enter a level.');
    }
    await handleConfirmCommand(message, level);
  }else if (message.content.startsWith('/clear')) {
    // Check if the user has the necessary permissions
    if (message.member.permissions.has('MANAGE_MESSAGES')) {
      const args = message.content.split(' ');
      const option = args[1];

      if (option === 'all') {
        // Clear all messages
        let fetched;
        do {
          fetched = await message.channel.messages.fetch({ limit: 100 });
          message.channel.bulkDelete(fetched);
        } while (fetched.size >= 2); // Discord API doesn't allow deleting a single message using bulkDelete
      } else {
        const deleteCount = parseInt(option, 10);

        // Check if the deleteCount is a number and between 2 and 100
        if (!deleteCount || deleteCount < 2 || deleteCount > 100) {
          return message.reply('Please provide a number between 2 and 100 for the number of messages to delete.');
        }

        // Fetch the messages and delete them
        const fetched = await message.channel.messages.fetch({ limit: deleteCount });
        message.channel.bulkDelete(fetched)
          .catch(error => message.reply(`Couldn't delete messages because of: ${error}`));
      }
    } else {
      message.reply('You don\'t have permission to use this command.');
    }
  }else if (message.content.startsWith('/unsub')) {
    const level = message.content.split(' ')[1].toUpperCase(); // Convert to uppercase
    await handleUnsubCommand(message, level);
  }else if (message.content.startsWith('/delete')) {
    const messageId = message.content.split(' ')[1];
    const userId = message.author.id;
    const user = client.users.cache.get(userId);

    // Ensure the DM channel exists
    let dmChannel = user.dmChannel;
    if (!dmChannel) {
      dmChannel = await user.createDM();
    }
    await handleDeleteDMCommand(message, messageId, dmChannel);
  }else if (message.content.startsWith('/mimic')) {
    const args = message.content.split(' ');
    const targetChannelId = args[1];
    const mimicMessage = args.slice(2).join(' ');

    try {
        const targetChannel = await client.channels.fetch(targetChannelId);
        console.log(`Channel Type: ${targetChannel.type}`);  // Debugging line

        if (targetChannel && (targetChannel.type === 0 || targetChannel.type === 'DM')) {
            targetChannel.send(mimicMessage);
        } else {
            message.reply('The target channel is not a text channel.');
        }
    } catch (error) {
        console.error(error);
        message.reply('Could not find the target channel or an error occurred.');
    }
  }else if (message.content.startsWith('/append')) {
    handleAppendCommand(message);
  }
});

  
client.login(discordToken);
