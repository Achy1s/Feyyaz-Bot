import { Client, Events, EmbedBuilder } from 'discord.js';
import { sendLog } from '../utils/logger';

export function registerBanEvents(client: Client): void {
    client.on(Events.GuildBanAdd, async (ban) => {
        const embed = new EmbedBuilder()
            .setColor('#cc0000')
            .setTitle('🔨 Üye Yasaklandı')
            .setThumbnail(ban.user.displayAvatarURL({ size: 64 }))
            .addFields(
                { name: 'Kullanıcı', value: `${ban.user.tag} (<@${ban.user.id}>)`, inline: true },
                { name: 'Sebep', value: ban.reason || 'Belirtilmedi', inline: true }
            )
            .setTimestamp();
        await sendLog(ban.guild, embed);
    });

    client.on(Events.GuildBanRemove, async (ban) => {
        const embed = new EmbedBuilder()
            .setColor('#00ff00')
            .setTitle('🔓 Yasaklama Kaldırıldı')
            .setThumbnail(ban.user.displayAvatarURL({ size: 64 }))
            .addFields(
                { name: 'Kullanıcı', value: `${ban.user.tag} (<@${ban.user.id}>)`, inline: true }
            )
            .setTimestamp();
        await sendLog(ban.guild, embed);
    });
}
