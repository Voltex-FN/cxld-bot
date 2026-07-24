client.once("ready", () => {
  console.log("Bot online: " + client.user.tag);
  
  // Set rich presence
  client.user.setActivity("CXLD Chapter 5", { type: 3 }); // 3 = WATCHING
  // OR
  client.user.setStatus("online"); // online, idle, dnd, invisible
  
  // Set custom status
  client.user.setPresence({
    activities: [{ name: "CXLD Launcher", type: 2 }], // 2 = LISTENING
    status: "online"
  });
});
// ... your existing code (require, client setup, slash commands) ...

client.once('ready', () => {
  console.log('Bot online!');
  // ... existing ready code ...
});

// ADD NEW CODE HERE (after the ready event)
const MEMBER_COUNT_CHANNEL_ID = 'VOICE_CHANNEL_ID'; // Replace with your channel ID

function updateMemberCount(guild) {
  const channel = guild.channels.cache.get(MEMBER_COUNT_CHANNEL_ID);
  if (!channel) return;
  const count = guild.memberCount;
  channel.setName(`All Members: ${count}`).catch(console.error);
}

client.on('guildMemberAdd', member => updateMemberCount(member.guild));
client.on('guildMemberRemove', member => updateMemberCount(member.guild));

// Your existing commands like /create, etc. remain below
client.on('interactionCreate', async interaction => {
  // ... your existing interaction code ...
});

client.login(process.env.DISCORD_TOKEN); // keep at the end
