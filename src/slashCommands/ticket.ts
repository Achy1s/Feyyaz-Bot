import { ChatInputCommandInteraction } from 'discord.js';
import { createTicketPanel } from '../systems/ticket';

export async function handleSlashTicket(interaction: ChatInputCommandInteraction): Promise<void> {
    await createTicketPanel(interaction);
}
