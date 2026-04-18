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
const CANAL_ID = "1494063399821381862";

client.once("clientReady", () => {
    console.log("Bot listo: " + client.user.tag);
});

client.on(Events.MessageCreate, async (message) => {
    if (message.channel.id !== CANAL_ID) return;
    if (!message.content.includes("GIVEROLE:")) return;

    const mcName = message.content.split("GIVEROLE:")[1].trim().split(" ")[0];
    
    try {
        const guild = await client.guilds.fetch(GUILD_ID);
        await guild.members.fetch();
        
        // Busca el miembro por nombre de usuario o nickname
        const member = guild.members.cache.find(m => 
            m.nickname === mcName || m.user.username === mcName
        );

        if (!member) {
            console.log("No se encontró miembro con nombre: " + mcName);
            return;
        }

        await member.roles.add(ROLE_ID);
        console.log("Rol dado a " + mcName);
    } catch (err) {
        console.error(err);
    }
});

client.login(TOKEN);
