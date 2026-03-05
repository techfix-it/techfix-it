export interface Ticket {
  id: string;
  created_at: string;
  closed_at?: string;
  name: string;
  email: string;
  phone: string;
  status: 'open' | 'closed';
  resolution?: 'resolvido' | 'não resolvido';
  discord_channel_id?: string;
  last_message_at: string;
}

export interface Message {
  id: string;
  created_at: string;
  ticket_id: string;
  sender_type: 'user' | 'agent';
  sender_name: string;
  content?: string;
  file_url?: string;
  file_name?: string;
  discord_message_id?: string;
}
