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

    try {
        await message.delete();
    } catch (err) {
        console.log("No se pudo borrar el mensaje");
    }

    console.log("Buscando jugador: " + mcName);
    
    try {
        // Obtener UUID de Mojang por nombre
        const uuidRes = await fetch(`https://api.mojang.com/users/profiles/minecraft/${mcName}`);
        const uuidData = await uuidRes.json();
        const uuid = uuidData.id;
        const formattedUuid = uuid.replace(/(.{8})(.{4})(.{4})(.{4})(.{12})/, '$1-$2-$3-$4-$5');
        
        console.log("UUID: " + formattedUuid);

        // Obtener Discord ID desde DiscordSRV API
        const syncRes = await fetch(`https://playerdb.co/api/player/minecraft/${mcName}`);
        const syncData = await syncRes.json();
        console.log("PlayerDB: " + JSON.stringify(syncData));

        const guild = await client.guilds.fetch(GUILD_ID);
        await guild.members.fetch();
        
        // Buscar en caché por el UUID en el nickname o por el nombre
        const member = guild.members.cache.find(m => 
            m.user.username.toLowerCase() === mcName.toLowerCase() ||
            (m.nickname && m.nickname.toLowerCase() === mcName.toLowerCase())
        );

        if (!member) {
            console.log("No encontrado: " + mcName);
            guild.members.cache.forEach(m => console.log("- " + m.user.username + " | " + m.nickname));
            return;
        }

        await member.roles.add(ROLE_ID);
        console.log("✅ Rol dado a " + mcName);
    } catch (err) {
        console.error(err);
    }
});

client.login(TOKEN);
