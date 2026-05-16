import { Client, Events, EmbedBuilder } from 'discord.js';
import { sendLog } from '../utils/logger';

export function registerEmojiEvents(client: Client): void {
    client.on(Events.GuildEmojiCreate, async (emoji) => {
        const embed = new EmbedBuilder()
            .setColor('#00ff88')
            .setTitle('😀 Emoji Eklendi')
            .setThumbnail(emoji.url)
            .addFields(
                { name: 'İsim', value: `\`:${emoji.name}:\``, inline: true },
                { name: 'ID', value: `\`${emoji.id}\``, inline: true },
                { name: 'Animasyonlu', value: emoji.animated ? '✅ Evet' : '❌ Hayır', inline: true }
            )
            .setTimestamp();
        await sendLog(emoji.guild, embed);
    });

    client.on(Events.GuildEmojiDelete, async (emoji) => {
        const embed = new EmbedBuilder()
            .setColor('#ff0000')
            .setTitle('😢 Emoji Silindi')
            .addFields(
                { name: 'İsim', value: `\`:${emoji.name}:\``, inline: true },
                { name: 'ID', value: `\`${emoji.id}\``, inline: true }
            )
            .setTimestamp();
        await sendLog(emoji.guild, embed);
    });

    client.on(Events.GuildEmojiUpdate, async (oldEmoji, newEmoji) => {
        if (oldEmoji.name === newEmoji.name) return;
        const embed = new EmbedBuilder()
            .setColor('#FFA500')
            .setTitle('😀 Emoji Güncellendi')
            .setThumbnail(newEmoji.url)
            .addFields(
                { name: 'Eski İsim', value: `\`:${oldEmoji.name}:\``, inline: true },
                { name: 'Yeni İsim', value: `\`:${newEmoji.name}:\``, inline: true }
            )
            .setTimestamp();
        await sendLog(newEmoji.guild, embed);
    });

    // Sticker Events
    client.on(Events.GuildStickerCreate, async (sticker) => {
        if (!sticker.guild) return;
        const embed = new EmbedBuilder()
            .setColor('#00ff88')
            .setTitle('🏷️ Sticker Eklendi')
            .addFields(
                { name: 'İsim', value: `\`${sticker.name}\``, inline: true },
                { name: 'Açıklama', value: sticker.description || 'Yok', inline: true }
            )
            .setTimestamp();
        await sendLog(sticker.guild, embed);
    });

    client.on(Events.GuildStickerDelete, async (sticker) => {
        if (!sticker.guild) return;
        const embed = new EmbedBuilder()
            .setColor('#ff0000')
            .setTitle('🏷️ Sticker Silindi')
            .addFields(
                { name: 'İsim', value: `\`${sticker.name}\``, inline: true }
            )
            .setTimestamp();
        await sendLog(sticker.guild, embed);
    });
}
