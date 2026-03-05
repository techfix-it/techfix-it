export type Ticket = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  status: 'open' | 'closed';
  resolution?: string;
  discord_channel_id?: string;
  created_at: string;
  closed_at?: string;
};

export type Message = {
  id: string;
  ticket_id: string;
  sender_type: 'user' | 'agent';
  sender_name: string;
  content: string;
  file_url?: string;
  file_name?: string;
  discord_message_id?: string;
  created_at: string;
};
