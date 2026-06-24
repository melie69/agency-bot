const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs'), path = require('path');
const dataPath = path.join(__dirname, '../data/shifts.json');
function load() { if (!fs.existsSync(dataPath)) return {}; return JSON.parse(fs.readFileSync(dataPath)); }
function save(d) { fs.writeFileSync(dataPath, JSON.stringify(d, null, 2)); }

module.exports = {
  data: new SlashCommandBuilder().setName('reprise').setDescription('Reprendre apres une pause'),
  async execute(interaction, client) {
    const data = load();
    const uid = interaction.user.id;
    const username = interaction.member?.displayName || interaction.user.username;
    const shifts = data.shifts || {};
    const mesShiftsPauses = Object.entries(shifts).filter(([k, s]) => s.uid === uid && s.enPause);
    if (mesShiftsPauses.length === 0) {
      return interaction.reply({ content: 'Aucun shift en pause.', ephemeral: true });
    }
    const now = Date.now();
    let count = 0;
    const salonId = process.env.CHANNEL_POINTAGE;
    const salon = salonId ? client.channels.cache.get(salonId) : null;
    for (const [shiftKey, shift] of mesShiftsPauses) {
      shift.totalPause += now - shift.debutPause;
      shift.enPause = false;
      shift.debutPause = null;
      data.shifts[shiftKey] = shift;
      count++;
      if (salon && shift.messageId) {
        const msg = await salon.messages.fetch(shift.messageId).catch(() => null);
        if (msg) await msg.edit({
          embeds: [{
            color: 0x57F287,
            title: '▶️ Shift Repris',
            fields: [
              { name: '🧑‍💻 Chatter', value: username, inline: true },
              { name: '👩 Modele', value: shift.modele, inline: true },
              { name: '📱 Plateforme', value: shift.plateforme, inline: true },
              { name: '▶️ Reprise', value: `<t:${Math.floor(now/1000)}:F>`, inline: true },
            ],
            footer: { text: 'AgencyBot • Pointage' },
            timestamp: new Date(),
          }]
        });
      }
    }
    save(data);
    return interaction.reply({ content: `▶️ **${username}** a repris ${count} shift(s).` });
  }
};
