import { Client, Events, EmbedBuilder, TextChannel, AttachmentBuilder } from 'discord.js';
import { CONFIG } from '../config';
import { sendLog } from '../utils/logger';
import { invitesCache } from '../systems/inviteTracker';
import { createCanvas, loadImage, GlobalFonts } from '@napi-rs/canvas';

export function registerGuildMemberAddEvent(client: Client): void {
    client.on(Events.GuildMemberAdd, async (member) => {
        try {
            // ─── ALT-KORUMASI (SAHTE HESAP) ───
            const accountAgeDays = (Date.now() - member.user.createdTimestamp) / (1000 * 60 * 60 * 24);
            if (accountAgeDays < CONFIG.ALT_ACCOUNT_DAYS) {
                // Kickle
                await member.send(`Sahte/Yeni hesap korumasına takıldınız. Hesabınızın en az ${CONFIG.ALT_ACCOUNT_DAYS} günlük olması gerekmektedir.`).catch(() => {});
                await member.kick('Sahte hesap (Alt-Account) koruması');

                const kickEmbed = new EmbedBuilder()
                    .setColor('#FF0000')
                    .setTitle('🛡️ Alt-Hesap Koruması Tetiklendi')
                    .addFields(
                        { name: 'Kullanıcı', value: `${member.user.tag} (<@${member.id}>)`, inline: true },
                        { name: 'Hesap Yaşı', value: `\`${Math.floor(accountAgeDays)} gün\``, inline: true }
                    )
                    .setTimestamp();
                await sendLog(member.guild, kickEmbed);
                return; // Devam etme
            }

            // ─── DAVET TAKİBİ (INVITE TRACKER) ───
            let inviter = 'Bilinmiyor';
            const guildInvites = await member.guild.invites.fetch().catch(() => null);
            const cachedInvites = invitesCache.get(member.guild.id);

            if (guildInvites && cachedInvites) {
                const invite = guildInvites.find(inv => {
                    const cachedUses = cachedInvites.get(inv.code) || 0;
                    return (inv.uses || 0) > cachedUses;
                });
                if (invite) {
                    inviter = invite.inviter ? `<@${invite.inviter.id}>` : 'Bilinmiyor';
                    cachedInvites.set(invite.code, invite.uses || 0);
                }
            }

            // ─── CANVAS HOŞ GELDİN RESMİ ───
            const canvas = createCanvas(1024, 450);
            const ctx = canvas.getContext('2d');

            // Arka plan resmini yükle (internetten veya lokalden olabilir, şimdilik siyah + gradient)
            const gradient = ctx.createLinearGradient(0, 0, 1024, 0);
            gradient.addColorStop(0, '#1a2a6c');
            gradient.addColorStop(0.5, '#b21f1f');
            gradient.addColorStop(1, '#fdbb2d');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, 1024, 450);

            // Çerçeve
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 10;
            ctx.strokeRect(0, 0, 1024, 450);

            // Metinler
            ctx.font = 'bold 60px sans-serif';
            ctx.fillStyle = '#ffffff';
            ctx.textAlign = 'center';
            ctx.fillText('HOŞ GELDİN', 512, 330);

            ctx.font = '45px sans-serif';
            ctx.fillStyle = '#e0e0e0';
            ctx.fillText(member.user.tag, 512, 390);

            ctx.font = '30px sans-serif';
            ctx.fillStyle = '#cccccc';
            ctx.fillText(`Seninle beraber ${member.guild.memberCount} kişiyiz!`, 512, 430);

            // Avatar Çizimi (Yuvarlak)
            ctx.beginPath();
            ctx.arc(512, 160, 100, 0, Math.PI * 2, true);
            ctx.closePath();
            ctx.clip();

            const avatarURL = member.user.displayAvatarURL({ extension: 'png', size: 256 });
            try {
                const avatar = await loadImage(avatarURL);
                ctx.drawImage(avatar, 412, 60, 200, 200);
            } catch (e) {
                console.error('Avatar yüklenemedi:', e);
            }

            const attachment = new AttachmentBuilder(await canvas.encode('png'), { name: 'welcome-image.png' });

            // ─── HOŞ GELDİN MESAJI ───
            const channel = member.guild.channels.cache.get(CONFIG.WELCOME_CHANNEL_ID) as TextChannel;
            let welcomeSent = false;
            if (channel) {
                const welcomeEmbed = new EmbedBuilder()
                    .setColor(CONFIG.EMBED_COLOR)
                    .setTitle(`Selam ${member.user.username}! ✨`)
                    .setDescription(
                        `Aramıza katıldığın için mutluyuz!\n\n` +
                        `📜 <#${CONFIG.RULES_CHANNEL_ID}> kurallarına göz atmayı unutma.\n` +
                        `👤 Davet Eden: ${inviter}`
                    )
                    .setImage('attachment://welcome-image.png')
                    .setFooter({ text: `Kullanıcı ID: ${member.id}` })
                    .setTimestamp();

                await channel.send({
                    content: `Sunucuya hoş geldin, <@${member.id}>! 🎊`,
                    embeds: [welcomeEmbed],
                    files: [attachment]
                });
                welcomeSent = true;
            }

            // ─── AUTO-ROLE ───
            let roleGiven = false;
            if (CONFIG.AUTO_ROLE_ID && CONFIG.AUTO_ROLE_ID !== 'BURAYA_ROL_ID_YAZ') {
                try {
                    await member.roles.add(CONFIG.AUTO_ROLE_ID);
                    roleGiven = true;
                } catch (err) { }
            }

            // ─── DETAYLI KATILIM LOGU ───
            const logEmbed = new EmbedBuilder()
                .setColor('#00ff00')
                .setTitle('📥 Yeni Üye Katıldı')
                .setThumbnail(member.user.displayAvatarURL({ size: 64 }))
                .addFields(
                    { name: 'Kullanıcı', value: `${member.user.tag} (<@${member.id}>)`, inline: true },
                    { name: 'Hesap Oluşturma', value: `<t:${Math.floor(member.user.createdTimestamp / 1000)}:R>`, inline: true },
                    { name: 'Davet Eden', value: inviter, inline: true },
                    { name: '📨 Hoş Geldin', value: welcomeSent ? '✅ Gönderildi' : '❌ Gönderilemedi', inline: true },
                    { name: '🎭 Auto-Role', value: roleGiven ? '✅ Verildi' : process.env.AUTO_ROLE_ID === 'BURAYA_ROL_ID_YAZ' ? '⚠️ Ayarlanmamış' : '❌ Verilemedi', inline: true }
                )
                .setTimestamp();
            await sendLog(member.guild, logEmbed);

        } catch (error) {
            console.error('Karşılama hatası:', error);
        }
    });
}
