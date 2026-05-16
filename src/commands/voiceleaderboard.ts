import { Message, EmbedBuilder } from 'discord.js';
import { getVoiceLeaderboard, formatDuration } from '../systems/voiceTracking';

export async function handleVoiceLeaderboardCmd(message: Message): Promise<void> {
    const leaderboard = getVoiceLeaderboard(message.guild!.id, 10);

    if (leaderboard.length === 0) {
        await message.reply('🎙️ Henüz ses sıralamasında kimse yok!');
        return;
    }

    const medals = ['🥇', '🥈', '🥉'];
    const list = leaderboard.map((entry, i) => {
        const medal = medals[i] || `**${i + 1}.**`;
        return `${medal} <@${entry.userId}> — \`${formatDuration(entry.stats.totalTime)}\` • \`${entry.stats.sessionCount}\` oturum`;
    }).join('\n');

    const embed = new EmbedBuilder()
        .setColor('#9B59B6')
        .setTitle('🎙️ Ses Kanalı Sıralaması')
        .setDescription(list)
        .setFooter({ text: `${message.guild!.name} • Top 10` })
        .setTimestamp();

    await message.reply({ embeds: [embed] });
}
