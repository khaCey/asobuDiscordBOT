const { google } = require('googleapis');

async function getGoogleAuth() {
    return new google.auth.GoogleAuth({
        keyFile: 'credentials.json',
        scopes: 'https://www.googleapis.com/auth/spreadsheets',
    }).getClient();
}

async function getReadingMaterial(auth, level, day) {
    try {
        const googleSheets = google.sheets({ version: "v4", auth: auth });
        const range = `${level}!A${day}:C${day}`;
        
        const response = await googleSheets.spreadsheets.values.get({
            spreadsheetId: process.env.GOOGLE_SHEETS_ID,
            range: range,
        });

        if (response.data.values && response.data.values.length > 0) {
            const [title, text, vocab] = response.data.values[0];
            return `## Level: ${level} | Day: ${day}\n\n### ${title}\n\n\`\`\`\n${text}\n\`\`\`\n### Vocabulary\n\n\`\`\`\n${vocab}\n\`\`\``;
        } else {
            console.log("No data found in the sheet for the given range.");
            return "No data found for the specified level and day."; // or handle this case appropriately
        }
    } catch (error) {
        console.error('An error occurred:', error);
        return "An error occurred while fetching data."; // or handle this case appropriately
    }
}

async function readEntriesAndAppend(auth) {
    const sheets = google.sheets({ version: 'v4', auth });
    
    const response = await sheets.spreadsheets.values.get({
        spreadsheetId: process.env.GOOGLE_SHEETS_ID,
        range: 'Entry!A:C',
    });
    
    const entries = response.data.values || [];
    for (let i = 0; i < entries.length; i++) {
        const [level, text, status] = entries[i];
        
        if (status === "Finished") {
            continue;
        }

        const lines = text.split('\n');
        const title = lines[0].replace('Title: ', '');
        const vocabIndex = lines.findIndex(line => line === 'Vocabulary List' || line === 'Vocabulary List\r');
        
        if (vocabIndex === -1) {
            console.log("Vocabulary List not found");
            continue;
        }

        const mainText = lines.slice(1, vocabIndex).join('\n').trim();
        const vocabList = lines.slice(vocabIndex + 1).join('\n').trim();
        
        await appendToSheet(auth, level, title, mainText, vocabList);

        const rowIndex = i + 1;
        await sheets.spreadsheets.values.update({
            spreadsheetId: process.env.GOOGLE_SHEETS_ID,
            range: `Entry!C${rowIndex}`,
            valueInputOption: 'RAW',
            resource: {
                values: [["Finished"]],
            },
        });
    }
}

async function appendToSheet(auth, level, title, mainText, vocabList) {
    const sheets = google.sheets({ version: 'v4', auth });
    const range = `${level}!A:C`;
    
    await sheets.spreadsheets.values.append({
        spreadsheetId: process.env.GOOGLE_SHEETS_ID,
        range: range,
        valueInputOption: 'RAW',
        resource: {
            values: [[title, mainText, vocabList]],
        },
    });
}


module.exports = { getGoogleAuth, getReadingMaterial, readEntriesAndAppend, appendToSheet };
