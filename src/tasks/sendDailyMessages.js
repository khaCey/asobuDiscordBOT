const { getGoogleAuth, getReadingMaterial } = require('../googleSheets/googleSheetsAPI');
const sendMessageAndUpdateSheet = require('./sendMessage');
const { google } = require('googleapis');
const { VALID_LEVELS } = require('../constants'); // Adjust path as needed
const spreadsheetId = process.env.GOOGLE_SHEETS_ID;

async function sendDailyMessages(client) {
    console.log("sendDailyMessages called");
    const auth = await getGoogleAuth();
    const sheets = google.sheets({ version: 'v4', auth });
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Subscribers!A:L',
    });
  
    const rows = response.data.values || [];
    const today = new Date().toLocaleDateString();
    const levels = ['N5', 'N4', 'N3', 'N2', 'N1'];

    for (const row of rows) {
        const userId = row[0];
        const rowIndex = rows.findIndex(row => row[0] === userId) + 1;
        console.log(`Calculated Row Index: ${rowIndex}`);

        if (rowIndex === 0) {
            console.error(`User ID ${userId} not found in sheet.`);
            continue; // Skip to the next iteration of the loop
        }

        let skipLevel = false; // Flag to skip sending the message for this level for this day

        for (let index = 0; index < levels.length; index++) {
            let level = levels[index];
            let day = row[index + 1];
            const lastSent = row[index + 6];
            const justSubscribed = row[6 + index]; // 6 is the index for column 'G'

            if (justSubscribed === 'true') {
                // Reset the flag and update the sheet
                await sheets.spreadsheets.values.update({
                    spreadsheetId,
                    range: `Subscribers!${String.fromCharCode(71 + index)}${rowIndex}`, // ASCII for 'G'
                    valueInputOption: 'RAW',
                    resource: {
                        values: [['false']],
                    },
                });
                skipLevel = true;
            }

            if (day > 0 && lastSent !== today && !skipLevel) {
                console.log(`About to send message with the following parameters: Auth: ${auth}, Sheets: ${sheets}, User ID: ${userId}, Level: ${level}, Day: ${day}, Client: ${client}, Row Index: ${rowIndex}`);
                sendMessageAndUpdateSheet(auth, sheets, userId, level, day, client, rowIndex, String.fromCharCode(72 + index));
            }
        }
    }
}

module.exports = sendDailyMessages;
