import 'server-only';
import { supabase } from './supabase';

export interface AdminUser {
    id: string;
    email: string;
    password?: string;
    name: string;
}

export interface Service {
    id: string;
    slug: string;
    title: string;
    shortDescription: string;
    short_description?: string; // Supabase column
    fullDescription: string;
    full_description?: string; // Supabase column
    icon: string;
    isExclusive: boolean;
    is_exclusive?: boolean; // Supabase column
    features: string[]; // JSONB
    imageUrl?: string;
    image_url?: string; // Supabase column
    display_order?: number;
}

export interface PricingPlan {
    id: string;
    slug: string;
    name: string;
    price: string;
    period: string;
    description: string;
    benefits_description?: string;
    features: string[];
    isPopular: boolean;
    is_popular?: boolean; // Supabase column
    featured?: boolean;
    cta: string;
}

export interface Testimonial {
    id: string;
    author_name: string;
    author_role: string;
    content: string;
    rating: number;
    avatar_url: string;
}

export interface LegalPage {
    id: string;
    slug: string;
    title: string;
    content: string;
    last_updated: string;
}

// Helper to normalize keys from snake_case (Supabase) to camelCase (App)
function normalizeService(s: any): Service {
    return {
        ...s,
        shortDescription: s.short_description || s.shortDescription,
        fullDescription: s.full_description || s.fullDescription,
        isExclusive: s.is_exclusive ?? s.isExclusive,
        imageUrl: s.image_url || s.imageUrl,
    };
}

function normalizePricing(p: any): PricingPlan {
    return {
        ...p,
        isPopular: p.is_popular ?? p.isPopular,
    };
}

export async function getServices(): Promise<Service[]> {
    const { data, error } = await supabase.from('services').select('*').order('display_order', { ascending: true });
    if (error) {
        console.error('Error fetching services:', error);
        return [];
    }
    return data.map(normalizeService);
}

export async function getPricingPlans(): Promise<PricingPlan[]> {
    const { data, error } = await supabase.from('pricing_plans').select('*').order('price', { ascending: true }); // simplified sort
    if (error) {
        console.error('Error fetching pricing:', error);
        return [];
    }
    return data.map(normalizePricing);
}

export async function getPricingPlanBySlug(slug: string): Promise<PricingPlan | null> {
    const { data, error } = await supabase.from('pricing_plans').select('*').eq('slug', slug).single();
    if (error) return null;
    return normalizePricing(data);
}

export async function getHeroContent() {
    const { data } = await supabase.from('site_content').select('data').eq('key', 'hero_section').single();
    return data?.data || {};
}

export async function getFooterContent() {
    const { data } = await supabase.from('site_content').select('data').eq('key', 'footer_content').single();
    return data?.data || {};
}

export async function getTestimonials(): Promise<Testimonial[]> {
     const { data, error } = await supabase.from('testimonials').select('*');
     if (error) return [];
     return data as Testimonial[];
}

export async function getLegalPages(): Promise<LegalPage[]> {
    const { data, error } = await supabase.from('legal_pages').select('*');
    if (error) {
        // Fallback default
        return [
            { id: '1', slug: 'privacy-policy', title: 'Privacy Policy', content: '', last_updated: new Date().toISOString() },
            { id: '2', slug: 'terms-of-service', title: 'Terms of Service', content: '', last_updated: new Date().toISOString() }
        ];
    }
    return data as LegalPage[];
}

export async function getAboutPage() {
    const { data } = await supabase.from('site_content').select('data').eq('key', 'about_page').single();
    return data?.data || {};
}
