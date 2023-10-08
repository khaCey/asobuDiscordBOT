async function handleClearCommand(message, args, client) {
    if (message.member.permissions.has('MANAGE_MESSAGES')) {
      const option = args[0];
      const deleteCount = parseInt(option, 10);
        // Check if the deleteCount is a number and between 2 and 100
        if (!deleteCount || deleteCount < 2 || deleteCount > 100) {
          return message.reply('Please provide a number between 2 and 100 for the number of messages to delete.');
        }
  
        // Fetch the messages and delete them
        message.channel.messages.fetch({ limit: deleteCount })
          .then(fetched => {
            // Filter messages to only include those less than 14 days old
            const notTooOld = fetched.filter(thisMsg => {
              return (Date.now() - thisMsg.createdTimestamp) < 1209600000; // 14 days in milliseconds
            });
            message.channel.bulkDelete(notTooOld)
              .catch(error => {
                if (error.code === 50034) {
                  message.reply('You can only bulk delete messages that are under 14 days old.');
                } else {
                  message.reply(`Couldn't delete messages because of: ${error}`);
                }
              });
          })
          .catch(error => message.reply(`Couldn't fetch messages because of: ${error}`));
      
    } else {
      message.reply("You don't have permission to use this command.");
    }
  }
  
  module.exports = handleClearCommand;
  