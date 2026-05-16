import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ButtonInteraction,
    ChannelType,
    EmbedBuilder,
    PermissionsBitField,
    TextChannel,
    CategoryChannel,
    ChatInputCommandInteraction
} from 'discord.js';
import { CONFIG } from '../config';
import { sendLog } from '../utils/logger';

// ─── TICKET PANEL KURULUMU ───
export async function createTicketPanel(interaction: ChatInputCommandInteraction): Promise<void> {
    if (!interaction.memberPermissions?.has(PermissionsBitField.Flags.Administrator)) {
        await interaction.reply({ content: '❌ Bu komutu sadece yöneticiler kullanabilir.', ephemeral: true });
        return;
    }

    const embed = new EmbedBuilder()
        .setColor('#2E86C1')
        .setTitle('🎫 Destek Talebi (Ticket)')
        .setDescription('Sunucu yetkilileri ile iletişime geçmek için aşağıdaki butona tıklayarak bir destek talebi oluşturabilirsin.\n\nLütfen gereksiz yere ticket açmaktan kaçının.')
        .setFooter({ text: interaction.guild!.name, iconURL: interaction.guild!.iconURL() || undefined })
        .setTimestamp();

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
            .setCustomId('ticket_create')
            .setLabel('🎫 Destek Talebi Aç')
            .setStyle(ButtonStyle.Primary)
    );

    const targetChannel = interaction.channel as TextChannel;
    await targetChannel.send({ embeds: [embed], components: [row] });
    await interaction.reply({ content: '✅ Ticket paneli başarıyla kuruldu!', ephemeral: true });
}

// ─── TICKET BUTON ETKİLEŞİMLERİ ───
export async function handleTicketButton(interaction: ButtonInteraction): Promise<void> {
    const guild = interaction.guild;
    if (!guild) return;

    // Yeni ticket açma
    if (interaction.customId === 'ticket_create') {
        let ticketCategory = guild.channels.cache.get(CONFIG.TICKET_CATEGORY_ID) as CategoryChannel;

        // Kategori yoksa yeni oluştur
        if (!ticketCategory || ticketCategory.type !== ChannelType.GuildCategory) {
            try {
                ticketCategory = await guild.channels.create({
                    name: '🎫 Destek Talepleri',
                    type: ChannelType.GuildCategory,
                }) as CategoryChannel;
            } catch {
                await interaction.reply({ content: '❌ Bilet kategorisi bulunamadı veya oluşturulamadı.', ephemeral: true });
                return;
            }
        }

        const member = interaction.member;
        if (!member) return;

        // Zaten açık ticketi var mı kontrol (Opsiyonel olarak eklenebilir. Şu an her kullanıcı birden fazla ticket açabilir, genellikle bu istenmez).
        const existingChannel = guild.channels.cache.find(c => c.name === `ticket-${interaction.user.username.toLowerCase()}`);
        if (existingChannel) {
            await interaction.reply({ content: `❌ Zaten açık bir biletiniz var: <#${existingChannel.id}>`, ephemeral: true });
            return;
        }

        await interaction.deferReply({ ephemeral: true });

        try {
            const ticketChannel = await guild.channels.create({
                name: `ticket-${interaction.user.username}`,
                type: ChannelType.GuildText,
                parent: ticketCategory.id,
                permissionOverwrites: [
                    {
                        id: guild.id, // @everyone
                        deny: [PermissionsBitField.Flags.ViewChannel],
                    },
                    {
                        id: interaction.user.id, // Bilet sahibi
                        allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ReadMessageHistory],
                    },
                    {
                        id: CONFIG.TICKET_MOD_ROLE_ID, // Mod rolü
                        allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ReadMessageHistory],
                    },
                ],
            });

            const welcomeEmbed = new EmbedBuilder()
                .setColor('#2E86C1')
                .setTitle(`🎫 Destek Bileti - ${interaction.user.tag}`)
                .setDescription(`Merhaba <@${interaction.user.id}>,\n\nYetkililer en kısa sürede seninle ilgilenecektir. Lütfen sorununuzu veya talebinizi detaylıca açıklayın.\n\nBileti kapatmak için aşağıdaki 🔒 butonuna tıklayabilirsiniz.`)
                .setTimestamp();

            const closeRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
                new ButtonBuilder()
                    .setCustomId('ticket_close')
                    .setLabel('🔒 Bileti Kapat')
                    .setStyle(ButtonStyle.Danger)
            );

            await ticketChannel.send({ content: `<@${interaction.user.id}> | <@&${CONFIG.TICKET_MOD_ROLE_ID}>`, embeds: [welcomeEmbed], components: [closeRow] });

            await interaction.editReply({ content: `✅ Biletiniz başarıyla açıldı: <#${ticketChannel.id}>` });

            // Log
            const logEmbed = new EmbedBuilder()
                .setColor('#00FF00')
                .setTitle('🎫 Bilet Açıldı')
                .addFields(
                    { name: 'Kullanıcı', value: `<@${interaction.user.id}>`, inline: true },
                    { name: 'Kanal', value: `<#${ticketChannel.id}>`, inline: true }
                )
                .setTimestamp();
            await sendLog(guild, logEmbed);

        } catch (error) {
            console.error('Bilet açma hatası:', error);
            await interaction.editReply({ content: '❌ Bilet açılırken bir hata oluştu.' });
        }
    }

    // Ticketi kapatma
    else if (interaction.customId === 'ticket_close') {
        const channel = interaction.channel as TextChannel;
        // İsteğe bağlı olarak sadece yetkililerin kapatmasına izin verilebilir.
        // if (!interaction.memberPermissions?.has(PermissionsBitField.Flags.ManageChannels)) return;

        await interaction.reply({ content: '🔒 Bilet 5 saniye içinde kapatılıp silinecektir...', ephemeral: false });

        // Basit Transcript ve Loglama
        try {
            const messages = await channel.messages.fetch({ limit: 100 });
            const transcript = messages.reverse().map(m => `${m.createdAt.toLocaleString('tr-TR')} - ${m.author.tag}: ${m.content}`).join('\n');

            const logEmbed = new EmbedBuilder()
                .setColor('#FF0000')
                .setTitle('🔒 Bilet Kapatıldı')
                .addFields(
                    { name: 'Kapatan', value: `<@${interaction.user.id}>`, inline: true },
                    { name: 'Kanal İsim', value: `\`${channel.name}\``, inline: true }
                )
                .setTimestamp();
            await sendLog(guild, logEmbed);

            // Gelişmiş ticket sistemlerinde `discord-html-transcripts` kütüphanesi ile HTML transcript atılır,
            // şimdilik basit metin logu veya direkt silme uygulanıyor.
        } catch (e) {
            console.error("Transcript alınamadı", e);
        }

        setTimeout(() => {
            channel.delete().catch(() => {});
        }, 5000);
    }
}
