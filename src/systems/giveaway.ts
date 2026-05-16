import * as fs from 'fs';
import * as path from 'path';
import {
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    TextChannel,
    ChatInputCommandInteraction,
    ButtonInteraction,
    Client
} from 'discord.js';
import { CONFIG } from '../config';

interface Giveaway {
    messageId: string;
    channelId: string;
    guildId: string;
    prize: string;
    winnersCount: number;
    endsAt: number;
    hostId: string;
    participants: string[];
    ended: boolean;
}

interface GiveawayData {
    [messageId: string]: Giveaway;
}

const DATA_PATH = path.join(__dirname, '..', '..', 'data', 'giveaways.json');

function ensureDataDir(): void {
    const dir = path.dirname(DATA_PATH);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
}

function loadData(): GiveawayData {
    ensureDataDir();
    if (!fs.existsSync(DATA_PATH)) return {};
    try {
        return JSON.parse(fs.readFileSync(DATA_PATH, 'utf-8'));
    } catch {
        return {};
    }
}

function saveData(data: GiveawayData): void {
    ensureDataDir();
    fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2));
}

// ─── Çekiliş oluşturma ───
export async function createGiveaway(interaction: ChatInputCommandInteraction): Promise<void> {
    const prize = interaction.options.getString('ödül', true);
    const durationMinutes = interaction.options.getInteger('süre', true);
    const winnersCount = interaction.options.getInteger('kazanan', true);

    const endsAt = Date.now() + durationMinutes * 60 * 1000;
    const endTimestamp = Math.floor(endsAt / 1000);

    const embed = new EmbedBuilder()
        .setColor('#FF1493')
        .setTitle('🎉 ÇEKİLİŞ BAŞLADI!')
        .setDescription(
            `**Ödül:** ${prize}\n\n` +
            `⏰ **Bitiş:** <t:${endTimestamp}:R>\n` +
            `👥 **Kazanan Sayısı:** ${winnersCount}\n` +
            `🎫 **Katılımcı:** 0 kişi\n\n` +
            `Katılmak için aşağıdaki **🎉 Katıl** butonuna tıkla!`
        )
        .setFooter({ text: `Düzenleyen: ${interaction.user.tag}` })
        .setTimestamp(new Date(endsAt));

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
            .setCustomId('giveaway_join')
            .setLabel('🎉 Katıl')
            .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
            .setCustomId('giveaway_leave')
            .setLabel('❌ Ayrıl')
            .setStyle(ButtonStyle.Danger),
        new ButtonBuilder()
            .setCustomId('giveaway_participants')
            .setLabel('👥 Katılımcılar')
            .setStyle(ButtonStyle.Secondary)
    );

    await interaction.reply({ content: '🎉 Çekiliş oluşturuluyor...', ephemeral: true });

    const channel = interaction.channel as TextChannel;
    const msg = await channel.send({ embeds: [embed], components: [row] });

    const giveaway: Giveaway = {
        messageId: msg.id,
        channelId: channel.id,
        guildId: interaction.guildId!,
        prize,
        winnersCount,
        endsAt,
        hostId: interaction.user.id,
        participants: [],
        ended: false
    };

    const data = loadData();
    data[msg.id] = giveaway;
    saveData(data);

    // Zamanlayıcı kur
    setTimeout(() => endGiveaway(msg.id, interaction.client), durationMinutes * 60 * 1000);
}

// ─── Buton etkileşimleri ───
export async function handleGiveawayButton(interaction: ButtonInteraction): Promise<void> {
    const data = loadData();
    const giveaway = data[interaction.message.id];

    if (!giveaway || giveaway.ended) {
        await interaction.reply({ content: '❌ Bu çekiliş sona ermiş.', ephemeral: true });
        return;
    }

    const userId = interaction.user.id;

    if (interaction.customId === 'giveaway_join') {
        if (giveaway.participants.includes(userId)) {
            await interaction.reply({ content: '⚠️ Zaten katıldın!', ephemeral: true });
            return;
        }
        giveaway.participants.push(userId);
        saveData(data);
        await updateGiveawayEmbed(interaction, giveaway);
        await interaction.reply({ content: '✅ Çekilişe katıldın! Bol şans! 🍀', ephemeral: true });

    } else if (interaction.customId === 'giveaway_leave') {
        const index = giveaway.participants.indexOf(userId);
        if (index === -1) {
            await interaction.reply({ content: '⚠️ Zaten katılmamışsın.', ephemeral: true });
            return;
        }
        giveaway.participants.splice(index, 1);
        saveData(data);
        await updateGiveawayEmbed(interaction, giveaway);
        await interaction.reply({ content: '👋 Çekilişten ayrıldın.', ephemeral: true });

    } else if (interaction.customId === 'giveaway_participants') {
        const list = giveaway.participants.length > 0
            ? giveaway.participants.map((id, i) => `${i + 1}. <@${id}>`).join('\n')
            : 'Henüz kimse katılmadı.';

        const embed = new EmbedBuilder()
            .setColor('#FF1493')
            .setTitle('👥 Katılımcı Listesi')
            .setDescription(list.slice(0, 4000))
            .setFooter({ text: `Toplam: ${giveaway.participants.length} katılımcı` });

        await interaction.reply({ embeds: [embed], ephemeral: true });
    }
}

