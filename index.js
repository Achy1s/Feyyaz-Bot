const {
    Client,
    GatewayIntentBits,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ComponentType,
    REST,
    Routes,
    SlashCommandBuilder,
} = require("discord.js");
const { joinVoiceChannel } = require("@discordjs/voice");

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        // HIZLANDIRMA 1: Etkinlikleri önbelleğe almak için bu izni ekledik
        GatewayIntentBits.GuildScheduledEvents, 
    ],
});

// --- AYARLAR ---
const TOKEN = "MTQ2Nzk4NjA0NTU1NDUyODM1OQ.GBrfQM.wLFmh-uOHKJ3YQiog6vm_f6eAop495RlPFUKa4";
const CLIENT_ID = "1467986045554528359";
const ETKINLIK_BILETI_ID = "1470026648752619590"; 
const BEKLEME_ODASI_ID = "1470026697339437209";
const ETKINLIK_ODASI_ID = "1325394986618982410"; 
const YETKILI_ROLLERI = ["1325887804642693150", "1325889194677239859", "873985713086009375"];
const GUILD_ID = "751507503816376421";

const beklemeSirasi = new Map(); 
const reddedilenler = new Set(); 

// --- OPTİMİZE EDİLMİŞ YARDIMCI FONKSİYONLAR ---

// HIZLANDIRMA 2: Fetch yerine Cache kullanıyoruz (Await kaldırıldı)
function aktifEtkinlikVarMi(guild) {
    return guild.scheduledEvents.cache.some((event) => event.status === 2); // 2: ACTIVE
}

function aktifEtkinlikKanaliBul(guild) {
    const aktifEtkinlik = guild.scheduledEvents.cache.find(event => event.status === 2); 
    if (aktifEtkinlik && aktifEtkinlik.channelId) {
        return aktifEtkinlik.channelId;
    }
    return ETKINLIK_ODASI_ID; 
}

async function rolleriTemizle(guild) {
    const etkinlikAktif = aktifEtkinlikVarMi(guild); // Await yok
    if (!etkinlikAktif) {
        if (reddedilenler.size > 0) {
            reddedilenler.clear();
            console.log("♻️ Etkinlik bittiği için red listesi sıfırlandı.");
        }
        const rol = guild.roles.cache.get(ETKINLIK_BILETI_ID);
        if (!rol) return;
        
        // Hızlandırma: Rolleri tek tek değil, Promise.all ile paralel alıyoruz (eğer çok kişi varsa)
        // Ancak rol silme API limitine takılabileceği için basit döngü kalabilir, fakat try-catch hızlandırıldı.
        rol.members.forEach((member) => {
            member.roles.remove(rol).catch(e => console.error("Rol silinemedi:", e.message));
        });
    }
}

// HIZLANDIRMA 3: Sırayı güncellerken herkesi aynı anda güncelle (Paralel İşlem)
async function sirayiGuncelle(guild) {
    const hedefKanalId = aktifEtkinlikKanaliBul(guild); // Await yok
    const kanal = guild.channels.cache.get(hedefKanalId);

    if (!kanal) return;

    let index = 1;
    const guncellemeIslemleri = []; // Promise dizisi

    for (const [userId, data] of beklemeSirasi) {
        const siraNo = index++; // Closure için kopyala
        
        // İşlemi hemen başlat ama await etme, diziye at
        const islem = (async () => {
            try {
                // Mesajı önce cache'de ara, yoksa fetch et
                let msg = kanal.messages.cache.get(data.mesajId);
                if (!msg) msg = await kanal.messages.fetch(data.mesajId).catch(() => null);

                if (msg && msg.embeds[0]) {
                    const yeniEmbed = EmbedBuilder.from(msg.embeds[0])
                        .setDescription(
                            `**${msg.embeds[0].author.name}** bekleme odasında.\n\n🔢 **Sıra Numarası:** #${siraNo}\n⏱ **Giriş:** <t:${Math.floor(data.joinTime / 1000)}:R>`,
                        )
                        .setFooter({ text: `Şu an sırada toplam ${beklemeSirasi.size} kişi var.` });
                    await msg.edit({ embeds: [yeniEmbed] });
                }
            } catch (e) {
                // Hata olursa sessizce geç, sistemi kilitleme
            }
        })();
        
        guncellemeIslemleri.push(islem);
    }

    // Tüm mesajları aynı anda güncelle
    await Promise.all(guncellemeIslemleri);
}

