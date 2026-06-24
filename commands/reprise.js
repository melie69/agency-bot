const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs'), path = require('path');
const dataPath = path.join(__dirname, '../data/shifts.json');
function load() { return JSON.parse(fs.readFileSync(dataPath)); }
function save(d) { fs.writeFileSync(dataPath, JSON.stringify(d, null, 2)); }

module.exports = {
  data: new SlashCommandBuilder().setName('reprise').setDescription('Reprendre apres une pause'),
  async execute(interaction, client) {
    const data = load();
    const uid = interaction.user.id;
    const username = interaction.member?.displayName || interaction.user.username;
    if (!data[uid]?.actif) return interaction.reply({ content: 'Pas de shift actif.', ephemeral: true });
    if (!data[uid].enPause) return interaction.reply({ content: 'Tu nes pas en pause.', ephemeral: true });
    const now = Date.now();
    data[uid].totalPause += now - data[uid].debutPause;
    data[uid].enPause = false;
    data[uid].debutPause = null;
    save(data);
    const salonId = process.env.CHANNEL_POINTAGE;
    const salon = salonId ? client.channels.cache.get(salonId) : null;
    if (salon && data[uid].messageId) {
      const msg = await salon.messages.fetch(data[uid].messageId).catch(() => null);
      if (msg) await msg.edit({
        embeds: [{
          color: 0x57F287,
          title: '🟢 Shift en cours',
          fields: [
            { name: 'Chatter', value: username, inline: true },
            { name: 'Reprise', value: `<t:${Math.floor(now/1000)}:F>`, inline: true },
            { name: 'Statut', value: '▶️ En service', inline: true },
          ],
          footer: { text: 'AgencyBot • Pointage' },
          timestamp: new Date(),
        }]
      });
    }
    return interaction.reply({ content: `▶️ Reprise enregistrée, **${username}** !`, ephemeral: true });
  }
};
