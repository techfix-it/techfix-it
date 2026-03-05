import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { sendToDiscord } from '@/lib/discord/bot';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = getSupabaseAdmin();

  const { data: messages, error } = await supabase
    .from('messages')
    .select('*')
    .eq('ticket_id', id)
    .order('created_at', { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(messages);
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { content, sender_name, file_url, file_name } = await request.json();

  const supabase = getSupabaseAdmin();

  // 1. Get ticket to find Discord channel
  const { data: ticket, error: ticketError } = await supabase
    .from('tickets')
    .select('*')
    .eq('id', id)
    .single();

  if (ticketError || !ticket) {
    return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
  }

  // 2. Save message to Supabase
  const { data: message, error: messageError } = await supabase
    .from('messages')
    .insert({
      ticket_id: id,
      sender_type: 'user',
      sender_name: sender_name,
      content: content,
      file_url: file_url,
      file_name: file_name
    })
    .select()
    .single();

  if (messageError) throw messageError;

  // 3. Send to Discord
  if (ticket.discord_channel_id) {
    try {
      await sendToDiscord(ticket.discord_channel_id, content, sender_name, file_url);
    } catch (discordError) {
      console.error('Failed to send to Discord:', discordError);
    }
  }

  return NextResponse.json(message);
}
