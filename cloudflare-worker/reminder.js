// cloudflare-worker/reminder.js
// Deploy with: wrangler deploy
// Schedule: every day at 8am UTC

export default {
  async scheduled(event, env, ctx) {
    ctx.waitUntil(sendReminders(env))
  },

  // Also allow manual trigger via HTTP
  async fetch(request, env) {
    if (request.method === 'POST' && request.url.includes('/trigger')) {
      await sendReminders(env)
      return new Response(JSON.stringify({ ok: true }), { headers: { 'Content-Type': 'application/json' } })
    }
    return new Response('Kaizen reminder worker', { status: 200 })
  }
}

async function sendReminders(env) {
  // Fetch users who have reminders enabled (momentum + mastery plans)
  const res = await fetch(`${env.SUPABASE_URL}/rest/v1/profiles?plan=in.(momentum,mastery)&onboarding_completed=eq.true&select=id,email,full_name,plan`, {
    headers: {
      'apikey': env.SUPABASE_SERVICE_KEY,
      'Authorization': `Bearer ${env.SUPABASE_SERVICE_KEY}`,
    }
  })

  const users = await res.json()

  // Get today's date
  const today = new Date().toISOString().split('T')[0]

  // For each user, check if they've completed habits today
  for (const user of users) {
    const completionsRes = await fetch(
      `${env.SUPABASE_URL}/rest/v1/habit_completions?user_id=eq.${user.id}&completed_date=eq.${today}&select=id`,
      {
        headers: {
          'apikey': env.SUPABASE_SERVICE_KEY,
          'Authorization': `Bearer ${env.SUPABASE_SERVICE_KEY}`,
        }
      }
    )
    const completions = await completionsRes.json()

    // Only send reminder if no habits completed today
    if (completions.length === 0) {
      await sendEmail(env, user.email, user.full_name || 'there', user.plan)
      // Small delay to avoid rate limits
      await new Promise(r => setTimeout(r, 100))
    }
  }
}

async function sendEmail(env, email, name, plan) {
  const firstName = name.split(' ')[0]

  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: `Kaizen <${env.FROM_EMAIL}>`,
      to: email,
      subject: `${firstName}, your 3 habits are waiting 🔥`,
      html: `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#0a0a0f;font-family:'DM Sans',sans-serif;color:#f0eff8;">
  <div style="max-width:560px;margin:40px auto;padding:0 20px;">
    <div style="text-align:center;margin-bottom:32px;">
      <h1 style="font-size:24px;font-weight:800;letter-spacing:-0.02em;margin:0;">
        kaizen<span style="color:#7F77DD;">.</span>
      </h1>
    </div>

    <div style="background:#13131c;border:1px solid rgba(255,255,255,0.07);border-radius:16px;padding:32px;">
      <p style="font-size:20px;font-weight:600;margin:0 0 12px;">Hey ${firstName} 👋</p>
      <p style="font-size:15px;color:#8b8a9e;line-height:1.7;margin:0 0 24px;">
        Your daily habits are waiting. It only takes ${plan === 'mastery' ? '10-15' : '5-10'} minutes — and today's streak is on the line.
      </p>

      <div style="background:#1a1a24;border-radius:10px;padding:20px;margin-bottom:24px;">
        <p style="font-size:13px;color:#4a4a5e;margin:0 0 8px;text-transform:uppercase;letter-spacing:0.05em;">Kaizen principle</p>
        <p style="font-size:15px;color:#f0eff8;margin:0;font-style:italic;">"You don't rise to the level of your goals. You fall to the level of your systems."</p>
        <p style="font-size:12px;color:#4a4a5e;margin:6px 0 0;">— James Clear</p>
      </div>

      <a href="${env.APP_URL}/dashboard" style="display:block;text-align:center;background:#7F77DD;color:white;text-decoration:none;padding:14px 24px;border-radius:8px;font-size:15px;font-weight:500;">
        Complete today's habits →
      </a>
    </div>

    <p style="text-align:center;font-size:12px;color:#4a4a5e;margin-top:24px;">
      You're on the <strong style="color:#8b8a9e;">${plan}</strong> plan ·
      <a href="${env.APP_URL}/dashboard/settings" style="color:#4a4a5e;">Manage reminders</a>
    </p>
  </div>
</body>
</html>
      `
    })
  })
}

// wrangler.toml config:
/*
name = "kaizen-reminders"
main = "reminder.js"
compatibility_date = "2024-01-01"

[triggers]
crons = ["0 8 * * *"]

[vars]
APP_URL = "https://your-kaizen-app.vercel.app"
FROM_EMAIL = "reminders@yourdomain.com"

# Add these as secrets with: wrangler secret put SUPABASE_URL
# SUPABASE_URL, SUPABASE_SERVICE_KEY, RESEND_API_KEY
*/
