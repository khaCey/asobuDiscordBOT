require('dotenv').config();
const express = require('express');
const { google } = require('googleapis');
const spreadsheetId = process.env.GOOGLE_SHEETS_ID;

const app = express();

app.get("/", async(req, res) => {
  const auth = new google.auth.GoogleAuth({
    keyFile: "credentials.json",
    scopes: "https://www.googleapis.com/auth/spreadsheets"
  });

  const client = await auth.getClient();

  const googleSheets = google.sheets({ version: "v4", auth: "client"});

  const metaData = await googleSheets.spreadsheets.get({
    auth,
    spreadsheetId
  })
  
  const getRows = await googleSheets.spreadsheets.values.get({
    auth,
    spreadsheetId,
    range: "N2!A:B",
  });

  res.send(getRows.data.values);
})

app.listen(5338, (req, res) => console.log('Running on 5338'));

async function initializeGoogleSheets() {
  const auth = await authorize();
  const sheetsApi = google.sheets({ version: 'v4', auth });

  // Call the daily task function
  await dailyTask(sheetsApi);
}

