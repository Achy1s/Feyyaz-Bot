import * as fs from 'fs';
import * as path from 'path';
import {
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ChatInputCommandInteraction,
    ButtonInteraction,
    TextChannel
} from 'discord.js';
import { sendLog } from '../utils/logger';

interface Poll {
    messageId: string;
    channelId: string;
    guildId: string;
    question: string;
    options: string[];
    votes: Record<string, string[]>; // optionIndex → userId[]
    creatorId: string;
    ended: boolean;
}

interface PollData {
    [messageId: string]: Poll;
}

const DATA_PATH = path.join(__dirname, '..', '..', 'data', 'polls.json');

function ensureDataDir(): void {
    const dir = path.dirname(DATA_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function loadData(): PollData {
    ensureDataDir();
    if (!fs.existsSync(DATA_PATH)) return {};
    try { return JSON.parse(fs.readFileSync(DATA_PATH, 'utf-8')); } catch { return {}; }
}

function saveData(data: PollData): void {
    ensureDataDir();
    fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2));
}

const OPTION_EMOJIS = ['🅰️', '🅱️', '🅲', '🅳', '🅴'];

export async function createPoll(interaction: ChatInputCommandInteraction): Promise<void> {
    const question = interaction.options.getString('soru', true);
    const option1 = interaction.options.getString('seçenek1', true);
    const option2 = interaction.options.getString('seçenek2', true);
    const option3 = interaction.options.getString('seçenek3');
    const option4 = interaction.options.getString('seçenek4');

    const options = [option1, option2];
    if (option3) options.push(option3);
    if (option4) options.push(option4);

    const optionsList = options.map((opt, i) => `${OPTION_EMOJIS[i]} ${opt}`).join('\n');

    const embed = new EmbedBuilder()
        .setColor('#3498DB')
        .setTitle('📊 Anket')
        .setDescription(`**${question}**\n\n${optionsList}\n\n*Oy vermek için aşağıdaki butonlara tıkla!*`)
        .setFooter({ text: `Oluşturan: ${interaction.user.tag} • Toplam: 0 oy` })
        .setTimestamp();

    const row = new ActionRowBuilder<ButtonBuilder>();
    options.forEach((_, i) => {
        row.addComponents(
            new ButtonBuilder()
                .setCustomId(`poll_vote_${i}`)
                .setLabel(`${OPTION_EMOJIS[i]} (0)`)
                .setStyle(ButtonStyle.Primary)
        );
    });
    row.addComponents(
        new ButtonBuilder()
            .setCustomId('poll_end')
            .setLabel('🔒 Bitir')
            .setStyle(ButtonStyle.Danger)
    );

    await interaction.reply({ content: '📊 Anket oluşturuluyor...', ephemeral: true });

    const channel = interaction.channel as TextChannel;
    const msg = await channel.send({ embeds: [embed], components: [row] });

    const votes: Record<string, string[]> = {};
    options.forEach((_, i) => { votes[String(i)] = []; });

    const poll: Poll = {
        messageId: msg.id,
        channelId: channel.id,
        guildId: interaction.guildId!,
        question,
        options,
        votes,
        creatorId: interaction.user.id,
        ended: false
    };

    const data = loadData();
    data[msg.id] = poll;
    saveData(data);

    // Log
    if (interaction.guild) {
        const logEmbed = new EmbedBuilder()
            .setColor('#3498DB')
            .setTitle('📊 Anket Oluşturuldu')
            .addFields(
                { name: 'Soru', value: question, inline: false },
                { name: 'Oluşturan', value: `${interaction.user.tag}`, inline: true },
                { name: 'Kanal', value: `<#${channel.id}>`, inline: true }
            )
            .setTimestamp();
        await sendLog(interaction.guild, logEmbed);
    }
}

