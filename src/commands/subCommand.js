require('dotenv').config();
const { getGoogleAuth, getReadingMaterial } = require('../googleSheets/googleSheetsAPI');
const sendMessageAndUpdateSheet = require('../tasks/sendMessage');
const { getSheets } = require('../tasks/utils');
const { google } = require('googleapis');
const spreadsheetId = process.env.GOOGLE_SHEETS_ID;
const validLevels = ['N1', 'N2', 'N3', 'N4', 'N5'];

async function handleSubCommand(message, args, client) {
    let level = args[0].toUpperCase();
    console.log(level);
    if (!validLevels.includes(level)) {
        message.reply('Invalid level. Please enter a valid JLPT level (N1, N2, N3, N4, N5).');
        return;
    }
    const auth = await getGoogleAuth();
    const sheets = await getSheets(auth);
    
    const userId = message.author.id;
    const response = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: 'Subscribers!A:J',
    });
    
    let rows = response.data.values || [];
    let existingRow = rows.find(row => row[0] === userId);

    const levelIndex = {
        'N5': 1,
        'N4': 2,
        'N3': 3,
        'N2': 4,
        'N1': 5
    };

    let rowIndex = rows.findIndex(row => row[0] === userId) + 1; // +1 because Sheets is 1-indexed
    
    if (rowIndex <= 0) {
        console.log("User not found or sheet is empty. Appending new row...");
        const newRow = [userId, 0, 0, 0, 0, 0]; // Initialize all days to 0
        await sheets.spreadsheets.values.append({
            spreadsheetId,
            range: 'Subscribers!A:J',
            valueInputOption: 'RAW',
            resource: {
                values: [newRow],
            },
        });

        // Update rows, rowIndex and existingRow
        rows.push(newRow);
        rowIndex = rows.length;  // Update the rowIndex to the last row
        existingRow = newRow;    // Update the existingRow to the newRow
    }
      
    if (existingRow && existingRow[levelIndex[level]] > 0) {
        message.reply(`You are already subscribed to level ${level}.`);
        return;  // Return early, do nothing further.
    }

    if (!existingRow){
        const newRow = [userId, 0, 0, 0, 0, 0]; // Initialize all days to 0
        await sheets.spreadsheets.values.append({
            spreadsheetId,
            range: 'Subscribers!A:K',
            valueInputOption: 'RAW',
            resource: {
                values: [newRow],
            },
        });
    }
    const columnForJustSubscribed = String.fromCharCode(71 + ['N5', 'N4', 'N3', 'N2', 'N1'].indexOf(level)); // ASCII for 'G'
        await sheets.spreadsheets.values.update({
            spreadsheetId,
            range: `Subscribers!${columnForJustSubscribed}${rowIndex}`,
            valueInputOption: 'RAW',
            resource: {
                values: [['true']],
            },
        }
    );
    message.reply(`You have subscribed to level ${level}.`);
  
    // Send a DM to the user
    await sendMessageAndUpdateSheet(auth, sheets, userId, level, 1, client, rowIndex);
}

module.exports = handleSubCommand;