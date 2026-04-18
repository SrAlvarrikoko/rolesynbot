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

// Tabla de UUID -> Discord ID
const linkedAccounts = {};

async function fetchLinkedAccounts() {
    try {
        const res = await fetch("https://raw.githubusercontent.com/TU_USUARIO/rolesynbot/main/accounts.aof");
        const text = await res.text();
        text.split("\n").forEach(line => {
            const parts = line.trim().split(" ");
            if (parts.length === 2) {
                linkedAccounts[parts[1]] = parts[0]; // uuid -> discordId
            }
        });
        console.log("Cuentas cargadas: " + Object.keys(linkedAccounts).length);
    } catch (err) {
        console.error("Error cargando cuentas: " + err);
    }
}

client.once("clientReady", async () => {
    console.log("Bot listo: " + client.user.tag);
    await fetchLinkedAccounts();
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
        // Obtener UUID de Mojang
        const uuidRes = await fetch(`https://api.mojang.com/users/profiles/minecraft/${mcName}`);
        const uuidData = await uuidRes.json();
        const rawUuid = uuidData.id;
        const uuid = rawUuid.replace(/(.{8})(.{4})(.{4})(.{4})(.{12})/, '$1-$2-$3-$4-$5');
        
        console.log("UUID: " + uuid);
        
        const discordId = linkedAccounts[uuid];
        if (!discordId) {
            console.log("No vinculado: " + uuid);
            return;
        }

        const guild = await client.guilds.fetch(GUILD_ID);
        const member = await guild.members.fetch(discordId);
        await member.roles.add(ROLE_ID);
        console.log("✅ Rol dado a " + discordId);
    } catch (err) {
        console.error(err);
    }
});

client.login(TOKEN);
