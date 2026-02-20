import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Hero from '@/components/home/Hero';
import Services from '@/components/home/Services';
import Pricing from '@/components/home/Pricing';
import Testimonials from '@/components/home/Testimonials';
import { getHeroContent } from '@/lib/db';
import { SpeedInsights } from "@vercel/speed-insights/next"

export default async function Home() {
  const heroContent = await getHeroContent();
  
  return (
    <main>
      <SpeedInsights/>
      <Header />
      <Hero content={heroContent} />
      <Services />
      <Pricing />
      <Testimonials />
      <Footer />
    </main>
  );
}