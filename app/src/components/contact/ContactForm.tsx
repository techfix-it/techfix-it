'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import PhoneInput from './PhoneInput';
import styles from './ContactForm.module.css';

type FormState = {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
};

export default function ContactForm() {
  const [form, setForm] = useState<FormState>({ name: '', email: '', phone: '', subject: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.id]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        setStatus('success');
        setForm({ name: '', email: '', phone: '', subject: '', message: '' });
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.grid}>
        <div className={styles.field}>
          <label htmlFor="name" className={styles.label}>Name</label>
          <input
            type="text"
            id="name"
            placeholder="John Doe"
            className={styles.input}
            value={form.name}
            onChange={handleChange}
            required
          />
        </div>
        <div className={styles.field}>
          <label htmlFor="email" className={styles.label}>Email</label>
          <input
            type="email"
            id="email"
            placeholder="john@example.com"
            className={styles.input}
            value={form.email}
            onChange={handleChange}
            required
          />
        </div>
      </div>

      <div className={styles.field}>
        <label className={styles.label}>
          Phone <span style={{ fontWeight: 400, color: 'var(--color-text-body)' }}>— optional</span>
        </label>
        <PhoneInput
          value={form.phone}
          onChange={(val) => setForm((prev) => ({ ...prev, phone: val }))}
        />
      </div>

      <div className={styles.field}>
        <label htmlFor="subject" className={styles.label}>Subject</label>
        <input
          type="text"
          id="subject"
          placeholder="Project Inquiry"
          className={styles.input}
          value={form.subject}
          onChange={handleChange}
          required
        />
      </div>

      <div className={styles.field}>
        <label htmlFor="message" className={styles.label}>Message</label>
        <textarea
          id="message"
          rows={5}
          placeholder="Tell us about your project..."
          className={styles.textarea}
          value={form.message}
          onChange={handleChange}
          required
        />
      </div>

      {status === 'success' && (
        <p className={styles.successMsg}>✅ Message sent successfully! We'll be in touch soon.</p>
      )}
      {status === 'error' && (
        <p className={styles.errorMsg}>❌ Something went wrong. Please try again or email us directly.</p>
      )}

      <Button type="submit" size="lg" className={styles.submitBtn} disabled={status === 'loading'}>
        {status === 'loading' ? 'Sending...' : 'Send Message'}
      </Button>
    </form>
  );
}
