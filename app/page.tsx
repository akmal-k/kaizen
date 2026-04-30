'use client'
import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'

const TESTIMONIALS = [
  { name: 'Amir K.', role: 'Software Engineer', text: 'Got promoted 6 months after starting. The 10-min daily habit of reading system design docs compounded fast.', plan: 'momentum', avatar: 'AK' },
  { name: 'Sarah M.', role: 'UX Designer', text: "I've tried every productivity app. Kaizen is different — it's so small you can't fail. That's the whole trick.", plan: 'mastery', avatar: 'SM' },
  { name: 'Dmitri V.', role: 'Product Manager', text: 'Built my personal brand on LinkedIn in 90 days. One post a week. Kaizen kept me consistent.', plan: 'momentum', avatar: 'DV' },
]

const STATS = [
  { value: 12400, suffix: '+', label: 'Active users' },
  { value: 94, suffix: '%', label: 'Day-30 retention' },
  { value: 2.1, suffix: 'M+', label: 'Habits completed', decimal: true },
  { value: 4.8, suffix: '★', label: 'Average rating', decimal: true },
]

const FEATURES = [
  {
    icon: '◆',
    color: 'var(--gold)',
    bg: 'rgba(201,147,42,0.12)',
    title: 'AI-personalized plan',
    desc: 'Answer 3 questions. Get a 90-day micro-habit plan built for your exact career goal and available time.',
  },
  {
    icon: '▲',
    color: 'var(--sage)',
    bg: 'rgba(39,168,122,0.12)',
    title: 'Streak that sticks',
    desc: 'Your streak is sacred. Daily reminders, visual progress, and tiny habits that survive even your worst days.',
  },
  {
    icon: '●',
    color: 'var(--terracotta)',
    bg: 'rgba(200,92,58,0.12)',
    title: 'Career + life habits',
    desc: 'Not just productivity fluff. Real habits for getting promoted, learning skills, and living better — in 10 min.',
  },
  {
    icon: '■',
    color: 'var(--gold-light)',
    bg: 'rgba(224,173,74,0.12)',
    title: 'Weekly progress insights',
    desc: 'See exactly how your 1% compounds. Visual reports showing skill growth, consistency, and momentum.',
  },
]

const STEPS = [
  { num: '01', color: 'var(--gold)', border: 'var(--gold-border)', bg: 'var(--gold-dim)', title: 'Tell us your goal', desc: 'Takes 90 seconds. Choose your career goal, life areas, and how much time you have each day.' },
  { num: '02', color: 'var(--sage)', border: 'rgba(39,168,122,0.3)', bg: 'rgba(39,168,122,0.12)', title: 'Get your AI plan', desc: 'Claude builds a 3-phase, 90-day micro-habit plan tailored specifically to you.' },
  { num: '03', color: 'var(--terracotta)', border: 'rgba(200,92,58,0.3)', bg: 'rgba(200,92,58,0.12)', title: 'Build momentum daily', desc: 'Check off habits in under a minute. Watch your streak — and your career — grow.' },
]