export async function handlePollButton(interaction: ButtonInteraction): Promise<void> {
    const data = loadData();
    const poll = data[interaction.message.id];

    if (!poll || poll.ended) {
        await interaction.reply({ content: '❌ Bu anket sona ermiş.', ephemeral: true });
        return;
    }

    // Bitirme butonu
    if (interaction.customId === 'poll_end') {
        if (interaction.user.id !== poll.creatorId) {
            await interaction.reply({ content: '❌ Sadece anket oluşturucu bitirebilir.', ephemeral: true });
            return;
        }
        poll.ended = true;
        saveData(data);
        await updatePollEmbed(interaction, poll, true);
        await interaction.reply({ content: '🔒 Anket bitirildi!', ephemeral: true });
        return;
    }

    // Oy verme
    const optionIndex = interaction.customId.replace('poll_vote_', '');
    const userId = interaction.user.id;

    // Önceki oyu kaldır
    for (const key of Object.keys(poll.votes)) {
        const idx = poll.votes[key].indexOf(userId);
        if (idx !== -1) poll.votes[key].splice(idx, 1);
    }

    // Yeni oy ekle
    if (!poll.votes[optionIndex]) poll.votes[optionIndex] = [];
    poll.votes[optionIndex].push(userId);
    saveData(data);

    await updatePollEmbed(interaction, poll, false);
    await interaction.reply({ content: `✅ ${OPTION_EMOJIS[parseInt(optionIndex)]} seçeneğine oy verdin!`, ephemeral: true });
}

async function updatePollEmbed(interaction: ButtonInteraction, poll: Poll, ended: boolean): Promise<void> {
    const totalVotes = Object.values(poll.votes).reduce((sum, arr) => sum + arr.length, 0);

    const optionsList = poll.options.map((opt, i) => {
        const voteCount = poll.votes[String(i)]?.length || 0;
        const percentage = totalVotes > 0 ? Math.round((voteCount / totalVotes) * 100) : 0;
        const barLength = 10;
        const filled = Math.round((percentage / 100) * barLength);
        const bar = '█'.repeat(filled) + '░'.repeat(barLength - filled);
        return `${OPTION_EMOJIS[i]} ${opt}\n${bar} \`${percentage}%\` (${voteCount} oy)`;
    }).join('\n\n');

    const embed = new EmbedBuilder()
        .setColor(ended ? '#808080' : '#3498DB')
        .setTitle(ended ? '📊 Anket Sonuçları' : '📊 Anket')
        .setDescription(`**${poll.question}**\n\n${optionsList}`)
        .setFooter({ text: `Oluşturan: ${interaction.guild?.members.cache.get(poll.creatorId)?.user.tag || '?'} • Toplam: ${totalVotes} oy` })
        .setTimestamp();

    if (ended) {
        const disabledRow = new ActionRowBuilder<ButtonBuilder>();
        poll.options.forEach((_, i) => {
            const count = poll.votes[String(i)]?.length || 0;
            disabledRow.addComponents(
                new ButtonBuilder()
                    .setCustomId(`poll_ended_${i}`)
                    .setLabel(`${OPTION_EMOJIS[i]} (${count})`)
                    .setStyle(ButtonStyle.Secondary)
                    .setDisabled(true)
            );
        });
        await interaction.message.edit({ embeds: [embed], components: [disabledRow] });
    } else {
        const row = new ActionRowBuilder<ButtonBuilder>();
        poll.options.forEach((_, i) => {
            const count = poll.votes[String(i)]?.length || 0;
            row.addComponents(
                new ButtonBuilder()
                    .setCustomId(`poll_vote_${i}`)
                    .setLabel(`${OPTION_EMOJIS[i]} (${count})`)
                    .setStyle(ButtonStyle.Primary)
            );
        });
        row.addComponents(
            new ButtonBuilder()
                .setCustomId('poll_end')
                .setLabel('🔒 Bitir')
                .setStyle(ButtonStyle.Danger)
        );
        await interaction.message.edit({ embeds: [embed], components: [row] });
    }
}
