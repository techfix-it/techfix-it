import { getPricingPlans, getPricingPlanBySlug } from '@/lib/db';
import { notFound } from 'next/navigation';
import PageHeader from '@/components/layout/PageHeader';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import PricingCTA from '@/components/pricing/PricingCTA';
import { Button } from '@/components/ui/Button';
import { CheckCircle2, XCircle } from 'lucide-react';
import Link from 'next/link';
import styles from './page.module.css';

interface PricingDetailPageProps {
  params: Promise<{ slug: string }>;
}

// Ensure we re-generate params on build, but also allow new ones at runtime
export const dynamicParams = true; 

export async function generateStaticParams() {
  const pricingPlans = await getPricingPlans();
  return pricingPlans.map((plan) => ({
    slug: plan.slug,
  }));
}

export default async function PricingDetailPage({ params }: PricingDetailPageProps) {
  const { slug } = await params;
  // We can optimize this by fetching single slug, but for now matching previous pattern of fetching all (or use new getPricingPlanBySlug)
  // Let's use the new helper
  const plan = await getPricingPlanBySlug(slug);
  const pricingPlans = await getPricingPlans(); // Re-added for sidebar

  if (!plan) {
    notFound();
  }

  return (
    <main>
      <Header />
      <PageHeader title={plan.name} subtitle={`Everything included in the ${plan.name}`} />
      
      <div className="container">
        <div className={styles.layout}>
          {/* Main Content */}
          <div className={styles.content}>
            <div className={styles.headerSection}>
                <div className={styles.priceTag}>
                    <span className={styles.amount}>{plan.price}</span>
                    <span className={styles.period}>{plan.period}</span>
                </div>
                <p className={styles.mainDescription}>{plan.description}</p>
                <PricingCTA planName={plan.name} label={plan.cta} size="lg" className={styles.mainCta} />
            </div>
            
            <h3 className={styles.sectionTitle}>What's Included?</h3>
            <div className={styles.featuresGrid}>
              {plan.features.map((feature, idx) => (
                <div key={idx} className={styles.featureItem}>
                  <CheckCircle2 className={styles.checkIcon} size={24} />
                  <span>{feature}</span>
                </div>
              ))}
            </div>

            <div className={styles.infoBlock}>
                <h4>Why choose this plan?</h4>
                <p>
                    {plan.benefits_description || "This plan is designed for businesses that need reliable, consistent IT support without the overhead of an internal team."}
                </p>
            </div>
          </div>

          {/* Sidebar */}
          <aside className={styles.sidebar}>
            <div className={styles.sidebarBox}>
              <h3 className={styles.sidebarTitle}>All Plans</h3>
              <ul className={styles.planList}>
                {pricingPlans.map((p) => (
                    <li key={p.id}>
                        <Link 
                            href={`/pricing/${p.slug}`} 
                            className={`${styles.planLink} ${p.slug === slug ? styles.active : ''}`}
                        >
                            <span>{p.name}</span>
                            <span className={styles.miniPrice}>{p.price}</span>
                        </Link>
                    </li>
                ))}
              </ul>
            </div>

            <div className={`${styles.sidebarBox} ${styles.faqBox}`}>
              <h3 className={styles.sidebarTitle}>Have Questions?</h3>
              <p className={styles.faqText}>
                Not sure which plan is right for you? Our team is here to help you find the perfect fit.
              </p>
              <Link href="/contact" style={{width: '100%'}}>
                  <Button variant="outline" style={{width: '100%'}}>Contact Sales</Button>
              </Link>
            </div>
          </aside>
        </div>
      </div>

      <Footer />
    </main>
  );
}
