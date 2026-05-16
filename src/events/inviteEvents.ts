import { Client, Events, EmbedBuilder, Guild } from 'discord.js';
import { sendLog } from '../utils/logger';

export function registerInviteEvents(client: Client): void {
    client.on(Events.InviteCreate, async (invite) => {
        if (!invite.guild) return;
        const embed = new EmbedBuilder()
            .setColor('#00BFFF')
            .setTitle('🔗 Davet Oluşturuldu')
            .addFields(
                { name: 'Oluşturan', value: invite.inviter?.tag || 'Bilinmeyen', inline: true },
                { name: 'Kod', value: `\`${invite.code}\``, inline: true },
                { name: 'Kanal', value: `<#${invite.channel?.id}>`, inline: true },
                { name: 'Max Kullanım', value: `\`${invite.maxUses || '∞'}\``, inline: true },
                { name: 'Süre', value: invite.maxAge ? `\`${invite.maxAge / 3600} saat\`` : '`Süresiz`', inline: true }
            )
            .setTimestamp();
        await sendLog(invite.guild as Guild, embed);
    });

    client.on(Events.InviteDelete, async (invite) => {
        if (!invite.guild) return;
        const embed = new EmbedBuilder()
            .setColor('#ff4444')
            .setTitle('🔗 Davet Silindi')
            .addFields(
                { name: 'Kod', value: `\`${invite.code}\``, inline: true },
                { name: 'Kanal', value: invite.channel ? `<#${invite.channel.id}>` : 'Bilinmeyen', inline: true }
            )
            .setTimestamp();
        await sendLog(invite.guild as Guild, embed);
    });
}
