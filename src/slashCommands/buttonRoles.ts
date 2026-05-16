import { ChatInputCommandInteraction } from 'discord.js';
import { createRolePanel } from '../systems/buttonRoles';

export async function handleSlashRolePanel(interaction: ChatInputCommandInteraction): Promise<void> {
    await createRolePanel(interaction);
}
