const {
    Client,
    GatewayIntentBits,
} = require("discord.js");
const { joinVoiceChannel } = require("@discordjs/voice");

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates,
    ],
});

const TOKEN = "MTQ4NDI5NjI4NjA1MDk3NTg2NQ.GjZn__.K4S-1G5h5IcwB8l32nHctp-lhMXvxFjsIEYDE0";
// --- EVENTLER ---

client.once("clientReady", async () => {
    console.log(`${client.user.tag} hazır!`); 
});


client.login(TOKEN);