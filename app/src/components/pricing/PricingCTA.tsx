'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/Button';

// Carrega o modal apenas no cliente, sem SSR para evitar problemas de hidratação
const ContactModal = dynamic(() => import('@/components/contact/ContactModal'), {
  ssr: false,
});

type Props = {
  planName: string;
  label: string;
  variant?: 'primary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
};

export default function PricingCTA({ planName, label, variant = 'primary', size = 'lg', className }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        type="button"
        variant={variant}
        size={size}
        className={className}
        onClick={() => setOpen(true)}
      >
        {label}
      </Button>

      <ContactModal planName={planName} isOpen={open} onClose={() => setOpen(false)} />
    </>
  );
}
