import { ChatInputCommandInteraction, PermissionsBitField, GuildMember } from 'discord.js';

export async function handleSlashBan(interaction: ChatInputCommandInteraction): Promise<void> {
    if (!interaction.memberPermissions?.has(PermissionsBitField.Flags.BanMembers)) {
        await interaction.reply({ content: '❌ Bu komutu kullanma yetkin yok.', ephemeral: true });
        return;
    }

    const target = interaction.options.getMember('kullanıcı') as GuildMember;
    const reason = interaction.options.getString('sebep') || 'Sebep belirtilmedi.';

    if (!target) {
        await interaction.reply({ content: '❌ Kullanıcı bulunamadı.', ephemeral: true });
        return;
    }

    if (!target.bannable) {
        await interaction.reply({ content: '❌ Bu kullanıcıyı yasaklama yetkim yok.', ephemeral: true });
        return;
    }

    await target.ban({ reason });
    await interaction.reply(`⛔ **${target.user.tag}** sunucudan yasaklandı. Sebep: ${reason}`);
}
