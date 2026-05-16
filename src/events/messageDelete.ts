import { Client, Events, EmbedBuilder } from 'discord.js';
import { sendLog } from '../utils/logger';

export function registerMessageDeleteEvent(client: Client): void {
    client.on(Events.MessageDelete, async (message) => {
        if (!message.guild || message.author?.bot) return;

        const embed = new EmbedBuilder()
            .setColor('#ff0000')
            .setAuthor({ name: message.author?.tag || 'Bilinmeyen Kullanıcı', iconURL: message.author?.displayAvatarURL() })
            .setTitle('🗑️ Mesaj Silindi')
            .setDescription(
                `**Kanal:** <#${message.channel.id}>\n` +
                `**Mesaj:**\n${message.content?.slice(0, 1800) || '[İçerik Yok/Görsel]'}`
            )
            .setTimestamp();

        if (message.attachments.size > 0) {
            const attachList = message.attachments.map(a => `[${a.name}](${a.url})`).join('\n');
            embed.addFields({ name: '📎 Ekler', value: attachList.slice(0, 1024) });
        }

        await sendLog(message.guild, embed);
    });
}
