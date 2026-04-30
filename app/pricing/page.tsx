'use client'
import Link from 'next/link'
import { PLANS } from '@/lib/plans'

const COMPARISON = [
  { feature: 'Daily habits', free: '3 habits', momentum: 'Unlimited', mastery: 'Unlimited' },
  { feature: 'AI plan generation', free: '1x (on signup)', momentum: 'Monthly refresh', mastery: 'Weekly refresh' },
  { feature: 'Life areas', free: '1 area', momentum: 'Career + habits', mastery: 'All 5 areas' },
  { feature: 'Streak tracking', free: '30 days', momentum: 'Full history', mastery: 'Full history' },
  { feature: 'Email reminders', free: false, momentum: true, mastery: true },
  { feature: 'Progress insights', free: false, momentum: true, mastery: true },
  { feature: 'Custom habit builder', free: false, momentum: false, mastery: true },
  { feature: 'Team accountability', free: false, momentum: false, mastery: true },
  { feature: 'Advanced analytics', free: false, momentum: false, mastery: true },
  { feature: '1-on-1 onboarding call', free: false, momentum: false, mastery: true },
  { feature: 'Priority support', free: false, momentum: true, mastery: true },
]

function Check({ ok, text }: { ok: boolean | string, text?: string }) {
  if (typeof ok === 'string') return <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{ok}</span>
  return ok
    ? <span style={{ color: 'var(--teal)', fontSize: 16 }}>✓</span>
    : <span style={{ color: 'var(--text-muted)', fontSize: 16 }}>—</span>
}

