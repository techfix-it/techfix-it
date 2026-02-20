import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Facebook, Twitter, Instagram, Linkedin, Mail, MapPin, Phone } from 'lucide-react';
import styles from './Footer.module.css';
import { getFooterContent } from '@/lib/db';

export default async function Footer() {
  const content = await getFooterContent();

  return (
    <footer className={styles.footer}>
      <div className="container">
        <div className={styles.grid}>
          {/* Column 1: Brand */}
          <div className={styles.brandCol}>
             <span className={styles.logoText}>TechFix-<span className={styles.logoAccent}>It</span></span>
            <p className={styles.description}>
              {content.company_description || "Innovative technology solutions for modern businesses."}
            </p>
            <div className={styles.socials}>
              <Link href="#" className={styles.socialLink} aria-label="Facebook"><Facebook size={20} /></Link>
              <Link href="#" className={styles.socialLink} aria-label="Twitter"><Twitter size={20} /></Link>
              <Link href="#" className={styles.socialLink} aria-label="Instagram"><Instagram size={20} /></Link>
              <Link href="#" className={styles.socialLink} aria-label="LinkedIn"><Linkedin size={20} /></Link>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className={styles.col}>
            <h4 className={styles.heading}>Quick Links</h4>
            <ul className={styles.links}>
              <li><Link href="/about">About Us</Link></li>
              <li><Link href="/services">Services</Link></li>
              <li><Link href="/pricing">Pricing</Link></li>
              <li><Link href="/contact">Contact</Link></li>
            </ul>
          </div>

          {/* Column 3: Contact */}
          <div className={styles.col}>
            <h4 className={styles.heading}>Contact Us</h4>
            <ul className={styles.contactList}>
              <li>
                <MapPin size={18} className={styles.icon} />
                <span>{content.address || "N4 Axis Centre, Battery Rd, Aghadegnan, Longford, N39 XW95, Irlanda"}</span>
              </li>
              <li>
                <Phone size={18} className={styles.icon} />
                <span>{content.phone || "+353 43 335 0737"}</span>
              </li>
              <li>
                <Mail size={18} className={styles.icon} />
                <span>{content.email || "info@techfixit.com"}</span>
              </li>
            </ul>
          </div>

           {/* Column 4: Newsletter */}
           <div className={styles.col}>
            <h4 className={styles.heading}>Newsletter</h4>
            <p className={styles.text}>Subscribe to get the latest news and updates.</p>
            <form className={styles.form}>
              <input type="email" placeholder="Your email address" className={styles.input} />
              <Button type="submit" size="sm" className={styles.submitBtn}>Subscribe</Button>
            </form>
          </div>
        </div>

        <div className={styles.bottom}>
          <p>{content.copyright_text || `© ${new Date().getFullYear()} TechFix It. All rights reserved.`}</p>
          <div className={styles.legal}>
            <Link href="/privacy">Privacy Policy</Link>
            <Link href="/terms">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
