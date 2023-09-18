require('dotenv').config();
const { getGoogleAuth, getReadingMaterial } = require('../googleSheets/googleSheetsAPI');
const { google } = require('googleapis');
const spreadsheetId = process.env.GOOGLE_SHEETS_ID;

async function handleDeleteDMCommand(message, messageId, dmChannel) {
  try {
    const dmMessage = await dmChannel.messages.fetch(messageId);
    await dmMessage.delete();
  } catch (error) {
    console.error(`Couldn't delete message ${messageId}: ${error}`);
  }

  message.reply(`Message has been deleted.`);
  
}
  

module.exports = handleDeleteDMCommand;