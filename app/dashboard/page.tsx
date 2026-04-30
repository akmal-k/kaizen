'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import type { Profile, Habit, Streak } from '@/lib/supabase'
import Link from 'next/link'

const CATEGORY_COLORS: Record<string, string> = {
  career: 'var(--purple)',
  skill: 'var(--teal)',
  health: 'var(--amber)',
  mindset: '#D4537E',
  relationship: '#378ADD',
  custom: 'var(--text-secondary)',
}

function StreakFlame({ count }: { count: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <svg width="28" height="36" viewBox="0 0 28 36" fill="none" style={{ animation: 'flicker 2s ease-in-out infinite' }}>
        <path d="M14 2C14 2 20 10 20 18C20 24 17 28 14 30C11 28 8 24 8 18C8 10 14 2 14 2Z" fill="#C9932A" opacity="0.9"/>
        <path d="M14 12C14 12 18 18 18 22C18 25 16.5 27 14 28C11.5 27 10 25 10 22C10 18 14 12 14 12Z" fill="#C85C3A" opacity="0.85"/>
        <path d="M14 20C14 20 16 22 16 24C16 25.5 15.1 26.5 14 27C12.9 26.5 12 25.5 12 24C12 22 14 20 14 20Z" fill="#F5E6C8" opacity="0.9"/>
      </svg>
      <div>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 800, lineHeight: 1, color: 'var(--amber)' }}>{count}</div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>day streak</div>
      </div>
    </div>
  )
}