function AppMockup() {
  const habits = [
    { done: true,  label: 'Read 10 pages of system design', cat: 'career',  time: '10m' },
    { done: true,  label: 'Solve one LeetCode problem',     cat: 'skill',   time: '15m' },
    { done: false, label: 'Write in daily journal',         cat: 'mindset', time: '5m'  },
    { done: false, label: 'Publish LinkedIn post',          cat: 'career',  time: '10m' },
  ]
  const catColor: Record<string, string> = {
    career:  'var(--gold)',
    skill:   'var(--sage)',
    mindset: '#D4537E',
  }
  return (
    <div style={{
      background: 'var(--bg-card)',
      border: '1px solid rgba(201,147,42,0.2)',
      borderRadius: 16,
      overflow: 'hidden',
      width: 340,
      boxShadow:
        '0 2px 0 rgba(255,255,255,0.04) inset,' +
        '0 40px 80px rgba(0,0,0,0.7),' +
        '0 0 0 1px rgba(201,147,42,0.08)',
    }}>
      {/* Top bar */}
      <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg-2)' }}>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, fontStyle: 'italic' }}>
          kaizen<span style={{ color: 'var(--gold)', fontStyle: 'normal' }}>.</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800, color: 'var(--gold)', lineHeight: 1 }}>7</span>
          <span style={{ fontSize: 18, lineHeight: 1 }}>🔥</span>
          <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>streak</span>
        </div>
      </div>

      {/* Progress */}
      <div style={{ padding: '12px 16px 4px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--text-muted)', marginBottom: 6 }}>
          <span>Wednesday, Apr 30</span>
          <span style={{ color: 'var(--gold)', fontWeight: 600 }}>50%</span>
        </div>
        <div style={{ height: 3, background: 'var(--bg-3)', borderRadius: 2, marginBottom: 10 }}>
          <div style={{ height: '100%', width: '50%', borderRadius: 2, background: 'linear-gradient(90deg, var(--gold), var(--gold-light))' }} />
        </div>
      </div>

      {/* Habits */}
      <div style={{ padding: '0 10px 10px', display: 'flex', flexDirection: 'column', gap: 5 }}>
        {habits.map((h, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: 9, padding: '8px 10px',
            borderRadius: 8,
            background: h.done ? 'rgba(39,168,122,0.07)' : 'var(--bg-3)',
            border: h.done ? '1px solid rgba(39,168,122,0.2)' : '1px solid transparent',
            transition: 'all 0.2s',
          }}>
            <div style={{
              width: 17, height: 17, borderRadius: '50%', flexShrink: 0,
              background: h.done ? 'var(--sage)' : 'transparent',
              border: h.done ? 'none' : '1.5px solid var(--border)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {h.done && <span style={{ color: 'white', fontSize: 9, lineHeight: 1 }}>✓</span>}
            </div>
            <span style={{ flex: 1, fontSize: 11, color: h.done ? 'var(--text-secondary)' : 'var(--text-primary)', textDecoration: h.done ? 'line-through' : 'none', lineHeight: 1.4 }}>
              {h.label}
            </span>
            <span style={{ fontSize: 9, padding: '2px 6px', borderRadius: 10, background: `${catColor[h.cat] || 'var(--text-muted)'}1a`, color: catColor[h.cat] || 'var(--text-muted)', flexShrink: 0 }}>
              {h.cat}
            </span>
            <span style={{ fontSize: 10, color: 'var(--text-muted)', flexShrink: 0 }}>{h.time}</span>
          </div>
        ))}
      </div>

      {/* AI badge */}
      <div style={{ margin: '0 10px 10px', padding: '7px 10px', borderRadius: 8, background: 'var(--gold-dim)', border: '1px solid var(--gold-border)', display: 'flex', alignItems: 'center', gap: 7 }}>
        <span style={{ fontSize: 12, color: 'var(--gold)' }}>✦</span>
        <span style={{ fontSize: 10, color: 'var(--gold-light)', lineHeight: 1.4 }}>AI plan · Phase 1 of 3 · Day 14 of 30</span>
      </div>
    </div>
  )
}

