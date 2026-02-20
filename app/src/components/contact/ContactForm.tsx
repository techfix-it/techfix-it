'use client';

import { Button } from '@/components/ui/Button';
import styles from './ContactForm.module.css';

export default function ContactForm() {
  return (
    <form className={styles.form} onSubmit={(e) => e.preventDefault()}>
      <div className={styles.grid}>
        <div className={styles.field}>
          <label htmlFor="name" className={styles.label}>Name</label>
          <input type="text" id="name" placeholder="John Doe" className={styles.input} required />
        </div>
        <div className={styles.field}>
          <label htmlFor="email" className={styles.label}>Email</label>
          <input type="email" id="email" placeholder="john@example.com" className={styles.input} required />
        </div>
      </div>
      
      <div className={styles.field}>
        <label htmlFor="subject" className={styles.label}>Subject</label>
        <input type="text" id="subject" placeholder="Project Inquiry" className={styles.input} required />
      </div>

      <div className={styles.field}>
        <label htmlFor="message" className={styles.label}>Message</label>
        <textarea id="message" rows={5} placeholder="Tell us about your project..." className={styles.textarea} required></textarea>
      </div>

      <Button type="submit" size="lg" className={styles.submitBtn}>Send Message</Button>
    </form>
  );
}
