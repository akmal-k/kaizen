import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { PLANS } from '@/lib/plans'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(req: NextRequest) {
  const { planId, userId, email } = await req.json()

  const plan = PLANS[planId as keyof typeof PLANS]
  if (!plan || plan.id === 'free') {
    return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
  }

  // Get or create Stripe customer
  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('stripe_customer_id')
    .eq('id', userId)
    .single()

  let customerId = profile?.stripe_customer_id
  if (!customerId) {
    const customer = await stripe.customers.create({ email, metadata: { supabase_id: userId } })
    customerId = customer.id
    await supabaseAdmin.from('profiles').update({ stripe_customer_id: customerId }).eq('id', userId)
  }

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    payment_method_types: ['card'],
    mode: 'subscription',
    line_items: [{ price: (plan as any).stripePriceId, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?upgraded=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing`,
    allow_promotion_codes: true,
  })

  return NextResponse.json({ url: session.url })
}
