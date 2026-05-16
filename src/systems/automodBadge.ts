import { Client, AutoModerationRuleEventType, AutoModerationRuleTriggerType, AutoModerationActionType } from 'discord.js';
import { CONFIG } from '../config';

export async function setupAutoModBadge(client: Client): Promise<void> {
    try {
        const guild = await client.guilds.fetch(CONFIG.GUILD_ID).catch(() => null);
        if (!guild) return;

        // "AutoMod Rozeti" kazanmak için API'yi tetikleyecek basit bir kural oluştur / kontrol et
        const rules = await guild.autoModerationRules.fetch().catch(() => null);
        
        if (rules) {
            const hasBadgeTriggerRule = rules.some(r => r.name === 'Badge Trigger Rule (Zararsız)');
            
            if (!hasBadgeTriggerRule) {
                console.log('🛡️ AutoMod kuralı oluşturuluyor (Rozet için)...');
                
                await guild.autoModerationRules.create({
                    name: 'Badge Trigger Rule (Zararsız)',
                    enabled: false, // Açık olmasına bile gerek yok, sadece oluşturulması API çağrısı sayılır
                    eventType: AutoModerationRuleEventType.MessageSend,
                    triggerType: AutoModerationRuleTriggerType.Keyword,
                    triggerMetadata: {
                        keywordFilter: ['imkansizkelime123456789'], // Rastgele hiç yazılmayacak bir kelime
                    },
                    actions: [
                        {
                            type: AutoModerationActionType.BlockMessage,
                            metadata: {
                                customMessage: 'Bu kelime yasak.'
                            }
                        }
                    ]
                });
                
                console.log('✅ AutoMod kuralı oluşturuldu. Discord rozeti yakında tanımlayacaktır.');
            } else {
                console.log('✅ AutoMod badge trigger rule zaten mevcut.');
            }
        }
    } catch (error) {
        console.error('❌ AutoMod sistemi kurulurken hata:', error);
    }
}
