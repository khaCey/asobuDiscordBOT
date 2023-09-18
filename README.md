# 📚 Asobu Discord Bot

## 📝 Description

Asobu Discord Bot is designed to assist with language learning, specifically Japanese 🇯🇵. Written in JavaScript using Node.js and Discord.js, the bot sends daily reading materials 📖 to users based on their subscription level (N5, N4, N3, N2, N1). It also provides various utilities like message deletion 🗑️ and more.

## 🛠️ Built With

- 🟢 Node.js - JavaScript runtime
- 🤖 Discord.js - Discord API wrapper
- 📑 Google Sheets API - Used as a database

## 🗃️ Database

The bot uses Google Sheets as a database to store and retrieve reading materials. Each JLPT level has its own sheet, and the bot fetches the appropriate material based on the user's subscription level. This makes it easy to manage and update the content without changing the code.

## ✨ Features

- 📚 Subscribe to daily reading materials based on JLPT levels (N5 to N1).
- 🛑 Unsubscribe from daily reading materials.
- 🗑️ Delete specific direct messages.
- 🧹 Clear messages in a channel.
- ➕ Append new reading materials to Google Sheets.

## 🛠️ Prerequisites

- Node.js v14 or higher 🟢
- npm 📦
- Discord Developer Account 🤖
- Google Sheets API credentials 📑

## 🚀 Installation

1. 📂 Clone the repository:

    ```bash
    git clone https://github.com/yourusername/asobu-discord-bot.git
    ```

2. 📍 Navigate to the project directory:

    ```bash
    cd asobu-discord-bot
    ```

3. 📦 Install dependencies:

    ```bash
    npm install
    ```

4. ⚙️ Create a `.env` file in the root directory and add your environment variables:

    ```env
    DISCORD_TOKEN=your_discord_token_here
    GOOGLE_SHEETS_ID=your_google_sheet_id_here
    ALLOWED_CHANNELS=channel_id_1,channel_id_2
    ```

5. 🏃‍♂️ Run the bot:

    ```bash
    node index.js
    ```

## 📚 Usage

- 📚 Subscribe to a level:

    ```
    /sub N5
    ```

- 🛑 Unsubscribe from a level:

    ```
    /unsub N5
    ```

- 🗑️ Delete a specific direct message:

    ```
    /delete message_id
    ```

- 🧹 Clear messages in a channel:

    ```
    /clear 10
    ```

- ➕ Append new reading material:

    ```
    /append
    ```

## 👥 Contributing

🤝 Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## 📄 License

[MIT](https://choosealicense.com/licenses/mit/)
