import { Client, Events, EmbedBuilder, ChannelType } from 'discord.js';
import { sendLog } from '../utils/logger';

const channelTypeNames: Record<number, string> = {
    [ChannelType.GuildText]: 'Metin Kanalı',
    [ChannelType.GuildVoice]: 'Ses Kanalı',
    [ChannelType.GuildCategory]: 'Kategori',
    [ChannelType.GuildAnnouncement]: 'Duyuru Kanalı',
    [ChannelType.GuildStageVoice]: 'Sahne Kanalı',
    [ChannelType.GuildForum]: 'Forum Kanalı',
};

export function registerChannelEvents(client: Client): void {
    // Kanal Oluşturma
    client.on(Events.ChannelCreate, async (channel) => {
        if (!('guild' in channel) || !channel.guild) return;
        const embed = new EmbedBuilder()
            .setColor('#00ff88')
            .setTitle('📁 Kanal Oluşturuldu')
            .addFields(
                { name: 'Kanal', value: `${channel.name} (<#${channel.id}>)`, inline: true },
                { name: 'Tür', value: channelTypeNames[channel.type] || `${channel.type}`, inline: true }
            )
            .setTimestamp();
        await sendLog(channel.guild, embed);
    });

    // Kanal Silme
    client.on(Events.ChannelDelete, async (channel) => {
        if (!('guild' in channel) || !(channel as any).guild) return;
        const guildChannel = channel as any;
        const embed = new EmbedBuilder()
            .setColor('#ff0000')
            .setTitle('📁 Kanal Silindi')
            .addFields(
                { name: 'Kanal Adı', value: `\`${guildChannel.name}\``, inline: true },
                { name: 'Tür', value: channelTypeNames[guildChannel.type] || `${guildChannel.type}`, inline: true }
            )
            .setTimestamp();
        await sendLog(guildChannel.guild, embed);
    });

    // Kanal Güncelleme
    client.on(Events.ChannelUpdate, async (oldChannel, newChannel) => {
        if (!('guild' in newChannel) || !(newChannel as any).guild) return;
        const oldCh = oldChannel as any;
        const newCh = newChannel as any;

        const changes: string[] = [];
        if (oldCh.name !== newCh.name) changes.push(`**İsim:** \`${oldCh.name}\` → \`${newCh.name}\``);
        if (oldCh.topic !== newCh.topic) changes.push(`**Konu:** \`${oldCh.topic || 'Yok'}\` → \`${newCh.topic || 'Yok'}\``);
        if (oldCh.nsfw !== newCh.nsfw) changes.push(`**NSFW:** \`${oldCh.nsfw}\` → \`${newCh.nsfw}\``);

        if (changes.length === 0) return;

        const embed = new EmbedBuilder()
            .setColor('#FFA500')
            .setTitle('📁 Kanal Güncellendi')
            .setDescription(`**Kanal:** <#${newCh.id}>\n\n${changes.join('\n')}`)
            .setTimestamp();
        await sendLog(newCh.guild, embed);
    });
}
