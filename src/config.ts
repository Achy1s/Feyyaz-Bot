import { ColorResolvable } from 'discord.js';

export const CONFIG = {
    // Kanal ID'leri
    WELCOME_CHANNEL_ID: '1484475628454412308',
    RULES_CHANNEL_ID: '1483949683482296483',
    GENERAL_CHANNEL_ID: '1483949683482296486',
    LOG_CHANNEL_ID: '1484568952146497697',

    // Auto-Role: Yeni üyelere otomatik verilecek rol
    AUTO_ROLE_ID: '1484476711004405821',

    // Ticket (Destek)
    TICKET_CATEGORY_ID: 'BURAYA_KATEGORI_ID',
    TICKET_MOD_ROLE_ID: 'BURAYA_YETKILI_ROL_ID',

    // Security & Anti-Raid
    ALT_ACCOUNT_DAYS: 3,
    BANNED_WORDS: ['kötüsöz1', 'reklamlinki.com', 'discord.gg/'],

    // Bot ayarları
    PREFIX: '!',
    EMBED_COLOR: '#1a4d2e' as ColorResolvable,

    // Slash Commands kayıt için
    CLIENT_ID: '1484555537621319703',
    GUILD_ID: '1483949682551029862',

    // Leveling
    LEVEL_MESSAGES_PER_LEVEL: 15,
    LEVEL_COOLDOWN_MS: 60_000, // 60 saniye spam koruması
};
