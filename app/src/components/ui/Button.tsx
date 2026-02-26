import { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils';
import styles from './Button.module.css';
import Link from 'next/link';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  href?: string;
  target?: string;
}

export const Button = ({
  children,
  className,
  variant = 'primary', 
  size = 'md',
  isLoading = false,
  disabled,
  href,
  target,
  ...props
}: ButtonProps) => {
  const cnClasses = cn(
    styles.button,
    styles[variant],
    styles[size],
    isLoading && styles.loading,
    className
  );

  if (href) {
    if (href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('tel:')) {
      return (
        <a href={href} className={cnClasses} target={target} rel={target === '_blank' ? 'noopener noreferrer' : undefined} {...(props as any)}>
          {isLoading ? <span className={styles.spinner} /> : children}
        </a>
      );
    }
    return (
      <Link href={href} className={cnClasses} target={target} {...(props as any)}>
        {isLoading ? <span className={styles.spinner} /> : children}
      </Link>
    );
  }

  return (
    <button
      className={cnClasses}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? <span className={styles.spinner} /> : children}
    </button>
  );
};
