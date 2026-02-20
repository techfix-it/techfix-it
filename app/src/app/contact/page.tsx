import PageHeader from '@/components/layout/PageHeader';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ContactForm from '@/components/contact/ContactForm';
import { Mail, MapPin, Phone } from 'lucide-react';
import styles from './page.module.css';

export default function ContactPage() {
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
               <p>789 Oak St, Smalltown, TX 23456, United States</p>
            </div>
            <div className={styles.infoBox}>
               <div className={styles.iconWrapper}><Mail size={24} /></div>
               <h3>Email</h3>
               <p>info@techfixit.com<br/>support@techfixit.com</p>
            </div>
            <div className={styles.infoBox}>
               <div className={styles.iconWrapper}><Phone size={24} /></div>
               <h3>Phone</h3>
               <p>+1 (555) 123-4567<br/>+1 (555) 987-6543</p>
            </div>
          </div>
          
          <div className={styles.formWrapper}>
            <h2 className={styles.formTitle}>Send us a Message</h2>
            <ContactForm />
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
