import { ChatInputCommandInteraction, EmbedBuilder, TextChannel, PermissionsBitField } from 'discord.js';
import { sendLog } from '../utils/logger';

export async function handleSlashAnnounce(interaction: ChatInputCommandInteraction): Promise<void> {
    if (!interaction.memberPermissions?.has(PermissionsBitField.Flags.ManageMessages)) {
        await interaction.reply({ content: '❌ Bu komutu kullanma yetkin yok.', ephemeral: true });
        return;
    }

    const channel = interaction.options.getChannel('kanal', true) as TextChannel;
    const message = interaction.options.getString('mesaj', true);
    const title = interaction.options.getString('başlık') || '📢 Duyuru';

    const embed = new EmbedBuilder()
        .setColor('#FF6B6B')
        .setTitle(title)
        .setDescription(message)
        .setFooter({ text: `Duyuran: ${interaction.user.tag}` })
        .setTimestamp();

    try {
        await channel.send({ embeds: [embed] });
        await interaction.reply({ content: `✅ Duyuru <#${channel.id}> kanalına gönderildi!`, ephemeral: true });

        // Log
        if (interaction.guild) {
            const logEmbed = new EmbedBuilder()
                .setColor('#FF6B6B')
                .setTitle('📢 Duyuru Gönderildi')
                .addFields(
                    { name: 'Kanal', value: `<#${channel.id}>`, inline: true },
                    { name: 'Gönderen', value: `${interaction.user.tag}`, inline: true },
                    { name: 'Mesaj', value: message.slice(0, 1024), inline: false }
                )
                .setTimestamp();
            await sendLog(interaction.guild, logEmbed);
        }
    } catch {
        await interaction.reply({ content: '❌ Duyuru gönderilemedi.', ephemeral: true });
    }
}
