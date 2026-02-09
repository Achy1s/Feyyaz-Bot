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
    ],
});

// --- AYARLAR ---
const TOKEN = "MTQ2Nzk4NjA0NTU1NDUyODM1OQ.Gh05wB.lYGH9xpS1c4Hnmr7n18ofLzaRFtMWWX15k9yUw";
const CLIENT_ID = "1467986045554528359";
const ETKINLIK_BILETI_ID = "1470026648752619590"; 
const BEKLEME_ODASI_ID = "1470026697339437209";
const ETKINLIK_ODASI_ID = "1325394986618982410"; // Yedek oda (etkinlik bulunamazsa buraya atar)
const YETKILI_ROLLERI = ["1325887804642693150", "1325889194677239859"];
const GUILD_ID = "751507503816376421";

const beklemeSirasi = new Map(); 
const reddedilenler = new Set(); 

// --- YARDIMCI FONKSİYONLAR ---

async function aktifEtkinlikVarMi(guild) {
    const etkinlikler = await guild.scheduledEvents.fetch();
    return etkinlikler.some((event) => event.status === 2); // 2: ACTIVE
}

async function aktifEtkinlikKanaliBul(guild) {
    const etkinlikler = await guild.scheduledEvents.fetch();
    const aktifEtkinlik = etkinlikler.find(event => event.status === 2); 

    // Aktif bir etkinlik varsa ve kanalı belliyse o kanalı döner
    if (aktifEtkinlik && aktifEtkinlik.channelId) {
        return aktifEtkinlik.channelId;
    }
    return ETKINLIK_ODASI_ID; // Bulamazsa varsayılan odayı döner
}

async function rolleriTemizle(guild) {
    const etkinlikAktif = await aktifEtkinlikVarMi(guild);
    if (!etkinlikAktif) {
        if (reddedilenler.size > 0) {
            reddedilenler.clear();
            console.log("♻️ Etkinlik bittiği için red listesi sıfırlandı.");
        }
        const rol = guild.roles.cache.get(ETKINLIK_BILETI_ID);
        if (!rol) return;
        rol.members.forEach(async (member) => {
            try {
                await member.roles.remove(rol);
            } catch (e) {
                console.error("Rol temizleme hatası:", e);
            }
        });
    }
}

// GÜNCELLEME: Artık guild parametresi alıyor ve dinamik kanalı buluyor
async function sirayiGuncelle(guild) {
    const hedefKanalId = await aktifEtkinlikKanaliBul(guild);
    const kanal = guild.channels.cache.get(hedefKanalId);

    if (!kanal) return;

    let index = 1;
    for (const [userId, data] of beklemeSirasi) {
        try {
            const msg = await kanal.messages.fetch(data.mesajId).catch(() => null);
            if (msg && msg.embeds[0]) {
                const yeniEmbed = EmbedBuilder.from(msg.embeds[0])
                    .setDescription(
                        `**${msg.embeds[0].author.name}** bekleme odasında.\n\n🔢 **Sıra Numarası:** #${index}\n⏱ **Giriş:** <t:${Math.floor(data.joinTime / 1000)}:R>`,
                    )
                    .setFooter({ text: `Şu an sırada toplam ${beklemeSirasi.size} kişi var.` });
                await msg.edit({ embeds: [yeniEmbed] });
            }
        } catch (e) {}
        index++;
    }
}

function botSesliKanalaKatil() {
    const kanal = client.channels.cache.get(BEKLEME_ODASI_ID);
    if (!kanal) return;
    try {
        joinVoiceChannel({
            channelId: kanal.id,
            guildId: kanal.guild.id,
            adapterCreator: kanal.guild.voiceAdapterCreator,
            selfDeaf: true,
            selfMute: true,
        });
    } catch (e) {}
}

// --- SLASH KOMUTLARI YÜKLEME ---
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

client.once("ready", () => { // v15 uyarısı alırsan burayı 'clientReady' yapabilirsin ama 'ready' de çalışır
    console.log(`${client.user.tag} hazır!`);
    botSesliKanalaKatil();
    setInterval(async () => {
        const guild = client.guilds.cache.get(GUILD_ID);
        if (guild) await rolleriTemizle(guild);
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
        const aktifMi = await aktifEtkinlikVarMi(guild);

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

        // Kullanıcının rolü varsa direkt aktif odaya fırlat
        if (user.roles.cache.has(ETKINLIK_BILETI_ID)) {
            const hedefKanalId = await aktifEtkinlikKanaliBul(guild);
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

        // GÜNCELLEME: Mesajı aktif etkinlik kanalına gönderiyoruz
        const hedefKanalId = await aktifEtkinlikKanaliBul(guild);
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

                // GÜNCELLEME: Hatayı önlemek için deferReply
                await i.deferReply({ ephemeral: true });

                const hedefKanalId = await aktifEtkinlikKanaliBul(i.guild);

                if (i.customId.startsWith("onay_")) {
                    beklemeSirasi.delete(user.id);
                    await sirayiGuncelle(i.guild); // Guild parametresi eklendi
                    try {
                        const rol = i.guild.roles.cache.get(ETKINLIK_BILETI_ID);
                        if (rol) await user.roles.add(rol);

                        // Kullanıcıyı taşı
                        await user.voice.setChannel(hedefKanalId);

                        await logMsg.delete().catch(() => {});

                        // reply yerine editReply
                        await i.editReply({ content: `✅ ${user.user.tag} içeri alındı.` });
                    } catch (e) { 
                        await i.editReply({ content: "Hata oluştu, kullanıcı odadan çıkmış olabilir." }); 
                    }
                }

                if (i.customId.startsWith("red_")) {
                    reddedilenler.add(user.id);
                    beklemeSirasi.delete(user.id);
                    await sirayiGuncelle(i.guild); // Guild parametresi eklendi
                    try {
                        await user.voice.disconnect();
                        await logMsg.delete().catch(() => {});
                        await i.editReply({ content: `❌ ${user.user.tag} reddedildi.` });
                    } catch (e) {
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
            // GÜNCELLEME: Silinecek mesajı aktif kanalda arıyoruz
            const hedefKanalId = await aktifEtkinlikKanaliBul(newState.guild);
            const logKanal = newState.guild.channels.cache.get(hedefKanalId);

            if (logKanal && data.mesajId) {
                const msg = await logKanal.messages.fetch(data.mesajId).catch(() => null);
                if (msg) await msg.delete().catch(() => {});
            }
            beklemeSirasi.delete(user.id);
            await sirayiGuncelle(newState.guild);
        }
    }
});

client.login(TOKEN);