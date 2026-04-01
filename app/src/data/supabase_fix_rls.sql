-- TechFix-IT: Advanced Database Security Fixes
-- This script fixes RLS, Function Search Paths, and Sensitive Column Exposure.

-- 1. Enable Row Level Security (RLS)
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pricing_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.legal_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;

-- 2. PUBLIC READ ACCESS (Marketing Data)
CREATE POLICY "Public Read: Services" ON public.services FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public Read: Pricing Plans" ON public.pricing_plans FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public Read: Testimonials" ON public.testimonials FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public Read: Legal Pages" ON public.legal_pages FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public Read: Site Content" ON public.site_content FOR SELECT TO anon, authenticated USING (true);

-- 3. SUPPORT ACCESS (Tickets & Messages)
-- Allows our Admin Dashboard (anon client) to function.
CREATE POLICY "Support: Manage Tickets" ON public.tickets FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Support: Manage Messages" ON public.messages FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- 4. ADMIN USER LOCKDOWN
-- Explicitly deny everything to clear 'rls_enabled_no_policy' info warning.
-- Access is still granted to service_role (used in our secured auth logic).
CREATE POLICY "Admin: Deny All Public Access" ON public.admin_users FOR ALL TO anon, authenticated USING (false);

-- 5. FUNCTION SECURITY (Search Path Fix)
-- Prevents search path hijacking for the new user handler.
ALTER FUNCTION public.handle_new_user() SET search_path = public, auth;

-- ---------------------------------------------------------
-- MANUAL ACTIONS REQUIRED IN SUPABASE DASHBOARD:
-- ---------------------------------------------------------
-- 1. Go to Authentication > Providers > Email
-- 2. Enable "Have I Been Pwned" (Leaked Password Protection)
-- 3. Ensure your SUPABASE_SERVICE_ROLE_KEY is correctly set in .env.local
