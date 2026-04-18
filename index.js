const { Client, GatewayIntentBits, Events } = require("discord.js");
const https = require("https");

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
const CANAL_ID = "1494063583334764604";

client.once("clientReady", () => {
    console.log("Bot listo: " + client.user.tag);
});

client.on(Events.MessageCreate, async (message) => {
    if (message.channel.id !== CANAL_ID) return;
    if (!message.content.includes("GIVEROLE:")) return;

    const uuid = message.content.split("GIVEROLE:")[1].trim().split(" ")[0].split("\n")[0];
    console.log("UUID recibido: " + uuid);
    
    try {
        const guild = await client.guilds.fetch(GUILD_ID);
        await guild.members.fetch();
        
        // El ID de Discord de SrAlvarikoko es 1232345163926339708
        // Buscamos directamente por el UUID en los nicknames o usamos el linked de DiscordSRV
        const discordId = "1232345163926339708"; // temporal para probar
        
        const member = await guild.members.fetch(discordId);
        await member.roles.add(ROLE_ID);
        console.log("✅ Rol dado a " + discordId);
    } catch (err) {
        console.error(err);
    }
});

client.login(TOKEN);
