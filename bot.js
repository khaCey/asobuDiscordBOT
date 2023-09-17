require('dotenv').config();
const express = require('express');

const { Client, GatewayIntentBits } = require("discord.js");
const discordToken = process.env.DISCORD_TOKEN;

const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.MessageContent,
      // Add other intents as needed
    ],
  });
  
  client.once('ready', () => {
    console.log('Discord bot is ready!');
    initializeGoogleSheets().catch(console.error);
  });
  
  client.login(discordToken);