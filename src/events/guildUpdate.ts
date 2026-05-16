import { Client, Events, EmbedBuilder, GuildMember } from 'discord.js';
import { sendLog } from '../utils/logger';

export function registerGuildUpdateEvent(client: Client): void {
    // Sunucu Güncelleme
    client.on(Events.GuildUpdate, async (oldGuild, newGuild) => {
        const changes: string[] = [];
        if (oldGuild.name !== newGuild.name) changes.push(`**İsim:** \`${oldGuild.name}\` → \`${newGuild.name}\``);
        if (oldGuild.iconURL() !== newGuild.iconURL()) changes.push('**İkon** değiştirildi');
        if (oldGuild.bannerURL() !== newGuild.bannerURL()) changes.push('**Banner** değiştirildi');
        if (oldGuild.description !== newGuild.description) changes.push(`**Açıklama:** \`${oldGuild.description || 'Yok'}\` → \`${newGuild.description || 'Yok'}\``);
        if (oldGuild.verificationLevel !== newGuild.verificationLevel) changes.push(`**Doğrulama:** \`${oldGuild.verificationLevel}\` → \`${newGuild.verificationLevel}\``);
        if (oldGuild.vanityURLCode !== newGuild.vanityURLCode) changes.push(`**Vanity URL:** \`${oldGuild.vanityURLCode || 'Yok'}\` → \`${newGuild.vanityURLCode || 'Yok'}\``);

        if (changes.length === 0) return;

        const embed = new EmbedBuilder()
            .setColor('#FFD700')
            .setTitle('🏰 Sunucu Güncellendi')
            .setDescription(changes.join('\n'))
            .setTimestamp();
        await sendLog(newGuild, embed);
    });

    // ─── BOOST LOGLARI ───
    client.on(Events.GuildMemberUpdate, async (oldMember, newMember) => {
        const old = oldMember as GuildMember;
        const nw = newMember as GuildMember;

        // Boost başladı
        if (!old.premiumSince && nw.premiumSince) {
            const embed = new EmbedBuilder()
                .setColor('#FF73FA')
                .setTitle('💎 Yeni Boost!')
                .setThumbnail(nw.user.displayAvatarURL({ size: 64 }))
                .setDescription(`**${nw.user.tag}** sunucuyu boost etti! 🎉`)
                .addFields(
                    { name: 'Toplam Boost', value: `\`${nw.guild.premiumSubscriptionCount || 0}\``, inline: true },
                    { name: 'Boost Seviyesi', value: `\`${nw.guild.premiumTier}\``, inline: true }
                )
                .setTimestamp();
            await sendLog(nw.guild, embed);
        }

        // Boost bitti
        if (old.premiumSince && !nw.premiumSince) {
            const embed = new EmbedBuilder()
                .setColor('#808080')
                .setTitle('💔 Boost Kaldırıldı')
                .setThumbnail(nw.user.displayAvatarURL({ size: 64 }))
                .setDescription(`**${nw.user.tag}** boost'unu kaldırdı.`)
                .addFields(
                    { name: 'Kalan Boost', value: `\`${nw.guild.premiumSubscriptionCount || 0}\``, inline: true }
                )
                .setTimestamp();
            await sendLog(nw.guild, embed);
        }
    });
}
