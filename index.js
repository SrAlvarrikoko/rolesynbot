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
const linkedAccounts = {
    "8d2a6733-8799-3d52-963d-20c59e78dfa5": "1232345163926339708"
};

client.once("clientReady", () => {
    console.log("Bot listo: " + client.user.tag);
});

client.on(Events.MessageCreate, async (message) => {
    if (message.channel.id !== CANAL_ID) return;

    // Registrar nuevo link: LINKED:uuid:discordId
    if (message.content.includes("LINKED:")) {
        const parts = message.content.split("LINKED:")[1].trim().split(":");
        if (parts.length === 2) {
            linkedAccounts[parts[0]] = parts[1];
            console.log("Nuevo link: " + parts[0] + " -> " + parts[1]);
        }
        try { await message.delete(); } catch (err) {}
        return;
    }

    if (!message.content.includes("GIVEROLE:")) return;

    const uuid = message.content.split("GIVEROLE:")[1].trim().split(" ")[0].split("\n")[0];
    
    if (procesados.has(uuid)) return;
    procesados.add(uuid);
    setTimeout(() => procesados.delete(uuid), 10000);

    try { await message.delete(); } catch (err) {}

    console.log("UUID recibido: " + uuid);
    
    const discordId = linkedAccounts[uuid];
    if (!discordId) {
        console.log("No vinculado: " + uuid);
        return;
    }

    try {
        const guild = await client.guilds.fetch(GUILD_ID);
        const member = await guild.members.fetch(discordId);
        await member.roles.add(ROLE_ID);
        console.log("✅ Rol dado a " + discordId);
    } catch (err) {
        console.error(err);
    }
});

client.login(TOKEN);
