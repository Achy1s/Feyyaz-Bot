import { ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { getLeaderboard } from '../systems/leveling';

export async function handleSlashLeaderboard(interaction: ChatInputCommandInteraction): Promise<void> {
    const leaderboard = getLeaderboard(interaction.guildId!, 10);

    if (leaderboard.length === 0) {
        await interaction.reply('📊 Henüz sıralamada kimse yok!');
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
        .setFooter({ text: `${interaction.guild!.name} • Top 10` })
        .setTimestamp();

    await interaction.reply({ embeds: [embed] });
}
