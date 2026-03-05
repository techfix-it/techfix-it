'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Ticket, Message } from '@/lib/types';
import styles from './tickets.module.css';
import { Download, X } from 'lucide-react';

export default function AdminTicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [filteredTickets, setFilteredTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [filters, setFilters] = useState({
    name: '',
    email: '',
    phone: '',
    status: '',
    date: ''
  });

  // Transcript Modal State
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [transcriptMessages, setTranscriptMessages] = useState<Message[]>([]);
  const [loadingTranscript, setLoadingTranscript] = useState(false);

  useEffect(() => {
    fetchTickets();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [tickets, filters]);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('tickets')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      setTickets(data || []);
    } catch (error) {
      console.error('Error fetching tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let result = [...tickets];

    if (filters.name) {
      result = result.filter(t => t.name.toLowerCase().includes(filters.name.toLowerCase()));
    }
    if (filters.email) {
      result = result.filter(t => t.email.toLowerCase().includes(filters.email.toLowerCase()));
    }
    if (filters.phone) {
      result = result.filter(t => t.phone && t.phone.includes(filters.phone));
    }
    if (filters.status) {
      result = result.filter(t => t.status === filters.status);
    }
    if (filters.date) {
      result = result.filter(t => t.created_at.startsWith(filters.date));
    }

    setFilteredTickets(result);
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const openTranscript = async (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setLoadingTranscript(true);
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('ticket_id', ticket.id)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setTranscriptMessages(data || []);
    } catch (error) {
      console.error('Error fetching transcript:', error);
    } finally {
      setLoadingTranscript(false);
    }
  };

  const closeTranscript = () => {
    setSelectedTicket(null);
    setTranscriptMessages([]);
  };

  const generateHtmlTranscript = (ticket: Ticket, messages: Message[]) => {
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
          .agent { background: #dcf8c6; margin-left: 50px; }
          .user { background: #fff; border: 1px solid #ddd; margin-right: 50px; }
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
          <p><strong>Current Status:</strong> ${ticket.status.toUpperCase()}</p>
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

  const downloadTranscript = () => {
    if (!selectedTicket) return;
    const html = generateHtmlTranscript(selectedTicket, transcriptMessages);
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transcript-${selectedTicket.id}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Tickets Management</h1>
      
      {/* Filters */}
      <div className={styles.filterGrid}>
        <input 
          type="text" 
          name="name" 
          placeholder="Filter by Name" 
          value={filters.name}
          onChange={handleFilterChange}
          className={styles.input}
        />
        <input 
          type="email" 
          name="email" 
          placeholder="Filter by Email" 
          value={filters.email}
          onChange={handleFilterChange}
          className={styles.input}
        />
        <input 
          type="text" 
          name="phone" 
          placeholder="Filter by Phone" 
          value={filters.phone}
          onChange={handleFilterChange}
          className={styles.input}
        />
        <input 
          type="date" 
          name="date" 
          value={filters.date}
          onChange={handleFilterChange}
          className={styles.input}
        />
        <select 
          name="status" 
          value={filters.status}
          onChange={handleFilterChange}
          className={styles.select}
        >
          <option value="">All Statuses</option>
          <option value="open">Open</option>
          <option value="closed">Closed</option>
        </select>
      </div>

      {/* Tickets Table */}
      <div className={styles.tableWrapper}>
        {loading ? (
          <p>Loading tickets...</p>
        ) : filteredTickets.length === 0 ? (
          <p>No tickets found.</p>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Date</th>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredTickets.map(ticket => (
                <tr 
                  key={ticket.id} 
                  className={styles.tableRow}
                  onClick={() => openTranscript(ticket)}
                >
                  <td>{new Date(ticket.created_at).toLocaleDateString()}</td>
                  <td>{ticket.name}</td>
                  <td>{ticket.email}</td>
                  <td>{ticket.phone || '-'}</td>
                  <td>
                    <span className={`${styles.statusBadge} ${ticket.status === 'open' ? styles.statusOpen : styles.statusClosed}`}>
                      {ticket.status.toUpperCase()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Transcript Modal */}
      {selectedTicket && (
        <div className={styles.modalOverlay} onClick={closeTranscript}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Ticket #{selectedTicket.id.split('-')[0]} - Transcript</h2>
              <button className={styles.closeBtn} onClick={closeTranscript}>
                <X size={24} />
              </button>
            </div>
            
            <div className={styles.modalBody}>
              {loadingTranscript ? (
                <p>Loading transcript...</p>
              ) : transcriptMessages.length === 0 ? (
                <p>No messages in this ticket yet.</p>
              ) : (
                transcriptMessages.map(msg => (
                  <div key={msg.id} className={`${styles.message} ${msg.sender_type === 'user' ? styles.msgUser : styles.msgAgent}`}>
                    <div className={styles.msgMeta}>
                      {msg.sender_name} • {new Date(msg.created_at).toLocaleString()}
                    </div>
                    <div>{msg.content}</div>
                    {msg.file_url && (
                      <div style={{ marginTop: '8px' }}>
                        <a href={msg.file_url} target="_blank" rel="noreferrer" style={{ color: '#075e54', fontSize: '12px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          📎 {msg.file_name}
                        </a>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            <div className={styles.modalFooter}>
              <div>
                <strong>Status:</strong>{' '}
                <span className={`${styles.statusBadge} ${selectedTicket.status === 'open' ? styles.statusOpen : styles.statusClosed}`}>
                  {selectedTicket.status.toUpperCase()}
                </span>
              </div>
              <button className={styles.downloadBtn} onClick={downloadTranscript}>
                <Download size={18} /> Download HTML
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
