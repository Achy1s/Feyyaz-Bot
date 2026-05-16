import { ChatInputCommandInteraction, PermissionsBitField, GuildMember } from 'discord.js';

export async function handleSlashTimeout(interaction: ChatInputCommandInteraction): Promise<void> {
    if (!interaction.memberPermissions?.has(PermissionsBitField.Flags.ModerateMembers)) {
        await interaction.reply({ content: '❌ Bu komutu kullanma yetkin yok.', ephemeral: true });
        return;
    }

    const target = interaction.options.getMember('kullanıcı') as GuildMember;
    const minutes = interaction.options.getInteger('dakika', true);
    const reason = interaction.options.getString('sebep') || 'Sebep belirtilmedi.';

    if (!target) {
        await interaction.reply({ content: '❌ Kullanıcı bulunamadı.', ephemeral: true });
        return;
    }

    if (!target.moderatable) {
        await interaction.reply({ content: '❌ Bu kullanıcıya zamanaşımı uygulayamam.', ephemeral: true });
        return;
    }

    const ms = minutes * 60 * 1000;
    await target.timeout(ms, reason);
    await interaction.reply(`🤐 **${target.user.tag}** adlı kullanıcıya ${minutes} dakika zamanaşımı uygulandı.`);
}
