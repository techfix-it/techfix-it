import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Check } from 'lucide-react';
import { getPricingPlans, getPricingPageContent } from '@/lib/db';
import styles from './Pricing.module.css';

export default async function Pricing() {
  const pricingPlans = await getPricingPlans();
  const pageContent = await getPricingPageContent();

  return (
    <section className={styles.pricing}>
      <div className="container">
        <div className={styles.header}>
            <h2 className={styles.title}>{pageContent.home_title || "Our Pricing Plans"}</h2>
            <p className={styles.subtitle}>{pageContent.home_subtitle || "Choose the perfect plan for your business needs."}</p>
        </div>
        
        <div className={styles.grid}>
          {pricingPlans.filter(p => p.featured).map((plan) => (
            <Link key={plan.id} href={`/pricing/${plan.slug}`} className={styles.cardLink}>
              <div className={`${styles.card} ${plan.isPopular ? styles.popular : ''}`}>
                {plan.isPopular && <span className={styles.badge}>Most Popular</span>}
                <div className={styles.cardHeader}>
                  <h3 className={styles.planName}>{plan.name}</h3>
                  <div className={styles.priceWrapper}>
                    <span className={styles.price}>{plan.price}</span>
                    <span className={styles.period}>{plan.period}</span>
                  </div>
                  <p className={styles.description}>{plan.description}</p>
                </div>
                
                <div className={styles.features}>
                  {plan.features.slice(0, 4).map((feature, idx) => (
                    <div key={idx} className={styles.featureItem}>
                      <Check size={18} className={styles.checkIcon} />
                      <span>{feature}</span>
                    </div>
                  ))}
                  {plan.features.length > 4 && (
                      <div className={styles.moreFeatures}>+ {plan.features.length - 4} more features</div>
                  )}
                </div>

                <div className={styles.ctaWrapper}>
                  <Button variant={plan.isPopular ? 'primary' : 'outline'} className={styles.ctaBtn}>
                    {plan.cta}
                  </Button>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
