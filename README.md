# Kaizen SaaS — Complete Setup Guide

> Build career skills and life habits in 10 minutes a day. AI-personalized, streak-driven, conversion-optimized.

## Tech Stack
- **Frontend**: Next.js 14 (App Router) + React
- **Database + Auth**: Supabase (Postgres, magic link, Google OAuth)
- **Payments**: Stripe (subscriptions)
- **Email reminders**: Cloudflare Workers + Resend
- **AI plan generation**: Claude (Anthropic API)
- **Hosting**: Vercel (free tier)
- **DNS/CDN**: Cloudflare (free tier)

## Plans
| Plan | Price | Key features |
|------|-------|--------------|
| Free Trial | $0 | 30 days, 3 habits/day, 1x AI plan |
| Momentum | $9/mo | Unlimited habits, monthly AI refresh, reminders |
| Mastery | $19/mo | Weekly AI refresh, all life areas, custom habits, team features |

---

## 1. Supabase Setup

1. Create project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run the full schema from `supabase-schema.sql`
3. In **Authentication → Providers**, enable:
   - Email (magic link) ✓ already on
   - Google OAuth (add client ID + secret)
4. In **Authentication → URL Configuration**, add:
   - Site URL: `https://yourapp.vercel.app`
   - Redirect URL: `https://yourapp.vercel.app/**`
5. Copy from **Settings → API**:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`

### Add yourself as admin
```sql
-- Run in Supabase SQL Editor after signing up
INSERT INTO admin_users (id, email)
SELECT id, email FROM auth.users WHERE email = 'your@email.com';
```

---

## 2. Stripe Setup

1. Create account at [stripe.com](https://stripe.com)
2. In **Products**, create two products:
   - **Momentum** — $9/month recurring → copy Price ID
   - **Mastery** — $19/month recurring → copy Price ID
3. Set up webhook:
   - Endpoint: `https://yourapp.vercel.app/api/stripe/webhook`
   - Events: `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`
   - Copy **Webhook Secret**
4. Copy from Dashboard:
   - `STRIPE_SECRET_KEY` (sk_live_...)
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (pk_live_...)
   - `STRIPE_MOMENTUM_PRICE_ID`
   - `STRIPE_MASTERY_PRICE_ID`

---

## 3. Anthropic API

1. Get API key at [console.anthropic.com](https://console.anthropic.com)
2. Set `ANTHROPIC_API_KEY` in env

---

## 4. Resend (Email)

1. Create account at [resend.com](https://resend.com)
2. Add and verify your domain
3. Copy API key → `RESEND_API_KEY`
4. Set `RESEND_FROM_EMAIL` = `noreply@yourdomain.com`

---

## 5. Vercel Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# From project root
vercel

# Set all env vars in Vercel dashboard or:
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
# ... (all vars from .env.local.example)
```

---

## 6. Cloudflare Setup

### DNS (free)
1. Add your domain to Cloudflare
2. Point to Vercel via CNAME

### Daily reminder worker
```bash
# Install Wrangler
npm i -g wrangler
wrangler login

cd cloudflare-worker

# Set secrets
wrangler secret put SUPABASE_URL
wrangler secret put SUPABASE_SERVICE_KEY
wrangler secret put RESEND_API_KEY

# Deploy
wrangler deploy
```

The worker runs daily at 8am UTC and sends email reminders to Momentum + Mastery users who haven't completed habits that day.

---

## 7. Admin Dashboard

Access at: `https://yourapp.vercel.app/admin`

1. Sign in with your admin email
2. Run the SQL to add yourself as admin (see Supabase setup step)
3. Dashboard shows: MRR, user list, plan breakdown, streak stats, onboarding rates

**Set your admin email:**
```env
NEXT_PUBLIC_ADMIN_EMAIL=your@email.com
```

---

## Local Development

```bash
# Clone and install
npm install

# Copy env vars
cp .env.local.example .env.local
# Fill in all values

# Run dev server
npm run dev
# → http://localhost:3000
```

---

## Project Structure

```
kaizen-saas/
├── app/
│   ├── page.tsx              # Landing page
│   ├── pricing/page.tsx      # Pricing page (3 plans)
│   ├── auth/login/page.tsx   # Magic link + Google auth
│   ├── dashboard/page.tsx    # User habit dashboard
│   ├── onboarding/page.tsx   # AI plan generation flow
│   ├── admin/page.tsx        # 🔑 Admin monitoring panel
│   └── api/
│       ├── habits/generate/  # Claude AI plan generator
│       ├── stripe/checkout/  # Create checkout session
│       └── stripe/webhook/   # Handle subscription events
├── lib/
│   ├── supabase.ts           # DB client + types
│   └── plans.ts              # Plan configs + feature flags
├── cloudflare-worker/
│   └── reminder.js           # Daily email reminder cron
├── supabase-schema.sql       # Complete DB schema
└── .env.local.example        # All required env vars
```

---

## Validation Checklist (do before writing more code)

- [ ] Landing page live with email capture
- [ ] 20 waitlist signups
- [ ] 5 user interviews done
- [ ] Pre-sell page live with Stripe Payment Link
- [ ] 10 pre-sales = green light to build the full app

---

## Revenue Targets

| MRR | What that looks like |
|-----|----------------------|
| $500 | 55 Momentum users |
| $1,000 | 111 Momentum OR 53 Mastery |
| $5,000 | Mix of ~400 Momentum + ~100 Mastery |
| $10,000 | ~700 paying users avg $14 |
