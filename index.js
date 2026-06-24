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

// Map modal customId -> nom de commande
const modalMap = {
  'modal_debut': 'debut',
  'modal_fin': 'fin',
  'modal_demande': 'demande-perso',
  'modal_absence': 'absence'
};

client.on(Events.InteractionCreate, async interaction => {
  // Slash commands
  if (interaction.isChatInputCommand()) {
    const cmd = client.commands.get(interaction.commandName);
    if (!cmd) return;
    try {
      await cmd.execute(interaction, client);
    } catch (e) {
      console.error(e);
      const msg = { content: 'Erreur lors de lexecution.', ephemeral: true };
      if (interaction.replied || interaction.deferred) await interaction.followUp(msg);
      else await interaction.reply(msg);
    }
  }

  // Modal submissions
  if (interaction.isModalSubmit()) {
    const cmdName = modalMap[interaction.customId];
    if (!cmdName) return;
    const cmd = client.commands.get(cmdName);
    if (!cmd || !cmd.handleModal) return;
    try {
      await cmd.handleModal(interaction, client);
    } catch (e) {
      console.error(e);
      const msg = { content: 'Erreur lors du traitement du formulaire.', ephemeral: true };
      if (interaction.replied || interaction.deferred) await interaction.followUp(msg);
      else await interaction.reply(msg);
    }
  }
});

client.login(process.env.TOKEN);
