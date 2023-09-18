require('dotenv').config();
const { getGoogleAuth } = require('../googleSheets/googleSheetsAPI');
const { google } = require('googleapis');
const spreadsheetId = process.env.GOOGLE_SHEETS_ID;
const validLevels = ['N1', 'N2', 'N3', 'N4', 'N5'];

async function handleUnsubCommand(message, level) {
    if (!validLevels.includes(level)) {
        message.reply('Invalid level. Please enter a valid JLPT level (N1, N2, N3, N4, N5).');
        return;
    }
    const auth = await getGoogleAuth();
    const sheets = google.sheets({ version: 'v4', auth });
  
    const userId = message.author.id;
    const response = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: 'Subscribers!A:F', // Changed to A:F to cover all columns
    });
  
    const rows = response.data.values || [];
    const existingRow = rows.find(row => row[0] === userId);

    // New code for level index mapping
    const levelIndex = {
        'N5': 1,
        'N4': 2,
        'N3': 3,
        'N2': 4,
        'N1': 5
    };

    const rowIndex = rows.findIndex(row => row[0] === userId) + 1; // +1 because Sheets is 1-indexed

    if (existingRow) {
        existingRow[levelIndex[level]] = 0; // Reset the day to 0 for the given level
        await sheets.spreadsheets.values.update({
            spreadsheetId,
            range: `Subscribers!B${rowIndex}:F${rowIndex}`,
            valueInputOption: 'RAW',
            resource: {
                values: [existingRow.slice(1)],
            },
        });
    }
  
    message.reply(`You have been unsubscribed from level ${level}.`);
}

  

module.exports = handleUnsubCommand;