require('dotenv').config();
const { getGoogleAuth, getReadingMaterial } = require('../googleSheets/googleSheetsAPI');
const { google } = require('googleapis');
const spreadsheetId = process.env.GOOGLE_SHEETS_ID;
const validLevels = ['N1', 'N2', 'N3', 'N4', 'N5'];

async function handleSubCommand(message, level) {
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
    if (level === "ALL") {
        const newRow = [userId, 1, 1, 1, 1, 1]; // Initialize all days to 1
        if (existingRow) {
            await sheets.spreadsheets.values.update({
                spreadsheetId,
                range: `Subscribers!B${rowIndex}:F${rowIndex}`,
                valueInputOption: 'RAW',
                resource: {
                    values: [newRow.slice(1)],
                },
            });
        } else {
            await sheets.spreadsheets.values.append({
                spreadsheetId,
                range: 'Subscribers!A:F',
                valueInputOption: 'RAW',
                resource: {
                    values: [newRow],
                },
            });
        }
        message.reply("You have been subscribed to all levels.");
        return;
    }

    if (existingRow) {
        existingRow[levelIndex[level]] = 1; // Set the day to 1 for the given level
        await sheets.spreadsheets.values.update({
            spreadsheetId,
            range: `Subscribers!B${rowIndex}:F${rowIndex}`,
            valueInputOption: 'RAW',
            resource: {
                values: [existingRow.slice(1)],
            },
        });
    } else {
        const newRow = [userId, 0, 0, 0, 0, 0]; // Initialize all days to 0
        newRow[levelIndex[level]] = 1; // Set the day to 1 for the given level
        await sheets.spreadsheets.values.append({
            spreadsheetId,
            range: 'Subscribers!A:F',
            valueInputOption: 'RAW',
            resource: {
                values: [newRow],
            },
        });
    }

    message.reply(`You have been subscribed to level ${level}.`);
  
    // Fetch the reading material for day 1
    const readingMaterial = await getReadingMaterial(auth, level, 1);
  
    // Send a DM to the user
    message.author.send(readingMaterial);
}

  

module.exports = handleSubCommand;