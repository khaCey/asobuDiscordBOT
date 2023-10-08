const { google } = require('googleapis');

async function getSheets(auth) {
  return google.sheets({ version: 'v4', auth });
}

module.exports = { getSheets };
