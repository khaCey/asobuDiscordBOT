require('dotenv').config();
const { getGoogleAuth, getReadingMaterial, readEntriesAndAppend } = require('../googleSheets/googleSheetsAPI');
const { google } = require('googleapis');
const spreadsheetId = process.env.GOOGLE_SHEETS_ID;
const validLevels = ['N1', 'N2', 'N3', 'N4', 'N5'];

async function appendCommand(message) {
    const auth = await getGoogleAuth();
    await readEntriesAndAppend(auth);
    message.reply('Entries read and appended successfully.');
}

module.exports = appendCommand;