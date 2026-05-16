import { REST, Routes, SlashCommandBuilder, ChannelType } from 'discord.js';
import { CONFIG } from '../config';

const commands = [
    // ─── MODERASYON ───
    new SlashCommandBuilder()
        .setName('purge')
        .setDescription('Belirtilen sayıda mesajı siler.')
        .addIntegerOption(opt =>
            opt.setName('miktar').setDescription('Silinecek mesaj sayısı (1-100)').setRequired(true).setMinValue(1).setMaxValue(100)
        ),

    new SlashCommandBuilder()
        .setName('kick')
        .setDescription('Bir üyeyi sunucudan atar.')
        .addUserOption(opt => opt.setName('kullanıcı').setDescription('Atılacak kullanıcı').setRequired(true))
        .addStringOption(opt => opt.setName('sebep').setDescription('Atma sebebi')),

    new SlashCommandBuilder()
        .setName('ban')
        .setDescription('Bir üyeyi sunucudan yasaklar.')
        .addUserOption(opt => opt.setName('kullanıcı').setDescription('Yasaklanacak kullanıcı').setRequired(true))
        .addStringOption(opt => opt.setName('sebep').setDescription('Yasaklama sebebi')),

    new SlashCommandBuilder()
        .setName('timeout')
        .setDescription('Bir üyeye zamanaşımı uygular.')
        .addUserOption(opt => opt.setName('kullanıcı').setDescription('Susturulacak kullanıcı').setRequired(true))
        .addIntegerOption(opt => opt.setName('dakika').setDescription('Zamanaşımı süresi (dakika)').setRequired(true).setMinValue(1))
        .addStringOption(opt => opt.setName('sebep').setDescription('Zamanaşımı sebebi')),

    // ─── ÇEKİLİŞ ───
    new SlashCommandBuilder()
        .setName('giveaway')
        .setDescription('Yeni bir çekiliş başlatır.')
        .addStringOption(opt => opt.setName('ödül').setDescription('Çekiliş ödülü').setRequired(true))
        .addIntegerOption(opt => opt.setName('süre').setDescription('Çekiliş süresi (dakika)').setRequired(true).setMinValue(1))
        .addIntegerOption(opt => opt.setName('kazanan').setDescription('Kazanan sayısı').setRequired(true).setMinValue(1).setMaxValue(20)),

    // ─── LEVELİNG ───
    new SlashCommandBuilder()
        .setName('level')
        .setDescription('Seviyeni veya bir kullanıcının seviyesini gösterir.')
        .addUserOption(opt => opt.setName('kullanıcı').setDescription('Seviyesini görmek istediğin kullanıcı')),

    new SlashCommandBuilder()
        .setName('leaderboard')
        .setDescription('Sunucu seviye sıralamasını gösterir.'),

    // ─── SES İSTATİSTİKLERİ ───
    new SlashCommandBuilder()
        .setName('ses')
        .setDescription('Ses kanalı istatistiklerini gösterir.')
        .addUserOption(opt => opt.setName('kullanıcı').setDescription('İstatistiklerini görmek istediğin kullanıcı')),

    new SlashCommandBuilder()
        .setName('sessıralama')
        .setDescription('Ses kanalı sıralamasını gösterir.'),

    // ─── BİLGİ KOMUTLARI ───
    new SlashCommandBuilder()
        .setName('kullanıcı')
        .setDescription('Bir kullanıcının detaylı bilgilerini gösterir.')
        .addUserOption(opt => opt.setName('kullanıcı').setDescription('Bilgilerini görmek istediğin kullanıcı')),

    new SlashCommandBuilder()
        .setName('sunucu')
        .setDescription('Sunucu hakkında detaylı bilgi gösterir.'),

    new SlashCommandBuilder()
        .setName('avatar')
        .setDescription('Bir kullanıcının avatarını gösterir.')
        .addUserOption(opt => opt.setName('kullanıcı').setDescription('Avatarını görmek istediğin kullanıcı')),

    // ─── ANKET ───
    new SlashCommandBuilder()
        .setName('anket')
        .setDescription('Butonlu anket oluşturur.')
        .addStringOption(opt => opt.setName('soru').setDescription('Anket sorusu').setRequired(true))
        .addStringOption(opt => opt.setName('seçenek1').setDescription('1. seçenek').setRequired(true))
        .addStringOption(opt => opt.setName('seçenek2').setDescription('2. seçenek').setRequired(true))
        .addStringOption(opt => opt.setName('seçenek3').setDescription('3. seçenek'))
        .addStringOption(opt => opt.setName('seçenek4').setDescription('4. seçenek')),

    // ─── DUYURU ───
    new SlashCommandBuilder()
        .setName('duyuru')
        .setDescription('Belirtilen kanala duyuru gönderir.')
        .addChannelOption(opt => opt.setName('kanal').setDescription('Duyurunun gönderileceği kanal').setRequired(true).addChannelTypes(ChannelType.GuildText))
        .addStringOption(opt => opt.setName('mesaj').setDescription('Duyuru mesajı').setRequired(true))
        .addStringOption(opt => opt.setName('başlık').setDescription('Duyuru başlığı')),

    // ─── SLOWMODE ───
    new SlashCommandBuilder()
        .setName('slowmode')
        .setDescription('Kanal yavaş modunu ayarlar.')
        .addIntegerOption(opt => opt.setName('süre').setDescription('Yavaş mod süresi (saniye, 0=kapalı)').setRequired(true).setMinValue(0).setMaxValue(21600))
        .addChannelOption(opt => opt.setName('kanal').setDescription('Hedef kanal').addChannelTypes(ChannelType.GuildText)),

    // ─── V3 YENİ KOMUTLAR ───
    new SlashCommandBuilder().setName('ticket-kur').setDescription('Destek talebi (ticket) panelini kurar. (Sadece Yöneticiler)'),

    new SlashCommandBuilder().setName('cüzdan').setDescription('Kendi cüzdanınızı veya başkasının cüzdanını gösterir.')
        .addUserOption(opt => opt.setName('kullanıcı').setDescription('Cüzdanını görmek istediğin kullanıcı')),

    new SlashCommandBuilder().setName('günlük').setDescription('Günlük ödülünüzü alırsınız.'),

    new SlashCommandBuilder().setName('yazıtura').setDescription('Coinflip oynarsınız.')
        .addIntegerOption(opt => opt.setName('bahis').setDescription('Bahis miktarı').setRequired(true).setMinValue(1))
        .addStringOption(opt => opt.setName('taraf').setDescription('Yazı mı Tura mı?').setRequired(true)
            .addChoices({ name: 'Yazı', value: 'yazi' }, { name: 'Tura', value: 'tura' })),

    new SlashCommandBuilder().setName('market').setDescription('Sunucu marketini (Rol mağazası) açar.'),

    new SlashCommandBuilder().setName('rol-panel-kur').setDescription('Rol seçim panelini kurar. (Sadece Yöneticiler)'),

].map(cmd => cmd.toJSON());
export async function registerSlashCommands(): Promise<void> {
    const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN!);

    try {
        console.log('📡 Slash komutları kaydediliyor (Global)...');
        await rest.put(
            Routes.applicationCommands(CONFIG.CLIENT_ID),
            { body: commands }
        );
        console.log(`✅ ${commands.length} slash komut başarıyla kaydedildi!`);
    } catch (error) {
        console.error('❌ Slash komutları kaydedilemedi:', error);
    }
}