export default function PricingPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Nav */}
      <nav style={{ borderBottom: '1px solid var(--border)', padding: '0 2.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 72, position: 'sticky', top: 0, background: 'rgba(12,11,9,0.94)', backdropFilter: 'blur(16px)', zIndex: 100 }}>
        <Link href="/" style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 22, letterSpacing: '-0.01em', fontStyle: 'italic', textDecoration: 'none', color: 'var(--text-primary)' }}>
          kaizen<span style={{ color: 'var(--gold)', fontStyle: 'normal' }}>.</span>
        </Link>
        <div style={{ display: 'flex', gap: 8 }}>
          <Link href="/auth/login" className="btn btn-ghost" style={{ padding: '8px 16px', fontSize: 13 }}>Sign in</Link>
          <Link href="/auth/login" className="btn btn-primary" style={{ padding: '8px 18px', fontSize: 13 }}>Start free</Link>
        </div>
      </nav>

      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '80px 2rem' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 60 }}>
          <div className="badge badge-purple" style={{ marginBottom: 16, display: 'inline-flex' }}>Simple, honest pricing</div>
          <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 16 }}>
            Invest in yourself.<br />
            <span className="gradient-text">Cancel anytime.</span>
          </h1>
          <p style={{ fontSize: 16, color: 'var(--text-secondary)' }}>Start with 30 days free. No credit card required.</p>
        </div>

        {/* Plans grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 64 }}>
          {Object.values(PLANS).map(plan => (
            <div
              key={plan.id}
              className="card"
              style={{
                border: plan.highlighted ? `1px solid ${plan.color}` : '1px solid var(--border)',
                position: 'relative',
                background: plan.highlighted ? `linear-gradient(135deg, var(--bg-card) 0%, rgba(201,147,42,0.05) 100%)` : 'var(--bg-card)',
              }}
            >
              {plan.highlighted && (
                <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: plan.color, color: 'white', fontSize: 11, fontWeight: 600, padding: '3px 12px', borderRadius: 20, whiteSpace: 'nowrap' }}>
                  MOST POPULAR
                </div>
              )}

              {/* Plan header */}
              <div style={{ marginBottom: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: plan.color }} />
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700 }}>{plan.name}</span>
                </div>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16 }}>{plan.tagline}</p>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: 38, fontWeight: 800 }}>
                    {plan.price === 0 ? 'Free' : `$${plan.price}`}
                  </span>
                  {plan.price > 0 && <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>/month</span>}
                </div>
                {plan.id === 'free' && <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>for 30 days, then choose a plan</p>}
              </div>

              {/* Features */}
              <ul style={{ listStyle: 'none', marginBottom: 28, display: 'flex', flexDirection: 'column', gap: 10 }}>
                {plan.features.map(f => (
                  <li key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 13, color: 'var(--text-secondary)' }}>
                    <span style={{ color: plan.color, marginTop: 1, flexShrink: 0 }}>✓</span>
                    {f}
                  </li>
                ))}
              </ul>

              <Link
                href="/auth/login"
                className="btn"
                style={{
                  display: 'block',
                  textAlign: 'center',
                  textDecoration: 'none',
                  background: plan.highlighted ? plan.color : 'transparent',
                  color: plan.highlighted ? 'white' : 'var(--text-secondary)',
                  border: plan.highlighted ? 'none' : '1px solid var(--border)',
                  padding: '11px 20px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: 13,
                  fontWeight: 500,
                  transition: 'all 0.2s',
                  width: '100%',
                }}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>

        {/* What you're paying for */}
        <div style={{ marginBottom: 64 }}>
          <h2 style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 8, textAlign: 'center' }}>What are you actually paying for?</h2>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', textAlign: 'center', marginBottom: 40 }}>Here's the honest answer.</p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
            {[
              { icon: '🧠', title: 'Your AI coach, always on', desc: 'The AI doesn\'t give generic advice. It knows your goal, your time, your struggles — and builds a plan only for you. Every week (Mastery) or month (Momentum), it reassesses and improves the plan based on your completions.' },
              { icon: '🔁', title: 'The streak system that actually works', desc: 'Most habit apps let you fail silently. Kaizen sends reminders, shows your streak at risk, and keeps habits so small that even on your worst day, you can check off one thing. That consistency is worth more than any course.' },
              { icon: '📈', title: 'Progress you can see and share', desc: 'Kaizen turns 10 minutes a day into visible career capital. Your weekly insight report shows what\'s compounding. The streak card lets you share your progress — which keeps you accountable AND attracts opportunities.' },
              { icon: '🎯', title: 'A plan built around your life', desc: 'Not a generic list of "read 10 pages a day." A plan that fits your career goal (promotion, new skill, side project) AND your life habits (fitness, mindset, relationships) in the time you actually have each day.' },
            ].map(item => (
              <div key={item.title} className="card" style={{ display: 'flex', gap: 16 }}>
                <div style={{ fontSize: 28, flexShrink: 0 }}>{item.icon}</div>
                <div>
                  <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 8 }}>{item.title}</h3>
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.65 }}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Comparison table */}
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 24, textAlign: 'center' }}>Full feature comparison</h2>
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-2)' }}>
                  <th style={{ padding: '14px 20px', textAlign: 'left', color: 'var(--text-secondary)', fontWeight: 500 }}>Feature</th>
                  {Object.values(PLANS).map(p => (
                    <th key={p.id} style={{ padding: '14px 20px', textAlign: 'center', fontFamily: 'var(--font-display)', fontWeight: 700, color: p.highlighted ? 'var(--purple-light)' : 'var(--text-primary)' }}>{p.name}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {COMPARISON.map((row, i) => (
                  <tr key={row.feature} style={{ borderBottom: i < COMPARISON.length - 1 ? '1px solid var(--border)' : 'none' }}>
                    <td style={{ padding: '12px 20px', color: 'var(--text-secondary)' }}>{row.feature}</td>
                    <td style={{ padding: '12px 20px', textAlign: 'center' }}><Check ok={row.free} /></td>
                    <td style={{ padding: '12px 20px', textAlign: 'center' }}><Check ok={row.momentum} /></td>
                    <td style={{ padding: '12px 20px', textAlign: 'center' }}><Check ok={row.mastery} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQ */}
        <div style={{ marginTop: 64 }}>
          <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 32, textAlign: 'center' }}>Common questions</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              { q: 'What happens after my 30-day trial?', a: 'You\'ll be prompted to choose Momentum or Mastery. If you don\'t upgrade, your account is paused — your data is saved. No charges ever happen without your action.' },
              { q: 'Can I switch plans?', a: 'Yes, upgrade or downgrade anytime. Prorated immediately — you\'ll only pay the difference.' },
              { q: 'How does the AI plan work?', a: 'After onboarding, our AI (powered by Claude) builds a 3-phase habit plan tailored to your goal and time. Momentum users get a monthly refresh; Mastery users get weekly refreshes as the AI learns your patterns.' },
              { q: 'Is my data safe?', a: 'Stored securely in Supabase (Postgres on AWS), encrypted at rest and in transit. We never sell your data. You can export or delete anytime.' },
            ].map(item => (
              <div key={item.q} className="card">
                <p style={{ fontSize: 14, fontWeight: 500, marginBottom: 8 }}>{item.q}</p>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.65 }}>{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
