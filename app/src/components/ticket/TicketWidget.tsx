'use client';

import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Paperclip } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Ticket, Message } from '@/lib/discord/types';
import { usePathname } from 'next/navigation';
import './ticket-widget.css';

export default function TicketWidget() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '' });
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchMessages = React.useCallback(async (ticketId: string) => {
    const response = await fetch(`/api/tickets/${ticketId}/messages`);
    const data = await response.json();
    if (Array.isArray(data)) {
      setMessages(data);
    }
  }, []);

  const fetchTicket = React.useCallback(async (id: string) => {
    if (!supabase) return;
    const { data, error } = await supabase
      .from('tickets')
      .select('*')
      .eq('id', id)
      .single();

    if (data && !error) {
      setTicket(data);
      fetchMessages(id);
    } else {
      localStorage.removeItem('techfix_ticket_id');
    }
  }, [fetchMessages]);

  // Load ticket from localStorage on mount
  useEffect(() => {
    const savedTicketId = localStorage.getItem('techfix_ticket_id');
    if (savedTicketId) {
      fetchTicket(savedTicketId);
    }
  }, [fetchTicket]);

  // Subscribe to real-time messages when ticket is active
  useEffect(() => {
    if (!ticket || !supabase) return;

    const channel = supabase
      .channel(`ticket-${ticket.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `ticket_id=eq.${ticket.id}`,
        },
        (payload: any) => {
          setMessages((prev) => [...prev, payload.new as Message]);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'tickets',
          filter: `id=eq.${ticket.id}`,
        },
        (payload: any) => {
          setTicket(payload.new as Ticket);
        }
      )
      .subscribe();

    return () => {
      if (supabase) {
        supabase.removeChannel(channel);
      }
    };
  }, [ticket]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleOpenTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (data.id) {
        setTicket(data);
        localStorage.setItem('techfix_ticket_id', data.id);
      }
    } catch (error) {
      console.error('Error opening ticket:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !ticket) return;

    const content = newMessage;
    setNewMessage('');

    try {
      await fetch(`/api/tickets/${ticket.id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content,
          sender_name: ticket.name,
        }),
      });
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !ticket || !supabase) return;

    try {
      setUploading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${ticket.id}/${fileName}`;

      // 1. Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('ticket-files')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // 2. Get Public URL
      const { data: { publicUrl } } = supabase.storage
        .from('ticket-files')
        .getPublicUrl(filePath);

      // 3. Send message with file
      await fetch(`/api/tickets/${ticket.id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sender_name: ticket.name,
          file_url: publicUrl,
          file_name: file.name,
          content: `Sent a file: ${file.name}`
        }),
      });

    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Error sending file.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  if (pathname?.startsWith('/admin')) {
    return null;
  }

  return (
    <>
      {/* FAB */}
      <div className="ticket-fab" onClick={() => setIsOpen(!isOpen)} id="ticket-fab">
        <MessageCircle size={30} />
      </div>

      {/* Chat Window */}
      {isOpen && (
        <div className="ticket-container" id="ticket-container">
          <div className="ticket-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h3>TechFix Support</h3>
            </div>
            <button className="close-btn" onClick={() => setIsOpen(false)}>
              <X size={20} />
            </button>
          </div>

          {!ticket ? (
            <form className="ticket-form" onSubmit={handleOpenTicket}>
              <p style={{ fontSize: '14px', color: '#666', marginBottom: '10px' }}>
                Fill in the information to begin the service.
              </p>
              <input
                type="text"
                placeholder="Your Name"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
              <input
                type="email"
                placeholder="Your Email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
              <input
                type="tel"
                placeholder="Your Phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
              <button type="submit" disabled={loading}>
                {loading ? 'Starting...' : 'Open Ticket'}
              </button>
            </form>
          ) : (
            <>
              <div className="chat-messages">
                {ticket.status === 'closed' && (
                  <div className="status-banner animate-in">
                    <div className="status-icon">✅</div>
                    <div>
                      <strong>Chat Closed</strong><br />
                      Resolved as: <em>{ticket.resolution}</em><br />
                      <small>{new Date(ticket.closed_at!).toLocaleString()}</small>
                    </div>
                  </div>
                )}
                {messages.map((msg) => (
                  <div key={msg.id} className={`message ${msg.sender_type}`}>
                    <div className="message-info">
                      {msg.sender_name} • {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    {msg.content}
                    {msg.file_url && (
                      <div className="message-file">
                        {msg.file_url.match(/\.(jpg|jpeg|png|gif)$/i) ? (
                          <a href={msg.file_url} target="_blank" rel="noreferrer">
                            <img src={msg.file_url} alt={msg.file_name} className="file-preview" />
                          </a>
                        ) : (
                          <a href={msg.file_url} target="_blank" rel="noreferrer" className="file-link">
                            <Paperclip size={14} /> {msg.file_name}
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
              {ticket.status === 'open' ? (
                <form className="chat-input-area" onSubmit={handleSendMessage}>
                  <input
                    type="file"
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                    onChange={handleFileUpload}
                    accept=".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx,.xls,.xlsx"
                  />
                  <button 
                    type="button" 
                    className="attach-btn" 
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                  >
                    <Paperclip size={18} />
                  </button>
                  <input
                    type="text"
                    placeholder={uploading ? "Sending file..." : "Type your message..."}
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    disabled={uploading}
                  />
                  <button type="submit" className="send-btn" disabled={uploading}>
                    <Send size={18} />
                  </button>
                </form>
              ) : (
                <div className="chat-footer-closed">
                  This ticket has been closed. <button onClick={() => {
                    localStorage.removeItem('techfix_ticket_id');
                    setTicket(null);
                    setMessages([]);
                  }}>Open new ticket</button>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </>
  );
}
