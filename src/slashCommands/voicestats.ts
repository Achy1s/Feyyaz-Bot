import { ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { getVoiceStats, formatDuration } from '../systems/voiceTracking';

export async function handleSlashVoiceStats(interaction: ChatInputCommandInteraction): Promise<void> {
    const target = interaction.options.getUser('kullanıcı') || interaction.user;
    const stats = getVoiceStats(interaction.guildId!, target.id);

    const embed = new EmbedBuilder()
        .setColor('#9B59B6')
        .setTitle(`🎙️ ${target.username} - Ses İstatistikleri`)
        .setThumbnail(target.displayAvatarURL({ size: 128 }))
        .addFields(
            { name: '⏱️ Toplam Süre', value: `\`${formatDuration(stats.totalTime)}\``, inline: true },
            { name: '📊 Oturum Sayısı', value: `\`${stats.sessionCount}\``, inline: true },
            { name: '🔴 Aktif Oturum', value: stats.currentSession > 0 ? `\`${formatDuration(stats.currentSession)}\` (Şu an VC'de!)` : '`Yok`', inline: true }
        )
        .setFooter({ text: 'Ses kanalında geçirdiğin toplam süre' })
        .setTimestamp();

    await interaction.reply({ embeds: [embed] });
}
