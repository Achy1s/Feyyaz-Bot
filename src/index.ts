import {
    Client,
    GatewayIntentBits,
    Partials
} from 'discord.js';
import * as dotenv from 'dotenv';

// Event Handlers
import { registerReadyEvent } from './events/ready';
import { registerGuildMemberAddEvent } from './events/guildMemberAdd';
import { registerGuildMemberRemoveEvent } from './events/guildMemberRemove';
import { registerGuildMemberUpdateEvent } from './events/guildMemberUpdate';
import { registerMessageCreateEvent } from './events/messageCreate';
import { registerMessageDeleteEvent } from './events/messageDelete';
import { registerMessageUpdateEvent } from './events/messageUpdate';
import { registerChannelEvents } from './events/channelEvents';
import { registerRoleEvents } from './events/roleEvents';
import { registerBanEvents } from './events/banEvents';
import { registerVoiceStateUpdateEvent } from './events/voiceStateUpdate';
import { registerInviteEvents } from './events/inviteEvents';
import { registerInteractionCreateEvent } from './events/interactionCreate';
import { registerEmojiEvents } from './events/emojiEvents';
import { registerGuildUpdateEvent } from './events/guildUpdate';
import { registerInviteTracker } from './systems/inviteTracker';

dotenv.config();

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildModeration,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildInvites,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.GuildEmojisAndStickers,
        GatewayIntentBits.AutoModerationConfiguration,
        GatewayIntentBits.AutoModerationExecution,
    ],
    partials: [
        Partials.Message,
        Partials.Channel,
        Partials.GuildMember,
        Partials.User,
    ],
});

// ─── EVENT'LERİ KAYDET ───
registerReadyEvent(client);
registerGuildMemberAddEvent(client);
registerGuildMemberRemoveEvent(client);
registerGuildMemberUpdateEvent(client);
registerMessageCreateEvent(client);
registerMessageDeleteEvent(client);
registerMessageUpdateEvent(client);
registerChannelEvents(client);
registerRoleEvents(client);
registerBanEvents(client);
registerVoiceStateUpdateEvent(client);
registerInviteEvents(client);
registerInteractionCreateEvent(client);
registerEmojiEvents(client);
registerGuildUpdateEvent(client);
registerInviteTracker(client);

// ─── HATA YAKALAMA ───
process.on('unhandledRejection', (error) => {
    console.error('Yakalanamayan hata:', error);
});

process.on('uncaughtException', (error) => {
    console.error('Kritik hata:', error);
});

// ─── GİRİŞ ───
client.login(process.env.DISCORD_TOKEN);