export default function LandingPage() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const heroRef = useRef<HTMLElement>(null)

  useEffect(() => {
    // Scroll-aware navbar
    const onScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', onScroll, { passive: true })

    // Scroll reveal — add .reveal-animate first (hides elements), then observe.
    // Using rAF ensures the class is applied after paint, avoiding invisible flash.
    const revealEls = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]'))
    const revealObserver = new IntersectionObserver(
      entries => entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('is-visible')
          revealObserver.unobserve(e.target)
        }
      }),
      { threshold: 0, rootMargin: '0px 0px -40px 0px' }
    )
    requestAnimationFrame(() => {
      revealEls.forEach(el => {
        el.classList.add('reveal-animate')
        revealObserver.observe(el)
      })
    })

    // 3D tilt on feature / testimonial cards
    const tiltEls = document.querySelectorAll<HTMLElement>('.tilt-card')
    const cleanups: (() => void)[] = []
    tiltEls.forEach(el => {
      const onMove = (e: MouseEvent) => {
        const r = el.getBoundingClientRect()
        const x = (e.clientX - r.left) / r.width  - 0.5
        const y = (e.clientY - r.top)  / r.height - 0.5
        el.style.transform = `perspective(800px) rotateX(${-y * 11}deg) rotateY(${x * 11}deg) translateZ(6px)`
        el.style.boxShadow = `${-x * 18}px ${-y * 18}px 36px rgba(0,0,0,0.32), 0 0 28px rgba(201,147,42,0.06)`
      }
      const onLeave = () => {
        el.style.transform = ''
        el.style.boxShadow = ''
      }
      el.addEventListener('mousemove', onMove)
      el.addEventListener('mouseleave', onLeave)
      cleanups.push(() => { el.removeEventListener('mousemove', onMove); el.removeEventListener('mouseleave', onLeave) })
    })

    // Hero mockup mouse-parallax
    const heroEl = heroRef.current
    const onHeroMove = (e: MouseEvent) => {
      const mockup = heroEl?.querySelector<HTMLElement>('.hero-mockup-inner')
      if (!mockup) return
      const x = (e.clientX / window.innerWidth  - 0.5) * 14
      const y = (e.clientY / window.innerHeight - 0.5) *  8
      mockup.style.transform = `perspective(1000px) rotateY(${-8 + x * 0.4}deg) rotateX(${4 - y * 0.4}deg)`
    }
    heroEl?.addEventListener('mousemove', onHeroMove)

    // Count-up animation
    const countObserver = new IntersectionObserver(
      entries => entries.forEach(e => {
        if (!e.isIntersecting) return
        const el = e.target as HTMLElement
        const target   = parseFloat(el.dataset.target  ?? '0')
        const isFloat  = el.dataset.decimal === 'true'
        const suffix   = el.dataset.suffix  ?? ''
        const duration = 1600
        const start    = performance.now()
        const tick = (now: number) => {
          const p  = Math.min((now - start) / duration, 1)
          const ep = 1 - Math.pow(1 - p, 3)
          const v  = target * ep
          el.textContent = (isFloat ? v.toFixed(1) : Math.round(v).toLocaleString()) + suffix
          if (p < 1) requestAnimationFrame(tick)
          else el.classList.add('count-flash')
        }
        requestAnimationFrame(tick)
        countObserver.unobserve(el)
      }),
      { threshold: 0.6 }
    )
    document.querySelectorAll<HTMLElement>('[data-target]').forEach(el => countObserver.observe(el))

    return () => {
      window.removeEventListener('scroll', onScroll)
      revealObserver.disconnect()
      countObserver.disconnect()
      revealEls.forEach(el => el.classList.remove('reveal-animate', 'is-visible'))
      cleanups.forEach(fn => fn())
      heroEl?.removeEventListener('mousemove', onHeroMove)
    }
  }, [])

  async function handleWaitlist(e: React.FormEvent) {
    e.preventDefault()
    if (!email) return
    setLoading(true)
    await supabase.from('waitlist').upsert({ email, source: 'landing' })
    setSubmitted(true)
    setLoading(false)
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', overflowX: 'hidden' }}>

      {/* ══ NAV ══ */}
      <nav style={{
        padding: '0 2.5rem',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        height: scrolled ? 64 : 72,
        position: 'sticky', top: 0, zIndex: 100,
        background: scrolled ? 'rgba(12,11,9,0.96)' : 'transparent',
        backdropFilter: scrolled ? 'blur(20px) saturate(180%)' : 'none',
        borderBottom: `1px solid ${scrolled ? 'var(--border)' : 'transparent'}`,
        transition: 'height 0.4s cubic-bezier(0.16,1,0.3,1), background 0.4s, border-color 0.4s, backdrop-filter 0.4s',
      }}>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 22, letterSpacing: '-0.01em', fontStyle: 'italic' }}>
          kaizen<span style={{ color: 'var(--gold)', fontStyle: 'normal' }}>.</span>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <Link href="/pricing" className="btn btn-ghost" style={{ padding: '8px 16px', fontSize: 13 }}>Pricing</Link>
          <Link href="/auth/login" className="btn btn-ghost" style={{ padding: '8px 16px', fontSize: 13 }}>Sign in</Link>
          <Link href="/auth/login" className="btn btn-primary" style={{ padding: '9px 20px', fontSize: 13 }}>Get started free</Link>
        </div>
      </nav>

      {/* ══ HERO ══ */}
      <section ref={heroRef} style={{ position: 'relative', minHeight: '92vh', display: 'flex', alignItems: 'center', overflow: 'hidden' }}>
        {/* Background: gradient orbs + grid */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          <div style={{ position: 'absolute', top: '-15%', left: '-8%', width: 700, height: 700, borderRadius: '50%', background: 'radial-gradient(circle, rgba(201,147,42,0.07) 0%, transparent 65%)', animation: 'orbDrift 14s ease-in-out infinite' }} />
          <div style={{ position: 'absolute', bottom: '-12%', right: '-5%', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(39,168,122,0.05) 0%, transparent 65%)', animation: 'orbDrift 18s ease-in-out infinite reverse' }} />
          <div style={{ position: 'absolute', top: '30%', right: '20%', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(200,92,58,0.04) 0%, transparent 65%)', animation: 'orbDrift 10s ease-in-out infinite 2s' }} />
          {/* Dot grid */}
          <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(242,234,216,0.025) 1px, transparent 0)', backgroundSize: '44px 44px' }} />
          {/* Vignette */}
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center, transparent 40%, rgba(12,11,9,0.6) 100%)' }} />
        </div>

        <div style={{
          maxWidth: 1140,
          margin: '0 auto',
          padding: '80px 2.5rem',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '5rem',
          alignItems: 'center',
          position: 'relative', zIndex: 1,
          width: '100%',
        }}>
          {/* Left: copy */}
          <div>
            <div className="badge badge-purple fade-up" style={{ marginBottom: 28, display: 'inline-flex' }}>
              <span className="pulse-dot" style={{ width: 6, height: 6 }} />
              30-day free trial · No credit card required
            </div>

            <h1 className="fade-up fade-up-delay-1" style={{ fontSize: 'clamp(2.8rem, 4.5vw, 5rem)', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.03, marginBottom: 24 }}>
              Build the career<br />
              <span className="gradient-text">you actually want</span><br />
              in 10 min a day.
            </h1>

            <p className="fade-up fade-up-delay-2" style={{ fontSize: 17, color: 'var(--text-secondary)', maxWidth: 460, marginBottom: 36, lineHeight: 1.8 }}>
              Kaizen uses AI to build a micro-habit plan tailored to your exact goal — whether that's a promotion, a new skill, or a healthier life.
            </p>

            <div className="fade-up fade-up-delay-3" style={{ display: 'flex', flexDirection: 'column', gap: 14, maxWidth: 440 }}>
              {submitted ? (
                <div className="card" style={{ display: 'inline-flex', alignItems: 'center', gap: 12, padding: '14px 24px' }}>
                  <span style={{ color: 'var(--sage)', fontSize: 20 }}>✓</span>
                  <span style={{ color: 'var(--text-secondary)', fontSize: 14 }}>You're on the list — check your email.</span>
                </div>
              ) : (
                <form onSubmit={handleWaitlist} style={{ display: 'flex', gap: 8 }}>
                  <input
                    className="input"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    style={{ flex: 1, fontSize: 14 }}
                  />
                  <button type="submit" className="btn btn-primary" disabled={loading} style={{ whiteSpace: 'nowrap', padding: '12px 22px' }}>
                    {loading ? '...' : 'Start free →'}
                  </button>
                </form>
              )}

              {/* Trust row */}
              <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
                {['No credit card', 'Cancel anytime', 'AI-powered'].map(t => (
                  <span key={t} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--text-muted)' }}>
                    <span style={{ color: 'var(--sage)', fontSize: 10 }}>✓</span>
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Right: 3D floating mockup */}
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }} className="fade-up fade-up-delay-4">
            <div className="hero-mockup-inner hero-mockup-float" style={{
              transition: 'transform 0.08s ease',
              filter: 'drop-shadow(0 48px 64px rgba(0,0,0,0.55))',
            }}>
              <AppMockup />
            </div>
          </div>
        </div>

        {/* Bottom fade */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 120, background: 'linear-gradient(to bottom, transparent, var(--bg))', pointerEvents: 'none' }} />
      </section>

      {/* ══ STATS BAR ══ */}
      <section style={{ borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', background: 'var(--bg-2)' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', padding: '2.5rem', display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '1rem', textAlign: 'center' }}>
          {STATS.map(s => (
            <div key={s.label} data-reveal style={{ padding: '0.5rem' }}>
              <div
                style={{ fontFamily: 'var(--font-display)', fontSize: 34, fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1 }}
                data-target={s.value}
                data-suffix={s.suffix}
                data-decimal={s.decimal ? 'true' : undefined}
              >
                {s.decimal ? s.value.toFixed(1) : s.value.toLocaleString()}{s.suffix}
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 6 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ══ HOW IT WORKS ══ */}
      <section style={{ maxWidth: 960, margin: '0 auto', padding: '110px 2.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: 72 }} data-reveal>
          <div className="badge badge-purple" style={{ marginBottom: 16, display: 'inline-flex' }}>How it works</div>
          <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)', letterSpacing: '-0.02em' }}>From goal to habit<br />in 3 minutes.</h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1px', position: 'relative' }}>
          {/* Connector line */}
          <div style={{ position: 'absolute', top: 27, left: '16.67%', right: '16.67%', height: 1, background: 'linear-gradient(90deg, var(--gold), var(--sage))', opacity: 0.25, pointerEvents: 'none' }} />

          {STEPS.map((s, i) => (
            <div key={s.num} style={{ textAlign: 'center', padding: '0 2rem' }} data-reveal data-reveal-delay={String(i + 1)}>
              <div style={{
                width: 54, height: 54, borderRadius: '50%',
                margin: '0 auto 22px',
                background: s.bg,
                border: `1px solid ${s.border}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 800,
                color: s.color,
                position: 'relative', zIndex: 1,
              }}>
                {s.num}
              </div>
              <h3 style={{ fontSize: 17, fontWeight: 600, marginBottom: 10 }}>{s.title}</h3>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.75 }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ══ FEATURES ══ */}
      <section style={{ background: 'var(--bg-2)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <div style={{ maxWidth: 960, margin: '0 auto', padding: '110px 2.5rem' }}>
          <div style={{ textAlign: 'center', marginBottom: 64 }} data-reveal>
            <div className="badge badge-purple" style={{ marginBottom: 16, display: 'inline-flex' }}>Features</div>
            <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)', letterSpacing: '-0.02em' }}>Everything you need.<br />Nothing you don't.</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 16 }}>
            {FEATURES.map((f, i) => (
              <div
                key={f.title}
                className="card tilt-card"
                data-reveal
                data-reveal-delay={String((i % 2) + 1)}
                style={{ cursor: 'default' }}
              >
                <div style={{ width: 46, height: 46, borderRadius: 11, background: f.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18, fontSize: 22, color: f.color }}>
                  {f.icon}
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 10 }}>{f.title}</h3>
                <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.75 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ TESTIMONIALS ══ */}
      <section style={{ maxWidth: 960, margin: '0 auto', padding: '110px 2.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: 64 }} data-reveal>
          <h2 style={{ fontSize: 'clamp(1.6rem, 3.5vw, 2.8rem)', letterSpacing: '-0.02em' }}>Real people. Real progress.</h2>
          <p style={{ fontSize: 15, color: 'var(--text-secondary)', marginTop: 14, lineHeight: 1.7 }}>Over 12,400 users have improved their careers and lives with Kaizen.</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
          {TESTIMONIALS.map((t, i) => (
            <div
              key={t.name}
              className="card tilt-card"
              data-reveal
              data-reveal-delay={String(i + 1)}
              style={{ cursor: 'default' }}
            >
              <div style={{ display: 'flex', gap: 3, marginBottom: 16 }}>
                {[...Array(5)].map((_, j) => <span key={j} style={{ color: 'var(--gold)', fontSize: 13 }}>★</span>)}
              </div>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: 20, fontStyle: 'italic' }}>"{t.text}"</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                  background: t.plan === 'mastery' ? 'var(--sage-dim)' : 'var(--gold-dim)',
                  border: `1px solid ${t.plan === 'mastery' ? 'rgba(39,168,122,0.3)' : 'var(--gold-border)'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, fontWeight: 700, fontFamily: 'var(--font-display)',
                  color: t.plan === 'mastery' ? 'var(--sage-light)' : 'var(--gold-light)',
                }}>
                  {t.avatar}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{t.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{t.role}</div>
                </div>
                <span className={`badge badge-${t.plan === 'mastery' ? 'teal' : 'purple'}`} style={{ fontSize: 10 }}>{t.plan}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ══ FINAL CTA ══ */}
      <section style={{ position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'var(--bg-2)', borderTop: '1px solid var(--border)' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 120%, rgba(201,147,42,0.08) 0%, transparent 60%)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: 680, margin: '0 auto', padding: '120px 2.5rem', textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <div data-reveal>
            <h2 style={{ fontSize: 'clamp(2.2rem, 5vw, 3.8rem)', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.05, marginBottom: 20 }}>
              Start your 30-day<br />
              <span className="gradient-text">free trial today.</span>
            </h2>
            <p style={{ fontSize: 17, color: 'var(--text-secondary)', marginBottom: 40, lineHeight: 1.75 }}>
              No credit card. No commitment.<br />Just 10 minutes a day to become 1% better.
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/auth/login" className="btn btn-primary" style={{ fontSize: 15, padding: '15px 32px' }}>Get started free →</Link>
              <Link href="/pricing" className="btn btn-ghost" style={{ fontSize: 15, padding: '15px 32px' }}>See pricing</Link>
            </div>
          </div>
        </div>
      </section>

      {/* ══ FOOTER ══ */}
      <footer style={{ borderTop: '1px solid var(--border)', padding: '2.5rem', textAlign: 'center' }}>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, marginBottom: 8, fontStyle: 'italic' }}>
          kaizen<span style={{ color: 'var(--gold)', fontStyle: 'normal' }}>.</span>
        </div>
        <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>© 2024 Kaizen. Build 1% better every day.</p>
      </footer>

    </div>
  )
}
