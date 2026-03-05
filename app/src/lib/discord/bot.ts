import { 
  Client, 
  GatewayIntentBits, 
  TextChannel, 
  ChannelType, 
  Partials, 
  ActionRowBuilder, 
  ButtonBuilder, 
  ButtonStyle,
  AttachmentBuilder
} from 'discord.js';
import { getSupabaseAdmin } from '../supabase';

const DISCORD_CLIENT_KEY = Symbol.for('techfix.discordClient');
const DISCORD_LISTENERS_KEY = Symbol.for('techfix.discordListenersAttached');

const globalAny = global as any;
let client: Client | null = globalAny[DISCORD_CLIENT_KEY] || null;
const deletionTimers = new Map<string, NodeJS.Timeout>();

export const getDiscordClient = async () => {
  if (client) return client;

  client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent,
    ],
    partials: [Partials.Channel],
  });

  let token = process.env.DISCORD_BOT_TOKEN?.trim();
  
  if (token) {
    token = token.replace(/[^a-zA-Z0-9._-]/g, '');
  }

  if (!token) {
    console.warn('DISCORD_BOT_TOKEN is missing. Discord integration will not work.');
    return null;
  }

  try {
    await client.login(token);
    console.log(`[Discord Bot] Successfully logged in as ${client.user?.tag}`);
    globalAny[DISCORD_CLIENT_KEY] = client;
    setupDiscordListeners(client);
    return client;
  } catch (error: any) {
    console.error('[Discord Bot] Login failed:', error.message || error);
    client = null;
    return null;
  }
};

