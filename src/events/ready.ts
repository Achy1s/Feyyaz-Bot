import { Client, Events, ActivityType, EmbedBuilder, TextChannel } from 'discord.js';
import { CONFIG } from '../config';
import { registerSlashCommands } from '../utils/registerSlashCommands';
import { restoreGiveaways } from '../systems/giveaway';
import { setupAutoModBadge } from '../systems/automodBadge';
import { loadEconomy } from '../systems/economy';

export function registerReadyEvent(client: Client): void {
    client.once(Events.ClientReady, async (readyClient) => {
        console.log(`🚀 Sistem Aktif: ${readyClient.user.tag}`);
        readyClient.user.setActivity('Sunucuyu Koruyor', { type: ActivityType.Watching });

        loadEconomy();
        await registerSlashCommands();
        restoreGiveaways(client);
        await setupAutoModBadge(client);

        // ─── BOT BAŞLATMA LOGU ───
        try {
            const guild = readyClient.guilds.cache.get(CONFIG.GUILD_ID);
            if (guild) {
                const logChannel = guild.channels.cache.get(CONFIG.LOG_CHANNEL_ID) as TextChannel;
                if (logChannel) {
                    const embed = new EmbedBuilder()
                        .setColor('#00ff00')
                        .setTitle('🟢 Bot Aktif')
                        .setDescription(`**${readyClient.user.tag}** başarıyla başlatıldı.`)
                        .addFields(
                            { name: '📡 Ping', value: `\`${readyClient.ws.ping}ms\``, inline: true },
                            { name: '👥 Sunucu', value: `\`${guild.memberCount}\` üye`, inline: true },
                            { name: '⏰ Başlatma', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: true }
                        )
                        .setTimestamp();
                    await logChannel.send({ embeds: [embed] });
                }
            }
        } catch (err) {
            console.error('Boot log gönderilemedi:', err);
        }
    });
}
