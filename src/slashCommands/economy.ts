import { ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { getBalance, addCoins, removeCoins } from '../systems/economy';

export async function handleSlashWallet(interaction: ChatInputCommandInteraction): Promise<void> {
    const target = interaction.options.getUser('kullanıcı') || interaction.user;
    const balance = getBalance(target.id);

    const embed = new EmbedBuilder()
        .setColor('#FFD700')
        .setTitle(`💳 ${target.username} Cüzdanı`)
        .addFields(
            { name: '💰 Nakit', value: `**${balance.wallet.toLocaleString()}** Coin`, inline: true },
            { name: '🏦 Banka', value: `**${balance.bank.toLocaleString()}** Coin`, inline: true }
        )
        .setThumbnail(target.displayAvatarURL())
        .setTimestamp();

    await interaction.reply({ embeds: [embed] });
}

export async function handleSlashDaily(interaction: ChatInputCommandInteraction): Promise<void> {
    const balance = getBalance(interaction.user.id);
    const now = Date.now();
    const cooldown = 24 * 60 * 60 * 1000; // 24 saat

    if (now - balance.lastDaily < cooldown) {
        const remaining = cooldown - (now - balance.lastDaily);
        const hours = Math.floor(remaining / (1000 * 60 * 60));
        const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
        
        await interaction.reply({ 
            content: `❌ Günlük ödülünü zaten aldın! Tekrar almak için **${hours} saat ${minutes} dakika** beklemelisin.`, 
            ephemeral: true 
        });
        return;
    }

    const reward = Math.floor(Math.random() * 500) + 500; // 500-1000 arası
    balance.lastDaily = now;
    addCoins(interaction.user.id, reward, 'wallet'); // saveEconomy içinden çağrılır
    
    await interaction.reply({ 
        content: `🎁 Günlük ödülünü aldın: **+${reward} Coin**! Yarın tekrar gel.` 
    });
}

export async function handleSlashCoinflip(interaction: ChatInputCommandInteraction): Promise<void> {
    const bet = interaction.options.getInteger('bahis', true);
    const side = interaction.options.getString('taraf', true);

    const balance = getBalance(interaction.user.id);

    if (bet > balance.wallet) {
        await interaction.reply({ content: '❌ Cüzdanınızda yeterli coin yok!', ephemeral: true });
        return;
    }

    const result = Math.random() < 0.5 ? 'yazi' : 'tura';
    const isWin = result === side;

    if (isWin) {
        addCoins(interaction.user.id, bet, 'wallet');
        await interaction.reply({ content: `🪙 Para havada döndü ve **${result === 'yazi' ? 'Yazı' : 'Tura'}** geldi! 🎉 **+${bet} Coin** kazandın!` });
    } else {
        removeCoins(interaction.user.id, bet, 'wallet');
        await interaction.reply({ content: `🪙 Para havada döndü ve **${result === 'yazi' ? 'Yazı' : 'Tura'}** geldi. 😢 Maalesef **-${bet} Coin** kaybettin.` });
    }
}
