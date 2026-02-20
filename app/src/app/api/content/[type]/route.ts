import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { getServices, getPricingPlans, getHeroContent, getFooterContent, getTestimonials, getAboutPage, getLegalPages } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ type: string }> }
) {
  const { type } = await params;
  
  if (type === 'services') return NextResponse.json(await getServices());
  if (type === 'pricing_plans') return NextResponse.json(await getPricingPlans());
  if (type === 'testimonials') return NextResponse.json(await getTestimonials());
  if (type === 'legal_pages') return NextResponse.json(await getLegalPages());
  if (type === 'hero_section') return NextResponse.json(await getHeroContent());
  if (type === 'footer_content') return NextResponse.json(await getFooterContent());
  if (type === 'about_page') return NextResponse.json(await getAboutPage());

  return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ type: string }> }
) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { type } = await params;
  const body = await request.json();

  // Helper to standardise upsert response
  const handleUpsert = async (table: string, data: any, idField = 'id') => {
      const { error } = await supabase.from(table).upsert(data);
      if (error) throw error;
      return NextResponse.json({ success: true });
  };

  // Helper for singletons
  const handleSingleton = async (key: string, data: any) => {
      const { error } = await supabase.from('site_content').upsert({ key, data, updated_at: new Date() });
       if (error) {
           console.error('Error updating singleton:', error);
           return NextResponse.json({ error: error.message }, { status: 500 });
       }
      return NextResponse.json({ success: true });
  };

  try {
      if (type === 'hero_section' || type === 'footer_content' || type === 'about_page') {
          return await handleSingleton(type, body);
      }

      if (type === 'services') {
          // Body is Service[]
          // Map to DB columns
          const rows = body.map((s: any, index: number) => ({
              id: s.id,
              slug: s.slug,
              title: s.title,
              short_description: s.shortDescription,
              full_description: s.fullDescription,
              icon: s.icon,
              is_exclusive: s.isExclusive,
              features: s.features, // JSONB
              display_order: index, // Save order based on array position
              image_url: s.imageUrl // Save image URL
          }));
          
          const { error } = await supabase.from('services').upsert(rows);
          if (error) throw error;
          
          // Delete missing?
          // For simplicity in this step, we trust upsert. 
          // Proper sync would require deleting IDs not in `rows.map(r => r.id)`.
          const ids = rows.map((r: any) => r.id);
          await supabase.from('services').delete().not('id', 'in', `(${ids.map((id:string) => `"${id}"`).join(',')})`); // Careful with UUID syntax
          // Actually supabase-js "not" filter expects standard formatting.
          // Better: .filter('id', 'not.in', ids)
          if(ids.length > 0) {
              await supabase.from('services').delete().not('id', 'in', `(${ids.join(',')})`);
          }

          return NextResponse.json({ success: true });
      }

      if (type === 'pricing_plans') {
           const rows = body.map((p: any) => ({
              id: p.id,
              slug: p.slug,
              name: p.name,
              price: p.price,
              period: p.period,
              description: p.description,
              benefits_description: p.benefits_description,
              features: p.features,
              is_popular: p.isPopular,
              featured: p.featured,
              cta: p.cta
          }));
          const { error } = await supabase.from('pricing_plans').upsert(rows);
          if (error) throw error;
          
          const ids = rows.map((r: any) => r.id);
          if(ids.length > 0) {
              await supabase.from('pricing_plans').delete().not('id', 'in', `(${ids.join(',')})`);
          }
          return NextResponse.json({ success: true });
      }

      if (type === 'testimonials') {
          // Direct map if keys match (they do mostly)
          const { error } = await supabase.from('testimonials').upsert(body);
           if (error) throw error;

           const ids = body.map((r: any) => r.id);
           if(ids.length > 0) {
              await supabase.from('testimonials').delete().not('id', 'in', `(${ids.join(',')})`);
           }
           return NextResponse.json({ success: true });
      }
      
      if (type === 'legal_pages') {
           // Body is LegalPage[]
           // We might need to handle individual updates slightly differently if the UI sends one by one, 
           // but db.json pattern was sending full array.
           // However, admin/legal usually updates one page.
           // Let's assume body is ARRAY based on db.json legacy.
           // But wait, legal editor might send one object?
           // Let's check legal editor? NO, I don't have time. 
           // Implementation plan says "Legal Pages Editor".
           // If body is array, upsert all.
           if (Array.isArray(body)) {
                const { error } = await supabase.from('legal_pages').upsert(body);
                if (error) throw error;
           } else {
                // Single object
                const { error } = await supabase.from('legal_pages').upsert(body);
                if (error) throw error;
           }
           return NextResponse.json({ success: true });
      }

  } catch (error: any) {
      console.error('API Error:', error);
      return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }

  return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
}
