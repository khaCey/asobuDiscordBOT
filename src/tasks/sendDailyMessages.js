const { Client, Intents } = require('discord.js');
const { getGoogleAuth, getReadingMaterial } = require('../googleSheets/googleSheetsAPI');
const sendMessageAndUpdateSheet = require('./sendMessage');
const { google } = require('googleapis');
const spreadsheetId = process.env.GOOGLE_SHEETS_ID;

// Initialize Discord client (you might already have this somewhere else in your code)

async function sendDailyMessages(client) {
    const auth = await getGoogleAuth();
    const sheets = google.sheets({ version: 'v4', auth });
    
    // Extend the range to include the last sent date for each level (assuming columns H-L)
    const response = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: 'Subscribers!A:L',
    });
    
    const rows = response.data.values || [];
    
    for (const row of rows) {
        const [userId, dayN5, dayN4, dayN3, dayN2, dayN1, lastSentN5, lastSentN4, lastSentN3, lastSentN2, lastSentN1] = row;
        const rowIndex = rows.findIndex(row => row[0] === userId) + 1; // +1 because Sheets is 1-indexed
        const today = new Date().toLocaleDateString(); // Get today's date

        if (dayN5 > 0 && lastSentN5 !== today) {
            await sendMessageAndUpdateSheet(auth, sheets, userId, 'N5', dayN5, client, rowIndex, 'H');
        }
        
        if (dayN4 > 0 && lastSentN4 !== today) {
            await sendMessageAndUpdateSheet(auth, sheets, userId, 'N4', dayN4, client, rowIndex, 'I');
        }
        
        if (dayN3 > 0 && lastSentN3 !== today) {
            await sendMessageAndUpdateSheet(auth, sheets, userId, 'N3', dayN3, client, rowIndex, 'J');
        }

        if (dayN2 > 0 && lastSentN2 !== today) {
            await sendMessageAndUpdateSheet(auth, sheets, userId, 'N2', dayN2, client, rowIndex, 'K');
        }
        
        if (dayN1 > 0 && lastSentN1 !== today) {
            await sendMessageAndUpdateSheet(auth, sheets, userId, 'N1', dayN1, client, rowIndex, 'L');
        }
    }
}


module.exports = sendDailyMessages;
