const { SlashCommandBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');
const fs = require('fs'), path = require('path');
const dataPath = path.join(__dirname, '../data/shifts.json');
function load() { if (!fs.existsSync(dataPath)) { fs.mkdirSync(path.dirname(dataPath), {recursive:true}); fs.writeFileSync(dataPath, '{}'); } return JSON.parse(fs.readFileSync(dataPath)); }
function save(d) { fs.writeFileSync(dataPath, JSON.stringify(d, null, 2)); }

module.exports = {
  data: new SlashCommandBuilder().setName('debut').setDescription('Declarer le debut dun shift'),
  async execute(interaction, client) {
    const modal = new ModalBuilder().setCustomId('modal_debut').setTitle('Debut de Shift');
    const modele = new TextInputBuilder().setCustomId('modele').setLabel('Nom de la modele').setStyle(TextInputStyle.Short).setRequired(true);
    const plateforme = new TextInputBuilder().setCustomId('plateforme').setLabel('Plateforme (ex: OnlyFans, MYM...)').setStyle(TextInputStyle.Short).setRequired(true);
    modal.addComponents(
      new ActionRowBuilder().addComponents(modele),
      new ActionRowBuilder().addComponents(plateforme)
    );
    await interaction.showModal(modal);
  },
  async handleModal(interaction, client) {
    const data = load();
    const uid = interaction.user.id;
    const username = interaction.member?.displayName || interaction.user.username;
    const modele = interaction.fields.getTextInputValue('modele');
    const plateforme = interaction.fields.getTextInputValue('plateforme');
    const now = Date.now();
    const shiftKey = `${uid}_${now}`;
    if (!data.shifts) data.shifts = {};
    data.shifts[shiftKey] = { uid, username, modele, plateforme, debut: now, totalPause: 0, enPause: false, debutPause: null, messageId: null };
    save(data);
    const embed = {
      color: 0x57F287,
      title: '🟢 Shift Demarre',
      fields: [
        { name: '🧑‍💻 Chatter', value: username, inline: true },
        { name: '👩 Modele', value: modele, inline: true },
        { name: '📱 Plateforme', value: plateforme, inline: true },
        { name: '⏰ Debut', value: `<t:${Math.floor(now/1000)}:F>`, inline: true },
        { name: '📊 Statut', value: '✅ En service', inline: true },
      ],
      footer: { text: `AgencyBot • Pointage • ID: ${shiftKey}` },
      timestamp: new Date(),
    };
    const salonId = process.env.CHANNEL_POINTAGE;
    const salon = salonId ? client.channels.cache.get(salonId) : null;
    if (salon && salon.id !== interaction.channelId) {
      const msg = await salon.send({ embeds: [embed] });
      data.shifts[shiftKey].messageId = msg.id;
      save(data);
    }
    // Reponse publique dans le salon courant avec embed complet
    const reply = await interaction.reply({ embeds: [embed], fetchReply: true });
    if (!data.shifts[shiftKey].messageId) {
      data.shifts[shiftKey].messageId = reply.id;
      save(data);
    }
  }
};
