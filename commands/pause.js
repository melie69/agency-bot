const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs'), path = require('path');
const dataPath = path.join(__dirname, '../data/shifts.json');
function load() { if (!fs.existsSync(dataPath)) return {}; return JSON.parse(fs.readFileSync(dataPath)); }
function save(d) { fs.writeFileSync(dataPath, JSON.stringify(d, null, 2)); }

module.exports = {
  data: new SlashCommandBuilder().setName('pause').setDescription('Mettre un shift en pause'),
  async execute(interaction, client) {
    const data = load();
    const uid = interaction.user.id;
    const username = interaction.member?.displayName || interaction.user.username;
    const shifts = data.shifts || {};
    const mesShifts = Object.entries(shifts).filter(([k, s]) => s.uid === uid && !s.enPause);
    if (mesShifts.length === 0) {
      return interaction.reply({ content: 'Aucun shift actif non en pause.', ephemeral: true });
    }
    const now = Date.now();
    let count = 0;
    const salonId = process.env.CHANNEL_POINTAGE;
    const salon = salonId ? client.channels.cache.get(salonId) : null;
    for (const [shiftKey, shift] of mesShifts) {
      shift.enPause = true;
      shift.debutPause = now;
      data.shifts[shiftKey] = shift;
      count++;
      if (salon && shift.messageId) {
        const msg = await salon.messages.fetch(shift.messageId).catch(() => null);
        if (msg) await msg.edit({
          embeds: [{
            color: 0xFEE75C,
            title: '⏸️ Shift en Pause',
            fields: [
              { name: '🧑‍💻 Chatter', value: username, inline: true },
              { name: '👩 Modele', value: shift.modele, inline: true },
              { name: '📱 Plateforme', value: shift.plateforme, inline: true },
              { name: '⏸️ Pause depuis', value: `<t:${Math.floor(now/1000)}:F>`, inline: true },
            ],
            footer: { text: 'AgencyBot • Pointage' },
            timestamp: new Date(),
          }]
        });
      }
    }
    save(data);
    return interaction.reply({ content: `⏸️ **${username}** a mis ${count} shift(s) en pause.` });
  }
};
