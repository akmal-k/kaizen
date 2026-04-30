export const PLANS = {
  free: {
    id: 'free',
    name: 'Free Trial',
    tagline: '30 days to feel the difference',
    price: 0,
    period: '30 days',
    color: '#888780',
    features: [
      '3 daily habits',
      'Basic AI career plan (1x)',
      '30-day streak tracking',
      'Career or habits focus',
      'Community access',
      'Email check-ins',
    ],
    limits: {
      habits_per_day: 3,
      ai_plan_refreshes: 1,
      streak_days: 30,
      areas: 1,
      reminders: false,
      insights: false,
      custom_habits: false,
    },
    cta: 'Start free trial',
    highlighted: false,
  },
  momentum: {
    id: 'momentum',
    name: 'Momentum',
    tagline: 'Build unstoppable daily habits',
    price: 9,
    period: 'month',
    color: '#C9932A',
    stripePriceId: process.env.STRIPE_MOMENTUM_PRICE_ID,
    features: [
      'Unlimited daily habits',
      'AI-personalized plan (refresh monthly)',
      'Full streak history & calendar',
      'Career + general habits',
      'Daily email reminders',
      'Weekly progress insights',
      'Career roadmap generator',
      'Priority support',
    ],
    limits: {
      habits_per_day: -1,
      ai_plan_refreshes: 1,
      streak_days: -1,
      areas: 2,
      reminders: true,
      insights: true,
      custom_habits: false,
    },
    cta: 'Start Momentum',
    highlighted: true,
  },
  mastery: {
    id: 'mastery',
    name: 'Mastery',
    tagline: 'Total life transformation, guided by AI',
    price: 19,
    period: 'month',
    color: '#27A87A',
    stripePriceId: process.env.STRIPE_MASTERY_PRICE_ID,
    features: [
      'Everything in Momentum',
      'All life areas (career, health, mindset, relationships)',
      'AI plan refresh every week',
      'Custom habit builder',
      'Advanced analytics dashboard',
      'Team accountability groups',
      '1-on-1 onboarding call',
      'Early access to new features',
      'Lifetime discount lock-in',
    ],
    limits: {
      habits_per_day: -1,
      ai_plan_refreshes: 4,
      streak_days: -1,
      areas: -1,
      reminders: true,
      insights: true,
      custom_habits: true,
    },
    cta: 'Unlock Mastery',
    highlighted: false,
  },
} as const

export type PlanId = keyof typeof PLANS

export function getPlanLimits(plan: PlanId) {
  return PLANS[plan].limits
}

export function canAccessFeature(plan: PlanId, feature: keyof typeof PLANS['mastery']['limits']) {
  const limits = PLANS[plan].limits
  const val = limits[feature]
  if (typeof val === 'boolean') return val
  return val === -1 || (val as number) > 0
}