// ─── Embed güncelleme ───
async function updateGiveawayEmbed(interaction: ButtonInteraction, giveaway: Giveaway): Promise<void> {
    const endTimestamp = Math.floor(giveaway.endsAt / 1000);
    const embed = new EmbedBuilder()
        .setColor('#FF1493')
        .setTitle('🎉 ÇEKİLİŞ BAŞLADI!')
        .setDescription(
            `**Ödül:** ${giveaway.prize}\n\n` +
            `⏰ **Bitiş:** <t:${endTimestamp}:R>\n` +
            `👥 **Kazanan Sayısı:** ${giveaway.winnersCount}\n` +
            `🎫 **Katılımcı:** ${giveaway.participants.length} kişi\n\n` +
            `Katılmak için aşağıdaki **🎉 Katıl** butonuna tıkla!`
        )
        .setFooter({ text: `Düzenleyen: ${interaction.guild?.members.cache.get(giveaway.hostId)?.user.tag || 'Bilinmeyen'}` })
        .setTimestamp(new Date(giveaway.endsAt));

    try {
        await interaction.message.edit({ embeds: [embed] });
    } catch (err) {
        console.error('Giveaway embed güncellenemedi:', err);
    }
}

// ─── Çekilişi bitirme ───
async function endGiveaway(messageId: string, client: Client): Promise<void> {
    const data = loadData();
    const giveaway = data[messageId];
    if (!giveaway || giveaway.ended) return;

    giveaway.ended = true;
    saveData(data);

    try {
        const guild = client.guilds.cache.get(giveaway.guildId);
        if (!guild) return;
        const channel = guild.channels.cache.get(giveaway.channelId) as TextChannel;
        if (!channel) return;
        const message = await channel.messages.fetch(messageId).catch(() => null);

        let winnersText: string;
        if (giveaway.participants.length === 0) {
            winnersText = 'Yeterli katılımcı yok! Kazanan belirlenemedi.';
        } else {
            // Rastgele kazanan seçme (Fisher-Yates shuffle)
            const shuffled = [...giveaway.participants];
            for (let i = shuffled.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
            }
            const winners = shuffled.slice(0, Math.min(giveaway.winnersCount, shuffled.length));
            winnersText = winners.map((id, i) => `🏆 ${i + 1}. <@${id}>`).join('\n');

            // Kazananları kanala bildir
            await channel.send({
                content: `🎉 **ÇEKİLİŞ BİTTİ!**\n\n**Ödül:** ${giveaway.prize}\n**Kazanan${winners.length > 1 ? 'lar' : ''}:**\n${winnersText}\n\nTebrikler! 🥳`,
            });
        }

        // Orijinal mesajı güncelle
        if (message) {
            const endedEmbed = new EmbedBuilder()
                .setColor('#808080')
                .setTitle('🎉 ÇEKİLİŞ SONA ERDİ')
                .setDescription(
                    `**Ödül:** ${giveaway.prize}\n\n` +
                    `👥 **Toplam Katılımcı:** ${giveaway.participants.length}\n` +
                    `**Kazanan${giveaway.participants.length > 1 ? 'lar' : ''}:**\n${winnersText}`
                )
                .setTimestamp();

            const disabledRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
                new ButtonBuilder()
                    .setCustomId('giveaway_join_ended')
                    .setLabel('🎉 Çekiliş Bitti')
                    .setStyle(ButtonStyle.Secondary)
                    .setDisabled(true)
            );

            await message.edit({ embeds: [endedEmbed], components: [disabledRow] });
        }
    } catch (err) {
        console.error('Çekiliş bitirme hatası:', err);
    }
}

// ─── Bot yeniden başladığında aktif çekilişleri yeniden zamanla ───
export function restoreGiveaways(client: Client): void {
    const data = loadData();
    const now = Date.now();

    for (const [messageId, giveaway] of Object.entries(data)) {
        if (giveaway.ended) continue;

        const remaining = giveaway.endsAt - now;
        if (remaining <= 0) {
            // Süre geçmiş, hemen bitir
            endGiveaway(messageId, client);
        } else {
            setTimeout(() => endGiveaway(messageId, client), remaining);
        }
    }
}
