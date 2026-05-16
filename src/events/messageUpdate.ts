import { Client, Events, EmbedBuilder } from 'discord.js';
import { sendLog } from '../utils/logger';

export function registerMessageUpdateEvent(client: Client): void {
    client.on(Events.MessageUpdate, async (oldMessage, newMessage) => {
        if (!oldMessage.guild || oldMessage.author?.bot) return;
        if (oldMessage.content === newMessage.content) return;

        const embed = new EmbedBuilder()
            .setColor('#ffff00')
            .setAuthor({ name: oldMessage.author?.tag || 'Bilinmeyen Kullanıcı', iconURL: oldMessage.author?.displayAvatarURL() })
            .setTitle('✏️ Mesaj Düzenlendi')
            .setDescription(`**Kanal:** <#${oldMessage.channel.id}>\n[Mesaja Git](${newMessage.url})`)
            .addFields(
                { name: 'Eski Mesaj', value: oldMessage.content?.slice(0, 1024) || '[Boş]', inline: false },
                { name: 'Yeni Mesaj', value: newMessage.content?.slice(0, 1024) || '[Boş]', inline: false }
            )
            .setTimestamp();
        await sendLog(oldMessage.guild, embed);
    });
}
