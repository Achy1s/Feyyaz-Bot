import { Message, EmbedBuilder } from 'discord.js';
import { getVoiceStats, formatDuration, createVoiceProgressBar } from '../systems/voiceTracking';

export async function handleVoiceStatsCmd(message: Message, args: string[]): Promise<void> {
    const target = message.mentions.users.first() || message.author;
    const stats = getVoiceStats(message.guild!.id, target.id);

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

    await message.reply({ embeds: [embed] });
}
