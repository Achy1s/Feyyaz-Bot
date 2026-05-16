import { Client, Events, ChatInputCommandInteraction, ButtonInteraction, EmbedBuilder } from 'discord.js';
import { handleSlashPurge } from '../slashCommands/purge';
import { handleSlashKick } from '../slashCommands/kick';
import { handleSlashBan } from '../slashCommands/ban';
import { handleSlashTimeout } from '../slashCommands/timeout';
import { handleSlashLevel } from '../slashCommands/level';
import { handleSlashLeaderboard } from '../slashCommands/leaderboard';
import { handleSlashVoiceStats } from '../slashCommands/voicestats';
import { handleSlashVoiceLeaderboard } from '../slashCommands/voiceleaderboard';
import { handleSlashUserInfo } from '../slashCommands/userinfo';
import { handleSlashServerInfo } from '../slashCommands/serverinfo';
import { handleSlashAvatar } from '../slashCommands/avatar';
import { handleSlashAnnounce } from '../slashCommands/announce';
import { handleSlashSlowmode } from '../slashCommands/slowmode';
import { createGiveaway, handleGiveawayButton } from '../systems/giveaway';
import { createPoll, handlePollButton } from '../systems/poll';
import { handleTicketButton } from '../systems/ticket';
import { handleMarketButton } from '../slashCommands/market';
import { handleRoleButton } from '../systems/buttonRoles';
import { handleSlashTicket } from '../slashCommands/ticket';
import { handleSlashWallet, handleSlashDaily, handleSlashCoinflip } from '../slashCommands/economy';
import { handleSlashMarket } from '../slashCommands/market';
import { handleSlashRolePanel } from '../slashCommands/buttonRoles';
import { sendLog } from '../utils/logger';

export function registerInteractionCreateEvent(client: Client): void {
    client.on(Events.InteractionCreate, async (interaction) => {
        try {
            // ─── SLASH COMMANDS ───
            if (interaction.isChatInputCommand()) {
                const cmd = interaction as ChatInputCommandInteraction;

                // ─── KOMUT KULLANIM LOGU ───
                if (cmd.guild) {
                    const logEmbed = new EmbedBuilder()
                        .setColor('#5865F2')
                        .setTitle('📋 Slash Komut Kullanıldı')
                        .addFields(
                            { name: 'Komut', value: `\`/${cmd.commandName}\``, inline: true },
                            { name: 'Kullanan', value: `${cmd.user.tag} (<@${cmd.user.id}>)`, inline: true },
                            { name: 'Kanal', value: `<#${cmd.channelId}>`, inline: true }
                        )
                        .setTimestamp();
                    await sendLog(cmd.guild, logEmbed);
                }

                switch (cmd.commandName) {
                    case 'purge': return await handleSlashPurge(cmd);
                    case 'kick': return await handleSlashKick(cmd);
                    case 'ban': return await handleSlashBan(cmd);
                    case 'timeout': return await handleSlashTimeout(cmd);
                    case 'level': return await handleSlashLevel(cmd);
                    case 'leaderboard': return await handleSlashLeaderboard(cmd);
                    case 'ses': return await handleSlashVoiceStats(cmd);
                    case 'sessıralama': return await handleSlashVoiceLeaderboard(cmd);
                    case 'kullanıcı': return await handleSlashUserInfo(cmd);
                    case 'sunucu': return await handleSlashServerInfo(cmd);
                    case 'avatar': return await handleSlashAvatar(cmd);
                    case 'giveaway': return await createGiveaway(cmd);
                    case 'anket': return await createPoll(cmd);
                    case 'duyuru': return await handleSlashAnnounce(cmd);
                    case 'slowmode': return await handleSlashSlowmode(cmd);
                    case 'ticket-kur': return await handleSlashTicket(cmd);
                    case 'cüzdan': return await handleSlashWallet(cmd);
                    case 'günlük': return await handleSlashDaily(cmd);
                    case 'yazıtura': return await handleSlashCoinflip(cmd);
                    case 'market': return await handleSlashMarket(cmd);
                    case 'rol-panel-kur': return await handleSlashRolePanel(cmd);
                }
            }

            // ─── BUTTON INTERACTIONS ───
            if (interaction.isButton()) {
                const btn = interaction as ButtonInteraction;
                if (btn.customId.startsWith('giveaway_')) {
                    return await handleGiveawayButton(btn);
                }
                if (btn.customId.startsWith('poll_')) {
                    return await handlePollButton(btn);
                }
                if (btn.customId.startsWith('ticket_')) {
                    return await handleTicketButton(btn);
                }
                if (btn.customId.startsWith('market_buy_')) {
                    return await handleMarketButton(btn);
                }
                if (btn.customId.startsWith('role_assign_')) {
                    return await handleRoleButton(btn);
                }
            }
        } catch (error) {
            console.error('Etkileşim hatası:', error);
            try {
                if (interaction.isRepliable() && !interaction.replied && !interaction.deferred) {
                    await interaction.reply({ content: '❌ Bir hata oluştu.', ephemeral: true });
                }
            } catch {}
        }
    });
}
