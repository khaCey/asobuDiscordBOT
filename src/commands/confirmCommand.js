require('dotenv').config();
const { getGoogleAuth, getReadingMaterial } = require('../googleSheets/googleSheetsAPI');
const { google } = require('googleapis');
const spreadsheetId = process.env.GOOGLE_SHEETS_ID;

async function handleConfirmCommand(message, level) {
    const auth = await getGoogleAuth();
    const sheets = google.sheets({ version: 'v4', auth });
  
    const userId = message.author.id;
    const response = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: 'Subscribers!A:B',
    });
  
    const rows = response.data.values || [];
    const existingRow = rows.find(row => row[0] === userId);
    
    if (!existingRow) {
        message.reply('You are not subscribed. Use /sub to subscribe.');
        return;
    }
  
    const existingLevels = existingRow[1].split(',');
    if (!existingLevels.includes(level)) {
        existingLevels.push(level);
    }
  
    const newLevels = existingLevels.join(',');
  
    const rowIndex = rows.findIndex(row => row[0] === userId) + 1; // +1 because Sheets is 1-indexed
    await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `Subscribers!B${rowIndex}`,
        valueInputOption: 'RAW',
        resource: {
            values: [[newLevels]],
        },
    });
  
    message.reply(`Your subscription level has been changed to ${newLevels}.`);

    
    // Fetch the reading material for day 1
    const readingMaterial = await getReadingMaterial(auth, level, 1);
  
    // Send a DM to the user
    message.author.send(readingMaterial);
  }

module.exports = handleConfirmCommand;