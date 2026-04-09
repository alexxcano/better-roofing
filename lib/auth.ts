import NextAuth from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'
import { z } from 'zod'

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

const nextAuth = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/login',
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials)
        if (!parsed.success) return null

        const { email, password } = parsed.data

        const user = await prisma.user.findUnique({ where: { email } })

        if (!user || !user.password) return null

        // Check lockout
        if (user.loginLockedUntil && user.loginLockedUntil > new Date()) {
          const minutesLeft = Math.ceil((user.loginLockedUntil.getTime() - Date.now()) / 60000)
          throw new Error(`Too many failed attempts. Try again in ${minutesLeft} minute${minutesLeft === 1 ? '' : 's'}.`)
        }

        const isValid = await bcrypt.compare(password, user.password)

        if (!isValid) {
          const attempts = user.failedLoginAttempts + 1
          const locked = attempts >= 5
          await prisma.user.update({
            where: { id: user.id },
            data: {
              failedLoginAttempts: attempts,
              loginLockedUntil: locked ? new Date(Date.now() + 15 * 60 * 1000) : null,
            },
          })
          if (locked) {
            throw new Error('Too many failed attempts. Try again in 15 minutes.')
          }
          return null
        }

        // Success — reset counters
        await prisma.user.update({
          where: { id: user.id },
          data: { failedLoginAttempts: 0, loginLockedUntil: null },
        })

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          contractorId: user.contractorId,
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      // Bootstrap contractor for first-time Google sign-ins.
      // We check the DB directly rather than relying on the user object since
      // PrismaAdapter may not have flushed the User row before this callback fires.
      if (account?.provider === 'google' && user.id) {
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: { contractorId: true },
        })
        // dbUser may be null on the very first sign-in if the adapter hasn't written
        // the row yet — fall back to treating a missing contractorId as a new user.
        const needsBootstrap = !dbUser || !dbUser.contractorId
        if (needsBootstrap) {
          try {
            const contractor = await prisma.contractor.create({
              data: {
                companyName: user.name ?? 'My Roofing Company',
                pricingSettings: { create: {} },
              },
            })
            await prisma.user.update({
              where: { id: user.id },
              data: { contractorId: contractor.id },
            })
            await prisma.subscription.create({
              data: {
                contractorId: contractor.id,
                plan: 'PRO',
                status: 'trialing',
                trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
              },
            })
          } catch (err) {
            await logger.error('auth.bootstrap', err, {
              userId: user.id,
              meta: { email: user.email, name: user.name },
            })
          }
        }
      }
      return true
    },
    async jwt({ token, user, trigger }) {
      if (user) {
        token.id = user.id
        token.role = (user as any).role
        token.contractorId = (user as any).contractorId
      }
      // Re-fetch contractorId for Google users on first sign-in (it's set after jwt fires)
      if (trigger === 'signIn' && token.id && !token.contractorId) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { contractorId: true, role: true },
        })
        if (dbUser) {
          token.contractorId = dbUser.contractorId
          token.role = dbUser.role
        }
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        session.user.role = token.role as string
        session.user.contractorId = token.contractorId as string | null
      }
      return session
    },
  },
})

export const { handlers, signIn, signOut } = nextAuth

// Dev auth bypass — set DEV_BYPASS_AUTH=true in .env.local to skip login
const DEV_SESSION = {
  user: {
    id: 'dev-user-id',
    email: 'dev@betterroofing.co',
    name: 'Dev User',
    role: 'ADMIN',
    contractorId: process.env.DEV_CONTRACTOR_ID ?? 'dev-contractor-id',
  },
  expires: new Date(Date.now() + 86400 * 1000).toISOString(),
}

export const auth =
  process.env.DEV_BYPASS_AUTH === 'true' && process.env.NODE_ENV !== 'production'
    ? (() => Promise.resolve(DEV_SESSION)) as typeof nextAuth.auth
    : nextAuth.auth
