'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import styles from './Header.module.css';
import { Menu, X } from 'lucide-react';

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={cn(styles.header, isScrolled && styles.scrolled)}>
      <div className={cn("container", styles.container)}>
        <Link href="/" className={styles.logo}>
            {/* Placeholder for Logo - replacing Image with text for now as per instructions to use minimal placeholder if asset missing */}
            <span className={styles.logoText}>TechFix-<span className={styles.logoAccent}>It</span></span>
        </Link>

        {/* Desktop Nav */}
        <nav className={styles.desktopNav}>
          {/* <a href="https://shop.techfix-it.ie/" className={styles.navLink} target="_blank" rel="noopener noreferrer">Shop</a> */}
          <Link href="/" className={styles.navLink}>Home</Link>
          <Link href="/about" className={styles.navLink}>About Us</Link>
          <Link href="/services" className={styles.navLink}>Services</Link>
          <Link href="/pricing" className={styles.navLink}>Pricing</Link>
          <Link href="/contact" className={styles.navLink}>Contact Us</Link>
        </nav>

        <div className={styles.actions}>
          <Button href="/contact" variant="primary" size="md" className={styles.ctaBtn}>
            Get in Touch
          </Button>
          
          <button 
            className={styles.mobileToggle}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

       {/* Mobile Nav */}
       <div className={cn(styles.mobileNav, isMobileMenuOpen && styles.mobileNavOpen)}>
          {/* <a href="https://shop.techfix-it.ie/" className={styles.mobileNavLink} target="_blank" rel="noopener noreferrer" onClick={() => setIsMobileMenuOpen(false)}>Shop</a> */}
          <Link href="/" className={styles.mobileNavLink} onClick={() => setIsMobileMenuOpen(false)}>Home</Link>
          <Link href="/about" className={styles.mobileNavLink} onClick={() => setIsMobileMenuOpen(false)}>About Us</Link>
          <Link href="/services" className={styles.mobileNavLink} onClick={() => setIsMobileMenuOpen(false)}>Services</Link>
          <Link href="/pricing" className={styles.mobileNavLink} onClick={() => setIsMobileMenuOpen(false)}>Pricing</Link>
          <Link href="/contact" className={styles.mobileNavLink} onClick={() => setIsMobileMenuOpen(false)}>Contact Us</Link>
       </div>
    </header>
  );
}
