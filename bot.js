//Datei-Einstellungen
const fetch = require("@replit/node-fetch");
const Discord = require("discord.js");
const editJsonFile = require("edit-json-file");
const { EmbedBuilder, PermissionBitFlags } = require("@discordjs/builders");
const env = require("dotenv").config();
const http = require("http");
//Server-Einstellungen
const server = http.createServer((req, res) => {
    res.write("TicketsTM");
});
server.listen();
const FARBE = Discord.Colors;
//Datenbank-Einstellungen
const SERVERS = editJsonFile("Daten/servers.json");
//Funktionen
function getDifferenceInDates(date1, date2) {
    const diffInMs = Math.abs(date2 - date1);
    let ergebnis = diffInMs / (1000 * 60 * 60 * 24);
    if (ergebnis >= 1 && ergebnis < 2) {
      return String(Math.round(ergebnis) + " Tag");
    } else if(ergebnis >= 2) {
      return String(Math.round(ergebnis) + " Tagen");
    } else if (ergebnis < 1) {
      ergebnis = diffInMs / (1000 * 60 * 60);
      if (ergebnis >= 1 && ergebnis < 2) {
          return String(Math.round(ergebnis) + " Stunde");
      } else if (ergebnis >= 2) {
          return String(Math.round(ergebnis) + " Stunden");
      } else if (ergebnis < 1) {
          ergebnis = diffInMs / (1000 * 60);
          if (ergebnis >= 1 && ergebnis <=2) {
              return String(Math.round(ergebnis) + " Minute");
          } else if (ergebnis >= 2) {
              return String(Math.round(ergebnis) + " Minuten");
          } else if (ergebnis < 1) {
              ergebnis = diffInMs / 1000;
              if (ergebnis >=1 && ergebnis < 2) {
                  return String(Math.round(ergebnis) + " Sekunde");
              } else if (ergebnis >= 2) {
                  return String(Math.round(ergebnis) + " Sekunden");
              } else if (ergebnis < 1) {
                  return String(ergebnis + " Millisekunden");
              }
          }
      }
    }
};
function intToString(num) {
    num = num.toString().replace(/[^0-9.]/g, '');
    if (num < 1000) {
        return num;
    }
    let si = [
      {v: 1E3, s: "K"},
      {v: 1E6, s: "M"},
      {v: 1E9, s: "B"},
      {v: 1E12, s: "T"},
      {v: 1E15, s: "P"},
      {v: 1E18, s: "E"}
      ];
    let index;
    for (index = si.length - 1; index > 0; index--) {
        if (num >= si[index].v) {
            break;
        }
    }
    return (num / si[index].v).toFixed(2).replace(/\.0+$|(\.[0-9]*[1-9])0+$/, "$1") + si[index].s;
};
//Client-Einstellungen
const client = new Discord.Client(
    {
        partials: [
            Discord.Partials.Channel,
            Discord.Partials.GuildMember,
            Discord.Partials.Message,
            Discord.Partials.Reaction,
            Discord.Partials.ThreadMember,
            Discord.Partials.GuildScheduledEvent
        ],
        intents: [
            Discord.GatewayIntentBits.Guilds,
            Discord.GatewayIntentBits.DirectMessages,
            Discord.GatewayIntentBits.GuildBans,
            Discord.GatewayIntentBits.GuildEmojisAndStickers,
            Discord.GatewayIntentBits.GuildIntegrations,
            Discord.GatewayIntentBits.GuildInvites,
            Discord.GatewayIntentBits.GuildMembers,
            Discord.GatewayIntentBits.GuildMessages,
            Discord.GatewayIntentBits.GuildMessageReactions,
            Discord.GatewayIntentBits.MessageContent,
            Discord.IntentsBitField.Flags.Guilds,
            Discord.IntentsBitField.Flags.GuildBans,
            Discord.IntentsBitField.Flags.DirectMessages,
            Discord.IntentsBitField.Flags.GuildEmojisAndStickers,
            Discord.IntentsBitField.Flags.GuildInvites,
            Discord.IntentsBitField.Flags.GuildMembers,
            Discord.IntentsBitField.Flags.GuildMessages,
            Discord.IntentsBitField.Flags.MessageContent
        ]
    }
);
//Client-Start
client.on("ready", function(){
    let embed = new EmbedBuilder()
    .setColor(FARBE.Green)
    .setDescription(`Ich bin wieder online! \n\n Datum: ${new Date}\n Nutzer: ${client.users.cache.size} \n Server: ${client.guilds.cache.size} \n Channel: ${client.channels.cache.size} \n Emojis: ${client.emojis.cache.size}`)
    .setAuthor({name: client.user.username, iconURL: client.user.avatarURL({forceStatic: false})})
    client.guilds.cache.get("979301372333805628").channels.cache.get("1068600931157016586").send({embeds: [embed]})
});
//Client-Wiederverbinden
client.on("shardReconnecting", function(){
    console.log("Es wird versucht sich erneut mit dem WebSocket zu verbinden!");
});
//Client-Wiederverbunden
client.on("shardResume", function(){
    console.log("Der Bot hat sich wieder verbunden!")
});
//Client-Warnung
client.on("warn", function(info){
    console.log(`Warnung: ${info}`);
});
//Client-Verbindungsabbruch
client.on("shardDisconnect", function(event){
    console.log("Der Bot hat die Verbindung abgebrochen und wird sie nicht mehr eigenständig aufnehmen!");
});
//Client-Fehler
client.on("error", function(error){
    console.log(`Ein Verbindungsfehler ist aufgetreten: ${error}`);
});
client.login(process.env["TOKEN"]);
//Wichtige Variablen
const SERVER = client.guilds.cache.get("979301372333805628");

