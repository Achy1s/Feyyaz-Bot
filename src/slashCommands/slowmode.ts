import { ChatInputCommandInteraction, PermissionsBitField, TextChannel } from 'discord.js';
import { sendLog } from '../utils/logger';
import { EmbedBuilder } from 'discord.js';

export async function handleSlashSlowmode(interaction: ChatInputCommandInteraction): Promise<void> {
    if (!interaction.memberPermissions?.has(PermissionsBitField.Flags.ManageChannels)) {
        await interaction.reply({ content: '❌ Bu komutu kullanma yetkin yok.', ephemeral: true });
        return;
    }

    const seconds = interaction.options.getInteger('süre', true);
    const channel = (interaction.options.getChannel('kanal') || interaction.channel) as TextChannel;

    try {
        await channel.setRateLimitPerUser(seconds);

        if (seconds === 0) {
            await interaction.reply(`✅ <#${channel.id}> kanalında yavaş mod kapatıldı.`);
        } else {
            await interaction.reply(`✅ <#${channel.id}> kanalında yavaş mod \`${seconds}\` saniyeye ayarlandı.`);
        }

        // Log
        if (interaction.guild) {
            const logEmbed = new EmbedBuilder()
                .setColor('#FFA500')
                .setTitle('🐌 Yavaş Mod Değiştirildi')
                .addFields(
                    { name: 'Kanal', value: `<#${channel.id}>`, inline: true },
                    { name: 'Süre', value: seconds === 0 ? 'Kapalı' : `\`${seconds}\` saniye`, inline: true },
                    { name: 'Değiştiren', value: `${interaction.user.tag}`, inline: true }
                )
                .setTimestamp();
            await sendLog(interaction.guild, logEmbed);
        }
    } catch {
        await interaction.reply({ content: '❌ Yavaş mod ayarlanamadı.', ephemeral: true });
    }
}
