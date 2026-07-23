require("dotenv").config();
const { Client, GatewayIntentBits, SlashCommandBuilder, REST, Routes, EmbedBuilder } = require("discord.js");

const API_URL = "https://cxld-server.onrender.com";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages
  ],
  partials: ["CHANNEL"]
});

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
  
  console.log("Commands ready!");
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand()) return;
  if (interaction.commandName !== "create") return;
  
  await interaction.reply({ content: "Creating account...", ephemeral: true });
  
  const username = interaction.options.getString("username");
  
  try {
    // THIS IS WHERE THE API CALL GOES
    const res = await fetch(API_URL + "/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username })
    });
    
    const data = await res.json();
    
    if (data.success) {
      const embed = new EmbedBuilder()
        .setTitle("CXLD Account Created")
        .setColor(0xc0c0c0)
        .addFields(
          {name:"Username", value:data.data.username},
          {name:"Email", value:data.data.email},
          {name:"Password", value:"||"+data.data.password+"||"}
        );
      
      try {
        await interaction.user.send({embeds:[embed]});
        await interaction.editReply({ content: "Done! Check DMs", ephemeral: true });
      } catch(e) {
        await interaction.editReply({ content: "Open your DMs!", ephemeral: true });
      }
    } else {
      await interaction.editReply({ content: data.message, ephemeral: true });
    }
  } catch(e) {
    await interaction.editReply({ content: "Server error. Try again.", ephemeral: true });
  }
});

client.login(process.env.DISCORD_TOKEN);
