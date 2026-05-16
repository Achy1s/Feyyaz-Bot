import fs from 'fs';
import path from 'path';

export interface EconomyData {
    wallet: number;
    bank: number;
    lastDaily: number;
}

const dbFolder = path.join(process.cwd(), 'data');
const dbFile = path.join(dbFolder, 'economy.json');

// Memory Cache
export const economyCache: Record<string, EconomyData> = {};

// Load JSON
export function loadEconomy(): void {
    if (!fs.existsSync(dbFolder)) {
        fs.mkdirSync(dbFolder);
    }
    if (fs.existsSync(dbFile)) {
        try {
            const data = fs.readFileSync(dbFile, 'utf8');
            const parsed = JSON.parse(data);
            Object.assign(economyCache, parsed);
        } catch (error) {
            console.error('Economy verileri yüklenirken hata oluştu:', error);
        }
    }
}

// Save JSON
export function saveEconomy(): void {
    try {
        fs.writeFileSync(dbFile, JSON.stringify(economyCache, null, 4));
    } catch (error) {
        console.error('Economy verileri kaydedilirken hata:', error);
    }
}

// Ensure User
export function ensureUserEco(userId: string): EconomyData {
    if (!economyCache[userId]) {
        economyCache[userId] = { wallet: 0, bank: 0, lastDaily: 0 };
    }
    return economyCache[userId];
}

// Add Coins
export function addCoins(userId: string, amount: number, type: 'wallet' | 'bank' = 'wallet'): void {
    const user = ensureUserEco(userId);
    user[type] += amount;
    saveEconomy();
}

// Remove Coins
export function removeCoins(userId: string, amount: number, type: 'wallet' | 'bank' = 'wallet'): boolean {
    const user = ensureUserEco(userId);
    if (user[type] < amount) return false;
    user[type] -= amount;
    saveEconomy();
    return true;
}

// Get Balance
export function getBalance(userId: string): EconomyData {
    return ensureUserEco(userId);
}
