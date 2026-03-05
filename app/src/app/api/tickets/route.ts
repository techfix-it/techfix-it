import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { createDiscordTicketChannel } from '@/lib/discord/bot';

export async function POST(request: Request) {
  try {
    const { name, email, phone } = await request.json();

    if (!name || !email) {
      return NextResponse.json({ error: 'Name and email are required' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    // 1. Create ticket in Supabase
    const { data: ticket, error: ticketError } = await supabase
      .from('tickets')
      .insert({ name, email, phone, status: 'open' })
      .select()
      .single();

    if (ticketError) throw ticketError;

    // 2. Create channel in Discord
    let discordChannelId = null;
    try {
      discordChannelId = await createDiscordTicketChannel(ticket.id, name, email, phone);
      
      if (discordChannelId) {
        await supabase
          .from('tickets')
          .update({ discord_channel_id: discordChannelId })
          .eq('id', ticket.id);
      }
    } catch (discordError) {
      console.error('Failed to create Discord channel:', discordError);
      // We still return the ticket even if Discord fails, for robustness
    }

    return NextResponse.json({ ...ticket, discord_channel_id: discordChannelId });
  } catch (error: any) {
    console.error('Ticket creation error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