const generateTranscriptHtml = (ticket: any, messages: any[]) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Ticket Transcript - ${ticket.id}</title>
      <style>
        body { font-family: sans-serif; line-height: 1.6; max-width: 800px; margin: 40px auto; padding: 20px; color: #333; }
        .header { border-bottom: 2px solid #075e54; padding-bottom: 20px; margin-bottom: 30px; }
        .info { background: #f4f4f4; padding: 15px; border-radius: 8px; margin-bottom: 30px; }
        .message { margin-bottom: 20px; padding: 10px; border-radius: 8px; }
        .user { background: #dcf8c6; margin-left: 50px; }
        .agent { background: #fff; border: 1px solid #ddd; margin-right: 50px; }
        .meta { font-size: 12px; color: #666; margin-bottom: 5px; }
        .file-link { color: #075e54; font-weight: bold; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Support Transcript - TechFix</h1>
        <p>Ticket ID: ${ticket.id}</p>
      </div>
      <div class="info">
        <p><strong>Client:</strong> ${ticket.name}</p>
        <p><strong>Email:</strong> ${ticket.email}</p>
        <p><strong>Phone:</strong> ${ticket.phone || 'Not provided'}</p>
        <p><strong>Opened:</strong> ${new Date(ticket.created_at).toLocaleString()}</p>
        ${ticket.closed_at ? `<p><strong>Closed:</strong> ${new Date(ticket.closed_at).toLocaleString()}</p>` : ''}
        ${ticket.resolution ? `<p><strong>Resolution:</strong> ${ticket.resolution}</p>` : ''}
      </div>
      <div class="messages">
        ${messages.map(m => `
          <div class="message ${m.sender_type}">
            <div class="meta">${m.sender_name} • ${new Date(m.created_at).toLocaleString()}</div>
            <div class="content">
              ${m.content || ''}
              ${m.file_url ? `<br><a class="file-link" href="${m.file_url}" target="_blank">📎 ${m.file_name}</a>` : ''}
            </div>
          </div>
        `).join('')}
      </div>
    </body>
    </html>
  `;
};

const setupDiscordListeners = (discordClient: Client) => {
  if (globalAny[DISCORD_LISTENERS_KEY]) {
    console.log('[Discord Bot] Listeners already attached, skipping.');
    return;
  }
  
  globalAny[DISCORD_LISTENERS_KEY] = true;
  console.log('[Discord Bot] Setting up listeners...');

  discordClient.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    const supabase = getSupabaseAdmin();
    const { data: ticket, error } = await supabase
      .from('tickets')
      .select('*')
      .eq('discord_channel_id', message.channel.id)
      .eq('status', 'open')
      .single();

    if (error || !ticket) return;

    // Handle Discord attachments
    let fileUrl = undefined;
    let fileName = undefined;
    
    if (message.attachments.size > 0) {
      const attachment = message.attachments.first();
      if (attachment) {
        fileUrl = attachment.url;
        fileName = attachment.name;
      }
    }

    // 3. Add message to Supabase
    // Using a strictly prioritized name (Nickname > Username)
    const senderName = message.member?.displayName || message.author.username;

    // Optional: Deduplication check by discord_message_id
    const { data: existing } = await supabase
      .from('messages')
      .select('id')
      .eq('discord_message_id', message.id)
      .limit(1);

    if (existing && existing.length > 0) return;

    await supabase.from('messages').insert({
      ticket_id: ticket.id,
      sender_type: 'agent',
      sender_name: senderName,
      content: message.content || (fileUrl ? `Sent a file: ${fileName}` : ''),
      file_url: fileUrl,
      file_name: fileName,
      discord_message_id: message.id
    });
  });

  discordClient.on('interactionCreate', async (interaction) => {
    if (!interaction.isButton()) return;

    const [action, ticketId] = interaction.customId.split(':');
    console.log(`[Discord Bot] Interaction received: ${action} for ticket ${ticketId}`);
    const supabase = getSupabaseAdmin();

    if (action === 'close_ticket_resolved' || action === 'close_ticket_unresolved') {
      const resolution = action === 'close_ticket_resolved' ? 'resolved' : 'unresolved';
      
      try {
        await interaction.deferReply();

        await supabase
          .from('tickets')
          .update({ 
            status: 'closed', 
            resolution,
            closed_at: new Date().toISOString()
          })
          .eq('id', ticketId);

        const row = new ActionRowBuilder<ButtonBuilder>()
          .addComponents(
            new ButtonBuilder()
              .setCustomId(`download_transcript:${ticketId}`)
              .setLabel('Download Transcript')
              .setStyle(ButtonStyle.Primary),
          );

        await interaction.editReply({
          content: `✅ Ticket closed as **${resolution}**.\nYou have **1 minute** to download the transcript before this channel is deleted.`,
          components: [row]
        });

        // Set 1 minute auto-delete timer
        const timer = setTimeout(async () => {
          try {
            await interaction.channel?.delete();
            deletionTimers.delete(interaction.channelId);
          } catch (e) {
            console.error('Auto-delete failed:', e);
          }
        }, 60000);

        deletionTimers.set(interaction.channelId, timer);

      } catch (error) {
        console.error('Error closing ticket:', error);
        if (interaction.deferred || interaction.replied) {
          await interaction.editReply({ content: '❌ Error closing ticket. Please try again.' });
        } else {
          await interaction.reply({ content: '❌ Error closing ticket. Please try again.', ephemeral: true });
        }
      }
    }

    if (action === 'download_transcript') {
      try {
        await interaction.deferUpdate();

        // 1. Get ticket and messages
        const { data: ticket } = await supabase.from('tickets').select('*').eq('id', ticketId).single();
        const { data: messages } = await supabase.from('messages').select('*').eq('ticket_id', ticketId).order('created_at', { ascending: true });

        if (!ticket || !messages) return;

        // 2. Generate HTML
        const html = generateTranscriptHtml(ticket, messages);
        const buffer = Buffer.from(html, 'utf-8');
        const attachment = new AttachmentBuilder(buffer, { name: `transcript-${ticketId}.html` });

        const channel = interaction.channel as TextChannel;
        // 3. Send file
        await channel?.send({
          content: '📄 Here is the chat transcript. The channel will be deleted in **60 seconds**.',
          files: [attachment]
        });

        // 4. Cancel 1-minute timer and set 60-second timer
        const oldTimer = deletionTimers.get(interaction.channelId);
        if (oldTimer) clearTimeout(oldTimer);

        setTimeout(async () => {
          try {
            await interaction.channel?.delete();
            deletionTimers.delete(interaction.channelId);
          } catch (e) {
            console.error('Final delete failed:', e);
          }
        }, 60000);

      } catch (error) {
        console.error('Error downloading transcript:', error);
        if (interaction.deferred || interaction.replied) {
          await interaction.editReply({ content: '❌ Error generating transcript. Please try again.' });
        } else {
          await interaction.reply({ content: '❌ Error generating transcript. Please try again.', ephemeral: true });
        }
      }
    }
  });
};

export const createDiscordTicketChannel = async (ticketId: string, name: string, email: string, phone: string) => {
  const discordClient = await getDiscordClient();
  if (!discordClient) return null;

  const guildId = process.env.DISCORD_GUILD_ID;
  const categoryId = process.env.DISCORD_CATEGORY_ID?.trim();

  if (!guildId) {
    console.error('DISCORD_GUILD_ID is missing');
    return null;
  }

  try {
    const guild = await discordClient.guilds.fetch(guildId).catch(() => null);
    
    if (!guild) {
      console.error(`[Discord Bot] Bot is not in the server with ID: ${guildId}.`);
      return null;
    }
    
    const botMember = await guild.members.fetch(discordClient.user!.id).catch(() => null);
    if (!botMember || !botMember.permissions.has('ManageChannels')) {
      console.error('[Discord Bot] Bot is missing "Manage Channels" permission.');
      return null;
    }

    const channelOptions: any = {
      name: `ticket-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
      type: ChannelType.GuildText,
      topic: `Ticket ID: ${ticketId}`,
    };

    if (categoryId && /^\d+$/.test(categoryId)) {
      channelOptions.parent = categoryId;
    }

    const channel = await guild.channels.create(channelOptions);

    const row = new ActionRowBuilder<ButtonBuilder>()
      .addComponents(
        new ButtonBuilder()
          .setCustomId(`close_ticket_resolved:${ticketId}`)
          .setLabel('Close (Resolved)')
          .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
          .setCustomId(`close_ticket_unresolved:${ticketId}`)
          .setLabel('Close (Unresolved)')
          .setStyle(ButtonStyle.Danger),
      );

    await (channel as TextChannel).send({
      content: `**New Ticket Opened!**\n\n**Client:** ${name}\n**Email:** ${email}\n**Phone:** ${phone || 'Not provided'}\n**ID:** ${ticketId}\n\nUse this channel to chat with the client. When finished, use the buttons below to close the ticket.`,
      components: [row]
    });

    return channel.id;
  } catch (error: any) {
    console.error('Detailed error creating Discord channel:', error.message || error);
    return null;
  }
};

export const sendToDiscord = async (channelId: string, content: string, senderName: string, fileUrl?: string) => {
  const discordClient = await getDiscordClient();
  if (!discordClient) return;

  const channel = await discordClient.channels.fetch(channelId);
  if (channel && channel.isTextBased()) {
    let messageContent = `**${senderName}**: ${content}`;
      if (fileUrl) {
      messageContent += `\n📎 **Attached file:** ${fileUrl}`;
    }
    await (channel as TextChannel).send(messageContent);
  }
};
