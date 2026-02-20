import { getServices } from '@/lib/db';
import PageHeader from '@/components/layout/PageHeader';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Services from '@/components/home/Services';

export const dynamic = 'force-dynamic';

export default async function ServicesPage() {
  const services = await getServices();
  
  return (
    <main>
      <Header />
      <PageHeader 
        title="Managed IT Services for High-End Enterprises" 
        subtitle="From remote support to advanced cybersecurity, we deliver the technological foundation your company needs to grow without interruption."
      />
      
      {/* Reusing Home Services component but adding top padding to separate from header */}
      <div style={{ paddingTop: '6rem' }}>
        <Services />
      </div>

      <Footer />
    </main>
  );
}