function HabitCard({ habit, onToggle, completed }: { habit: Habit, onToggle: () => void, completed: boolean }) {
  return (
    <div
      className="card"
      style={{
        cursor: 'pointer',
        border: completed ? '1px solid rgba(39,168,122,0.35)' : '1px solid var(--border)',
        background: completed ? 'rgba(39,168,122,0.05)' : 'var(--bg-card)',
        transition: 'all 0.25s cubic-bezier(0.16,1,0.3,1)',
        display: 'flex',
        alignItems: 'center',
        gap: 16,
      }}
      onClick={onToggle}
      onMouseEnter={e => {
        const el = e.currentTarget
        el.style.transform = 'translateY(-2px)'
        el.style.boxShadow = '0 8px 32px rgba(0,0,0,0.28)'
        if (!completed) el.style.borderColor = 'var(--border-hover)'
      }}
      onMouseLeave={e => {
        const el = e.currentTarget
        el.style.transform = ''
        el.style.boxShadow = ''
        el.style.borderColor = completed ? 'rgba(39,168,122,0.35)' : 'var(--border)'
      }}
    >
      {/* Checkbox */}
      <div style={{
        width: 26, height: 26, borderRadius: '50%', flexShrink: 0,
        border: completed ? 'none' : '2px solid rgba(242,234,216,0.15)',
        background: completed ? 'var(--sage)' : 'transparent',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'all 0.25s cubic-bezier(0.16,1,0.3,1)',
        boxShadow: completed ? '0 0 12px rgba(39,168,122,0.4)' : 'none',
      }}>
        {completed && <span style={{ color: 'white', fontSize: 13, lineHeight: 1 }}>✓</span>}
      </div>

      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <span style={{ fontSize: 14, fontWeight: 500, color: completed ? 'var(--text-secondary)' : 'var(--text-primary)', textDecoration: completed ? 'line-through' : 'none', transition: 'all 0.2s' }}>
            {habit.title}
          </span>
          <span className="badge" style={{ background: `${CATEGORY_COLORS[habit.category]}1a`, color: CATEGORY_COLORS[habit.category], fontSize: 10, padding: '2px 7px', borderRadius: 20 }}>
            {habit.category}
          </span>
        </div>
        {habit.description && (
          <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5 }}>{habit.description}</p>
        )}
      </div>

      <div style={{ fontSize: 12, color: 'var(--text-muted)', flexShrink: 0 }}>
        {habit.duration_minutes}m
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [habits, setHabits] = useState<Habit[]>([])
  const [streak, setStreak] = useState<Streak | null>(null)
  const [completedToday, setCompletedToday] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [greeting, setGreeting] = useState('Good morning')

  useEffect(() => {
    const h = new Date().getHours()
    if (h < 12) setGreeting('Good morning')
    else if (h < 17) setGreeting('Good afternoon')
    else setGreeting('Good evening')
    loadData()
  }, [])

  async function loadData() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { window.location.href = '/auth/login'; return }

    const [profileRes, habitsRes, streakRes, completionsRes] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', user.id).single(),
      supabase.from('habits').select('*').eq('user_id', user.id).eq('is_active', true).order('sort_order'),
      supabase.from('streaks').select('*').eq('user_id', user.id).single(),
      supabase.from('habit_completions').select('habit_id').eq('user_id', user.id).eq('completed_date', new Date().toISOString().split('T')[0]),
    ])

    setProfile(profileRes.data)
    setHabits(habitsRes.data || [])
    setStreak(streakRes.data)
    setCompletedToday(new Set((completionsRes.data || []).map((c: any) => c.habit_id)))
    setLoading(false)

    // Redirect to onboarding if not completed
    if (profileRes.data && !profileRes.data.onboarding_completed) {
      window.location.href = '/onboarding'
    }
  }

  async function toggleHabit(habit: Habit) {
    const today = new Date().toISOString().split('T')[0]
    const isCompleted = completedToday.has(habit.id)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    if (isCompleted) {
      await supabase.from('habit_completions').delete().eq('habit_id', habit.id).eq('completed_date', today)
      setCompletedToday(prev => { const n = new Set(prev); n.delete(habit.id); return n })
    } else {
      await supabase.from('habit_completions').upsert({ user_id: user.id, habit_id: habit.id, completed_date: today })
      setCompletedToday(prev => {
        const n = new Set(prev)
        n.add(habit.id)
        return n
      })
      // Update streak
      await supabase.rpc('update_streak', { p_user_id: user.id })
    }
  }

  async function signOut() {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 22, color: 'var(--text-primary)', fontStyle: 'italic', marginBottom: 8 }}>kaizen<span style={{ color: 'var(--gold)', fontStyle: 'normal' }}>.</span></div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Loading your plan…</div>
        </div>
      </div>
    )
  }

  const completionRate = habits.length > 0 ? Math.round((completedToday.size / habits.length) * 100) : 0
  const trialDaysLeft = profile?.trial_ends_at ? Math.max(0, Math.ceil((new Date(profile.trial_ends_at).getTime() - Date.now()) / 86400000)) : 0

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Nav */}
      <nav style={{ borderBottom: '1px solid var(--border)', padding: '0 2.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 72, position: 'sticky', top: 0, background: 'rgba(12,11,9,0.94)', backdropFilter: 'blur(16px)', zIndex: 100 }}>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 20, letterSpacing: '-0.01em', fontStyle: 'italic' }}>
          kaizen<span style={{ color: 'var(--gold)', fontStyle: 'normal' }}>.</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {profile?.plan === 'free' && trialDaysLeft < 10 && (
            <Link href="/pricing" className="badge badge-amber" style={{ textDecoration: 'none', cursor: 'pointer' }}>
              {trialDaysLeft}d trial left · Upgrade →
            </Link>
          )}
          <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{profile?.email}</span>
          <button onClick={signOut} style={{ fontSize: 13, color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}>Sign out</button>
        </div>
      </nav>

      <div style={{ maxWidth: 800, margin: '0 auto', padding: '2.5rem 2rem' }}>
        {/* Header row */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 32 }}>
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 4 }}>
              {greeting}, {profile?.full_name?.split(' ')[0] || 'there'} 👋
            </h1>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <StreakFlame count={streak?.current_streak || 0} />
        </div>

        {/* Stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 32 }}>
          {[
            { label: "Today's progress", value: `${completionRate}%`, color: completionRate === 100 ? 'var(--sage)' : 'var(--gold)' },
            { label: 'Completed today', value: `${completedToday.size}/${habits.length}`, color: 'var(--text-primary)' },
            { label: 'Longest streak', value: `${streak?.longest_streak || 0}d`, color: 'var(--terracotta)' },
            { label: 'Total habits done', value: streak?.total_completions || 0, color: 'var(--gold-light)' },
          ].map(s => (
            <div
              key={s.label}
              className="stat-card"
              style={{ transition: 'all 0.2s cubic-bezier(0.16,1,0.3,1)' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-hover)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ''; (e.currentTarget as HTMLElement).style.borderColor = '' }}
            >
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>{s.label}</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 700, color: s.color }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Progress bar */}
        {habits.length > 0 && (
          <div style={{ marginBottom: 32 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>
              <span>Daily completion</span>
              <span>{completionRate}%</span>
            </div>
            <div style={{ height: 6, background: 'var(--bg-3)', borderRadius: 3, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${completionRate}%`, background: completionRate === 100 ? 'var(--sage)' : 'linear-gradient(90deg, var(--gold), var(--gold-light))', borderRadius: 3, transition: 'width 0.6s cubic-bezier(0.16,1,0.3,1)', boxShadow: completionRate > 0 ? '0 0 12px rgba(201,147,42,0.4)' : 'none' }} />
            </div>
          </div>
        )}

        {/* Habits */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h2 style={{ fontSize: 16, fontWeight: 600 }}>Today's habits</h2>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Tap to complete</span>
          </div>

          {habits.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 16 }}>No habits yet. Let AI build your plan.</p>
              <Link href="/onboarding" className="btn btn-primary" style={{ textDecoration: 'none', display: 'inline-flex' }}>Generate my plan →</Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {habits.map(h => (
                <HabitCard key={h.id} habit={h} completed={completedToday.has(h.id)} onToggle={() => toggleHabit(h)} />
              ))}
            </div>
          )}
        </div>

        {/* Plan info */}
        <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: profile?.plan === 'mastery' ? 'var(--teal)' : profile?.plan === 'momentum' ? 'var(--purple)' : 'var(--text-muted)' }} />
            <span style={{ fontSize: 13, textTransform: 'capitalize', color: 'var(--text-secondary)' }}>
              {profile?.plan} plan
              {profile?.plan === 'free' && ` · ${trialDaysLeft} days remaining`}
            </span>
          </div>
          {profile?.plan === 'free' && (
            <Link href="/pricing" className="btn btn-primary" style={{ fontSize: 12, padding: '7px 14px', textDecoration: 'none' }}>Upgrade →</Link>
          )}
        </div>
      </div>
    </div>
  )
}
