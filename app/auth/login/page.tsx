'use client'
import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

const EMAIL_RE = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/

function LoginForm() {
  const searchParams = useSearchParams()
  const next = searchParams.get('next') || '/dashboard'

  const [email, setEmail]           = useState('')
  const [touched, setTouched]       = useState(false)   // true after first blur
  const [sent, setSent]             = useState(false)
  const [loading, setLoading]       = useState(false)
  const [error, setError]           = useState('')
  const [cooldown, setCooldown]     = useState(0)       // resend timer (seconds)

  // Countdown tick
  useEffect(() => {
    if (cooldown <= 0) return
    const t = setTimeout(() => setCooldown(c => c - 1), 1000)
    return () => clearTimeout(t)
  }, [cooldown])

  const isValid       = EMAIL_RE.test(email)
  const showError     = touched && email.length > 0 && !isValid

  // Input border color: green valid / red invalid-after-touch / default
  const borderColor = () => {
    if (showError)                      return 'rgba(200,92,58,0.6)'
    if (email.length > 0 && isValid)   return 'rgba(39,168,122,0.5)'
    return 'var(--border)'
  }

  async function sendLink(addr: string) {
    setLoading(true)
    setError('')
    const { error: err } = await supabase.auth.signInWithOtp({
      email: addr,
      options: { emailRedirectTo: `${window.location.origin}${next}` },
    })
    if (err) {
      setError(err.message)
    } else {
      setSent(true)
      setCooldown(60)
    }
    setLoading(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setTouched(true)
    if (!isValid) return          // block submit if email is bad
    await sendLink(email)
  }

  async function handleResend() {
    if (cooldown > 0 || loading) return
    await sendLink(email)
  }

  async function handleGoogle() {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}${next}` },
    })
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', padding: '2rem' }}>
      {/* Background */}
      <div style={{ position: 'fixed', inset: 0, backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(201,147,42,0.06) 1px, transparent 0)', backgroundSize: '32px 32px', pointerEvents: 'none' }} />
      <div style={{ position: 'fixed', inset: 0, background: 'radial-gradient(ellipse at 50% -10%, rgba(201,147,42,0.06) 0%, transparent 55%)', pointerEvents: 'none' }} />

      <div style={{ width: '100%', maxWidth: 400, position: 'relative' }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <Link href="/" style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 28, fontStyle: 'italic', color: 'var(--text-primary)', textDecoration: 'none' }}>
            kaizen<span style={{ color: 'var(--gold)', fontStyle: 'normal' }}>.</span>
          </Link>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 10, lineHeight: 1.5 }}>
            {sent ? 'Check your inbox' : 'Sign in or create your account'}
          </p>
        </div>

        <div className="card">

          {/* ── SENT STATE ── */}
          {sent ? (
            <div style={{ textAlign: 'center', padding: '0.25rem 0' }}>
              <div style={{
                width: 64, height: 64, borderRadius: '50%', margin: '0 auto 20px',
                background: 'var(--gold-dim)', border: '1px solid var(--gold-border)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28,
              }}>
                ✉️
              </div>

              <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 10 }}>Magic link sent!</h2>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 8 }}>
                We sent a sign-in link to
              </p>
              <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 24, wordBreak: 'break-all' }}>
                {email}
              </p>

              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16, lineHeight: 1.6 }}>
                Didn't get it? Check your spam folder, or resend below.
              </p>

              {error && (
                <div style={{ fontSize: 12, color: 'var(--terracotta)', marginBottom: 12, padding: '8px 12px', background: 'rgba(200,92,58,0.08)', borderRadius: 6, border: '1px solid rgba(200,92,58,0.2)' }}>
                  {error}
                </div>
              )}

              <button
                onClick={handleResend}
                disabled={cooldown > 0 || loading}
                className="btn btn-ghost"
                style={{ width: '100%', marginBottom: 12, opacity: cooldown > 0 ? 0.55 : 1, transition: 'opacity 0.2s' }}
              >
                {loading ? 'Sending…' : cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend magic link'}
              </button>

              <button
                onClick={() => { setSent(false); setEmail(''); setTouched(false); setError('') }}
                style={{ fontSize: 13, color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', textUnderlineOffset: 3 }}
              >
                Use a different email
              </button>
            </div>

          ) : (
            /* ── LOGIN FORM ── */
            <>
              {/* Google OAuth */}
              <button onClick={handleGoogle} className="btn btn-ghost" style={{ width: '100%', marginBottom: 20, padding: '12px', fontSize: 14 }}>
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
                  <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.859-3.048.859-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
                  <path d="M3.964 10.705A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.705V4.963H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.037l3.007-2.332z" fill="#FBBC05"/>
                  <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.963L3.964 7.295C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
                </svg>
                Continue with Google
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>or email</span>
                <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
              </div>

              <form onSubmit={handleSubmit} noValidate>
                <div style={{ marginBottom: 14 }}>
                  <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 6, fontWeight: 500 }}>
                    Email address
                  </label>

                  {/* Input + inline icon */}
                  <div style={{ position: 'relative' }}>
                    <input
                      className="input"
                      type="email"
                      value={email}
                      onChange={e => { setEmail(e.target.value); setError('') }}
                      onBlur={() => setTouched(true)}
                      placeholder="you@example.com"
                      autoFocus
                      autoComplete="email"
                      style={{
                        borderColor: borderColor(),
                        paddingRight: email.length > 0 ? 38 : 16,
                        transition: 'border-color 0.2s, box-shadow 0.2s',
                      }}
                    />

                    {/* ✓ / × icon inside input */}
                    {email.length > 0 && (
                      <span style={{
                        position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                        fontSize: 15, lineHeight: 1, pointerEvents: 'none',
                        color: isValid ? 'var(--sage)' : showError ? 'var(--terracotta)' : 'var(--text-muted)',
                        transition: 'color 0.2s',
                      }}>
                        {isValid ? '✓' : '✕'}
                      </span>
                    )}
                  </div>

                  {/* Inline validation message — only after blur */}
                  <div style={{
                    overflow: 'hidden',
                    maxHeight: showError ? 32 : 0,
                    transition: 'max-height 0.2s ease',
                  }}>
                    <p style={{ fontSize: 12, color: 'var(--terracotta)', marginTop: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <span style={{ fontSize: 10 }}>▲</span>
                      Please enter a valid email address
                    </p>
                  </div>
                </div>

                {/* API error */}
                {error && (
                  <div style={{ fontSize: 12, color: 'var(--terracotta)', marginBottom: 14, padding: '9px 12px', background: 'rgba(200,92,58,0.08)', borderRadius: 6, border: '1px solid rgba(200,92,58,0.2)', lineHeight: 1.5 }}>
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading}
                  style={{ width: '100%', padding: '12px', fontSize: 14 }}
                >
                  {loading ? 'Sending…' : 'Send magic link →'}
                </button>
              </form>

              <p style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center', marginTop: 16, lineHeight: 1.7 }}>
                By continuing you agree to our Terms of Service.<br />
                Your 30-day free trial starts immediately.
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

// useSearchParams requires Suspense in Next.js App Router
export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}
