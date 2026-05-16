import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ChatInputCommandInteraction, EmbedBuilder, PermissionsBitField, ButtonInteraction } from 'discord.js';
import { getBalance, removeCoins } from '../systems/economy';

// Basit Market Ürünleri (Örnek)
const MARKET_ITEMS = [
    { id: 'vip', name: '👑 VIP Rolü', price: 50000, description: 'Sunucuda VIP Rolü alırsınız.' },
    { id: 'custom_name', name: '🏷️ İsim Değiştirme', price: 10000, description: 'Sunucudaki isminizi özelleştirmenizi sağlar.' }
];

export async function handleSlashMarket(interaction: ChatInputCommandInteraction): Promise<void> {
    const embed = new EmbedBuilder()
        .setColor('#FFA500')
        .setTitle('🛒 Sunucu Marketi')
        .setDescription('Oyun paralarınızla aşağıdaki ürünleri satın alabilirsiniz.')
        .setTimestamp();

    const row = new ActionRowBuilder<ButtonBuilder>();

    MARKET_ITEMS.forEach(item => {
        embed.addFields({ name: `${item.name} - 💰 ${item.price.toLocaleString()} Coin`, value: item.description });
        row.addComponents(
            new ButtonBuilder()
                .setCustomId(`market_buy_${item.id}`)
                .setLabel('Satın Al')
                .setStyle(ButtonStyle.Success)
        );
    });

    await interaction.reply({ embeds: [embed], components: [row] });
}

export async function handleMarketButton(interaction: ButtonInteraction): Promise<void> {
    const itemId = interaction.customId.replace('market_buy_', '');
    const item = MARKET_ITEMS.find(i => i.id === itemId);

    if (!item) {
        await interaction.reply({ content: '❌ Ürün bulunamadı.', ephemeral: true });
        return;
    }

    const balance = getBalance(interaction.user.id);
    if (balance.wallet < item.price) {
        await interaction.reply({ content: `❌ Bu ürün için **${item.price.toLocaleString()} Coin** gerekiyor. Senin cüzdanında **${balance.wallet.toLocaleString()} Coin** var.`, ephemeral: true });
        return;
    }

    await interaction.deferReply({ ephemeral: true });

    // Satın alma işlemi
    const success = removeCoins(interaction.user.id, item.price, 'wallet');
    if (success) {
        // İlgili rolü verme vs işlemleri buraya eklenebilir. (Gerçek projede Role ID vb tanımlanıp verilir)
        await interaction.editReply({ content: `✅ Başarıyla **${item.name}** satın aldınız! Gerekli işlemler yetkililere iletildi (Demo).` });
    } else {
        await interaction.editReply({ content: '❌ Satın alma işlemi sırasında bir hata oluştu.' });
    }
}
