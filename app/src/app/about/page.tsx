import PageHeader from '@/components/layout/PageHeader';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import styles from './page.module.css';

import Link from 'next/link';
import { getAboutPage } from '@/lib/db';

export default async function AboutPage() {
  const data = await getAboutPage();

  return (
    <main>
      <Header />
      <PageHeader 
        title={data.title || "About Us"} 
        subtitle={data.subtitle || "Unleashing Innovation, Connecting Possibilities. Pioneering the Future of Technology."}
      />
      
      <section className="container" style={{ padding: '6rem 1rem' }}>
        <div className={styles.split}>
          <div className={styles.imageWrapper}>
            {data.image_url ? (
                <div style={{ position: 'relative', width: '100%', height: '400px', borderRadius: '12px', overflow: 'hidden' }}>
                    <Image src={data.image_url} alt="About Us" fill style={{ objectFit: 'cover' }} />
                </div>
            ) : (
                <div className={styles.imgPlaceholder}></div> 
            )}
            <div className={styles.experienceBadge}>
              <span className={styles.expNumber}>{data.stats_number || "18+"}</span>
              <span className={styles.expText}>{data.stats_label || "Years Experience"}</span>
            </div>
          </div>
          
          <div className={styles.content}>
            <span className={styles.overline}>{data.section_label || "Who We Are"}</span>
            <h2 className={styles.heading}>{data.heading || "Leading the Future of Technology with Strategic Support"}</h2>
            <p className={styles.text}>
              {data.paragraph1 || "With over 8 years of experience in the Irish market, TechFix It combines in-depth technical knowledge with personalized service. We're not just support; we're your infrastructure partner."}
            </p>
            <p className={styles.text}>
              {data.paragraph2 || "We've reduced downtime by up to 40% for our clients through proactive monitoring and state-of-the-art cloud solutions."}
            </p>
            <Link href={data.cta_link || "/contact"}>
                <Button size="lg">{data.cta_text || "More About Us"}</Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
