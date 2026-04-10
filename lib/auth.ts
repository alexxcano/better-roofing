import NextAuth from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'
import { sendTelegramMessage, signupAlert } from '@/lib/telegram'
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

        try {
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
        } catch (err) {
          // Re-throw user-facing errors (lockout messages) as-is
          if (err instanceof Error && err.message.startsWith('Too many failed attempts')) throw err
          await logger.error('auth.credentials', err, { meta: { email } })
          return null
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === 'google' && user.email) {
        // Guard: if this Google providerAccountId is already linked to a DIFFERENT
        // user (email mismatch), block the sign-in. This prevents an active session
        // for user A from silently absorbing a Google account that belongs to user B.
        if (account.providerAccountId) {
          const existingAccount = await prisma.account.findUnique({
            where: {
              provider_providerAccountId: {
                provider: 'google',
                providerAccountId: account.providerAccountId,
              },
            },
            select: { user: { select: { email: true } } },
          })
          if (existingAccount && existingAccount.user.email !== user.email) {
            await logger.error('auth.signIn', new Error('Google account linked to mismatched user'), {
              meta: { providerAccountId: account.providerAccountId, googleEmail: user.email, linkedEmail: existingAccount.user.email },
            })
            return false
          }
        }

        // Bootstrap contractor for first-time Google sign-ins.
        // We look up by email (not user.id) because in Auth.js v5 the user.id in this
        // callback is a provisional provider ID, not the DB CUID the adapter will assign.
        // If the user row doesn't exist yet (race condition on very first sign-in),
        // we skip here — the jwt callback will finish bootstrap once the adapter commits.
        const dbUser = await prisma.user.findUnique({
          where: { email: user.email },
          select: { id: true, contractorId: true, role: true },
        })
        // Never bootstrap a contractor for ADMIN users.
        if (dbUser && !dbUser.contractorId && dbUser.role !== 'ADMIN') {
          try {
            const contractor = await prisma.contractor.create({
              data: {
                companyName: user.name ?? 'My Roofing Company',
                pricingSettings: { create: {} },
              },
            })
            await prisma.user.update({
              where: { id: dbUser.id },
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
            await sendTelegramMessage(signupAlert(user.name ?? 'Unknown', user.email, 'Google'))
          } catch (err) {
            await logger.error('auth.bootstrap', err, {
              userId: dbUser.id,
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
      // On first sign-in: if the user has no contractor yet (signIn callback couldn't
      // bootstrap because the user row didn't exist at that point), do it here.
      // By jwt time the adapter has committed the User row so token.id is the real CUID.
      if (trigger === 'signIn' && token.id && !token.contractorId) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { id: true, contractorId: true, role: true },
        })
        // Never bootstrap a contractor for ADMIN users.
        if (dbUser && !dbUser.contractorId && dbUser.role !== 'ADMIN') {
          try {
            const contractor = await prisma.contractor.create({
              data: {
                companyName: token.name ?? 'My Roofing Company',
                pricingSettings: { create: {} },
              },
            })
            await prisma.user.update({
              where: { id: dbUser.id },
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
            token.contractorId = contractor.id
            await sendTelegramMessage(signupAlert(token.name ?? 'Unknown', token.email ?? '', 'Google'))
          } catch (err) {
            await logger.error('auth.bootstrap', err, {
              userId: dbUser.id,
              meta: { email: token.email, name: token.name },
            })
          }
        } else if (dbUser) {
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
