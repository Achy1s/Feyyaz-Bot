import { ChatInputCommandInteraction, PermissionsBitField, GuildMember } from 'discord.js';

export async function handleSlashKick(interaction: ChatInputCommandInteraction): Promise<void> {
    if (!interaction.memberPermissions?.has(PermissionsBitField.Flags.KickMembers)) {
        await interaction.reply({ content: '❌ Bu komutu kullanma yetkin yok.', ephemeral: true });
        return;
    }

    const target = interaction.options.getMember('kullanıcı') as GuildMember;
    const reason = interaction.options.getString('sebep') || 'Sebep belirtilmedi.';

    if (!target) {
        await interaction.reply({ content: '❌ Kullanıcı bulunamadı.', ephemeral: true });
        return;
    }

    if (!target.kickable) {
        await interaction.reply({ content: '❌ Bu kullanıcıyı atma yetkim yok.', ephemeral: true });
        return;
    }

    await target.kick(reason);
    await interaction.reply(`🔨 **${target.user.tag}** sunucudan atıldı. Sebep: ${reason}`);
}