function botSesliKanalaKatil() {
    const kanal = client.channels.cache.get(BEKLEME_ODASI_ID);
    if (!kanal) {
        console.log("❌ Bekleme odası kanalı bulunamadı!");
        return;
    }
    
    try {
        const connection = joinVoiceChannel({
            channelId: kanal.id,
            guildId: kanal.guild.id,
            adapterCreator: kanal.guild.voiceAdapterCreator,
            selfDeaf: true,
            selfMute: true,
        });

        connection.on('stateChange', (oldState, newState) => {
            console.log(`🔊 Ses Durumu: ${oldState.status} -> ${newState.status}`);
        });

    } catch (e) {
        console.error("❌ Ses kanalına bağlanırken hata oluştu:", e);
    }
}

// --- SLASH KOMUTLARI ---
const commands = [
    new SlashCommandBuilder().setName("red-kaldir").setDescription("Reddedilen birinin engelini kaldırır.").addUserOption(o => o.setName("kullanici").setDescription("Üye").setRequired(true)),
    new SlashCommandBuilder().setName("red-listesi").setDescription("Reddedilen kullanıcıları gösterir."),
].map(c => c.toJSON());

const rest = new REST({ version: "10" }).setToken(TOKEN);
(async () => {
    try {
        await rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), { body: commands });
        console.log("✅ Slash komutları yüklendi.");
    } catch (e) { console.error(e); }
})();

// --- EVENTLER ---

client.once("ready", async () => {
    console.log(`${client.user.tag} hazır!`);
    
    // İlk açılışta cache'i doldurmak için bir kere fetch yapıyoruz
    const guild = client.guilds.cache.get(GUILD_ID);
    if (guild) {
        await guild.scheduledEvents.fetch().catch(() => {});
        console.log("📅 Etkinlik önbelleği (cache) oluşturuldu.");
    }

    botSesliKanalaKatil();
    
    setInterval(async () => {
        if (guild) {
             // Arka planda ara sıra cache tazele
            await guild.scheduledEvents.fetch().catch(() => {});
            await rolleriTemizle(guild);
        }
    }, 60000);
});

client.on("interactionCreate", async (interaction) => {
    if (!interaction.isChatInputCommand()) return;
    const yetkiliMi = interaction.member.roles.cache.some(r => YETKILI_ROLLERI.includes(r.id));
    if (!yetkiliMi) return interaction.reply({ content: "Yetkiniz yok!", ephemeral: true });

    if (interaction.commandName === "red-kaldir") {
        const user = interaction.options.getUser("kullanici");
        if (reddedilenler.has(user.id)) {
            reddedilenler.delete(user.id);
            await interaction.reply({ content: `✅ **${user.tag}** engeli kaldırıldı.`, ephemeral: true });
        } else {
            await interaction.reply({ content: "Bu kullanıcı listede değil.", ephemeral: true });
        }
    }

    if (interaction.commandName === "red-listesi") {
        if (reddedilenler.size === 0) return interaction.reply({ content: "Liste boş.", ephemeral: true });
        const embed = new EmbedBuilder().setTitle("🚫 Red Listesi").setDescription(Array.from(reddedilenler).map(id => `<@${id}>`).join("\n")).setColor("Red");
        await interaction.reply({ embeds: [embed], ephemeral: true });
    }
});

