'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

type UserRow = {
  id: string
  email: string
  full_name: string | null
  plan: string
  created_at: string
  trial_ends_at: string
  onboarding_completed: boolean
  goal_type: string
  streak?: { current_streak: number; total_completions: number }
}

type Stats = {
  total: number
  free: number
  momentum: number
  mastery: number
  today: number
  week: number
  completedOnboarding: number
  avgStreak: number
}

const PLAN_COLOR: Record<string, string> = {
  free: 'var(--text-muted)',
  momentum: 'var(--purple)',
  mastery: 'var(--teal)',
}

const PLAN_BG: Record<string, string> = {
  free: 'rgba(136,135,128,0.1)',
  momentum: 'var(--purple-dim)',
  mastery: 'var(--teal-dim)',
}

function MRRCard({ momentum, mastery }: { momentum: number; mastery: number }) {
  const mrr = momentum * 9 + mastery * 19
  const arr = mrr * 12
  return (
    <div className="card" style={{ background: 'linear-gradient(135deg, rgba(127,119,221,0.12) 0%, rgba(29,158,117,0.08) 100%)', border: '1px solid var(--purple-border)' }}>
      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Monthly Recurring Revenue</div>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: 36, fontWeight: 800, color: 'var(--text-primary)' }}>${mrr.toLocaleString()}</div>
      <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>ARR: ${arr.toLocaleString()} · {momentum} Momentum + {mastery} Mastery</div>
    </div>
  )
}

function StatCard({ label, value, sub, color }: { label: string; value: string | number; sub?: string; color?: string }) {
  return (
    <div className="stat-card">
      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>{label}</div>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 700, color: color || 'var(--text-primary)' }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>{sub}</div>}
    </div>
  )
}

function SimpleBarChart({ data }: { data: { label: string; value: number; color: string }[] }) {
  const max = Math.max(...data.map(d => d.value), 1)
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 80 }}>
      {data.map(d => (
        <div key={d.label} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: d.color }}>{d.value}</div>
          <div style={{ width: '100%', height: Math.max(4, (d.value / max) * 60), background: d.color, borderRadius: '3px 3px 0 0', opacity: 0.85, transition: 'height 0.4s ease' }} />
          <div style={{ fontSize: 10, color: 'var(--text-muted)', textAlign: 'center' }}>{d.label}</div>
        </div>
      ))}
    </div>
  )
}

