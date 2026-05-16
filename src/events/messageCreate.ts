import { Client, Events, EmbedBuilder } from 'discord.js';
import { CONFIG } from '../config';
import { handlePurge } from '../commands/purge';
import { handleKick } from '../commands/kick';
import { handleBan } from '../commands/ban';
import { handleTimeout } from '../commands/timeout';
import { handleLevel } from '../commands/level';
import { handleLeaderboard } from '../commands/leaderboard';
import { handleVoiceStatsCmd } from '../commands/voicestats';
import { handleVoiceLeaderboardCmd } from '../commands/voiceleaderboard';
import { handleUserInfo } from '../commands/userinfo';
import { handleServerInfo } from '../commands/serverinfo';
import { handleAvatar } from '../commands/avatar';
import { handleLevelMessage } from '../systems/leveling';
import { sendLog } from '../utils/logger';

export function registerMessageCreateEvent(client: Client): void {
    client.on(Events.MessageCreate, async (message) => {
        if (message.author.bot || !message.guild) return;

        // ─── YASAKLI KELİME FİLTRESİ ───
        if (CONFIG.BANNED_WORDS && CONFIG.BANNED_WORDS.length > 0) {
            const contentLower = message.content.toLowerCase();
            const containsBanned = CONFIG.BANNED_WORDS.some(word => contentLower.includes(word.toLowerCase()));
            
            if (containsBanned && !message.member?.permissions.has('ManageMessages')) {
                await message.delete().catch(() => {});
                await message.channel.send(`<@${message.author.id}>, mesajınızda yasaklı kelime bulunduğu için silinmiştir.`).then(m => {
                    setTimeout(() => m.delete().catch(() => {}), 3000);
                });

                const logEmbed = new EmbedBuilder()
                    .setColor('#FFA500')
                    .setTitle('🚨 Yasaklı Kelime Engellendi')
                    .addFields(
                        { name: 'Kullanıcı', value: `<@${message.author.id}>`, inline: true },
                        { name: 'Kanal', value: `<#${message.channel.id}>`, inline: true },
                        { name: 'Mesaj', value: `\`\`\`${message.content}\`\`\`` }
                    )
                    .setTimestamp();
                await sendLog(message.guild!, logEmbed);
                return; // Mesaj silindiği için diğer işlemlere devam etme
            }
        }

        // ─── LEVELİNG SİSTEMİ ───
        await handleLevelMessage(message);

        // ─── MESAJLA PARA KAZANMA ───
        // Her mesaja 1-3 arası rastgele coin ekle (spam engellemek için basit bekleme eklenebilir, şu an direkt).
        const { addCoins } = await import('../systems/economy');
        addCoins(message.author.id, Math.floor(Math.random() * 3) + 1, 'wallet');

        // ─── PREFIX KOMUTLARI ───
        if (!message.content.startsWith(CONFIG.PREFIX)) return;

        const args = message.content.slice(CONFIG.PREFIX.length).trim().split(/ +/);
        const command = args.shift()?.toLowerCase();

        // ─── KOMUT KULLANIM LOGU ───
        if (command) {
            const logEmbed = new EmbedBuilder()
                .setColor('#5865F2')
                .setTitle('📋 Prefix Komut Kullanıldı')
                .addFields(
                    { name: 'Komut', value: `\`${CONFIG.PREFIX}${command}\``, inline: true },
                    { name: 'Kullanan', value: `${message.author.tag} (<@${message.author.id}>)`, inline: true },
                    { name: 'Kanal', value: `<#${message.channel.id}>`, inline: true }
                )
                .setTimestamp();
            await sendLog(message.guild, logEmbed);
        }

        try {
            switch (command) {
                case 'purge':
                case 'sil':
                    return await handlePurge(message, args);
                case 'kick':
                    return await handleKick(message, args);
                case 'ban':
                    return await handleBan(message, args);
                case 'timeout':
                case 'mute':
                    return await handleTimeout(message, args);
                case 'level':
                case 'seviye':
                    return await handleLevel(message, args);
                case 'leaderboard':
                case 'sıralama':
                    return await handleLeaderboard(message);
                case 'ses':
                    return await handleVoiceStatsCmd(message, args);
                case 'sessıralama':
                case 'sestop':
                    return await handleVoiceLeaderboardCmd(message);
                case 'kullanıcı':
                case 'userinfo':
                    return await handleUserInfo(message, args);
                case 'sunucu':
                case 'serverinfo':
                    return await handleServerInfo(message);
                case 'avatar':
                case 'pp':
                    return await handleAvatar(message, args);
            }
        } catch (error) {
            console.error(`Komut hatası (${command}):`, error);
        }
    });
}
