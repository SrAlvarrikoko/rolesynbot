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

// Tabla de UUID -> Discord ID (se rellena automáticamente cuando alguien recoge el item)
const linkedPlayers = {};

client.once("clientReady", () => {
    console.log("Bot listo: " + client.user.tag);
});

client.on(Events.MessageCreate, async (message) => {
    if (message.channel.id !== CANAL_ID) return;

    // Cuando DiscordSRV confirma el link: "LINKED:uuid:discordId"
    if (message.content.includes("LINKED:")) {
        const parts = message.content.split("LINKED:")[1].trim().split(":");
        linkedPlayers[parts[0]] = parts[1];
        console.log("Vinculado: " + parts[0] + " -> " + parts[1]);
        return;
    }

    if (!message.content.includes("GIVEROLE:")) return;

    const uuid = message.content.split("GIVEROLE:")[1].trim().split(" ")[0].split("\n")[0];
    console.log("UUID recibido: " + uuid);
    
    try {
        const guild = await client.guilds.fetch(GUILD_ID);
        await guild.members.fetch();

        // Busca el Discord ID por UUID en la tabla de LuckPerms contexts
        const member = guild.members.cache.find(m => 
            m.nickname && m.nickname.includes(uuid)
        );

        // Si no está en caché, usa el UUID para buscar en los miembros vinculados
        const discordId = linkedPlayers[uuid];
        if (!discordId) {
            console.log("No se encontró Discord ID para UUID: " + uuid);
            console.log("Tabla actual: " + JSON.stringify(linkedPlayers));
            return;
        }

        const target = await guild.members.fetch(discordId);
        await target.roles.add(ROLE_ID);
        console.log("✅ Rol dado a " + discordId);
    } catch (err) {
        console.error(err);
    }
});

client.login(TOKEN);
