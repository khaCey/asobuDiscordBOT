const sendDailyMessages = require('../tasks/sendDailyMessages');

module.exports = async function handleDebugCommand(message, args, client) {
    console.log("Debug: Simulating a day passing by.");
    await sendDailyMessages(client);
};
