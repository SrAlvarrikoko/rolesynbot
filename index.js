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
const CANAL_ID = "1494063583334764604";

const ROLES = {
    "NOVA": "1494826586384633919",
    "TERRA": "1494826680991088851",
    "SUPERIOR": "1494826773911834784"
};

const procesados = new Set();
let linkedAccounts = {
    "8d2a6733-8799-3d52-963d-20c59e78dfa5": "1232345163926339708"
};

async function cargarAccounts() {
    try {
        const res = await fetch("https://raw.githubusercontent.com/SrAlvarrikoko/rolesynbot/main/accounts.aof");
        const text = await res.text();
        const nuevas = {};
        text.split("\n").forEach(line => {
            const parts = line.trim().split(" ");
            if (parts.length === 2) {
                nuevas[parts[1]] = parts[0];
            }
        });
        if (Object.keys(nuevas).length > 0) {
            linkedAccounts = nuevas;
            console.log("Cuentas cargadas: " + Object.keys(linkedAccounts).length);
        }
    } catch (err) {
        console.log("Usando cuentas hardcodeadas");
    }
}

client.once("clientReady", async () => {
    console.log("Bot listo: " + client.user.tag);
    await cargarAccounts();
    setInterval(cargarAccounts, 60000);
});

client.on(Events.MessageCreate, async (message) => {
    console.log("Mensaje en canal " + message.channel.id + ": " + message.content);

    if (message.channel.id !== CANAL_ID) return;
    
    const content = message.content;
    let roleKey = null;

    if (content.includes("GIVEROLE-NOVA:")) roleKey = "NOVA";
    else if (content.includes("GIVEROLE-TERRA:")) roleKey = "TERRA";
    else if (content.includes("GIVEROLE-SUPERIOR:")) roleKey = "SUPERIOR";
    
    if (!roleKey) return;

    const uuid = content.split(`GIVEROLE-${roleKey}:`)[1].trim().split(" ")[0].split("\n")[0];
    
    if (procesados.has(uuid + roleKey)) return;
    procesados.add(uuid + roleKey);
    setTimeout(() => procesados.delete(uuid + roleKey), 10000);

    try { await message.delete(); } catch (err) {}

    console.log("UUID recibido para " + roleKey + ": " + uuid);
    
    await cargarAccounts();
    
    const discordId = linkedAccounts[uuid];
    if (!discordId) {
        console.log("No vinculado: " + uuid);
        return;
    }

    try {
        const guild = await client.guilds.fetch(GUILD_ID);
        const member = await guild.members.fetch(discordId);
        await member.roles.add(ROLES[roleKey]);
        console.log("✅ Rol " + roleKey + " dado a " + discordId);
    } catch (err) {
        console.error(err);
    }
});

client.login(TOKEN);
