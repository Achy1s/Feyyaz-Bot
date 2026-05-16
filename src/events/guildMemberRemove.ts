import { Client, Events, EmbedBuilder } from 'discord.js';
import { sendLog } from '../utils/logger';

export function registerGuildMemberRemoveEvent(client: Client): void {
    client.on(Events.GuildMemberRemove, async (member) => {
        const roles = member.roles.cache
            .filter(r => r.id !== member.guild.id)
            .map(r => `\`${r.name}\``)
            .join(', ') || 'Yok';

        const embed = new EmbedBuilder()
            .setColor('#ff9900')
            .setTitle('📤 Üye Ayrıldı')
            .setThumbnail(member.user.displayAvatarURL({ size: 64 }))
            .addFields(
                { name: 'Kullanıcı', value: `${member.user.tag} (<@${member.id}>)`, inline: true },
                { name: 'Rolleri', value: roles.slice(0, 1024), inline: false },
                { name: 'Katılma Tarihi', value: member.joinedAt ? `<t:${Math.floor(member.joinedAt.getTime() / 1000)}:R>` : 'Bilinmiyor', inline: true }
            )
            .setTimestamp();
        await sendLog(member.guild, embed);
    });
}
