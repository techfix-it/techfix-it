'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { 
  LayoutDashboard, 
  Layers, 
  DollarSign, 
  MessageSquare, 
  StickyNote, 
  FileText, 
  Globe, 
  LogOut, 
  Phone,
  Menu,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import styles from './admin-layout.module.css';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Close mobile menu when pathname changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const navItems = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Hero Section', href: '/admin/hero', icon: Globe },
    { name: 'Services', href: '/admin/services', icon: Layers },
    { name: 'Pricing Plans', href: '/admin/pricing', icon: DollarSign },
    { name: 'Testimonials', href: '/admin/testimonials', icon: MessageSquare },
    { name: 'Footer', href: '/admin/footer', icon: StickyNote },
    { name: 'Contact Info', href: '/admin/contact', icon: Phone },
    { name: 'Msg/Legal', href: '/admin/legal', icon: FileText },
    { name: 'About Us', href: '/admin/about', icon: Globe },
    { name: 'Profile', href: '/admin/profile', icon: Globe },
    { name: 'Tickets', href: '/admin/tickets', icon: MessageSquare }, // Added Tickets Tab
  ];

  return (
    <div className={styles.layout}>
      {/* Mobile Toggle Button */}
      <button 
        className={styles.menuToggle}
        onClick={() => setIsMobileMenuOpen(true)}
        aria-label="Open Menu"
      >
        <Menu size={24} />
      </button>

      {/* Mobile Overlay */}
      <div 
        className={`${styles.overlay} ${isMobileMenuOpen ? styles.open : ''}`}
        onClick={() => setIsMobileMenuOpen(false)}
      />

      {/* Sidebar */}
      <aside className={`${styles.sidebar} ${isMobileMenuOpen ? styles.open : ''}`}>
        <button 
          className={styles.closeToggle}
          onClick={() => setIsMobileMenuOpen(false)}
          aria-label="Close Menu"
        >
          <X size={24} />
        </button>

        <div className={styles.sidebarHeader}>
          <h2 className={styles.title}>
            <span>TechFix-</span><span style={{ color: 'var(--color-accent)' }}>It</span> 
            <span className={styles.subtitle}>Admin</span>
          </h2>
          <p className={styles.welcome}>Welcome, {session?.user?.name || 'Admin'}</p>
        </div>

        <nav className={styles.nav}>
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link 
                key={item.href} 
                href={item.href}
                className={`${styles.navItem} ${isActive ? styles.navItemActive : ''}`}
              >
                <item.icon size={20} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <Button 
            variant="destructive" 
            onClick={() => signOut({ callbackUrl: '/' })}
            className={styles.logoutBtn}
        >
            <LogOut size={18} /> Sign Out
        </Button>
      </aside>

      {/* Main Content */}
      <main className={styles.mainContent}>
        <div className={styles.mainInner}>
            {children}
        </div>
      </main>
    </div>
  );
}
