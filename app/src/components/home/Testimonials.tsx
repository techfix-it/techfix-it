import styles from './Testimonials.module.css';
import { Star } from 'lucide-react';
import { getTestimonials } from '@/lib/db';

export default async function Testimonials() {
  const testimonials = await getTestimonials();

  return (
    <section className={styles.section}>
      <div className="container">
        <div className={styles.header}>
            <span className={styles.overline}>Testimonials</span>
            <h2 className={styles.title}>What Our Clients Say</h2>
        </div>
        
        <div className={styles.grid}>
          {testimonials.map((item: any) => (
            <div key={item.id} className={styles.card}>
              <div className={styles.stars}>
                {[...Array(item.rating)].map((_, i) => (
                  <Star key={i} size={18} fill="#FFD700" color="#FFD700" />
                ))}
              </div>
              <p className={styles.content}>"{item.content}"</p>
              <div className={styles.author}>
                <div className={styles.avatarPlaceholder}>
                    {item.author_name.charAt(0)}
                </div>
                <div>
                    <h4 className={styles.name}>{item.author_name}</h4>
                    <p className={styles.role}>{item.author_role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
