import { Message, EmbedBuilder } from 'discord.js';

export async function handleAvatar(message: Message, args: string[]): Promise<void> {
    const target = message.mentions.users.first() || message.author;

    const embed = new EmbedBuilder()
        .setColor('#7B68EE')
        .setTitle(`🖼️ ${target.username} - Avatar`)
        .setImage(target.displayAvatarURL({ size: 4096 }))
        .addFields(
            { name: '🔗 Linkler', value: `[PNG](${target.displayAvatarURL({ extension: 'png', size: 4096 })}) • [JPG](${target.displayAvatarURL({ extension: 'jpg', size: 4096 })}) • [WEBP](${target.displayAvatarURL({ extension: 'webp', size: 4096 })})`, inline: false }
        )
        .setFooter({ text: `İsteyen: ${message.author.tag}` })
        .setTimestamp();

    await message.reply({ embeds: [embed] });
}
