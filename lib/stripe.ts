import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-04-10',
})

export const PLANS = {
  STARTER: {
    name: 'Starter',
    priceId: process.env.STRIPE_STARTER_PRICE_ID!,
    price: 49,
    features: [
      'Up to 50 leads/month',
      'Instant quote widget',
      'Lead scoring & qualification',
      'Service area filtering',
      'Email notifications',
      'CSV export',
      'Email support',
    ],
  },
  PRO: {
    name: 'Pro',
    priceId: process.env.STRIPE_PRO_PRICE_ID!,
    price: 97,
    features: [
      'Unlimited leads',
      'Everything in Starter',
      'AI follow-up email & SMS per lead',
      'Weekly lead intelligence report',
      'Webhook / Zapier integration',
      'Booking CTA on result screen',
      'Priority support',
    ],
  },
} as const
