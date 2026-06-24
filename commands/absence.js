const { SlashCommandBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder().setName('absence').setDescription('Declarer une absence'),
  async execute(interaction) {
    const modal = new ModalBuilder().setCustomId('modal_absence').setTitle('Fiche Absence');
    const raison = new TextInputBuilder().setCustomId('raison').setLabel('Raison de labsence').setStyle(TextInputStyle.Short).setRequired(true);
    const dateDebut = new TextInputBuilder().setCustomId('date_debut').setLabel('Date de debut (ex: 25/06/2026)').setStyle(TextInputStyle.Short).setRequired(true);
    const dateFin = new TextInputBuilder().setCustomId('date_fin').setLabel('Date de fin (ex: 27/06/2026)').setStyle(TextInputStyle.Short).setRequired(true);
    const commentaire = new TextInputBuilder().setCustomId('commentaire').setLabel('Commentaire (optionnel)').setStyle(TextInputStyle.Paragraph).setRequired(false);
    modal.addComponents(
      new ActionRowBuilder().addComponents(raison),
      new ActionRowBuilder().addComponents(dateDebut),
      new ActionRowBuilder().addComponents(dateFin),
      new ActionRowBuilder().addComponents(commentaire)
    );
    await interaction.showModal(modal);
  }
};
