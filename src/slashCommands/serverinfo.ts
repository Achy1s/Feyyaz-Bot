import { ChatInputCommandInteraction, EmbedBuilder, ChannelType } from 'discord.js';

export async function handleSlashServerInfo(interaction: ChatInputCommandInteraction): Promise<void> {
    const guild = interaction.guild!;
    await guild.members.fetch().catch(() => {});

    const textChannels = guild.channels.cache.filter(c => c.type === ChannelType.GuildText).size;
    const voiceChannels = guild.channels.cache.filter(c => c.type === ChannelType.GuildVoice).size;
    const totalMembers = guild.memberCount;
    const botCount = guild.members.cache.filter(m => m.user.bot).size;

    const boostNames: Record<number, string> = { 0: 'Yok', 1: '⭐ Lv1', 2: '⭐⭐ Lv2', 3: '⭐⭐⭐ Lv3' };

    const embed = new EmbedBuilder()
        .setColor('#7B68EE')
        .setTitle(`🏰 ${guild.name}`)
        .setThumbnail(guild.iconURL({ size: 256 }) || null)
        .addFields(
            { name: '👑 Sahip', value: `<@${guild.ownerId}>`, inline: true },
            { name: '📅 Kuruluş', value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:R>`, inline: true },
            { name: `👥 Üyeler (${totalMembers})`, value: `İnsan: \`${totalMembers - botCount}\` • Bot: \`${botCount}\``, inline: true },
            { name: '📁 Kanallar', value: `💬 \`${textChannels}\` • 🔊 \`${voiceChannels}\``, inline: true },
            { name: '💎 Boost', value: `${boostNames[guild.premiumTier]} • \`${guild.premiumSubscriptionCount || 0}\` boost`, inline: true },
            { name: '😀 Emoji', value: `\`${guild.emojis.cache.size}\` emoji`, inline: true }
        )
        .setImage(guild.bannerURL({ size: 512 }) || null)
        .setTimestamp();

    await interaction.reply({ embeds: [embed] });
}
