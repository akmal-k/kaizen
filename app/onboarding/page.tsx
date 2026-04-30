'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'

const STEPS = ['goal', 'time', 'areas', 'generating'] as const
type Step = typeof STEPS[number]

const GOALS = [
  { id: 'promotion', label: 'Get promoted', icon: '📈', desc: 'Focus on skills, visibility, and leadership habits' },
  { id: 'new_skill', label: 'Learn a new skill', icon: '🧠', desc: 'Daily practice, coding, design, writing, or any craft' },
  { id: 'side_project', label: 'Build a side project', icon: '🚀', desc: 'Consistent progress on your own product or business' },
  { id: 'career_change', label: 'Change careers', icon: '🔄', desc: 'Build credibility and skills in a new field' },
  { id: 'wellbeing', label: 'Better life habits', icon: '🌱', desc: 'Health, mindset, relationships — holistic growth' },
  { id: 'custom', label: 'Custom goal', icon: '✨', desc: 'Tell us exactly what you want to achieve' },
]

const TIME_OPTIONS = [
  { value: 5, label: '5 min', desc: 'Bare minimum — even on tough days' },
  { value: 10, label: '10 min', desc: 'The sweet spot — recommended' },
  { value: 15, label: '15 min', desc: 'Serious growth mode' },
  { value: 30, label: '30 min', desc: 'Maximum momentum' },
]

const AREAS = [
  { id: 'career', label: 'Career', icon: '💼' },
  { id: 'skill', label: 'Skills', icon: '🔧' },
  { id: 'health', label: 'Health', icon: '💪' },
  { id: 'mindset', label: 'Mindset', icon: '🧘' },
  { id: 'relationship', label: 'Relationships', icon: '🤝' },
]