client.on("voiceStateUpdate", async (oldState, newState) => {
    const user = newState.member;
    if (!user || user.user.bot) return;

    if (newState.id === client.user.id && !newState.channelId) {
        return setTimeout(() => botSesliKanalaKatil(), 5000);
    }

    // BEKLEME ODASINA GİRİŞ
    if (newState.channelId === BEKLEME_ODASI_ID && oldState.channelId !== BEKLEME_ODASI_ID) {
        const guild = newState.guild;
        // Cache'den kontrol (HIZLI)
        const aktifMi = aktifEtkinlikVarMi(guild);

        if (!aktifMi) {
            try {
                if (user.roles.cache.has(ETKINLIK_BILETI_ID)) await user.roles.remove(ETKINLIK_BILETI_ID);
                await user.voice.disconnect();
                return await user.send("Şu an aktif bir etkinlik yok.").catch(() => {});
            } catch (e) {}
            return;
        }

        if (reddedilenler.has(user.id)) {
            try {
                await user.voice.disconnect();
                return await user.send("Bu etkinlik için reddedildiniz.").catch(() => {});
            } catch (e) {}
            return;
        }

        if (user.roles.cache.has(ETKINLIK_BILETI_ID)) {
            const hedefKanalId = aktifEtkinlikKanaliBul(guild); // Await yok
            try { return await user.voice.setChannel(hedefKanalId); } catch (e) {}
        }

        const simdi = Date.now();
        beklemeSirasi.set(user.id, { joinTime: simdi });

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId(`onay_${user.id}`).setLabel("İçeri Al").setStyle(ButtonStyle.Success),
            new ButtonBuilder().setCustomId(`red_${user.id}`).setLabel("Reddet").setStyle(ButtonStyle.Danger),
        );

        const embed = new EmbedBuilder()
            .setColor("Blue")
            .setAuthor({ name: user.user.tag, iconURL: user.user.displayAvatarURL() })
            .setTitle("🔔 Yeni Sıra Bildirimi")
            .setDescription(`**${user.user.username}** bekleme odasına girdi.\n\n🔢 **Sıra:** #${beklemeSirasi.size}\n⏱ **Giriş:** <t:${Math.floor(simdi / 1000)}:R>`)
            .setFooter({ text: `Etkinlik Odası için ${beklemeSirasi.size} kişi sırada.` });

        const hedefKanalId = aktifEtkinlikKanaliBul(guild); // Await yok
        const logKanal = guild.channels.cache.get(hedefKanalId);

        if (logKanal) {
            const logMsg = await logKanal.send({
                content: YETKILI_ROLLERI.map(r => `<@&${r}>`).join(" "),
                embeds: [embed],
                components: [row]
            });

            if(beklemeSirasi.has(user.id)) beklemeSirasi.get(user.id).mesajId = logMsg.id;

            const collector = logMsg.createMessageComponentCollector({ componentType: ComponentType.Button, time: 3600000 });

            collector.on("collect", async (i) => {
                const yetkili = i.member.roles.cache.some(r => YETKILI_ROLLERI.includes(r.id));
                if (!yetkili) return i.reply({ content: "Yetkiniz yok.", ephemeral: true });

                // HIZLANDIRMA 4: DeferReply ile etkileşimi bekletmeden API'ye "aldım" diyoruz
                await i.deferReply({ ephemeral: true });

                const hedefKanalId = aktifEtkinlikKanaliBul(i.guild); // Await yok

                if (i.customId.startsWith("onay_")) {
                    beklemeSirasi.delete(user.id);
                    
                    // İşlemleri paralel yap
                    const updateQueue = sirayiGuncelle(i.guild);
                    const userProcess = (async () => {
                         try {
                            const rol = i.guild.roles.cache.get(ETKINLIK_BILETI_ID);
                            if (rol) await user.roles.add(rol);
                            await user.voice.setChannel(hedefKanalId);
                            await logMsg.delete().catch(() => {});
                         } catch(e) { throw e; }
                    })();

                    try {
                        await Promise.all([updateQueue, userProcess]);
                        await i.editReply({ content: `✅ ${user.user.tag} içeri alındı.` });
                    } catch (e) {
                        await i.editReply({ content: "Hata oluştu, kullanıcı odadan çıkmış olabilir." });
                    }
                }

                if (i.customId.startsWith("red_")) {
                    reddedilenler.add(user.id);
                    beklemeSirasi.delete(user.id);

                    const updateQueue = sirayiGuncelle(i.guild);
                    const userProcess = (async () => {
                        try {
                            await user.voice.disconnect();
                            await logMsg.delete().catch(() => {});
                        } catch(e) { throw e; }
                    })();

                    try {
                        await Promise.all([updateQueue, userProcess]);
                        await i.editReply({ content: `❌ ${user.user.tag} reddedildi.` });
                    } catch(e) {
                         await i.editReply({ content: "İşlem tamamlanamadı." });
                    }
                }
            });
        }
    }

    // BEKLEME ODASINDAN ÇIKIŞ TEMİZLİĞİ
    if (oldState.channelId === BEKLEME_ODASI_ID && newState.channelId !== BEKLEME_ODASI_ID) {
        const data = beklemeSirasi.get(user.id);
        if (data) {
            const hedefKanalId = aktifEtkinlikKanaliBul(newState.guild); // Await yok
            const logKanal = newState.guild.channels.cache.get(hedefKanalId);

            if (logKanal && data.mesajId) {
                // Mesajı sil ama bekleme, fire-and-forget
                logKanal.messages.fetch(data.mesajId).then(m => m.delete()).catch(() => {});
            }
            beklemeSirasi.delete(user.id);
            // Sırayı güncelle ama bekleme
            sirayiGuncelle(newState.guild).catch(() => {});
        }
    }
});

client.login(TOKEN);