export default function AdminPage() {
  const [authed, setAuthed] = useState(false)
  const [loginEmail, setLoginEmail] = useState('')
  const [loginSent, setLoginSent] = useState(false)
  const [users, setUsers] = useState<UserRow[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [planFilter, setPlanFilter] = useState('all')
  const [sortBy, setSortBy] = useState<'created_at' | 'plan' | 'streak'>('created_at')

  useEffect(() => {
    checkAuth()
  }, [])

  async function checkAuth() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setLoading(false); return }

    // Check if admin
    const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL || ''
    if (user.email === adminEmail || user.email) {
      const { data } = await supabase.from('admin_users').select('id').eq('id', user.id).single()
      if (data || user.email === adminEmail) {
        setAuthed(true)
        await loadData()
      }
    }
    setLoading(false)
  }

  async function handleAdminLogin(e: React.FormEvent) {
    e.preventDefault()
    await supabase.auth.signInWithOtp({
      email: loginEmail,
      options: { emailRedirectTo: `${window.location.origin}/admin` },
    })
    setLoginSent(true)
  }

  async function loadData() {
    // Fetch all users with their streaks
    const { data: profileData } = await supabase
      .from('profiles')
      .select('*, streaks(current_streak, total_completions)')
      .order('created_at', { ascending: false })
      .limit(500)

    const usersWithStreaks: UserRow[] = (profileData || []).map((p: any) => ({
      ...p,
      streak: p.streaks?.[0] || { current_streak: 0, total_completions: 0 },
    }))

    setUsers(usersWithStreaks)

    // Compute stats
    const now = new Date()
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const weekStart = new Date(todayStart.getTime() - 6 * 86400000)

    const total = usersWithStreaks.length
    const free = usersWithStreaks.filter(u => u.plan === 'free').length
    const momentum = usersWithStreaks.filter(u => u.plan === 'momentum').length
    const mastery = usersWithStreaks.filter(u => u.plan === 'mastery').length
    const today = usersWithStreaks.filter(u => new Date(u.created_at) >= todayStart).length
    const week = usersWithStreaks.filter(u => new Date(u.created_at) >= weekStart).length
    const completedOnboarding = usersWithStreaks.filter(u => u.onboarding_completed).length
    const streaks = usersWithStreaks.map(u => u.streak?.current_streak || 0)
    const avgStreak = streaks.length > 0 ? Math.round(streaks.reduce((a, b) => a + b, 0) / streaks.length) : 0

    setStats({ total, free, momentum, mastery, today, week, completedOnboarding, avgStreak })
  }

  const filtered = users
    .filter(u => planFilter === 'all' || u.plan === planFilter)
    .filter(u => !search || u.email.includes(search) || (u.full_name || '').toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'streak') return (b.streak?.current_streak || 0) - (a.streak?.current_streak || 0)
      if (sortBy === 'plan') return a.plan.localeCompare(b.plan)
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Loading…</div>
      </div>
    )
  }

  // Login screen
  if (!authed) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <div style={{ width: '100%', maxWidth: 380 }}>
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 22, marginBottom: 4 }}>
              kaizen<span style={{ color: 'var(--purple)' }}>.</span>
              <span style={{ fontSize: 13, fontWeight: 400, color: 'var(--text-muted)', marginLeft: 8, fontFamily: 'var(--font-body)' }}>admin</span>
            </div>
          </div>
          <div className="card">
            {loginSent ? (
              <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                <div style={{ fontSize: 40, marginBottom: 16 }}>✉️</div>
                <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>Magic link sent to <strong style={{ color: 'var(--text-primary)' }}>{loginEmail}</strong></p>
              </div>
            ) : (
              <form onSubmit={handleAdminLogin}>
                <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Admin email</label>
                <input
                  className="input"
                  type="email"
                  value={loginEmail}
                  onChange={e => setLoginEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  style={{ marginBottom: 12 }}
                />
                <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                  Send magic link →
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Nav */}
      <nav style={{ borderBottom: '1px solid var(--border)', padding: '0 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 56, position: 'sticky', top: 0, background: 'rgba(10,10,15,0.95)', backdropFilter: 'blur(12px)', zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 18 }}>
            kaizen<span style={{ color: 'var(--purple)' }}>.</span>
          </span>
          <span style={{ fontSize: 12, padding: '2px 8px', background: 'var(--purple-dim)', color: 'var(--purple-light)', borderRadius: 20, border: '1px solid var(--purple-border)' }}>admin</span>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <div className="pulse-dot" />
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Live</span>
          <button onClick={() => supabase.auth.signOut().then(() => window.location.reload())} style={{ fontSize: 12, color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', marginLeft: 8 }}>Sign out</button>
        </div>
      </nav>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '2rem' }}>
        {/* MRR Banner */}
        {stats && <MRRCard momentum={stats.momentum} mastery={stats.mastery} />}

        {/* Stats grid */}
        {stats && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, margin: '16px 0' }}>
            <StatCard label="Total users" value={stats.total.toLocaleString()} color="var(--text-primary)" />
            <StatCard label="New today" value={stats.today} sub={`${stats.week} this week`} color="var(--teal)" />
            <StatCard label="Conversion rate" value={`${stats.total > 0 ? Math.round(((stats.momentum + stats.mastery) / stats.total) * 100) : 0}%`} sub="free → paid" color="var(--amber)" />
            <StatCard label="Avg streak" value={`${stats.avgStreak}d`} sub="across all users" color="var(--purple-light)" />
          </div>
        )}

        {/* Plan breakdown + chart */}
        {stats && (
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12, marginBottom: 16 }}>
            <div className="card">
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16 }}>Plan distribution</div>
              <SimpleBarChart data={[
                { label: 'Free', value: stats.free, color: 'var(--text-secondary)' },
                { label: 'Momentum', value: stats.momentum, color: 'var(--purple)' },
                { label: 'Mastery', value: stats.mastery, color: 'var(--teal)' },
              ]} />
            </div>
            <div className="card">
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12 }}>Onboarding</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
                {stats.total > 0 ? Math.round((stats.completedOnboarding / stats.total) * 100) : 0}%
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 12 }}>{stats.completedOnboarding}/{stats.total} completed</div>
              <div style={{ height: 6, background: 'var(--bg-3)', borderRadius: 3, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${stats.total > 0 ? (stats.completedOnboarding / stats.total) * 100 : 0}%`, background: 'var(--teal)', borderRadius: 3 }} />
              </div>
            </div>
          </div>
        )}

        {/* Users table */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          {/* Table controls */}
          <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            <input
              className="input"
              placeholder="Search email or name..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ flex: 1, minWidth: 200 }}
            />
            <select
              value={planFilter}
              onChange={e => setPlanFilter(e.target.value)}
              style={{ background: 'var(--bg-3)', border: '1px solid var(--border)', color: 'var(--text-primary)', padding: '8px 12px', borderRadius: 'var(--radius-sm)', fontSize: 13, cursor: 'pointer' }}
            >
              <option value="all">All plans</option>
              <option value="free">Free</option>
              <option value="momentum">Momentum</option>
              <option value="mastery">Mastery</option>
            </select>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              style={{ background: 'var(--bg-3)', border: '1px solid var(--border)', color: 'var(--text-primary)', padding: '8px 12px', borderRadius: 'var(--radius-sm)', fontSize: 13, cursor: 'pointer' }}
            >
              <option value="created_at">Newest first</option>
              <option value="streak">By streak</option>
              <option value="plan">By plan</option>
            </select>
            <span style={{ fontSize: 12, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{filtered.length} users</span>
          </div>

          {/* Table */}
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-2)' }}>
                  {['User', 'Plan', 'Streak', 'Habits done', 'Onboarding', 'Goal', 'Signed up'].map(col => (
                    <th key={col} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 11, color: 'var(--text-muted)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.slice(0, 100).map((u, i) => (
                  <tr key={u.id} style={{ borderBottom: i < filtered.length - 1 ? '1px solid var(--border)' : 'none', transition: 'background 0.1s' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-2)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ fontWeight: 500, color: 'var(--text-primary)', marginBottom: 2 }}>{u.full_name || '—'}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{u.email}</div>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: PLAN_BG[u.plan], color: PLAN_COLOR[u.plan], padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 500, textTransform: 'capitalize' }}>
                        {u.plan}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        {(u.streak?.current_streak || 0) > 0 && <span style={{ fontSize: 14 }}>🔥</span>}
                        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--amber)' }}>{u.streak?.current_streak || 0}</span>
                        <span style={{ color: 'var(--text-muted)' }}>d</span>
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>
                      {u.streak?.total_completions || 0}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      {u.onboarding_completed
                        ? <span style={{ color: 'var(--teal)', fontSize: 16 }}>✓</span>
                        : <span style={{ color: 'var(--text-muted)', fontSize: 16 }}>○</span>}
                    </td>
                    <td style={{ padding: '12px 16px', color: 'var(--text-secondary)', textTransform: 'capitalize' }}>
                      {u.goal_type || '—'}
                    </td>
                    <td style={{ padding: '12px 16px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                      {new Date(u.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filtered.length === 0 && (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>No users found</div>
          )}
        </div>
      </div>
    </div>
  )
}
