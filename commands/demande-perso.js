const { SlashCommandBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder().setName('demande-perso').setDescription('Creer une demande personnalisee'),
  async execute(interaction) {
    const modal = new ModalBuilder().setCustomId('modal_demande').setTitle('Nouvelle Demande Personnalisee');
    const cliente = new TextInputBuilder().setCustomId('cliente').setLabel('Nom de la cliente').setStyle(TextInputStyle.Short).setRequired(true);
    const type = new TextInputBuilder().setCustomId('type').setLabel('Type de contenu').setStyle(TextInputStyle.Short).setRequired(true);
    const prix = new TextInputBuilder().setCustomId('prix').setLabel('Prix propose').setStyle(TextInputStyle.Short).setRequired(true);
    const details = new TextInputBuilder().setCustomId('details').setLabel('Details de la demande').setStyle(TextInputStyle.Paragraph).setRequired(true);
    const deadline = new TextInputBuilder().setCustomId('deadline').setLabel('Deadline').setStyle(TextInputStyle.Short).setRequired(true);
    modal.addComponents(
      new ActionRowBuilder().addComponents(cliente),
      new ActionRowBuilder().addComponents(type),
      new ActionRowBuilder().addComponents(prix),
      new ActionRowBuilder().addComponents(details),
      new ActionRowBuilder().addComponents(deadline)
    );
    await interaction.showModal(modal);
  }
};
