# BetterRoofing Instant Quote — Internal Developer Reference

This document is for internal use only. Do not share publicly or commit to a public repository.

---

## Quick Start

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

```bash
cp .env.local.example .env.local
```

Fill in all values (see Environment Variables section below).

### 3. Set up the database

```bash
npx prisma db push
```

### 4. Run the dev server

```bash
npm run dev
```

Visit `http://localhost:3000`

---

## Environment Variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `NEXTAUTH_SECRET` | Random secret — generate with `openssl rand -base64 32` |
| `NEXTAUTH_URL` | App URL (e.g. `http://localhost:3000`) |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | Google Maps key — requires Maps JavaScript API, Places API, Places API (New) |
| `STRIPE_SECRET_KEY` | Stripe secret key |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret |
| `STRIPE_STARTER_PRICE_ID` | Stripe Price ID for Starter plan |
| `STRIPE_PRO_PRICE_ID` | Stripe Price ID for Pro plan |
| `STRIPE_AGENCY_PRICE_ID` | Stripe Price ID for Agency plan |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key |
| `NEXT_PUBLIC_APP_URL` | App URL — used in widget embed and Stripe redirects |
| `OPENAI_API_KEY` | OpenAI key — used for lead summaries and weekly reports |
| `MAPBOX_TOKEN` | Mapbox token — server-side only, used for satellite imagery |
| `CRON_SECRET` | Secret for authenticating cron job requests |

---

## Stripe Setup

1. Create subscription products and prices in the [Stripe Dashboard](https://dashboard.stripe.com/) — see internal pricing doc for tier details
2. Copy the Price IDs into `.env.local`
3. Set up a webhook pointing to `https://yourdomain.com/api/stripe/webhook` with these events:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_failed`

Local development — use the Stripe CLI:
```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

---

## Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create OAuth 2.0 credentials
3. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google` (dev)
   - `https://yourdomain.com/api/auth/callback/google` (prod)
4. Copy Client ID and Secret into `.env.local`

---

## Widget Embed (for contractors)

After signup, contractors find their install snippet under **Dashboard → Install Widget**:

```html
<div id="roof-estimator"></div>
<script src="https://yourdomain.com/widget.js" data-contractor-id="CONTRACTOR_ID" async></script>
```

---

## Deploying to Vercel

```bash
vercel --prod
```

After deploying, update in the Vercel dashboard:
1. Set all environment variables
2. Update `NEXTAUTH_URL` and `NEXT_PUBLIC_APP_URL` to the production URL
3. Update Google OAuth redirect URIs
4. Update Stripe webhook URL to production endpoint

---

## Admin Access

Admin promotion is done directly in the database — contact the team lead for access. Do not document the method here.
