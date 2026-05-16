import * as fs from 'fs';
import * as path from 'path';

interface VoiceUserStats {
    totalTime: number; // milisaniye cinsinden toplam süre
    sessionCount: number;
}

interface VoiceData {
    [guildId: string]: {
        [userId: string]: VoiceUserStats;
    };
}

// Aktif oturumlar (bellekte)
const activeSessions: Map<string, number> = new Map(); // `guildId-userId` → joinTimestamp

const DATA_PATH = path.join(__dirname, '..', '..', 'data', 'voiceStats.json');

function ensureDataDir(): void {
    const dir = path.dirname(DATA_PATH);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
}

function loadData(): VoiceData {
    ensureDataDir();
    if (!fs.existsSync(DATA_PATH)) return {};
    try {
        return JSON.parse(fs.readFileSync(DATA_PATH, 'utf-8'));
    } catch {
        return {};
    }
}

function saveData(data: VoiceData): void {
    ensureDataDir();
    fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2));
}

// ─── Ses kanalına girdiğinde ───
export function handleVoiceJoin(guildId: string, userId: string): void {
    const key = `${guildId}-${userId}`;
    activeSessions.set(key, Date.now());
}

// ─── Ses kanalından çıktığında ───
export function handleVoiceLeave(guildId: string, userId: string): void {
    const key = `${guildId}-${userId}`;
    const joinTime = activeSessions.get(key);
    if (!joinTime) return;

    const duration = Date.now() - joinTime;
    activeSessions.delete(key);

    const data = loadData();
    if (!data[guildId]) data[guildId] = {};
    if (!data[guildId][userId]) {
        data[guildId][userId] = { totalTime: 0, sessionCount: 0 };
    }

    data[guildId][userId].totalTime += duration;
    data[guildId][userId].sessionCount += 1;
    saveData(data);

    // ─── EKONOMİ SİSTEMİ ───
    // Dakika başına 10 coin kazanç
    const minutes = Math.floor(duration / 60000);
    if (minutes >= 1) {
        import('./economy').then(({ addCoins }) => {
            addCoins(userId, minutes * 10, 'wallet');
        }).catch(() => {});
    }
}

// ─── Kullanıcı istatistiklerini getir (aktif oturum dahil) ───
export function getVoiceStats(guildId: string, userId: string): VoiceUserStats & { currentSession: number } {
    const data = loadData();
    const stats = data[guildId]?.[userId] || { totalTime: 0, sessionCount: 0 };

    // Aktif oturum varsa o da ekle
    const key = `${guildId}-${userId}`;
    const joinTime = activeSessions.get(key);
    const currentSession = joinTime ? Date.now() - joinTime : 0;

    return {
        totalTime: stats.totalTime + currentSession,
        sessionCount: stats.sessionCount + (currentSession > 0 ? 1 : 0),
        currentSession
    };
}

// ─── Ses Sıralaması ───
export function getVoiceLeaderboard(guildId: string, limit: number = 10): { userId: string; stats: VoiceUserStats }[] {
    const data = loadData();
    const guildData = data[guildId] || {};

    // Aktif oturumları da hesaba kat
    const combined: Record<string, VoiceUserStats> = {};

    for (const [userId, stats] of Object.entries(guildData)) {
        combined[userId] = { ...stats };
    }

    // Aktif oturumları ekle
    for (const [key, joinTime] of activeSessions.entries()) {
        if (!key.startsWith(guildId)) continue;
        const userId = key.split('-')[1];
        const currentDuration = Date.now() - joinTime;

        if (!combined[userId]) {
            combined[userId] = { totalTime: 0, sessionCount: 0 };
        }
        combined[userId].totalTime += currentDuration;
    }

    return Object.entries(combined)
        .map(([userId, stats]) => ({ userId, stats }))
        .sort((a, b) => b.stats.totalTime - a.stats.totalTime)
        .slice(0, limit);
}

// ─── Süre formatlama ───
export function formatDuration(ms: number): string {
    const totalSeconds = Math.floor(ms / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    const parts: string[] = [];
    if (days > 0) parts.push(`${days}g`);
    if (hours > 0) parts.push(`${hours}s`);
    if (minutes > 0) parts.push(`${minutes}dk`);
    if (seconds > 0 || parts.length === 0) parts.push(`${seconds}sn`);

    return parts.join(' ');
}

// ─── Progress bar ───
export function createVoiceProgressBar(current: number, max: number, length: number = 12): string {
    const ratio = max > 0 ? Math.min(current / max, 1) : 0;
    const filled = Math.round(ratio * length);
    const empty = length - filled;
    return '█'.repeat(filled) + '░'.repeat(empty);
}
