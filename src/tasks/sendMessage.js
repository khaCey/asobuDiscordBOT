const { getReadingMaterial } = require('../googleSheets/googleSheetsAPI');  // Import any other required modules here

async function sendMessageAndUpdateSheet(auth, sheets, userId, level, day, client, rowIndex) {
  console.log(`sendMessageAndUpdateSheet called for user ${userId} at level ${level}`);
  
  // Check if rowIndex is defined
  if (typeof rowIndex === 'undefined') {
    console.log("Error: rowIndex is undefined");
    return;
  }

  if (day > 0) {
    // Send the message for the new 'day' to the user
    const user = await client.users.fetch(userId);
    const readingMaterial = await getReadingMaterial(auth, level, day);
    user.send(readingMaterial);
    console.log(`Day counter before increment: ${day}`);
    
    // Increment the day counter
    day++;
    
    console.log(`Day counter after increment: ${day}`);
    
    // Update the day counter in Google Sheets
    await sheets.spreadsheets.values.update({
      spreadsheetId: process.env.GOOGLE_SHEETS_ID,  // Replace with your actual Spreadsheet ID
      range: `Subscribers!${String.fromCharCode(66 + ['N5', 'N4', 'N3', 'N2', 'N1'].indexOf(level))}${rowIndex}`,  // Update the cell corresponding to the day counter
      valueInputOption: 'RAW',
      resource: {
        values: [[day]]
      }
    });
    await sheets.spreadsheets.values.update({
      spreadsheetId: process.env.GOOGLE_SHEETS_ID,
      range: `Subscribers!${String.fromCharCode(71 + ['N5', 'N4', 'N3', 'N2', 'N1'].indexOf(level))}${rowIndex}`, // ASCII for 'G'
      valueInputOption: 'RAW',
      resource: {
          values: [['false']],
      },
    });
  }
}

module.exports = sendMessageAndUpdateSheet;