export default function OnboardingPage() {
  const [step, setStep] = useState<Step>('goal')
  const [goal, setGoal] = useState('')
  const [customGoal, setCustomGoal] = useState('')
  const [time, setTime] = useState(10)
  const [areas, setAreas] = useState<string[]>(['career'])
  const [loading, setLoading] = useState(false)
  const [generatingText, setGeneratingText] = useState('Analyzing your goal...')

  const stepIndex = STEPS.indexOf(step)

  function toggleArea(id: string) {
    setAreas(prev => prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id])
  }

  async function generatePlan() {
    setStep('generating')
    setLoading(true)

    const texts = [
      'Analyzing your goal...',
      'Building your 3-phase habit plan...',
      'Personalizing for your schedule...',
      'Finalizing your roadmap...',
    ]
    let i = 0
    const interval = setInterval(() => {
      i++
      if (i < texts.length) setGeneratingText(texts[i])
    }, 1500)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Call AI plan generation API
      const res = await fetch('/api/habits/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goal: goal === 'custom' ? customGoal : goal, time, areas }),
      })

      const { habits } = await res.json()

      // Save habits to Supabase
      if (habits && habits.length > 0) {
        await supabase.from('habits').insert(
          habits.map((h: any, i: number) => ({ ...h, user_id: user.id, sort_order: i, is_ai_generated: true }))
        )
      }

      // Update profile
      await supabase.from('profiles').update({
        goal_type: areas.includes('career') ? (areas.length > 1 ? 'both' : 'career') : 'habits',
        time_available: time,
        onboarding_completed: true,
      }).eq('id', user.id)

      clearInterval(interval)
      window.location.href = '/dashboard'
    } catch (err) {
      clearInterval(interval)
      window.location.href = '/dashboard'
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div style={{ width: '100%', maxWidth: 580 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 22, letterSpacing: '-0.02em' }}>
            kaizen<span style={{ color: 'var(--purple)' }}>.</span>
          </div>
        </div>

        {/* Progress bar */}
        {step !== 'generating' && (
          <div style={{ display: 'flex', gap: 6, marginBottom: 32 }}>
            {['goal', 'time', 'areas'].map((s, i) => (
              <div key={s} style={{ flex: 1, height: 3, borderRadius: 2, background: i <= stepIndex ? 'var(--purple)' : 'var(--bg-3)', transition: 'background 0.3s' }} />
            ))}
          </div>
        )}

        {/* Step: Goal */}
        {step === 'goal' && (
          <div className="fade-up">
            <h1 style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 8 }}>What's your main goal?</h1>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 28 }}>We'll build a habit plan around this.</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 24 }}>
              {GOALS.map(g => (
                <div
                  key={g.id}
                  className="card"
                  onClick={() => setGoal(g.id)}
                  style={{
                    cursor: 'pointer',
                    border: goal === g.id ? '1px solid var(--purple)' : '1px solid var(--border)',
                    background: goal === g.id ? 'var(--purple-dim)' : 'var(--bg-card)',
                    transition: 'all 0.15s',
                    padding: '14px 16px',
                  }}
                >
                  <div style={{ fontSize: 22, marginBottom: 8 }}>{g.icon}</div>
                  <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 4 }}>{g.label}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5 }}>{g.desc}</div>
                </div>
              ))}
            </div>
            {goal === 'custom' && (
              <input className="input" placeholder="Describe your goal..." value={customGoal} onChange={e => setCustomGoal(e.target.value)} style={{ marginBottom: 16 }} />
            )}
            <button className="btn btn-primary" style={{ width: '100%', padding: '13px' }} onClick={() => setStep('time')} disabled={!goal || (goal === 'custom' && !customGoal)}>
              Continue →
            </button>
          </div>
        )}

        {/* Step: Time */}
        {step === 'time' && (
          <div className="fade-up">
            <h1 style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 8 }}>How much time daily?</h1>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 28 }}>Be honest — consistency beats ambition.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
              {TIME_OPTIONS.map(t => (
                <div
                  key={t.value}
                  className="card"
                  onClick={() => setTime(t.value)}
                  style={{
                    cursor: 'pointer',
                    border: time === t.value ? '1px solid var(--purple)' : '1px solid var(--border)',
                    background: time === t.value ? 'var(--purple-dim)' : 'var(--bg-card)',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '14px 18px', transition: 'all 0.15s',
                  }}
                >
                  <div>
                    <span style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, marginRight: 10 }}>{t.label}</span>
                    <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{t.desc}</span>
                  </div>
                  {t.value === 10 && <span className="badge badge-purple" style={{ fontSize: 11 }}>Recommended</span>}
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn btn-ghost" onClick={() => setStep('goal')} style={{ flex: 1, padding: '13px' }}>← Back</button>
              <button className="btn btn-primary" onClick={() => setStep('areas')} style={{ flex: 2, padding: '13px' }}>Continue →</button>
            </div>
          </div>
        )}

        {/* Step: Areas */}
        {step === 'areas' && (
          <div className="fade-up">
            <h1 style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 8 }}>Which life areas matter?</h1>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 28 }}>Select all that apply. We'll include habits for each.</p>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 24 }}>
              {AREAS.map(a => (
                <div
                  key={a.id}
                  className="card"
                  onClick={() => toggleArea(a.id)}
                  style={{
                    cursor: 'pointer',
                    border: areas.includes(a.id) ? '1px solid var(--purple)' : '1px solid var(--border)',
                    background: areas.includes(a.id) ? 'var(--purple-dim)' : 'var(--bg-card)',
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '10px 16px', transition: 'all 0.15s', flexShrink: 0,
                  }}
                >
                  <span style={{ fontSize: 18 }}>{a.icon}</span>
                  <span style={{ fontSize: 14, fontWeight: 500 }}>{a.label}</span>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn btn-ghost" onClick={() => setStep('time')} style={{ flex: 1, padding: '13px' }}>← Back</button>
              <button className="btn btn-teal" onClick={generatePlan} disabled={areas.length === 0} style={{ flex: 2, padding: '13px' }}>
                Generate my plan ✨
              </button>
            </div>
          </div>
        )}

        {/* Step: Generating */}
        {step === 'generating' && (
          <div style={{ textAlign: 'center', padding: '3rem 0' }}>
            <div style={{ fontSize: 52, marginBottom: 24, animation: 'pulse 2s ease-in-out infinite' }}>🧠</div>
            <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 12 }}>Building your Kaizen plan</h2>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 32 }}>{generatingText}</p>
            <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
              {[0, 1, 2].map(i => (
                <div key={i} style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--purple)', opacity: 0.3, animation: `pulse ${1 + i * 0.2}s ease-in-out infinite ${i * 0.2}s` }} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
