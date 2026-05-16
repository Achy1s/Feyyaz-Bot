import { Client, Events, EmbedBuilder, GuildMember } from 'discord.js';
import { sendLog } from '../utils/logger';

export function registerGuildMemberUpdateEvent(client: Client): void {
    client.on(Events.GuildMemberUpdate, async (oldMember, newMember) => {
        const old = oldMember as GuildMember;
        const nw = newMember as GuildMember;

        // ─── TIMEOUT LOGLARI ───
        const oldTimeout = old.communicationDisabledUntilTimestamp;
        const newTimeout = nw.communicationDisabledUntilTimestamp;

        if (!oldTimeout && newTimeout) {
            // Timeout eklendi
            const embed = new EmbedBuilder()
                .setColor('#FF4500')
                .setTitle('🔇 Zamanaşımı Uygulandı')
                .setThumbnail(nw.user.displayAvatarURL({ size: 64 }))
                .addFields(
                    { name: 'Kullanıcı', value: `${nw.user.tag} (<@${nw.id}>)`, inline: true },
                    { name: 'Bitiş', value: `<t:${Math.floor(newTimeout / 1000)}:R>`, inline: true }
                )
                .setTimestamp();
            await sendLog(nw.guild, embed);
        } else if (oldTimeout && !newTimeout) {
            // Timeout kaldırıldı
            const embed = new EmbedBuilder()
                .setColor('#32CD32')
                .setTitle('🔊 Zamanaşımı Kaldırıldı')
                .setThumbnail(nw.user.displayAvatarURL({ size: 64 }))
                .addFields(
                    { name: 'Kullanıcı', value: `${nw.user.tag} (<@${nw.id}>)`, inline: true }
                )
                .setTimestamp();
            await sendLog(nw.guild, embed);
        }

        // ─── ROL DEĞİŞİKLİĞİ LOGLARI ───
        const oldRoles = old.roles.cache;
        const newRoles = nw.roles.cache;

        const addedRoles = newRoles.filter(r => !oldRoles.has(r.id));
        const removedRoles = oldRoles.filter(r => !newRoles.has(r.id));

        if (addedRoles.size > 0) {
            const embed = new EmbedBuilder()
                .setColor('#00CED1')
                .setTitle('🎭 Rol Eklendi')
                .setThumbnail(nw.user.displayAvatarURL({ size: 64 }))
                .addFields(
                    { name: 'Kullanıcı', value: `${nw.user.tag} (<@${nw.id}>)`, inline: true },
                    { name: 'Eklenen Roller', value: addedRoles.map(r => `\`${r.name}\``).join(', '), inline: true }
                )
                .setTimestamp();
            await sendLog(nw.guild, embed);
        }

        if (removedRoles.size > 0) {
            const embed = new EmbedBuilder()
                .setColor('#DC143C')
                .setTitle('🎭 Rol Kaldırıldı')
                .setThumbnail(nw.user.displayAvatarURL({ size: 64 }))
                .addFields(
                    { name: 'Kullanıcı', value: `${nw.user.tag} (<@${nw.id}>)`, inline: true },
                    { name: 'Kaldırılan Roller', value: removedRoles.map(r => `\`${r.name}\``).join(', '), inline: true }
                )
                .setTimestamp();
            await sendLog(nw.guild, embed);
        }

        // ─── NICKNAME DEĞİŞİKLİĞİ LOGU ───
        if (old.nickname !== nw.nickname) {
            const embed = new EmbedBuilder()
                .setColor('#9370DB')
                .setTitle('📝 Takma Ad Değiştirildi')
                .setThumbnail(nw.user.displayAvatarURL({ size: 64 }))
                .addFields(
                    { name: 'Kullanıcı', value: `${nw.user.tag} (<@${nw.id}>)`, inline: true },
                    { name: 'Eski İsim', value: `\`${old.nickname || 'Yok'}\``, inline: true },
                    { name: 'Yeni İsim', value: `\`${nw.nickname || 'Yok'}\``, inline: true }
                )
                .setTimestamp();
            await sendLog(nw.guild, embed);
        }
    });
}
