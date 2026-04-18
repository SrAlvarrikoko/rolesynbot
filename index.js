const { Client, GatewayIntentBits, Events } = require("discord.js");

const client = new Client({ 
    intents: [
        GatewayIntentBits.Guilds, 
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMessages
    ] 
});

const TOKEN = process.env.TOKEN;
const GUILD_ID = "1493330536851046580";
const ROLE_ID = "1494826586384633919";
const CANAL_ID = "1494063399821381862"; // canal consola de tu servidor

client.once("clientReady", () => {
    console.log("Bot listo: " + client.user.tag);
});

client.on(Events.MessageCreate, async (message) => {
    if (message.channel.id !== CANAL_ID) return;
    if (!message.content.startsWith("GIVEROLE:")) return;

    const discordId = message.content.replace("GIVEROLE:", "").trim();
    try {
        const guild = await client.guilds.fetch(GUILD_ID);
        const member = await guild.members.fetch(discordId);
        await member.roles.add(ROLE_ID);
        await message.reply("✅ Rol NOVA dado a <@" + discordId + ">");
        console.log("Rol dado a " + discordId);
    } catch (err) {
        console.error(err);
    }
});

client.login(TOKEN);
