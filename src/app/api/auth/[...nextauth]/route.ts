import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

// Initialize Supabase Client for auth
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "MOCK_CLIENT_ID",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "MOCK_CLIENT_SECRET",
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        // Query Supabase for the user
        const { data: user, error } = await supabase
          .from('users')
          .select('*')
          .eq('email', credentials.email)
          .single();

        if (error || !user) {
          console.error("User not found", error);
          return null;
        }

        // Check password (In production, use bcrypt.compare here!)
        // Since we stored plain text in setup_database.sql, we do direct comparison for now
        if (user.password !== credentials.password) {
          console.error("Password mismatch");
          return null;
        }

        return { 
          id: user.id, 
          name: user.name, 
          email: user.email,
          role: user.role // Passing role
        };
      }
    })
  ],
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        const cookieStore = await cookies();
        const oauthAction = cookieStore.get('oauth_action')?.value;

        // Cek apakah user sudah ada di database
        const { data: existingUser } = await supabase
          .from('users')
          .select('*')
          .eq('email', user.email)
          .single();

        if (oauthAction === 'register') {
          if (!existingUser) {
            // Jika belum ada, buat user baru di Supabase
            const { error } = await supabase
              .from('users')
              .insert([{
                email: user.email,
                name: user.name,
                role: 'user', // Default role
                password: '', // OAuth tidak pakai password lokal
              }]);
              
            if (error) {
              console.error("Gagal membuat user dari Google:", error);
              return false; // Tolak jika gagal
            }
          }
          return true; // Berhasil register (atau sudah terdaftar)
        } else {
          // Action adalah login (atau tidak ada cookie)
          if (!existingUser) {
            // Tolak login karena belum terdaftar
            return '/login?error=NotRegistered'; // Redirect kembali ke login dengan pesan error
          }
          return true; // Berhasil login
        }
      }
      return true;
    },
    async jwt({ token, user, account }) {
      if (user) {
        // Saat pertama login (termasuk via Google), ambil role dari DB
        if (account?.provider === "google") {
          const { data: dbUser } = await supabase
            .from('users')
            .select('role')
            .eq('email', user.email)
            .single();
          token.role = dbUser?.role || 'user';
        } else {
          // Jika via Credentials, role sudah ada di object user
          token.role = (user as any).role;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.sub;
        (session.user as any).role = token.role;
      }
      return session;
    },
  },
  session: {
    strategy: "jwt"
  },
  secret: process.env.NEXTAUTH_SECRET || "supersecret123",
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
