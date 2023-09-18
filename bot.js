client.once('ready', () => {
    console.log('Discord bot is ready!');
});
  
client.on('messageCreate', async (message) => {
    if (message.content.startsWith('/sub')) {
        console.log("/Sub");
        const level = message.content.split(' ')[1]; // Get the level (N1, N2, etc.)
        await handleSubCommand(message, level);
    } else if (message.content.startsWith('/confirm')) {
        console.log("/Confirm");
        const level = message.content.split(' ')[1]; // Get the level (N1, N2, etc.)
        await handleConfirmCommand(message, level);
    }
});
  
client.login(discordToken);
  
  async function handleSubCommand(message, level) {
    const auth = await getGoogleAuth();
    const sheets = google.sheets({ version: 'v4', auth });
    
    // Check if user is already subscribed
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Subscribers!A:C', // Assuming columns A-C contain Discord ID, N-level, and day
    });
  
    const rows = response.data.values || [];
    const userId = message.author.id;
  
    const existingRow = rows.find(row => row[0] === userId);
    if (existingRow) {
      message.reply('You are already subscribed. Use /confirm to change your level.');
      return;
    }
  
    // Add new subscriber
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'Subscribers!A:C',
      valueInputOption: 'RAW',
      resource: {
        values: [[userId, level, 1]], // Discord ID, N-level, Day 1
      },
    });
  
    message.reply(`You have been subscribed to level ${level}.`);
  }
  
  async function handleConfirmCommand(message, level) {
    const auth = await getGoogleAuth();
    const sheets = google.sheets({ version: 'v4', auth });
  
    // Check if user is already subscribed
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Subscribers!A:C',
    });
  
    const rows = response.data.values || [];
    const userId = message.author.id;
  
    const existingRow = rows.find(row => row[0] === userId);
    if (!existingRow) {
      message.reply('You are not subscribed. Use /sub to subscribe.');
      return;
    }
  
    // Update existing subscriber's level and reset day to 1
    const rowIndex = rows.findIndex(row => row[0] === userId) + 1; // +1 because Sheets is 1-indexed
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `Subscribers!B${rowIndex}:C${rowIndex}`,
      valueInputOption: 'RAW',
      resource: {
        values: [[level, 1]], // New level, reset day to 1
      },
    });
  
    message.reply(`Your subscription level has been changed to ${level}.`);
  }
  
  async function getGoogleAuth() {
    return new google.auth.GoogleAuth({
      keyFile: 'credentials.json',
      scopes: 'https://www.googleapis.com/auth/spreadsheets',
    }).getClient();
  }