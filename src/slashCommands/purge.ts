import { ChatInputCommandInteraction, PermissionsBitField, TextChannel } from 'discord.js';

export async function handleSlashPurge(interaction: ChatInputCommandInteraction): Promise<void> {
    if (!interaction.memberPermissions?.has(PermissionsBitField.Flags.ManageMessages)) {
        await interaction.reply({ content: '❌ Bu komutu kullanma yetkin yok.', ephemeral: true });
        return;
    }

    const amount = interaction.options.getInteger('miktar', true);
    const channel = interaction.channel as TextChannel;

    const deleted = await channel.bulkDelete(amount, true).catch(err => {
        console.error(err);
        return null;
    });

    if (deleted) {
        await interaction.reply({ content: `🧹 ${deleted.size} mesaj silindi.`, ephemeral: true });
    } else {
        await interaction.reply({ content: '❌ 14 günden eski mesajları topluca silemem.', ephemeral: true });
    }
}
