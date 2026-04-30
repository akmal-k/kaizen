import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { supabaseAdmin } from '@/lib/supabase-admin'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')!

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err) {
    return NextResponse.json({ error: 'Webhook signature invalid' }, { status: 400 })
  }

  const priceToplan = {
    [process.env.STRIPE_MOMENTUM_PRICE_ID!]: 'momentum',
    [process.env.STRIPE_MASTERY_PRICE_ID!]: 'mastery',
  }

  switch (event.type) {
    case 'customer.subscription.created':
    case 'customer.subscription.updated': {
      const sub = event.data.object as Stripe.Subscription
      const priceId = sub.items.data[0].price.id
      const plan = priceToplan[priceId] || 'free'

      const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .eq('stripe_customer_id', sub.customer as string)
        .single()

      if (profile) {
        await supabaseAdmin.from('profiles').update({
          plan,
          stripe_subscription_id: sub.id,
          plan_started_at: new Date().toISOString(),
        }).eq('id', profile.id)
      }
      break
    }

    case 'customer.subscription.deleted': {
      const sub = event.data.object as Stripe.Subscription
      const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .eq('stripe_customer_id', sub.customer as string)
        .single()

      if (profile) {
        await supabaseAdmin.from('profiles').update({
          plan: 'free',
          stripe_subscription_id: null,
        }).eq('id', profile.id)
      }
      break
    }
  }

  return NextResponse.json({ received: true })
}
