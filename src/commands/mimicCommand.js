module.exports = async function handleMimicCommand(message, args, client) {
    const targetChannelId = args[0];
    console.log(targetChannelId);
    const mimicMessage = args.slice(1).join(' ');
  
    try {
      const targetChannel = await client.channels.fetch(targetChannelId);
      console.log(`Channel Type: ${targetChannel.type}`);  // Debugging line
  
      if (targetChannel && (targetChannel.type === 0 || targetChannel.type === 'DM')) {
        targetChannel.send(mimicMessage);
      } else {
        message.reply('The target channel is not a text channel.');
      }
    } catch (error) {
      console.error(error);
      message.reply('Could not find the target channel or an error occurred.');
    }
  };
  