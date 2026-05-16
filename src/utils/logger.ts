import { EmbedBuilder, Guild, TextChannel } from 'discord.js';
import { CONFIG } from '../config';

export async function sendLog(guild: Guild, embed: EmbedBuilder): Promise<void> {
    try {
        const logChannel = guild.channels.cache.get(CONFIG.LOG_CHANNEL_ID) as TextChannel;
        if (logChannel) {
            await logChannel.send({ embeds: [embed] });
        }
    } catch (error) {
        console.error('Log gönderilemedi:', error);
    }
}
