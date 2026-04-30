'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/dashboard` },
    })
    if (error) setError(error.message)
    else setSent(true)
    setLoading(false)
  }

  async function handleGoogle() {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/dashboard` },
    })
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', padding: '2rem' }}>
      {/* Background dot pattern */}
      <div style={{ position: 'fixed', inset: 0, backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(201,147,42,0.06) 1px, transparent 0)', backgroundSize: '32px 32px', pointerEvents: 'none' }} />

      <div style={{ width: '100%', maxWidth: 400, position: 'relative' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <Link href="/" style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 28, color: 'var(--text-primary)', textDecoration: 'none', letterSpacing: '-0.02em' }}>
            kaizen<span style={{ color: 'var(--purple)' }}>.</span>
          </Link>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 8 }}>
            {sent ? 'Check your email' : 'Sign in or create your account'}
          </p>
        </div>

        <div className="card" style={{ position: 'relative' }}>
          {sent ? (
            <div style={{ textAlign: 'center', padding: '1rem 0' }}>
              <div style={{ fontSize: 48, marginBottom: 20 }}>✉️</div>
              <h2 style={{ fontSize: 20, marginBottom: 12 }}>Magic link sent!</h2>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                We sent a sign-in link to <strong style={{ color: 'var(--text-primary)' }}>{email}</strong>. Click it to continue.
              </p>
              <button
                onClick={() => { setSent(false); setEmail('') }}
                style={{ marginTop: 24, fontSize: 13, color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}
              >
                Use a different email
              </button>
            </div>
          ) : (
            <>
              {/* Google OAuth */}
              <button onClick={handleGoogle} className="btn btn-ghost" style={{ width: '100%', marginBottom: 16, padding: '12px', fontSize: 14 }}>
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
                  <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.859-3.048.859-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
                  <path d="M3.964 10.705A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.705V4.963H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.037l3.007-2.332z" fill="#FBBC05"/>
                  <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.963L3.964 7.295C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
                </svg>
                Continue with Google
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>or email</span>
                <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
              </div>

              {/* Magic link form */}
              <form onSubmit={handleMagicLink}>
                <div style={{ marginBottom: 12 }}>
                  <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Email address</label>
                  <input
                    className="input"
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                  />
                </div>

                {error && <p style={{ fontSize: 12, color: '#E24B4A', marginBottom: 12 }}>{error}</p>}

                <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', padding: '12px' }}>
                  {loading ? 'Sending...' : 'Send magic link →'}
                </button>
              </form>

              <p style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center', marginTop: 16, lineHeight: 1.6 }}>
                By continuing, you agree to our Terms of Service. Your 30-day free trial starts immediately.
              </p>
            </>
          )}
        </div>

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 12, color: 'var(--text-muted)' }}>
          <Link href="/" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>← Back to home</Link>
        </p>
      </div>
    </div>
  )
}
