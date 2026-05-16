import { Client, Events, EmbedBuilder } from 'discord.js';
import { sendLog } from '../utils/logger';
import { handleVoiceJoin, handleVoiceLeave } from '../systems/voiceTracking';

export function registerVoiceStateUpdateEvent(client: Client): void {
    client.on(Events.VoiceStateUpdate, async (oldState, newState) => {
        const member = newState.member || oldState.member;
        if (!member || member.user.bot) return;
        const guild = newState.guild;

        // Ses kanalına katıldı
        if (!oldState.channelId && newState.channelId) {
            handleVoiceJoin(guild.id, member.id);

            const embed = new EmbedBuilder()
                .setColor('#00ff88')
                .setTitle('🔊 Ses Kanalına Katıldı')
                .addFields(
                    { name: 'Kullanıcı', value: `${member.user.tag} (<@${member.id}>)`, inline: true },
                    { name: 'Kanal', value: `<#${newState.channelId}>`, inline: true }
                )
                .setTimestamp();
            await sendLog(guild, embed);
        }

        // Ses kanalından ayrıldı
        else if (oldState.channelId && !newState.channelId) {
            handleVoiceLeave(guild.id, member.id);

            const embed = new EmbedBuilder()
                .setColor('#ff6600')
                .setTitle('🔇 Ses Kanalından Ayrıldı')
                .addFields(
                    { name: 'Kullanıcı', value: `${member.user.tag} (<@${member.id}>)`, inline: true },
                    { name: 'Kanal', value: `<#${oldState.channelId}>`, inline: true }
                )
                .setTimestamp();
            await sendLog(guild, embed);
        }

        // Ses kanalı değiştirdi (süre sıfırlanmaz, sadece log)
        else if (oldState.channelId && newState.channelId && oldState.channelId !== newState.channelId) {
            const embed = new EmbedBuilder()
                .setColor('#1E90FF')
                .setTitle('🔀 Ses Kanalı Değiştirildi')
                .addFields(
                    { name: 'Kullanıcı', value: `${member.user.tag} (<@${member.id}>)`, inline: true },
                    { name: 'Eski Kanal', value: `<#${oldState.channelId}>`, inline: true },
                    { name: 'Yeni Kanal', value: `<#${newState.channelId}>`, inline: true }
                )
                .setTimestamp();
            await sendLog(guild, embed);
        }

        // ─── MIC / DEAF DEĞİŞİKLİKLERİ ───
        if (oldState.channelId && newState.channelId) {
            // Server mute
            if (!oldState.serverMute && newState.serverMute) {
                const embed = new EmbedBuilder()
                    .setColor('#FF4500')
                    .setTitle('🔇 Sunucu Tarafından Susturuldu')
                    .addFields(
                        { name: 'Kullanıcı', value: `${member.user.tag}`, inline: true },
                        { name: 'Kanal', value: `<#${newState.channelId}>`, inline: true }
                    )
                    .setTimestamp();
                await sendLog(guild, embed);
            } else if (oldState.serverMute && !newState.serverMute) {
                const embed = new EmbedBuilder()
                    .setColor('#32CD32')
                    .setTitle('🔊 Sunucu Susturması Kaldırıldı')
                    .addFields(
                        { name: 'Kullanıcı', value: `${member.user.tag}`, inline: true },
                        { name: 'Kanal', value: `<#${newState.channelId}>`, inline: true }
                    )
                    .setTimestamp();
                await sendLog(guild, embed);
            }

            // Server deaf
            if (!oldState.serverDeaf && newState.serverDeaf) {
                const embed = new EmbedBuilder()
                    .setColor('#FF4500')
                    .setTitle('🔇 Sunucu Tarafından Sağırlaştırıldı')
                    .addFields(
                        { name: 'Kullanıcı', value: `${member.user.tag}`, inline: true },
                        { name: 'Kanal', value: `<#${newState.channelId}>`, inline: true }
                    )
                    .setTimestamp();
                await sendLog(guild, embed);
            } else if (oldState.serverDeaf && !newState.serverDeaf) {
                const embed = new EmbedBuilder()
                    .setColor('#32CD32')
                    .setTitle('🔊 Sunucu Sağırlaştırması Kaldırıldı')
                    .addFields(
                        { name: 'Kullanıcı', value: `${member.user.tag}`, inline: true },
                        { name: 'Kanal', value: `<#${newState.channelId}>`, inline: true }
                    )
                    .setTimestamp();
                await sendLog(guild, embed);
            }
        }
    });
}
