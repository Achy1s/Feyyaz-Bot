import { Message, PermissionsBitField, TextChannel } from 'discord.js';

export async function handlePurge(message: Message, args: string[]): Promise<void> {
    if (!message.member?.permissions.has(PermissionsBitField.Flags.ManageMessages)) return;

    const amount = parseInt(args[0]);
    if (isNaN(amount) || amount < 1 || amount > 100) {
        await message.reply('Lütfen 1 ile 100 arasında bir sayı belirtin. Örn: `!purge 50`');
        return;
    }

    const channel = message.channel as TextChannel;
    const deleted = await channel.bulkDelete(amount, true).catch(err => {
        console.error(err);
        message.reply('14 günden eski mesajları topluca silemem.');
        return null;
    });

    if (deleted) {
        const msg = await (message.channel as TextChannel).send(`🧹 ${deleted.size} mesaj silindi.`);
        setTimeout(() => msg.delete().catch(() => {}), 5000);
    }
}
