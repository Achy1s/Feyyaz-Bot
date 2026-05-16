import { Message, EmbedBuilder, GuildMember } from 'discord.js';

export async function handleUserInfo(message: Message, args: string[]): Promise<void> {
    const target = (message.mentions.members?.first() || message.member) as GuildMember;
    if (!target) return;

    const user = target.user;
    const roles = target.roles.cache
        .filter(r => r.id !== message.guild!.id)
        .sort((a, b) => b.position - a.position)
        .map(r => `<@&${r.id}>`)
        .join(', ') || 'Rol yok';

    const badges = user.flags?.toArray().map(flag => {
        const badgeMap: Record<string, string> = {
            'ActiveDeveloper': '👨‍💻 Aktif Geliştirici',
            'BugHunterLevel1': '🐛 Bug Hunter',
            'BugHunterLevel2': '🐛 Bug Hunter Lv2',
            'CertifiedModerator': '🛡️ Sertifikalı Mod',
            'HypeSquadOnlineHouse1': '🏠 Bravery',
            'HypeSquadOnlineHouse2': '🏠 Brilliance',
            'HypeSquadOnlineHouse3': '🏠 Balance',
            'Hypesquad': '🎉 HypeSquad',
            'Partner': '👑 Partner',
            'PremiumEarlySupporter': '💎 Erken Destekçi',
            'Staff': '⚙️ Discord Staff',
            'VerifiedBot': '✅ Doğrulanmış Bot',
            'VerifiedDeveloper': '🔧 Doğrulanmış Geliştirici',
        };
        return badgeMap[flag] || flag;
    }).join(', ') || 'Yok';

    const boostStatus = target.premiumSince
        ? `💎 Boost: <t:${Math.floor(target.premiumSinceTimestamp! / 1000)}:R>`
        : '❌ Boost yapmamış';

    const embed = new EmbedBuilder()
        .setColor(target.displayHexColor === '#000000' ? '#7B68EE' : target.displayHexColor)
        .setTitle(`👤 ${user.username}`)
        .setThumbnail(user.displayAvatarURL({ size: 256 }))
        .addFields(
            { name: '🏷️ Kullanıcı', value: `${user.tag}\n<@${user.id}>`, inline: true },
            { name: '🆔 ID', value: `\`${user.id}\``, inline: true },
            { name: '📛 Sunucu İsmi', value: `\`${target.nickname || user.username}\``, inline: true },
            { name: '📅 Hesap Oluşturma', value: `<t:${Math.floor(user.createdTimestamp / 1000)}:F>\n(<t:${Math.floor(user.createdTimestamp / 1000)}:R>)`, inline: true },
            { name: '📥 Sunucuya Katılma', value: target.joinedAt ? `<t:${Math.floor(target.joinedAt.getTime() / 1000)}:F>\n(<t:${Math.floor(target.joinedAt.getTime() / 1000)}:R>)` : 'Bilinmiyor', inline: true },
            { name: '💎 Boost', value: boostStatus, inline: true },
            { name: '🏅 Rozetler', value: badges, inline: false },
            { name: `🎭 Roller (${target.roles.cache.size - 1})`, value: roles.slice(0, 1024), inline: false }
        )
        .setImage(user.bannerURL({ size: 512 }) || null)
        .setFooter({ text: `İsteyen: ${message.author.tag}` })
        .setTimestamp();

    await message.reply({ embeds: [embed] });
}
