'use client';

import { Button } from '@/components/ui/Button';
import Lottie from 'lottie-react';
import styles from './Hero.module.css';
import { useEffect, useState } from 'react';
import Link from 'next/link';

const LottiePlayer = ({ url }: { url: string }) => {
  const [animationData, setAnimationData] = useState(null);

  useEffect(() => {
    if (!url) return;
    fetch(url)
      .then((res) => res.json())
      .then((data) => setAnimationData(data))
      .catch((err) => console.error("Failed to load Lottie:", err));
  }, [url]);

  if (!animationData) return <div className={styles.lottiePlaceholder}>Loading animation...</div>;

  return <Lottie animationData={animationData} loop={true} />;
};

interface HeroProps {
  content: {
    title?: string;
    subtitle?: string;
    image_url?: string;
    cta_primary_text?: string;
    cta_primary_link?: string;
    cta_secondary_text?: string;
    cta_secondary_link?: string;
    background_image?: string;
    show_lottie?: boolean;
  }
}

export default function Hero({ content }: HeroProps) {
  // Default values strictly if content is missing, though db.json should have it.
  const title = content?.title || "IT solutions that drive innovation and excellence in Ireland.";
  const subtitle = content?.subtitle || "Specialized technical support and managed IT services designed to scale your business. Security, performance, and continuity where you need it most.";
  // Override any stored Lottie JSON with the visual GIF if not explicitly set elsewhere or if it's the old default
  const rawImageUrl = content?.image_url;
  const lottieUrl = (!rawImageUrl || rawImageUrl.includes('lottie.host')) 
    ? "/uploads/globo.gif" 
    : rawImageUrl;
    
  const backgroundImage = content?.background_image;
  const showLottie = content?.show_lottie !== false;

  return (
    <section 
        className={styles.hero} 
        style={backgroundImage ? { 
            backgroundImage: `url(${backgroundImage})`, 
            backgroundSize: 'cover', 
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
        } : {}}
    >
      <div className={styles.overlay} style={backgroundImage ? { opacity: 0.7, backgroundColor: 'rgba(0,0,0,0.6)' } : {}}></div>
      <div className={styles.container}>
        <div className={styles.content}>
          <h1 className={styles.title}>
             {/* Creating a simplistic highlight for 'innovation' if it exists in the title, otherwise just text */}
             {title.includes('innovation') ? (
                 <>
                    {title.split('innovation')[0]} 
                    <span className={styles.highlight}>innovation</span>
                    {title.split('innovation')[1]}
                 </>
             ) : (
                 title
             )}
          </h1>
          <p className={styles.description}>
            {subtitle}
          </p>
          <div className={styles.actions}>
            <Button href={content?.cta_primary_link || "/services"} size="lg" variant="primary">
                {content?.cta_primary_text || "Discover More"}
            </Button>
            <Button href={content?.cta_secondary_link || "/contact"} size="lg" variant="outline" className={styles.secondaryBtn}>
                {content?.cta_secondary_text || "Contact Us"}
            </Button>
          </div>
        </div>

        {showLottie && (
            <div className={styles.visual}>
                <div className={styles.lottieWrapper}>
                    {lottieUrl?.endsWith('.json') ? (
                        <LottiePlayer url={lottieUrl} />
                    ) : (
                        <img src={lottieUrl} alt="Hero Animation" style={{ width: '100%', height: 'auto', objectFit: 'contain', maxHeight: '500px' }} />
                    )}
                </div>
            </div>
        )}
      </div>
    </section>
  );
}