import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ButtonInteraction,
    EmbedBuilder,
    PermissionsBitField,
    TextChannel,
    ChatInputCommandInteraction
} from 'discord.js';

// Sabit Rol Tanımlamaları: config'e alınabilir ama örnek kullanım için burada tutuldu
const BUTTON_ROLES = [
    { id: '111111111111111111', label: '🎮 Oyuncu', style: ButtonStyle.Primary, emoji: '🎮' },
    { id: '222222222222222222', label: '📢 Bildirim', style: ButtonStyle.Success, emoji: '📢' },
    { id: '333333333333333333', label: '🎉 Çekiliş', style: ButtonStyle.Danger, emoji: '🎉' },
];

export async function createRolePanel(interaction: ChatInputCommandInteraction): Promise<void> {
    if (!interaction.memberPermissions?.has(PermissionsBitField.Flags.Administrator)) {
        await interaction.reply({ content: '❌ Bu komutu sadece yöneticiler kullanabilir.', ephemeral: true });
        return;
    }

    const embed = new EmbedBuilder()
        .setColor('#9B59B6')
        .setTitle('🎭 Rol Seçim Paneli')
        .setDescription('Aşağıdaki butonlara tıklayarak istediğiniz rolleri alabilir veya çıkarabilirsiniz.\n\nEğer rol sizde varsa butona tıklayınca **silinir**, yoksa **eklenir**.')
        .setTimestamp();

    const row = new ActionRowBuilder<ButtonBuilder>();

    BUTTON_ROLES.forEach(roleData => {
        row.addComponents(
            new ButtonBuilder()
                .setCustomId(`role_assign_${roleData.id}`)
                .setLabel(roleData.label)
                .setEmoji(roleData.emoji)
                .setStyle(roleData.style)
        );
    });

    const targetChannel = interaction.channel as TextChannel;
    await targetChannel.send({ embeds: [embed], components: [row] });
    await interaction.reply({ content: '✅ Rol paneli başarıyla kuruldu!', ephemeral: true });
}

export async function handleRoleButton(interaction: ButtonInteraction): Promise<void> {
    const roleId = interaction.customId.replace('role_assign_', '');
    const member = interaction.guild?.members.cache.get(interaction.user.id);

    if (!member) {
        await interaction.reply({ content: '❌ Üye bilgisi bulunamadı.', ephemeral: true });
        return;
    }

    const role = interaction.guild?.roles.cache.get(roleId);

    // Uyarı: ID'yi bilerek sahte girdik, hata fırlatabilir, yakalayalım
    if (!role) {
        // Test amaçlı fake ID'ler olduğu için hata vermeden çıkalım ki bot çökmesin
        await interaction.reply({ content: '❌ Sunucuda bu rol bulunamadı (Bot sahibinin geçerli ID girmesi gerek).', ephemeral: true });
        return;
    }

    try {
        if (member.roles.cache.has(roleId)) {
            await member.roles.remove(roleId);
            await interaction.reply({ content: `✅ <@&${roleId}> rolü üzerinizden alındı.`, ephemeral: true });
        } else {
            await member.roles.add(roleId);
            await interaction.reply({ content: `✅ <@&${roleId}> rolü size verildi.`, ephemeral: true });
        }
    } catch (error) {
        console.error('Rol verme hatası:', error);
        await interaction.reply({ content: '❌ Rol verilirken/alınırken yetki yetersiz hatası oluştu. Lütfen botun rolünün yeterince yukarıda olduğundan emin olun.', ephemeral: true });
    }
}
