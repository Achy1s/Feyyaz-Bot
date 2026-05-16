import { Message, PermissionsBitField } from 'discord.js';

export async function handleTimeout(message: Message, args: string[]): Promise<void> {
    if (!message.member?.permissions.has(PermissionsBitField.Flags.ModerateMembers)) return;

    const target = message.mentions.members?.first();
    const minutes = parseInt(args[1]);
    const reason = args.slice(2).join(' ') || 'Sebep belirtilmedi.';

    if (!target || isNaN(minutes)) {
        await message.reply('Kullanım: `!timeout @kullanıcı <dakika> [sebep]`');
        return;
    }

    if (!target.moderatable) {
        await message.reply('Bu kullanıcıya zamanaşımı uygulayamam.');
        return;
    }

    const ms = minutes * 60 * 1000;
    await target.timeout(ms, reason);
    await message.reply(`🤐 **${target.user.tag}** adlı kullanıcıya ${minutes} dakika zamanaşımı uygulandı.`);
}
