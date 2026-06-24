const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs'), path = require('path');
const dataPath = path.join(__dirname, '../data/shifts.json');
function load() { return JSON.parse(fs.readFileSync(dataPath)); }
function save(d) { fs.writeFileSync(dataPath, JSON.stringify(d, null, 2)); }

module.exports = {
  data: new SlashCommandBuilder().setName('pause').setDescription('Declarer une pause'),
  async execute(interaction, client) {
    const data = load();
    const uid = interaction.user.id;
    const username = interaction.member?.displayName || interaction.user.username;
    if (!data[uid]?.actif) return interaction.reply({ content: 'Pas de shift actif.', ephemeral: true });
    if (data[uid].enPause) return interaction.reply({ content: 'Tu es deja en pause.', ephemeral: true });
    const now = Date.now();
    data[uid].enPause = true;
    data[uid].debutPause = now;
    save(data);
    const salonId = process.env.CHANNEL_POINTAGE;
    const salon = salonId ? client.channels.cache.get(salonId) : null;
    if (salon && data[uid].messageId) {
      const msg = await salon.messages.fetch(data[uid].messageId).catch(() => null);
      if (msg) await msg.edit({
        embeds: [{
          color: 0xFEE75C,
          title: '⏸️ En Pause',
          fields: [
            { name: 'Chatter', value: username, inline: true },
            { name: 'Pause depuis', value: `<t:${Math.floor(now/1000)}:F>`, inline: true },
            { name: 'Statut', value: '⏸️ Pause', inline: true },
          ],
          footer: { text: 'AgencyBot • Pointage' },
          timestamp: new Date(),
        }]
      });
    }
    return interaction.reply({ content: `⏸️ Pause enregistrée, **${username}**. Repose-toi bien !`, ephemeral: true });
  }
};
