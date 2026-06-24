const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs'), path = require('path');
const dataPath = path.join(__dirname, '../data/shifts.json');
function load() { if (!fs.existsSync(dataPath)) { fs.mkdirSync(path.dirname(dataPath), {recursive:true}); fs.writeFileSync(dataPath, '{}'); } return JSON.parse(fs.readFileSync(dataPath)); }
function save(d) { fs.writeFileSync(dataPath, JSON.stringify(d, null, 2)); }

module.exports = {
  data: new SlashCommandBuilder().setName('debut').setDescription('Declarer le debut de ton shift'),
  async execute(interaction, client) {
    const data = load();
    const uid = interaction.user.id;
    const username = interaction.member?.displayName || interaction.user.username;
    const now = Date.now();
    if (data[uid]?.actif) return interaction.reply({ content: 'Tu as deja un shift en cours ! Fais /fin dabord.', ephemeral: true });
    data[uid] = { actif: true, debut: now, totalPause: 0, enPause: false, messageId: null, username };
    save(data);
    const salonId = process.env.CHANNEL_POINTAGE;
    const salon = salonId ? client.channels.cache.get(salonId) : null;
    if (salon) {
      const msg = await salon.send({
        embeds: [{
          color: 0x57F287,
          title: '🟢 Shift en cours',
          fields: [
            { name: 'Chatter', value: username, inline: true },
            { name: 'Debut', value: `<t:${Math.floor(now/1000)}:F>`, inline: true },
            { name: 'Statut', value: '✅ En service', inline: true },
          ],
          footer: { text: 'AgencyBot • Pointage' },
          timestamp: new Date(),
        }]
      });
      data[uid].messageId = msg.id;
      save(data);
    }
    return interaction.reply({ content: `✅ Shift démarré, **${username}** ! Bonne session.`, ephemeral: true });
  }
};
