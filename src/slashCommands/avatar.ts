import { ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';

export async function handleSlashAvatar(interaction: ChatInputCommandInteraction): Promise<void> {
    const target = interaction.options.getUser('kullanıcı') || interaction.user;

    const embed = new EmbedBuilder()
        .setColor('#7B68EE')
        .setTitle(`🖼️ ${target.username} - Avatar`)
        .setImage(target.displayAvatarURL({ size: 4096 }))
        .addFields(
            { name: '🔗 Linkler', value: `[PNG](${target.displayAvatarURL({ extension: 'png', size: 4096 })}) • [JPG](${target.displayAvatarURL({ extension: 'jpg', size: 4096 })}) • [WEBP](${target.displayAvatarURL({ extension: 'webp', size: 4096 })})`, inline: false }
        )
        .setTimestamp();

    await interaction.reply({ embeds: [embed] });
}
