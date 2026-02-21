'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import dynamic from 'next/dynamic';
import styles from './ContactModal.module.css';
import { X } from 'lucide-react';

const ContactForm = dynamic(() => import('@/components/contact/ContactForm'), { ssr: false });

type Props = {
  planName: string;
  isOpen: boolean;
  onClose: () => void;
};

export default function ContactModal({ planName, isOpen, onClose }: Props) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div
      className={styles.overlay}
      ref={overlayRef}
      onMouseDown={(e) => { if (e.target === overlayRef.current) onClose(); }}
    >
      <div className={styles.modal} role="dialog" aria-modal="true">
        <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
          <X size={20} />
        </button>

        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Get Started with {planName}</h2>
          <p className={styles.modalSubtitle}>Fill in your details and we'll get back to you shortly.</p>
        </div>

        <ContactForm planName={planName} />
      </div>
    </div>,
    document.body
  );
}
