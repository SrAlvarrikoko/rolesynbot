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
const CANAL_ID = "1494063583334764604";

const procesados = new Set();

client.once("clientReady", () => {
    console.log("Bot listo: " + client.user.tag);
});

client.on(Events.MessageCreate, async (message) => {
    if (message.channel.id !== CANAL_ID) return;
    if (!message.content.includes("GIVEROLE:")) return;

    const mcName = message.content.split("GIVEROLE:")[1].trim().split(" ")[0].split("\n")[0];
    
    if (procesados.has(mcName)) return;
    procesados.add(mcName);
    setTimeout(() => procesados.delete(mcName), 10000);

    try { await message.delete(); } catch (err) {}

    console.log("Buscando jugador: " + mcName);
    
    try {
        const guild = await client.guilds.fetch(GUILD_ID);
        await guild.members.fetch();
        
        const member = guild.members.cache.find(m => 
            m.user.username.toLowerCase() === mcName.toLowerCase() ||
            (m.nickname && m.nickname.toLowerCase() === mcName.toLowerCase()) ||
            m.user.globalName && m.user.globalName.toLowerCase() === mcName.toLowerCase()
        );

        if (!member) {
            console.log("No encontrado: " + mcName);
            console.log("Nombres disponibles:");
            guild.members.cache.forEach(m => console.log(`- ${m.user.username} | global: ${m.user.globalName} | nick: ${m.nickname}`));
            return;
        }

        await member.roles.add(ROLE_ID);
        console.log("✅ Rol dado a " + member.user.username);
    } catch (err) {
        console.error(err);
    }
});

client.login(TOKEN);
