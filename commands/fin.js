const { SlashCommandBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');
const fs = require('fs'), path = require('path');
const dataPath = path.join(__dirname, '../data/shifts.json');
function load() { if (!fs.existsSync(dataPath)) return {}; return JSON.parse(fs.readFileSync(dataPath)); }
function save(d) { fs.writeFileSync(dataPath, JSON.stringify(d, null, 2)); }
const fmt = ms => `${Math.floor(ms/3600000)}h${String(Math.floor((ms%3600000)/60000)).padStart(2,'0')}`;

module.exports = {
  data: new SlashCommandBuilder().setName('fin').setDescription('Terminer un shift'),
  async execute(interaction, client) {
    const data = load();
    const uid = interaction.user.id;
    const shifts = data.shifts || {};
    const mesShifts = Object.entries(shifts).filter(([k, s]) => s.uid === uid);
    if (mesShifts.length === 0) {
      return interaction.reply({ content: 'Tu nas aucun shift actif.', ephemeral: true });
    }
    const modal = new ModalBuilder().setCustomId('modal_fin').setTitle('Fin de Shift');
    const modeleInput = new TextInputBuilder()
      .setCustomId('modele')
      .setLabel('Nom de la modele (quel shift terminer ?)')
      .setStyle(TextInputStyle.Short)
      .setPlaceholder(mesShifts.length === 1 ? mesShifts[0][1].modele : `Shifts: ${mesShifts.map(([,s])=>s.modele).join(', ')}`)
      .setRequired(true);
    const caInput = new TextInputBuilder()
      .setCustomId('ca')
      .setLabel('CA du shift (ex: 120)')
      .setStyle(TextInputStyle.Short)
      .setPlaceholder('Montant en euros')
      .setRequired(true);
    modal.addComponents(
      new ActionRowBuilder().addComponents(modeleInput),
      new ActionRowBuilder().addComponents(caInput)
    );
    await interaction.showModal(modal);
  },
  async handleModal(interaction, client) {
    const data = load();
    const uid = interaction.user.id;
    const username = interaction.member?.displayName || interaction.user.username;
    const modeleSearch = interaction.fields.getTextInputValue('modele').toLowerCase().trim();
    const ca = interaction.fields.getTextInputValue('ca');
    const shifts = data.shifts || {};
    const found = Object.entries(shifts).find(([k, s]) => s.uid === uid && s.modele.toLowerCase().includes(modeleSearch));
    if (!found) {
      return interaction.reply({ content: `Aucun shift actif pour "${modeleSearch}".`, ephemeral: true });
    }
    const [shiftKey, shift] = found;
    const now = Date.now();
    const dureeTotal = now - shift.debut;
    const dureeEffective = dureeTotal - shift.totalPause;
    const embed = {
      color: 0xED4245,
      title: '🔴 Shift Termine',
      fields: [
        { name: '🧑‍💻 Chatter', value: username, inline: true },
        { name: '👩 Modele', value: shift.modele, inline: true },
        { name: '📱 Plateforme', value: shift.plateforme, inline: true },
        { name: '⏰ Debut', value: `<t:${Math.floor(shift.debut/1000)}:F>`, inline: true },
        { name: '🏁 Fin', value: `<t:${Math.floor(now/1000)}:F>`, inline: true },
        { name: '💶 CA du shift', value: `${ca}€`, inline: true },
        { name: '⏱️ Temps total', value: fmt(dureeTotal), inline: true },
        { name: '✅ Temps effectif', value: fmt(dureeEffective), inline: true },
        { name: '⏸️ Pause totale', value: fmt(shift.totalPause), inline: true },
      ],
      footer: { text: 'AgencyBot • Pointage' },
      timestamp: new Date(),
    };
    const salonId = process.env.CHANNEL_POINTAGE;
    const salon = salonId ? client.channels.cache.get(salonId) : null;
    if (salon && shift.messageId) {
      const msg = await salon.messages.fetch(shift.messageId).catch(() => null);
      if (msg) await msg.edit({ embeds: [embed] });
    }
    delete data.shifts[shiftKey];
    save(data);
    // Reponse publique avec l'embed complet
    return interaction.reply({ embeds: [embed] });
  }
};
