import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl)    throw new Error('Missing env var: NEXT_PUBLIC_SUPABASE_URL')
if (!supabaseAnonKey) throw new Error('Missing env var: NEXT_PUBLIC_SUPABASE_ANON_KEY')

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Profile = {
  id: string
  email: string
  full_name: string | null
  plan: 'free' | 'momentum' | 'mastery'
  trial_ends_at: string
  goal_type: 'career' | 'habits' | 'both'
  time_available: number
  onboarding_completed: boolean
  created_at: string
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
}

export type Habit = {
  id: string
  user_id: string
  title: string
  description: string
  category: string
  phase: number
  duration_minutes: number
  is_active: boolean
  is_ai_generated: boolean
  sort_order: number
  created_at: string
}

export type HabitCompletion = {
  id: string
  habit_id: string
  completed_date: string
  completed_at: string
  notes: string | null
}

export type Streak = {
  current_streak: number
  longest_streak: number
  last_active_date: string | null
  total_completions: number
}
