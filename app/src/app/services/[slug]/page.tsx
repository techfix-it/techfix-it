import { getServices } from '@/lib/db';
import { notFound } from 'next/navigation';
import PageHeader from '@/components/layout/PageHeader';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import styles from './page.module.css';
import fs from 'fs';
import path from 'path';


interface ServicePageProps {
  params: Promise<{ slug: string }>;
}

export const dynamicParams = true;

export async function generateStaticParams() {
  const services = await getServices();
  return services.map((service : any) => ({
    slug: service.slug,
  }));
}

export default async function ServicePage({ params }: ServicePageProps) {
  const { slug } = await params;
  const service = (await getServices()).find((s : any) => s.slug === slug);

  if (!service) {
    notFound();
  }

  // Use DB image if available, otherwise fallback
  const bgImage = service.imageUrl || 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2015&auto=format&fit=crop';

  return (
    <main>
      <Header />
      <PageHeader title={service.title} subtitle="Professional solutions tailored to your business goals." />

      <div className="container">
        <div className={styles.layout}>
          {/* Main Content */}
          <div className={styles.content}>
            <div 
              className={styles.imagePlaceholder} 
              style={{ 
                backgroundImage: `url('${bgImage}')`, 
                backgroundSize: 'cover', 
                backgroundPosition: 'center' 
              }}
            >
            </div>

            <h2 className={styles.sectionTitle}>Overview</h2>
            <p className={styles.text} style={{ whiteSpace: 'pre-wrap' }}>{service.fullDescription}</p>

            <h3 className={styles.sectionTitle}>Key Features</h3>
            <div className={styles.featuresGrid}>
              {service.features && service.features.map((feature : string, idx : number) => (
                <div key={idx} className={styles.featureItem}>
                  <CheckCircle2 className={styles.featureIcon} size={20} />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <aside className={styles.sidebar}>
            <div className={styles.sidebarBox}>
              <h3 className={styles.sidebarTitle}>Our Services</h3>
              <ul className={styles.serviceList}>
                {(await getServices()).map((s : any) => (
                  <li key={s.id}>
                    <Link 
                      href={`/services/${s.slug}`}
                      className={`${styles.serviceLink} ${s.slug === slug ? styles.active : ''}`}
                    >
                      {s.title}
                      <ArrowRight size={16} />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className={`${styles.sidebarBox} ${styles.ctaBox}`}>
              <h3 className={styles.sidebarTitle} style={{color: 'white'}}>Need Help?</h3>
              <p style={{color: 'rgba(255,255,255,0.8)', marginBottom: '1.5rem'}}>
                Contact us today to discuss how we can help you achieve your goals.
              </p>
              <Link href="/contact">
                  <Button className={styles.ctaBtn}>Contact Us</Button>
              </Link>
            </div>
          </aside>
        </div>
      </div>

      <Footer />
    </main>
  );
}
