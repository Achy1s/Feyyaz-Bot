import { Message, PermissionsBitField } from 'discord.js';

export async function handleBan(message: Message, args: string[]): Promise<void> {
    if (!message.member?.permissions.has(PermissionsBitField.Flags.BanMembers)) return;

    const target = message.mentions.members?.first();
    const reason = args.slice(1).join(' ') || 'Sebep belirtilmedi.';

    if (!target) {
        await message.reply('Lütfen yasaklanacak kullanıcıyı etiketleyin.');
        return;
    }

    if (!target.bannable) {
        await message.reply('Bu kullanıcıyı yasaklama yetkim yok.');
        return;
    }

    await target.ban({ reason });
    await message.reply(`⛔ **${target.user.tag}** sunucudan yasaklandı. Sebep: ${reason}`);
}