// Bot-Events
client.on("guildCreate", async (guild) => {
    SERVERS.set(guild.id,
        guild.toJSON());
    SERVERS.save();
    SERVERS.set(`${guild.id}.logs`, false);
    SERVERS.save();
});

// Commands
client.on("interactionCreate", async (interaction) => {
    if (interaction.isCommand()) {
        if (interaction.commandName === "log-channel") {
            await interaction.options.getChannel("channel", true);
            let channel = interaction.options.getChannel("channel", true).id;
            SERVERS.set(`${interaction.guild.id}.logs`, channel);
            SERVERS.save();
            if (SERVERS.get(`${interaction.guild.id}.logs`) != undefined) {
                interaction.reply({ content: "Success!", ephemeral: true });
            } else {
                interaction.reply({ content: "There where an error!", ephemeral: true });
            }
        }
    }
})
// Custom Log-Events
// Auto-Mod
client.on("autoModerationRuleCreate", async (autoModerationRule) => {
    let embed = new EmbedBuilder()
    .setColor(FARBE.Green)
    .setTimestamp();
    embed.setFooter({ iconURL: client.user.avatarURL({ forceStatic: false }), text: "Logs brought to you by LogsTM" });
    if (autoModerationRule.guild.preferredLocale.includes("de")) {
        embed.setDescription("Eine neue Auto-Mod-Regel wurde soeben erstellt!");
        embed.addFields(
            { name: "Name", value: `${autoModerationRule.name}`, inline: false },
            { name: "ID", value: `${autoModerationRule.id}`, inline: false },
            { name: "Ersteller-Name", value: `${autoModerationRule.guild.members.cache.get(autoModerationRule.creatorId).user.username} (${autoModerationRule.creatorId})`, inline: false},
            { name: "Aktionen", value: `${autoModerationRule.actions.toLocaleString()}`, inline: false },
            { name: "Trigger-Typ", value: `${autoModerationRule.triggerType}`, inline: false },
            { name: "Trigger Meta Data", value: `${autoModerationRule.triggerMetadata}`, inline: false },
            { name: "Event-Typ", value: `${autoModerationRule.eventType.toLocaleString()}`, inline: false },
            { name: "befreite Kanäle", value: autoModerationRule.exemptChannels.values.toString(), inline: false },
            { name: "befreite Rollen", value: autoModerationRule.exemptRoles.values.toString(), inline: false }
        );
        embed.setTitle("Auto-Mod-Regel erstellt!");
    } else {
        embed.setDescription("A new Auto-Mod-Rule was created!");
        embed.addFields(
            { name: "name", value: `${autoModerationRule.name}`, inline: false },
            { name: "id", value: `${autoModerationRule.id}`, inline: false },
            { name: "creator-name", value: `${autoModerationRule.guild.members.cache.get(autoModerationRule.creatorId).user.username} (${autoModerationRule.creatorId})`, inline: false},
            { name: "actions", value: `${autoModerationRule.actions.toLocaleString()}`, inline: false },
            { name: "trigger-type", value: `${autoModerationRule.triggerType}`, inline: false },
            { name: "trigger meta data", value: `${autoModerationRule.triggerMetadata}`, inline: false },
            { name: "event-type", value: `${autoModerationRule.eventType.toLocaleString()}`, inline: false },
            { name: "exempted channels", value: autoModerationRule.exemptChannels.values.toString(), inline: false },
            { name: "exempted roles", value: autoModerationRule.exemptRoles.values.toString(), inline: false }
        );
        embed.setTitle("Auto-Mod-Rule created!");
    };
    if (SERVERS.get(`${autoModerationRule.guild.id}.logs`)) {
        autoModerationRule.guild.channels.cache.get(SERVERS.get(`${autoModerationRule.guild.id}.logs`)).send({ embeds: [ embed ] });
    };
});
client.on("autoModerationRuleDelete", async (autoModerationRule) => {
    let embed = new EmbedBuilder()
    .setColor(FARBE.Red)
    .setTimestamp();
    embed.setFooter({ iconURL: client.user.avatarURL({ forceStatic: false }), text: "Logs brought to you by LogsTM" });
    if (autoModerationRule.guild.preferredLocale.includes("de")) {
        embed.setDescription("Eine Auto-Mod-Regel wurde gerade gelöscht!");
        const fetchedLogs = await autoModerationRule.guild.fetchAuditLogs({
            limit: 1,
            type: Discord.AuditLogEvent.AutoModerationRuleDelete
        });
        const deletionLog = fetchedLogs.entries.first();
        const { executor, target } = deletionLog;
        embed.addFields(
            { name: "Name", value: `${autoModerationRule.name}`, inline: false },
            { name: "ID", value: `${autoModerationRule.id}`, inline: false },
            { name: "Ersteller-Name", value: `${autoModerationRule.guild.members.cache.get(autoModerationRule.creatorId).user.username} (${autoModerationRule.creatorId})`, inline: false},
            { name: "Aktionen", value: `${autoModerationRule.actions.toLocaleString()}`, inline: false },
            { name: "Trigger-Typ", value: `${autoModerationRule.triggerType}`, inline: false },
            { name: "Trigger Meta Data", value: `${autoModerationRule.triggerMetadata}`, inline: false },
            { name: "Event-Typ", value: `${autoModerationRule.eventType.toLocaleString()}`, inline: false },
            { name: "befreite Kanäle", value: autoModerationRule.exemptChannels.values.toString(), inline: false },
            { name: "befreite Rollen", value: autoModerationRule.exemptRoles.values.toString(), inline: false },
            { name: "Gelöscht durch", value: `${autoModerationRule.guild.members.cache.get(executor.id).user.username} (${executor.id})`, inline: false }
        );
        embed.setTitle("Auto-Mod-Regel gelöscht!");
    } else {
        embed.setDescription("An Auto-Mod-Rule was deleted!");
        embed.addFields(
            { name: "name", value: `${autoModerationRule.name}`, inline: false },
            { name: "id", value: `${autoModerationRule.id}`, inline: false },
            { name: "creator-name", value: `${autoModerationRule.guild.members.cache.get(autoModerationRule.creatorId).user.username} (${autoModerationRule.creatorId})`, inline: false},
            { name: "actions", value: `${autoModerationRule.actions.toLocaleString()}`, inline: false },
            { name: "trigger-type", value: `${autoModerationRule.triggerType}`, inline: false },
            { name: "trigger meta data", value: `${autoModerationRule.triggerMetadata}`, inline: false },
            { name: "event-type", value: `${autoModerationRule.eventType.toLocaleString()}`, inline: false },
            { name: "exempted channels", value: autoModerationRule.exemptChannels.values.toString(), inline: false },
            { name: "exempted roles", value: autoModerationRule.exemptRoles.values.toString(), inline: false },
            { name: "deleted by", value: `${autoModerationRule.guild.members.cache.get(executor.id).user.username} (${executor.id})`, inline: false }
        );
        embed.setTitle("Auto-Mod-Rule deleted!");
    };
    if (SERVERS.get(`${autoModerationRule.guild.id}.logs`)) {
        autoModerationRule.guild.channels.cache.get(SERVERS.get(`${autoModerationRule.guild.id}.logs`)).send({ embeds: [ embed ] });
    };
});
client.on("autoModerationRuleUpdate", async (oldAutoModerationRule, newAutoModerationRule) => {
    let embed = new EmbedBuilder()
    .setColor(FARBE.Grey)
    .setTimestamp();
    embed.setFooter({ iconURL: client.user.avatarURL({ forceStatic: false }), text: "Logs brought to you by LogsTM" });
    if (newAutoModerationRule.guild.preferredLocale.includes("de")) {
        embed.setDescription("Eine Auto-Mod-Regel wurde gerade gelöscht!");
        const fetchedLogs = await newAutoModerationRule.guild.fetchAuditLogs({
            limit: 1,
            type: Discord.AuditLogEvent.AutoModerationRuleUpdate
        });
        const deletionLog = fetchedLogs.entries.first();
        const { executor, target } = deletionLog;
        embed.addFields(
            { name: "Vorher: ", value: "", inline: false },
            { name: "Name", value: `${oldAutoModerationRule.name}`, inline: true },
            { name: "ID", value: `${oldAutoModerationRule.id}`, inline: false },
            { name: "Ersteller-Name", value: `${oldAutoModerationRule.guild.members.cache.get(oldAutoModerationRule.creatorId).user.username} (${oldAutoModerationRule.creatorId})`, inline: false},
            { name: "Aktionen", value: `${oldAutoModerationRule.actions.toLocaleString()}`, inline: false },
            { name: "Trigger-Typ", value: `${oldAutoModerationRule.triggerType}`, inline: false },
            { name: "Trigger Meta Data", value: `${oldAutoModerationRule.triggerMetadata}`, inline: false },
            { name: "Event-Typ", value: `${oldAutoModerationRule.eventType.toLocaleString()}`, inline: false },
            { name: "befreite Kanäle", value: oldAutoModerationRule.exemptChannels.values.toString(), inline: false },
            { name: "befreite Rollen", value: oldAutoModerationRule.exemptRoles.values.toString(), inline: false },
            { name: "Nachher: ", value: "", inline: false },
            { name: "Name", value: `${newAutoModerationRule.name}`, inline: true },
            { name: "ID", value: `${newAutoModerationRule.id}`, inline: false },
            { name: "Ersteller-Name", value: `${newAutoModerationRule.guild.members.cache.get(newAutoModerationRule.creatorId).user.username} (${newAutoModerationRule.creatorId})`, inline: false},
            { name: "Aktionen", value: `${newAutoModerationRule.actions.toLocaleString()}`, inline: false },
            { name: "Trigger-Typ", value: `${newAutoModerationRule.triggerType}`, inline: false },
            { name: "Trigger Meta Data", value: `${newAutoModerationRule.triggerMetadata}`, inline: false },
            { name: "Event-Typ", value: `${newAutoModerationRule.eventType.toLocaleString()}`, inline: false },
            { name: "befreite Kanäle", value: newAutoModerationRule.exemptChannels.values.toString(), inline: false },
            { name: "befreite Rollen", value: newAutoModerationRule.exemptRoles.values.toString(), inline: false },
            { name: "Geändert durch", value: `${newAutoModerationRule.guild.members.cache.get(executor.id).user.username} (${executor.id})`, inline: false },
        );
        embed.setTitle("Auto-Mod-Regel geupdated!");
    } else {
        embed.setDescription("An Auto-Mod-Rule was updated!");
        embed.addFields(
            { name: "before: ", value: "", inline: false },
            { name: "name", value: `${oldAutoModerationRule.name}`, inline: true },
            { name: "id", value: `${oldAutoModerationRule.id}`, inline: false },
            { name: "creator-name", value: `${oldAutoModerationRule.guild.members.cache.get(oldAutoModerationRule.creatorId).user.username} (${oldAutoModerationRule.creatorId})`, inline: false},
            { name: "actions", value: `${oldAutoModerationRule.actions.toLocaleString()}`, inline: false },
            { name: "trigger-type", value: `${oldAutoModerationRule.triggerType}`, inline: false },
            { name: "trigger meta data", value: `${oldAutoModerationRule.triggerMetadata}`, inline: false },
            { name: "event-type", value: `${oldAutoModerationRule.eventType.toLocaleString()}`, inline: false },
            { name: "exempted channels", value: oldAutoModerationRule.exemptChannels.values.toString(), inline: false },
            { name: "exempted roles", value: oldAutoModerationRule.exemptRoles.values.toString(), inline: false },
            { name: "after: ", value: "", inline: false },
            { name: "name", value: `${newAutoModerationRule.name}`, inline: true },
            { name: "id", value: `${newAutoModerationRule.id}`, inline: false },
            { name: "creator-name", value: `${newAutoModerationRule.guild.members.cache.get(newAutoModerationRule.creatorId).user.username} (${newAutoModerationRule.creatorId})`, inline: false},
            { name: "actions", value: `${newAutoModerationRule.actions.toLocaleString()}`, inline: false },
            { name: "trigger-type", value: `${newAutoModerationRule.triggerType}`, inline: false },
            { name: "trigger-meta-data", value: `${newAutoModerationRule.triggerMetadata}`, inline: false },
            { name: "event-type", value: `${newAutoModerationRule.eventType.toLocaleString()}`, inline: false },
            { name: "exempted channels", value: newAutoModerationRule.exemptChannels.values.toString(), inline: false },
            { name: "exempted roles", value: newAutoModerationRule.exemptRoles.values.toString(), inline: false },
            { name: "changed by", value: `${newAutoModerationRule.guild.members.cache.get(executor.id).user.username} (${executor.id})`, inline: false },
        );
        embed.setTitle("Auto-Mod-Rule updated!");
    };
    if (SERVERS.get(`${newAutoModerationRule.guild.id}.logs`)) {
        newAutoModerationRule.guild.channels.cache.get(SERVERS.get(`${newAutoModerationRule.guild.id}.logs`)).send({ embeds: [ embed ] });
    };
});
// Nachrichten
client.on("messageCreate", async (message) => {
    let embed = new EmbedBuilder()
    .setColor(FARBE.Green)
    .setTimestamp();
    embed.setFooter({ iconURL: client.user.avatarURL({ forceStatic: false }), text: "Logs brought to you by LogsTM" });
    if (autoModerationRule.guild.preferredLocale.includes("de")) {
        embed.setDescription("Eine neue Nachricht gesendet!");
        embed.addFields(
            { name: "Inhalt", value: message.content, inline: false },
            { name: "Nachrichten-ID", value: message.id, inline: false },
            { name: "Autor", value: `${message.guild.members.cache.get(message.author.id).user.username} (${message.author.id})`, inline: false },
            { name: "Kanal", value: `${message.channel.name} (${message.channel.id})`, inline: false },
            { name: `Thread?`, value: `${message.hasThread}`, inline: false },
            { name: `Anhänge`, value: `${message.attachments.entries.toString()}`, inline: false },
            { name: "Reaktionen", value: `${message.reactions.cache.entries.toString()}`, inline: false },
            { name: "Erwähnungen", value: `${message.mentions.toJSON()}`, inline: false },
        );
        embed.setTitle("Neue Nachricht gesendet!");
    } else {
        embed.setDescription("A new message was sent!");
        embed.addFields(
            { name: "content", value: message.content, inline: false },
            { name: "message-id", value: message.id, inline: false },
            { name: "author", value: `${message.guild.members.cache.get(message.author.id).user.username} (${message.author.id})`, inline: false },
            { name: "channel", value: `${message.channel.name} (${message.channel.id})`, inline: false },
            { name: `thread?`, value: `${message.hasThread}`, inline: false },
            { name: `attachements`, value: `${message.attachments.entries.toString()}`, inline: false },
            { name: "reactions", value: `${message.reactions.cache.entries.toString()}`, inline: false },
            { name: "mentions", value: `${message.mentions.toJSON()}`, inline: false },
        );
        embed.setTitle("Message sent!");
    };
    if (SERVERS.get(`${message.guild.id}.logs`)) {
        message.guild.channels.cache.get(SERVERS.get(`${message.guild.id}.logs`)).send({ embeds: [ embed ] });
    };
});