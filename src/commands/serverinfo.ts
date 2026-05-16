import { Message, EmbedBuilder, ChannelType } from 'discord.js';

export async function handleServerInfo(message: Message): Promise<void> {
    const guild = message.guild!;
    await guild.members.fetch().catch(() => {});

    const textChannels = guild.channels.cache.filter(c => c.type === ChannelType.GuildText).size;
    const voiceChannels = guild.channels.cache.filter(c => c.type === ChannelType.GuildVoice).size;
    const categories = guild.channels.cache.filter(c => c.type === ChannelType.GuildCategory).size;
    const totalMembers = guild.memberCount;
    const onlineMembers = guild.members.cache.filter(m => m.presence?.status !== 'offline').size;
    const botCount = guild.members.cache.filter(m => m.user.bot).size;
    const humanCount = totalMembers - botCount;
    const emojiCount = guild.emojis.cache.size;
    const stickerCount = guild.stickers.cache.size;
    const roleCount = guild.roles.cache.size - 1;

    const boostLevelNames: Record<number, string> = {
        0: 'Seviye 0',
        1: '⭐ Seviye 1',
        2: '⭐⭐ Seviye 2',
        3: '⭐⭐⭐ Seviye 3',
    };

    const verificationLevels: Record<number, string> = {
        0: 'Yok',
        1: 'Düşük',
        2: 'Orta',
        3: 'Yüksek',
        4: 'En Yüksek',
    };

    const embed = new EmbedBuilder()
        .setColor('#7B68EE')
        .setTitle(`🏰 ${guild.name}`)
        .setThumbnail(guild.iconURL({ size: 256 }) || null)
        .addFields(
            { name: '👑 Sahip', value: `<@${guild.ownerId}>`, inline: true },
            { name: '🆔 ID', value: `\`${guild.id}\``, inline: true },
            { name: '📅 Kuruluş', value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:F>\n(<t:${Math.floor(guild.createdTimestamp / 1000)}:R>)`, inline: true },
            { name: `👥 Üyeler (${totalMembers})`, value: `İnsan: \`${humanCount}\`\nBot: \`${botCount}\`\nÇevrimiçi: \`${onlineMembers}\``, inline: true },
            { name: `📁 Kanallar (${guild.channels.cache.size})`, value: `💬 Metin: \`${textChannels}\`\n🔊 Ses: \`${voiceChannels}\`\n📂 Kategori: \`${categories}\``, inline: true },
            { name: '🎭 Roller', value: `\`${roleCount}\` rol`, inline: true },
            { name: '💎 Boost', value: `${boostLevelNames[guild.premiumTier] || 'Seviye 0'}\n\`${guild.premiumSubscriptionCount || 0}\` boost`, inline: true },
            { name: '😀 Emoji & Sticker', value: `Emoji: \`${emojiCount}\`\nSticker: \`${stickerCount}\``, inline: true },
            { name: '🔒 Doğrulama', value: verificationLevels[guild.verificationLevel] || 'Bilinmiyor', inline: true }
        )
        .setImage(guild.bannerURL({ size: 512 }) || null)
        .setFooter({ text: `İsteyen: ${message.author.tag}` })
        .setTimestamp();

    await message.reply({ embeds: [embed] });
}
