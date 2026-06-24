const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs'), path = require('path');
const dataPath = path.join(__dirname, '../data/shifts.json');
function load() { return JSON.parse(fs.readFileSync(dataPath)); }
function save(d) { fs.writeFileSync(dataPath, JSON.stringify(d, null, 2)); }
const fmt = ms => `${Math.floor(ms/3600000)}h${String(Math.floor((ms%3600000)/60000)).padStart(2,'0')}`;

module.exports = {
  data: new SlashCommandBuilder().setName('fin').setDescription('Terminer son shift'),
  async execute(interaction, client) {
    const data = load();
    const uid = interaction.user.id;
    const username = interaction.member?.displayName || interaction.user.username;
    if (!data[uid]?.actif) return interaction.reply({ content: 'Pas de shift actif.', ephemeral: true });
    const now = Date.now();
    const dureeTotal = now - data[uid].debut;
    const dureeEffective = dureeTotal - data[uid].totalPause;
    const salonId = process.env.CHANNEL_POINTAGE;
    const salon = salonId ? client.channels.cache.get(salonId) : null;
    if (salon && data[uid].messageId) {
      const msg = await salon.messages.fetch(data[uid].messageId).catch(() => null);
      if (msg) await msg.edit({
        embeds: [{
          color: 0xED4245,
          title: '🔴 Shift terminé',
          fields: [
            { name: 'Chatter', value: username, inline: true },
            { name: 'Debut', value: `<t:${Math.floor(data[uid].debut/1000)}:F>`, inline: true },
            { name: 'Fin', value: `<t:${Math.floor(now/1000)}:F>`, inline: true },
            { name: 'Temps total', value: fmt(dureeTotal), inline: true },
            { name: 'Temps effectif', value: fmt(dureeEffective), inline: true },
            { name: 'Pause totale', value: fmt(data[uid].totalPause), inline: true },
          ],
          footer: { text: 'AgencyBot • Pointage' },
          timestamp: new Date(),
        }]
      });
    }
    delete data[uid];
    save(data);
    return interaction.reply({ content: `🔴 Shift terminé, **${username}** ! Temps effectif : **${fmt(dureeEffective)}**.`, ephemeral: true });
  }
};
