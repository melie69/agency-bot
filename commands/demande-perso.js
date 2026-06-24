const { SlashCommandBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder().setName('demande-perso').setDescription('Creer une demande personnalisee'),
  async execute(interaction, client) {
    const modal = new ModalBuilder().setCustomId('modal_demande').setTitle('Demande Personnalisee');
    const modele = new TextInputBuilder().setCustomId('modele').setLabel('Nom de la modele').setStyle(TextInputStyle.Short).setRequired(true);
    const fans = new TextInputBuilder().setCustomId('fans').setLabel('Nom du fans').setStyle(TextInputStyle.Short).setRequired(true);
    const plateforme = new TextInputBuilder().setCustomId('plateforme').setLabel('Plateforme (ex: OnlyFans, MYM...)').setStyle(TextInputStyle.Short).setRequired(true);
    const type = new TextInputBuilder().setCustomId('type').setLabel('Type de contenu').setStyle(TextInputStyle.Short).setRequired(true);
    const details = new TextInputBuilder().setCustomId('details').setLabel('Prix propose + details de la demande').setStyle(TextInputStyle.Paragraph).setRequired(true);
    modal.addComponents(
      new ActionRowBuilder().addComponents(modele),
      new ActionRowBuilder().addComponents(fans),
      new ActionRowBuilder().addComponents(plateforme),
      new ActionRowBuilder().addComponents(type),
      new ActionRowBuilder().addComponents(details)
    );
    await interaction.showModal(modal);
  },
  async handleModal(interaction, client) {
    const username = interaction.member?.displayName || interaction.user.username;
    const modele = interaction.fields.getTextInputValue('modele');
    const fans = interaction.fields.getTextInputValue('fans');
    const plateforme = interaction.fields.getTextInputValue('plateforme');
    const type = interaction.fields.getTextInputValue('type');
    const details = interaction.fields.getTextInputValue('details');
    const salonId = process.env.CHANNEL_DEMANDES;
    const salon = salonId ? client.channels.cache.get(salonId) : null;
    if (salon) {
      await salon.send({
        embeds: [{
          color: 0x5865F2,
          title: '📝 Nouvelle Demande Personnalisee',
          fields: [
            { name: '🧑‍💻 Chatter', value: username, inline: true },
            { name: '👩 Modele', value: modele, inline: true },
            { name: '👤 Fans', value: fans, inline: true },
            { name: '📱 Plateforme', value: plateforme, inline: true },
            { name: '🎥 Type de contenu', value: type, inline: true },
            { name: '💬 Details & Prix', value: details, inline: false },
          ],
          footer: { text: 'AgencyBot • Demandes' },
          timestamp: new Date(),
        }]
      });
    }
    return interaction.reply({ content: '✅ Demande envoyée !', ephemeral: true });
  }
};
