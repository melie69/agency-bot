const { SlashCommandBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder().setName('absence').setDescription('Declarer une absence'),
  async execute(interaction, client) {
    const modal = new ModalBuilder().setCustomId('modal_absence').setTitle('Fiche Absence');
    const raison = new TextInputBuilder().setCustomId('raison').setLabel('Raison de labsence').setStyle(TextInputStyle.Short).setRequired(true);
    const descriptif = new TextInputBuilder().setCustomId('descriptif').setLabel('Descriptif (details, contexte...)').setStyle(TextInputStyle.Paragraph).setRequired(false);
    const dateDebut = new TextInputBuilder().setCustomId('date_debut').setLabel('Date de debut (ex: 25/06/2026)').setStyle(TextInputStyle.Short).setRequired(true);
    const dateFin = new TextInputBuilder().setCustomId('date_fin').setLabel('Date de fin (ex: 27/06/2026)').setStyle(TextInputStyle.Short).setRequired(true);
    modal.addComponents(
      new ActionRowBuilder().addComponents(raison),
      new ActionRowBuilder().addComponents(descriptif),
      new ActionRowBuilder().addComponents(dateDebut),
      new ActionRowBuilder().addComponents(dateFin)
    );
    await interaction.showModal(modal);
  },
  async handleModal(interaction, client) {
    const username = interaction.member?.displayName || interaction.user.username;
    const raison = interaction.fields.getTextInputValue('raison');
    const descriptif = interaction.fields.getTextInputValue('descriptif') || 'Aucun detail fourni';
    const dateDebut = interaction.fields.getTextInputValue('date_debut');
    const dateFin = interaction.fields.getTextInputValue('date_fin');
    const embed = {
      color: 0xED4245,
      title: '🗓️ Fiche Absence',
      fields: [
        { name: '🧑‍💻 Chatter', value: username, inline: true },
        { name: '📌 Raison', value: raison, inline: true },
        { name: '📅 Du', value: dateDebut, inline: true },
        { name: '📅 Au', value: dateFin, inline: true },
        { name: '💬 Descriptif', value: descriptif, inline: false },
      ],
      footer: { text: 'AgencyBot • Absences' },
      timestamp: new Date(),
    };
    // Poster aussi dans le salon absences si different du salon courant
    const salonId = process.env.CHANNEL_ABSENCES;
    const salon = salonId ? client.channels.cache.get(salonId) : null;
    if (salon && salon.id !== interaction.channelId) {
      await salon.send({ embeds: [embed] });
    }
    // Reponse publique avec l'embed complet visible de tous
    return interaction.reply({ embeds: [embed] });
  }
};
