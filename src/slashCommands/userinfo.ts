import { ChatInputCommandInteraction, EmbedBuilder, GuildMember } from 'discord.js';

export async function handleSlashUserInfo(interaction: ChatInputCommandInteraction): Promise<void> {
    const target = (interaction.options.getMember('kullanıcı') || interaction.member) as GuildMember;
    if (!target) {
        await interaction.reply({ content: '❌ Kullanıcı bulunamadı.', ephemeral: true });
        return;
    }
    const user = target.user;

    const roles = target.roles.cache
        .filter(r => r.id !== interaction.guild!.id)
        .sort((a, b) => b.position - a.position)
        .map(r => `<@&${r.id}>`)
        .join(', ') || 'Rol yok';

    const badges = user.flags?.toArray().map(flag => {
        const badgeMap: Record<string, string> = {
            'ActiveDeveloper': '👨‍💻', 'BugHunterLevel1': '🐛', 'BugHunterLevel2': '🐛',
            'HypeSquadOnlineHouse1': '🏠', 'HypeSquadOnlineHouse2': '🏠', 'HypeSquadOnlineHouse3': '🏠',
            'PremiumEarlySupporter': '💎', 'Partner': '👑', 'Staff': '⚙️',
        };
        return badgeMap[flag] || '';
    }).filter(Boolean).join(' ') || 'Yok';

    const boostStatus = target.premiumSince
        ? `💎 <t:${Math.floor(target.premiumSinceTimestamp! / 1000)}:R>`
        : '❌ Yok';

    const embed = new EmbedBuilder()
        .setColor(target.displayHexColor === '#000000' ? '#7B68EE' : target.displayHexColor)
        .setTitle(`👤 ${user.username}`)
        .setThumbnail(user.displayAvatarURL({ size: 256 }))
        .addFields(
            { name: '🏷️ Kullanıcı', value: `${user.tag}\n<@${user.id}>`, inline: true },
            { name: '🆔 ID', value: `\`${user.id}\``, inline: true },
            { name: '📛 Sunucu İsmi', value: `\`${target.nickname || user.username}\``, inline: true },
            { name: '📅 Hesap', value: `<t:${Math.floor(user.createdTimestamp / 1000)}:R>`, inline: true },
            { name: '📥 Katılma', value: target.joinedAt ? `<t:${Math.floor(target.joinedAt.getTime() / 1000)}:R>` : '?', inline: true },
            { name: '💎 Boost', value: boostStatus, inline: true },
            { name: '🏅 Rozetler', value: badges, inline: false },
            { name: `🎭 Roller (${target.roles.cache.size - 1})`, value: roles.slice(0, 1024), inline: false }
        )
        .setImage(user.bannerURL({ size: 512 }) || null)
        .setTimestamp();

    await interaction.reply({ embeds: [embed] });
}
