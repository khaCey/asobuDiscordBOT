require('dotenv').config();
const { getGoogleAuth, getReadingMaterial } = require('../googleSheets/googleSheetsAPI');
const { google } = require('googleapis');
const spreadsheetId = process.env.GOOGLE_SHEETS_ID;

async function handleDeleteDMCommand(message, args, client) {
  const messageId = args[0];
  const userId = message.author.id;
  const user = await client.users.fetch(userId);

  // Ensure the DM channel exists
  let dmChannel = user.dmChannel;
  if (!dmChannel) {
    dmChannel = await user.createDM();
  }
  try {
    const dmMessage = await dmChannel.messages.fetch(messageId);
    await dmMessage.delete();
  } catch (error) {
    console.error(`Couldn't delete message ${messageId}: ${error}`);
  }

  message.reply(`Message has been deleted.`);
  
}
  

module.exports = handleDeleteDMCommand;