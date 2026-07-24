require("dotenv").config();
const { Client, GatewayIntentBits, SlashCommandBuilder, REST, Routes, EmbedBuilder } = require("discord.js");
const fs = require("fs");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.GuildVoiceStates,   // Needed for voice join detection
    GatewayIntentBits.GuildMembers        // Needed for member join/leave
  ],
  partials: ["CHANNEL"]
});

function saveAccount(acc) {
  let accounts = [];
  try { accounts = JSON.parse(fs.readFileSync("accounts.json", "utf8")); } catch(e) {}
  accounts.push(acc);
  fs.writeFileSync("accounts.json", JSON.stringify(accounts, null, 2));
}

function genPass() {
  const c = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$";
  let p = "";
  for(let i=0; i<10; i++) p += c[Math.floor(Math.random()*c.length)];
  return p;
}

// ========== READY EVENT (COMBINED) ==========
client.once("ready", async () => {
  console.log("Bot online: " + client.user.tag);
  
  // Register slash commands
  const cmds = [
    new SlashCommandBuilder()
      .setName("create")
      .setDescription("Create CXLD account")
      .addStringOption(o => o.setName("username").setDescription("Your username").setRequired(true))
      .toJSON()
  ];
  
  await new REST({version:"10"}).setToken(process.env.DISCORD_TOKEN).put(
    Routes.applicationCommands(client.user.id), {body:cmds}
  );
  
  console.log("Commands ready! Use /create");
  
  // Set bot status
  client.user.setPresence({
    activities: [{ name: "CXLD Launcher", type: 2 }], // 2 = LISTENING
    status: "online"
  });
  
  // Initial member count update
  client.guilds.cache.forEach(guild => updateMemberCount(guild));
});

// ========== MEMBER COUNT CHANNEL ==========
const MEMBER_COUNT_CHANNEL_ID = '1529750060957569166

function updateMemberCount(guild) {
  const channel = guild.channels.cache.get(MEMBER_COUNT_CHANNEL_ID);
  if (!channel) return;
  const count = guild.memberCount;
  channel.setName(`All Members: ${count}`).catch(console.error);
}

client.on('guildMemberAdd', member => updateMemberCount(member.guild));
client.on('guildMemberRemove', member => updateMemberCount(member.guild));

// ========== VOICE CHANNEL JOIN/LEAVE ANNOUNCEMENTS ==========
const LOG_CHANNEL_ID = 1529750054712115351

client.on('voiceStateUpdate', (oldState, newState) => {
  const logChannel = client.channels.cache.get(LOG_CHANNEL_ID);
  if (!logChannel) return;
  
  // User joins a voice channel
  if (!oldState.channel && newState.channel) {
    logChannel.send(`${newState.member.user.tag} joined **${newState.channel.name}**`);
  }
  // User leaves a voice channel
  if (oldState.channel && !newState.channel) {
    logChannel.send(`${oldState.member.user.tag} left **${oldState.channel.name}**`);
  }
});

// ========== /create COMMAND ==========
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand()) return;
  if (interaction.commandName !== "create") return;
  
  await interaction.reply({ content: "Creating account...", ephemeral: true });
  
  const username = interaction.options.getString("username");
  const email = username.toLowerCase().replace(/[^a-z0-9]/g,"") + "@cxld.com";
  const password = genPass();
  
  saveAccount({ username, email, password, discord: interaction.user.tag, time: new Date().toISOString() });
  
  const embed = new EmbedBuilder()
    .setTitle("CXLD Account Created")
    .setColor(0xc0c0c0)
    .addFields(
      {name:"Username", value:username},
      {name:"Email", value:email},
      {name:"Password", value:"||"+password+"||"}
    );
  
  try {
    await interaction.user.send({embeds:[embed]});
    await interaction.editReply({ content: "Done! Check DMs", ephemeral: true });
  } catch(e) {
    await interaction.editReply({ content: "Open your DMs and try again!", ephemeral: true });
  }
});

client.login(process.env.DISCORD_TOKEN);
