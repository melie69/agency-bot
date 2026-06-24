require('dotenv').config();
const { Client, GatewayIntentBits, Collection, Events } = require('discord.js');
const fs = require('fs');
const path = require('path');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

client.commands = new Collection();

const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(f => f.endsWith('.js'));
for (const file of commandFiles) {
  const cmd = require(path.join(commandsPath, file));
  if (cmd.data && cmd.execute) client.commands.set(cmd.data.name, cmd);
}

client.once(Events.ClientReady, () => {
  console.log(`Bot connecte en tant que ${client.user.tag}`);
});

client.on(Events.InteractionCreate, async interaction => {
  if (interaction.isChatInputCommand()) {
    const cmd = client.commands.get(interaction.commandName);
    if (!cmd) return;
    try { await cmd.execute(interaction, client); }
    catch (e) {
      console.error(e);
      const msg = { content: 'Erreur lors de la commande.', ephemeral: true };
      if (interaction.replied || interaction.deferred) await interaction.followUp(msg);
      else await interaction.reply(msg);
    }
  }

  if (interaction.isModalSubmit()) {
    const { customId } = interaction;

    if (customId === 'modal_demande') {
      const cliente = interaction.fields.getTextInputValue('cliente');
      const type = interaction.fields.getTextInputValue('type');
      const prix = interaction.fields.getTextInputValue('prix');
      const details = interaction.fields.getTextInputValue('details');
      const deadline = interaction.fields.getTextInputValue('deadline');
      const salonId = process.env.CHANNEL_DEMANDES;
      const salon = salonId ? client.channels.cache.get(salonId) : null;
      if (salon) {
        await salon.send({
          embeds: [{
            color: 0x5865F2,
            title: 'Nouvelle Demande Personnalisee',
            fields: [
              { name: 'Cliente', value: cliente, inline: true },
              { name: 'Type', value: type, inline: true },
              { name: 'Prix', value: prix, inline: true },
              { name: 'Details', value: details },
              { name: 'Deadline', value: deadline, inline: true },
              { name: 'Cree par', value: `<@${interaction.user.id}>`, inline: true }
            ],
            timestamp: new Date().toISOString()
          }]
        });
      }
      await interaction.reply({ content: 'Demande envoyee !', ephemeral: true });
    }

    if (customId === 'modal_absence') {
      const raison = interaction.fields.getTextInputValue('raison');
      const dateDebut = interaction.fields.getTextInputValue('date_debut');
      const dateFin = interaction.fields.getTextInputValue('date_fin');
      const commentaire = interaction.fields.getTextInputValue('commentaire');
      const salonId = process.env.CHANNEL_ABSENCES;
      const salon = salonId ? client.channels.cache.get(salonId) : null;
      if (salon) {
        await salon.send({
          embeds: [{
            color: 0xED4245,
            title: 'Fiche Absence',
            fields: [
              { name: 'Chatter', value: `<@${interaction.user.id}>`, inline: true },
              { name: 'Raison', value: raison, inline: true },
              { name: 'Du', value: dateDebut, inline: true },
              { name: 'Au', value: dateFin, inline: true },
              { name: 'Commentaire', value: commentaire || 'Aucun' }
            ],
            timestamp: new Date().toISOString()
          }]
        });
      }
      await interaction.reply({ content: 'Fiche absence envoyee !', ephemeral: true });
    }
  }
});

client.login(process.env.TOKEN);
