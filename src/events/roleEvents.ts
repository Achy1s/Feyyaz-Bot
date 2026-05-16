import { Client, Events, EmbedBuilder } from 'discord.js';
import { sendLog } from '../utils/logger';

export function registerRoleEvents(client: Client): void {
    // Rol Oluşturma
    client.on(Events.GuildRoleCreate, async (role) => {
        const embed = new EmbedBuilder()
            .setColor('#00CED1')
            .setTitle('🎭 Rol Oluşturuldu')
            .addFields(
                { name: 'Rol Adı', value: `\`${role.name}\``, inline: true },
                { name: 'Rol ID', value: `\`${role.id}\``, inline: true },
                { name: 'Renk', value: `\`${role.hexColor}\``, inline: true }
            )
            .setTimestamp();
        await sendLog(role.guild, embed);
    });

    // Rol Silme
    client.on(Events.GuildRoleDelete, async (role) => {
        const embed = new EmbedBuilder()
            .setColor('#ff0000')
            .setTitle('🎭 Rol Silindi')
            .addFields(
                { name: 'Rol Adı', value: `\`${role.name}\``, inline: true },
                { name: 'Rol ID', value: `\`${role.id}\``, inline: true }
            )
            .setTimestamp();
        await sendLog(role.guild, embed);
    });

    // Rol Güncelleme
    client.on(Events.GuildRoleUpdate, async (oldRole, newRole) => {
        const changes: string[] = [];
        if (oldRole.name !== newRole.name) changes.push(`**İsim:** \`${oldRole.name}\` → \`${newRole.name}\``);
        if (oldRole.hexColor !== newRole.hexColor) changes.push(`**Renk:** \`${oldRole.hexColor}\` → \`${newRole.hexColor}\``);
        if (oldRole.hoist !== newRole.hoist) changes.push(`**Ayrı Göster:** \`${oldRole.hoist}\` → \`${newRole.hoist}\``);
        if (oldRole.mentionable !== newRole.mentionable) changes.push(`**Bahsedilebilir:** \`${oldRole.mentionable}\` → \`${newRole.mentionable}\``);

        if (changes.length === 0) return;

        const embed = new EmbedBuilder()
            .setColor('#FFA500')
            .setTitle('🎭 Rol Güncellendi')
            .setDescription(`**Rol:** ${newRole.name}\n\n${changes.join('\n')}`)
            .setTimestamp();
        await sendLog(newRole.guild, embed);
    });
}
