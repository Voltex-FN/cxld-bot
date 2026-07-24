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
