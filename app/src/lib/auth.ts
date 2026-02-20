import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { supabase } from './supabase';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        console.log('[Auth] Starting authorization for:', credentials?.email);
        
        if (!credentials?.email || !credentials?.password) {
            console.log('[Auth] Missing credentials');
            return null;
        }

        // Debug env vars (safe check)
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
        console.log('[Auth] Env check - URL:', !!supabaseUrl, 'Key:', !!supabaseKey);

        try {
            const { data: user, error } = await supabase
                .from('admin_users')
                .select('*')
                .eq('email', credentials.email)
                .single();

            if (error) {
                console.error('[Auth] Supabase error:', error.message, error.details);
                return null;
            }

            if (!user) {
                console.log('[Auth] No user found for email:', credentials.email);
                return null;
            }

            console.log('[Auth] User found, checking password...');

            // Validating password (plain text as per implementation)
            if (user.password === credentials.password) {
                console.log('[Auth] Password match! Login successful.');
                return { id: user.id, name: user.name, email: user.email };
            } else {
                console.log('[Auth] Password mismatch.');
                return null;
            }
        } catch (err: any) {
            console.error('[Auth] Unexpected error during authorization:', err);
            return null;
        }
      }
    })
  ],
  pages: {
    signIn: '/auth/signin',
  },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async session({ session, token }) {
        if (session.user && token.sub) {
            session.user.name = token.name;
            session.user.email = token.email;
             // session.user.id = token.sub; // invalid types unless extended
        }
      return session;
    },
    async jwt({ token, user }) {
        if (user) {
            token.id = user.id;
        }
      return token;
    }
  }
};
