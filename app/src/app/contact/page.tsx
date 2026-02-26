import PageHeader from '@/components/layout/PageHeader';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ContactForm from '@/components/contact/ContactForm';
import { Mail, MapPin, Phone } from 'lucide-react';
import styles from './page.module.css';
import { getContactContent } from '@/lib/db';

export default async function ContactPage() {
  const contact = await getContactContent();

  const address = contact.address || "789 Oak St, Smalltown, TX 23456, United States";
  const emails = contact.emails && contact.emails.length > 0 ? contact.emails : ["info@techfixit.com", "support@techfixit.com"];
  const phones = contact.phones && contact.phones.length > 0 ? contact.phones : ["+1 (555) 123-4567", "+1 (555) 987-6543"];

  return (
    <main>
      <Header />
      <PageHeader 
        title="Contact Us" 
        subtitle="We’re always here to chat! Reach out to us with any questions or concerns you may have." 
      />
      
      <section className="container" style={{ padding: '6rem 1rem' }}>
        <div className={styles.grid}>
          <div className={styles.info}>
            <div className={styles.infoBox}>
               <div className={styles.iconWrapper}><MapPin size={24} /></div>
               <h3>Address</h3>
               <p>{address}</p>
            </div>
            <div className={styles.infoBox}>
               <div className={styles.iconWrapper}><Mail size={24} /></div>
               <h3>Email</h3>
               <div style={{ display: 'flex', flexDirection: 'column' }}>
                 {emails.map((email: string, idx: number) => (
                   <a 
                    key={idx} 
                    href={`mailto:${email}`} 
                    className={styles.contactLink}
                   >
                     {email}
                   </a>
                 ))}
               </div>
            </div>
            <div className={styles.infoBox}>
               <div className={styles.iconWrapper}><Phone size={24} /></div>
               <h3>Phone</h3>
               <div style={{ display: 'flex', flexDirection: 'column' }}>
                 {phones.map((phone: string, idx: number) => (
                   <a 
                    key={idx} 
                    href={`tel:${phone.replace(/\s+/g, '')}`} 
                    className={styles.contactLink}
                   >
                     {phone}
                   </a>
                 ))}
               </div>
            </div>
          </div>
          
          <div className={styles.formContainer}>
            <h2 style={{ fontSize: '1.75rem', fontWeight: '800', marginBottom: '2rem', color: 'var(--color-primary)' }}>Send us a Message</h2>
            <ContactForm />
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
