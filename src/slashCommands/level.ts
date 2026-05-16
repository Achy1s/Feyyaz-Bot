import { ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { getUserLevel, createProgressBar } from '../systems/leveling';
import { CONFIG } from '../config';

export async function handleSlashLevel(interaction: ChatInputCommandInteraction): Promise<void> {
    const target = interaction.options.getUser('kullanıcı') || interaction.user;
    const data = getUserLevel(interaction.guildId!, target.id);

    const requiredXp = CONFIG.LEVEL_MESSAGES_PER_LEVEL;
    const progressBar = createProgressBar(data.xp, requiredXp);

    const embed = new EmbedBuilder()
        .setColor('#7B68EE')
        .setTitle(`📊 ${target.username} - Seviye Bilgisi`)
        .setThumbnail(target.displayAvatarURL({ size: 128 }))
        .addFields(
            { name: '🏅 Seviye', value: `\`${data.level}\``, inline: true },
            { name: '💬 Toplam Mesaj', value: `\`${data.totalMessages}\``, inline: true },
            { name: '📈 İlerleme', value: `${progressBar} \`${data.xp}/${requiredXp}\``, inline: false }
        )
        .setFooter({ text: `Her ${requiredXp} mesajda bir seviye atlarsın!` })
        .setTimestamp();

    await interaction.reply({ embeds: [embed] });
}
