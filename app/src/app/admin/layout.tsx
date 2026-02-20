'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { LayoutDashboard, Layers, DollarSign, MessageSquare, StickyNote, FileText, Globe, LogOut, Phone } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: session } = useSession();

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
    { name: 'Profile', href: '/admin/profile', icon: Globe }, // Reusing Globe or another icon
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <aside style={{ width: '250px', backgroundColor: '#1a1a2e', color: 'white', padding: '2rem', display: 'flex', flexDirection: 'column' }}>
        <div style={{ marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: 'white', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span>TechFix-</span><span style={{ color: 'var(--color-accent)' }}>It</span> 
            <span style={{ fontSize: '0.875rem', fontWeight: 'normal', opacity: 0.7, marginLeft: '0.5rem', alignSelf: 'flex-end', paddingBottom: '4px' }}>Admin</span>
          </h2>
          <p style={{ fontSize: '0.875rem', color: '#888' }}>Welcome, {session?.user?.name || 'Admin'}</p>
        </div>

        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link 
                key={item.href} 
                href={item.href}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  backgroundColor: isActive ? 'var(--color-primary)' : 'transparent',
                  color: isActive ? 'white' : '#ccc',
                  textDecoration: 'none',
                  transition: 'all 0.2s'
                }}
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
            style={{ marginTop: 'auto', width: '100%', display: 'flex', gap: '0.5rem', justifyContent: 'center' }}
        >
            <LogOut size={18} /> Sign Out
        </Button>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, backgroundColor: '#f5f5f7', padding: '2rem', overflowY: 'auto' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            {children}
        </div>
      </main>
    </div>
  );
}
