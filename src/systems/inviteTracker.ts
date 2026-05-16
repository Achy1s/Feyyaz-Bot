import { Client, Collection, Guild, Events } from 'discord.js';

// guildId -> (inviteCode -> uses)
export const invitesCache = new Map<string, Collection<string, number>>();

export function registerInviteTracker(client: Client): void {
    client.on(Events.ClientReady, async () => {
        // Tüm sunuculardaki mevcut davetleri önbelleğe al
        for (const [guildId, guild] of client.guilds.cache) {
            try {
                const invites = await guild.invites.fetch();
                const codeUses = new Collection<string, number>();
                invites.forEach(inv => codeUses.set(inv.code, inv.uses || 0));
                invitesCache.set(guildId, codeUses);
            } catch (err) {
                console.error(`${guild.name} için davetler alınamadı:`, err);
            }
        }
    });

    client.on(Events.InviteCreate, (invite) => {
        if (!invite.guild) return;
        const guildCache = invitesCache.get(invite.guild.id);
        if (guildCache) {
            guildCache.set(invite.code, invite.uses || 0);
        }
    });

    client.on(Events.InviteDelete, (invite) => {
        if (!invite.guild) return;
        const guildCache = invitesCache.get(invite.guild.id);
        if (guildCache) {
            guildCache.delete(invite.code);
        }
    });
}
