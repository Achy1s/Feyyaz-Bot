import * as fs from 'fs';
import * as path from 'path';
import { EmbedBuilder, Message, TextChannel } from 'discord.js';
import { CONFIG } from '../config';

interface UserLevel {
    xp: number;
    level: number;
    totalMessages: number;
    lastMessageTime: number;
}

interface LevelData {
    [guildId: string]: {
        [userId: string]: UserLevel;
    };
}

const DATA_PATH = path.join(__dirname, '..', '..', 'data', 'levels.json');

function ensureDataDir(): void {
    const dir = path.dirname(DATA_PATH);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
}

function loadData(): LevelData {
    ensureDataDir();
    if (!fs.existsSync(DATA_PATH)) return {};
    try {
        return JSON.parse(fs.readFileSync(DATA_PATH, 'utf-8'));
    } catch {
        return {};
    }
}

function saveData(data: LevelData): void {
    ensureDataDir();
    fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2));
}

// ─── XP Progress Bar ───
function createProgressBar(current: number, max: number, length: number = 12): string {
    const filled = Math.round((current / max) * length);
    const empty = length - filled;
    return '█'.repeat(filled) + '░'.repeat(empty);
}

// ─── Mesaj geldiğinde XP kazandırma ───
export async function handleLevelMessage(message: Message): Promise<void> {
    if (message.author.bot || !message.guild) return;

    const data = loadData();
    const guildId = message.guild.id;
    const userId = message.author.id;

    if (!data[guildId]) data[guildId] = {};
    if (!data[guildId][userId]) {
        data[guildId][userId] = { xp: 0, level: 0, totalMessages: 0, lastMessageTime: 0 };
    }

    const user = data[guildId][userId];
    const now = Date.now();

    // Spam koruması
    if (now - user.lastMessageTime < CONFIG.LEVEL_COOLDOWN_MS) return;

    user.lastMessageTime = now;
    user.xp += 1;
    user.totalMessages += 1;

    const requiredXp = CONFIG.LEVEL_MESSAGES_PER_LEVEL;

    // Level atlama kontrolü
    if (user.xp >= requiredXp) {
        user.level += 1;
        user.xp = 0;

        const levelUpEmbed = new EmbedBuilder()
            .setColor('#FFD700')
            .setTitle('🎉 Seviye Atladın!')
            .setDescription(`Tebrikler <@${userId}>! **Seviye ${user.level}** oldun!`)
            .setThumbnail(message.author.displayAvatarURL({ size: 128 }))
            .addFields(
                { name: '📊 Seviye', value: `\`${user.level}\``, inline: true },
                { name: '💬 Toplam Mesaj', value: `\`${user.totalMessages}\``, inline: true },
                { name: '📈 İlerleme', value: `${createProgressBar(0, requiredXp)} \`0/${requiredXp}\``, inline: false }
            )
            .setFooter({ text: `Her ${requiredXp} mesajda bir seviye atlarsın!` })
            .setTimestamp();

        try {
            const channel = message.channel as TextChannel;
            await channel.send({ embeds: [levelUpEmbed] });
        } catch (err) {
            console.error('Level up mesajı gönderilemedi:', err);
        }
    }

    saveData(data);
}

// ─── Kullanıcının seviye bilgisini getir ───
export function getUserLevel(guildId: string, userId: string): UserLevel {
    const data = loadData();
    return data[guildId]?.[userId] || { xp: 0, level: 0, totalMessages: 0, lastMessageTime: 0 };
}

// ─── Leaderboard ───
export function getLeaderboard(guildId: string, limit: number = 10): { userId: string; data: UserLevel }[] {
    const data = loadData();
    const guildData = data[guildId] || {};

    return Object.entries(guildData)
        .map(([userId, userData]) => ({ userId, data: userData }))
        .sort((a, b) => {
            if (b.data.level !== a.data.level) return b.data.level - a.data.level;
            return b.data.xp - a.data.xp;
        })
        .slice(0, limit);
}

export { createProgressBar };
