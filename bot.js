require("dotenv").config();
const { Client, GatewayIntentBits, SlashCommandBuilder, REST, Routes, EmbedBuilder } = require("discord.js");
const fs = require("fs");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages
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

client.once("ready", async () => {
  console.log("Bot online: " + client.user.tag);
  
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
});

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
