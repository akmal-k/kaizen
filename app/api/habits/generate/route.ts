import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { goal, time, areas } = await req.json()

  const prompt = `You are a Kaizen habit coach. Generate a personalized 3-phase micro-habit plan.

User's goal: ${goal}
Daily time available: ${time} minutes
Life areas to focus on: ${areas.join(', ')}

Return ONLY a JSON array of 6-9 habits (no markdown, no explanation). Each habit:
{
  "title": "short habit title",
  "description": "one sentence — specific action to take",
  "category": one of [career, skill, health, mindset, relationship],
  "phase": 1, 2, or 3,
  "duration_minutes": number (must fit in ${time} total per day)
}

Phase 1: Micro-habits (1-3 min each) — so easy you can't fail
Phase 2: Growth habits (3-7 min) — build momentum
Phase 3: Compound habits (5-10 min) — meaningful progress

Rules:
- Phase 1 has 3 habits, phase 2 has 3 habits, phase 3 has 2-3 habits
- Total daily time across ALL phase 1 habits must not exceed ${time} minutes
- Each habit must be a SPECIFIC action, not vague advice
- Match the categories to the user's chosen areas: ${areas.join(', ')}
- Habits should directly support the goal: ${goal}
- Make phase 1 habits embarrassingly easy — the key is consistency`

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY!,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1500,
        messages: [{ role: 'user', content: prompt }],
      }),
    })

    const data = await response.json()
    const text = data.content?.[0]?.text || '[]'

    // Parse JSON safely
    const clean = text.replace(/```json|```/g, '').trim()
    const habits = JSON.parse(clean)

    return NextResponse.json({ habits })
  } catch (err) {
    // Fallback habits if API fails
    const fallback = [
      { title: 'Read one thing about your goal', description: `Spend ${Math.min(time, 5)} minutes reading one article, doc page, or chapter related to: ${goal}`, category: areas[0] || 'career', phase: 1, duration_minutes: Math.min(time, 5) },
      { title: 'Write 2 sentences of reflection', description: 'After reading, write what you learned in 2 sentences — no more.', category: 'mindset', phase: 1, duration_minutes: 2 },
      { title: 'Identity affirmation', description: 'Say aloud: "I am someone who gets 1% better every day."', category: 'mindset', phase: 1, duration_minutes: 1 },
      { title: 'Apply what you learned', description: 'Build, write, or practice something small from yesterday\'s reading.', category: areas[0] || 'skill', phase: 2, duration_minutes: Math.min(time, 8) },
      { title: 'Share one insight', description: 'Post or message one person what you\'re learning. Build in public.', category: 'career', phase: 2, duration_minutes: 3 },
      { title: 'Weekly wins log', description: 'Every Friday, list 3 small wins from the week.', category: 'mindset', phase: 2, duration_minutes: 5 },
      { title: 'Deep work session', description: `${time} focused minutes on your main goal. No distractions.`, category: areas[0] || 'skill', phase: 3, duration_minutes: time },
      { title: 'Outreach & connect', description: 'Message one person in your field with a genuine question.', category: 'career', phase: 3, duration_minutes: 5 },
    ]
    return NextResponse.json({ habits: fallback })
  }
}
