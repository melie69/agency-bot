const { SlashCommandBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder().setName('demande-perso').setDescription('Creer une demande personnalisee'),
  async execute(interaction, client) {
    const modal = new ModalBuilder().setCustomId('modal_demande').setTitle('Demande Personnalisee');
    const cliente = new TextInputBuilder().setCustomId('cliente').setLabel('Nom de la cliente').setStyle(TextInputStyle.Short).setRequired(true);
    const type = new TextInputBuilder().setCustomId('type').setLabel('Type de contenu').setStyle(TextInputStyle.Short).setRequired(true);
    const prix = new TextInputBuilder().setCustomId('prix').setLabel('Prix propose (ex: 25€)').setStyle(TextInputStyle.Short).setRequired(true);
    const details = new TextInputBuilder().setCustomId('details').setLabel('Details de la demande').setStyle(TextInputStyle.Paragraph).setRequired(true);
    const deadline = new TextInputBuilder().setCustomId('deadline').setLabel('Deadline (ex: 24/06)').setStyle(TextInputStyle.Short).setRequired(false);
    modal.addComponents(
      new ActionRowBuilder().addComponents(cliente),
      new ActionRowBuilder().addComponents(type),
      new ActionRowBuilder().addComponents(prix),
      new ActionRowBuilder().addComponents(details),
      new ActionRowBuilder().addComponents(deadline)
    );
    await interaction.showModal(modal);
  },
  async handleModal(interaction, client) {
    const username = interaction.member?.displayName || interaction.user.username;
    const cliente = interaction.fields.getTextInputValue('cliente');
    const type = interaction.fields.getTextInputValue('type');
    const prix = interaction.fields.getTextInputValue('prix');
    const details = interaction.fields.getTextInputValue('details');
    const deadline = interaction.fields.getTextInputValue('deadline') || 'Non specifiee';
    const salonId = process.env.CHANNEL_DEMANDES;
    const salon = salonId ? client.channels.cache.get(salonId) : null;
    if (salon) {
      await salon.send({
        embeds: [{
          color: 0x5865F2,
          title: '📝 Nouvelle Demande Personnalisee',
          fields: [
            { name: 'Chatter', value: username, inline: true },
            { name: 'Cliente', value: cliente, inline: true },
            { name: 'Type de contenu', value: type, inline: true },
            { name: 'Prix propose', value: prix, inline: true },
            { name: 'Deadline', value: deadline, inline: true },
            { name: 'Details', value: details, inline: false },
          ],
          footer: { text: 'AgencyBot • Demandes' },
          timestamp: new Date(),
        }]
      });
    }
    return interaction.reply({ content: '✅ Demande envoyée avec succès !', ephemeral: true });
  }
};
