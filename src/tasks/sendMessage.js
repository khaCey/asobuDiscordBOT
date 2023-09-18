const { getGoogleAuth, getReadingMaterial } = require('../googleSheets/googleSheetsAPI');
const spreadsheetId = process.env.GOOGLE_SHEETS_ID;

async function sendMessageAndUpdateSheet(auth, sheets, userId, level, day, client) {
    const today = new Date().toLocaleDateString(); // Get today's date

    // Fetch the Discord user by ID
    const user = await client.users.fetch(userId);

    // Send reading material if the user is subscribed
    if (day > 0) {
        const readingMaterial = await getReadingMaterial(auth, level, day);
        user.send(readingMaterial);

        // Update the last sent date for this level in Google Sheets
        const range = `Subscribers!A:F`; // Adjust this range based on your sheet
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range: range,
        });

        const rows = response.data.values || [];
        const rowIndex = rows.findIndex(row => row[0] === userId) + 1; // +1 because Sheets is 1-indexed

        const levelIndex = {
            'N5': 6,
            'N4': 7,
            'N3': 8,
            'N2': 9,
            'N1': 10
        };

        await sheets.spreadsheets.values.update({
            spreadsheetId,
            range: `Subscribers!${String.fromCharCode(65 + levelIndex[level])}${rowIndex}`,
            valueInputOption: 'RAW',
            resource: {
                values: [[today]],
            },
        });
    }
}

module.exports = sendMessageAndUpdateSheet;