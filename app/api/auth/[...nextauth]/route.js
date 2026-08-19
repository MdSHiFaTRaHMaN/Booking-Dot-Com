import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import connectToDatabase from '@/lib/db.js';
import User from '@/lib/models/User.js';
import Staff from '@/lib/models/Staff.js';
import bcrypt from 'bcryptjs';

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Please provide both email and password.');
        }

        const email = credentials.email.trim().toLowerCase();
        const password = credentials.password;

        try {
          await connectToDatabase();

          let user = await User.findOne({ email });
          const totalUsers = await User.countDocuments();

          // 1. If database is completely empty (0 users), auto-create the ADMIN account with whatever credentials are submitted!
          if (totalUsers === 0) {
            console.log(`[Auth] Database is empty. Auto-initializing Admin account for: ${email}`);
            const passwordHash = await bcrypt.hash(password, 10);
            user = await User.create({
              name: 'System Admin',
              email: email,
              passwordHash: passwordHash,
              role: 'ADMIN',
              avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
              phone: '+1 (555) 019-2834',
            });

            return {
              id: user._id.toString(),
              name: user.name,
              email: user.email,
              role: user.role,
              avatar: user.avatar,
              staffId: null,
            };
          }

          // 2. If user doesn't exist, but it's the default admin email, auto-create default admin
          if (!user && email === 'admin@bookingdotcom.com') {
            const defaultPassword = password || 'admin123';
            const passwordHash = await bcrypt.hash(defaultPassword, 10);
            user = await User.create({
              name: 'System Admin',
              email: 'admin@bookingdotcom.com',
              passwordHash: passwordHash,
              role: 'ADMIN',
              avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
              phone: '+1 (555) 019-2834',
            });

            return {
              id: user._id.toString(),
              name: user.name,
              email: user.email,
              role: user.role,
              avatar: user.avatar,
              staffId: null,
            };
          }

          if (!user || !user.passwordHash) {
            throw new Error('No account found with this email. Please verify your email.');
          }

          const isValidPassword = await bcrypt.compare(password, user.passwordHash);
          if (!isValidPassword) {
            throw new Error('Incorrect password. Please try again.');
          }

          let staffId = null;
          if (user.role === 'STAFF') {
            const staff = await Staff.findOne({ userId: user._id });
            if (staff) {
              staffId = staff._id.toString();
            }
          }

          return {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            role: user.role,
            avatar: user.avatar,
            staffId,
          };
        } catch (error) {
          console.error('[Auth Error]:', error);
          throw error;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.avatar = user.avatar;
        token.staffId = user.staffId;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.avatar = token.avatar;
        session.user.staffId = token.staffId;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET || 'development-secret-key-booking-system',
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
