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
          title: 'Shift Termine',
          description: `<@${uid}> a termine son shift`,
          fields: [
            { name: 'Debut', value: `<t:${Math.floor(data[uid].debut/1000)}:F>`, inline: true },
            { name: 'Fin', value: `<t:${Math.floor(now/1000)}:F>`, inline: true },
            { name: 'Duree totale', value: fmt(dureeTotal), inline: true },
            { name: 'Temps de pause', value: `${Math.floor(data[uid].totalPause/60000)} min`, inline: true },
            { name: 'Temps effectif', value: fmt(dureeEffective), inline: true }
          ],
          timestamp: new Date().toISOString()
        }]
      });
    }
    data[uid] = { actif: false };
    save(data);
    await interaction.reply({ content: `Shift termine ! Duree effective : **${fmt(dureeEffective)}**`, ephemeral: true });
  }
};
