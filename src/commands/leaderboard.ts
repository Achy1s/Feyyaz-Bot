import { Message, EmbedBuilder } from 'discord.js';
import { getLeaderboard } from '../systems/leveling';

export async function handleLeaderboard(message: Message): Promise<void> {
    const leaderboard = getLeaderboard(message.guild!.id, 10);

    if (leaderboard.length === 0) {
        await message.reply('📊 Henüz sıralamada kimse yok!');
        return;
    }

    const medals = ['🥇', '🥈', '🥉'];
    const list = leaderboard.map((entry, i) => {
        const medal = medals[i] || `**${i + 1}.**`;
        return `${medal} <@${entry.userId}> — Seviye \`${entry.data.level}\` • \`${entry.data.totalMessages}\` mesaj`;
    }).join('\n');

    const embed = new EmbedBuilder()
        .setColor('#FFD700')
        .setTitle('🏆 Seviye Sıralaması')
        .setDescription(list)
        .setFooter({ text: `${message.guild!.name} • Top 10` })
        .setTimestamp();

    await message.reply({ embeds: [embed] });
}
