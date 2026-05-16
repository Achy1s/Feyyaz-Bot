import { Message, PermissionsBitField } from 'discord.js';

export async function handleKick(message: Message, args: string[]): Promise<void> {
    if (!message.member?.permissions.has(PermissionsBitField.Flags.KickMembers)) return;

    const target = message.mentions.members?.first();
    const reason = args.slice(1).join(' ') || 'Sebep belirtilmedi.';

    if (!target) {
        await message.reply('Lütfen atılacak kullanıcıyı etiketleyin.');
        return;
    }

    if (!target.kickable) {
        await message.reply('Bu kullanıcıyı atma yetkim yok (Rolü benden yüksek olabilir).');
        return;
    }

    await target.kick(reason);
    await message.reply(`🔨 **${target.user.tag}** sunucudan atıldı. Sebep: ${reason}`);
}
