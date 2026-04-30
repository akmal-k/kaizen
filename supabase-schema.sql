-- ============================================
-- KAIZEN SAAS - COMPLETE SUPABASE SCHEMA
-- Run this in Supabase SQL Editor
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- PROFILES TABLE (extends Supabase auth.users)
-- ============================================
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'momentum', 'mastery')),
  plan_started_at TIMESTAMPTZ DEFAULT NOW(),
  trial_ends_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '30 days'),
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  goal_type TEXT DEFAULT 'both' CHECK (goal_type IN ('career', 'habits', 'both')),
  time_available INT DEFAULT 10, -- minutes per day
  onboarding_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- PLANS TABLE (for pricing reference)
-- ============================================
CREATE TABLE plans (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  price_monthly DECIMAL(10,2),
  stripe_price_id TEXT,
  features JSONB,
  is_active BOOLEAN DEFAULT TRUE
);

INSERT INTO plans (id, name, price_monthly, features) VALUES
('free', 'Free Trial', 0, '["3 habits/day","Basic career plan","7-day streak tracking","Community access"]'),
('momentum', 'Momentum', 9, '["Unlimited habits","AI-personalized plan","Full streak history","Email reminders","Progress insights","Career roadmap","Priority support"]'),
('mastery', 'Mastery', 19, '["Everything in Momentum","Multiple life areas","Advanced AI coaching","Weekly AI plan refresh","Custom habit builder","Team accountability","1-on-1 onboarding call","Early access to features"]');

-- ============================================
-- HABITS TABLE
-- ============================================
CREATE TABLE habits (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'career' CHECK (category IN ('career', 'skill', 'health', 'mindset', 'relationship', 'custom')),
  phase INT DEFAULT 1 CHECK (phase IN (1, 2, 3)),
  duration_minutes INT DEFAULT 10,
  is_active BOOLEAN DEFAULT TRUE,
  is_ai_generated BOOLEAN DEFAULT FALSE,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- HABIT COMPLETIONS TABLE (daily tracking)
-- ============================================
CREATE TABLE habit_completions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  habit_id UUID REFERENCES habits(id) ON DELETE CASCADE NOT NULL,
  completed_date DATE NOT NULL DEFAULT CURRENT_DATE,
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  notes TEXT,
  UNIQUE(habit_id, completed_date)
);

-- ============================================
-- STREAKS TABLE
-- ============================================
CREATE TABLE streaks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  current_streak INT DEFAULT 0,
  longest_streak INT DEFAULT 0,
  last_active_date DATE,
  total_completions INT DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- AI PLANS TABLE (generated plans per user)
-- ============================================
CREATE TABLE ai_plans (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  plan_data JSONB NOT NULL,
  goal_type TEXT,
  time_available INT,
  is_current BOOLEAN DEFAULT TRUE,
  generated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- WAITLIST TABLE
-- ============================================
CREATE TABLE waitlist (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  source TEXT DEFAULT 'landing',
  converted_to_user BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ADMIN TABLE (for admin dashboard access)
-- ============================================
CREATE TABLE admin_users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE habit_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Profiles: users see only their own
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Habits: users manage their own
CREATE POLICY "Users manage own habits" ON habits FOR ALL USING (auth.uid() = user_id);

-- Completions: users manage their own
CREATE POLICY "Users manage own completions" ON habit_completions FOR ALL USING (auth.uid() = user_id);

-- Streaks: users see their own
CREATE POLICY "Users manage own streaks" ON streaks FOR ALL USING (auth.uid() = user_id);

-- AI Plans: users see their own
CREATE POLICY "Users manage own ai_plans" ON ai_plans FOR ALL USING (auth.uid() = user_id);

-- Admin: only admin users can read all profiles
CREATE POLICY "Admins can view all profiles" ON profiles FOR SELECT USING (
  EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid())
);

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  INSERT INTO streaks (user_id) VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Update streak function
CREATE OR REPLACE FUNCTION update_streak(p_user_id UUID)
RETURNS VOID AS $$
DECLARE
  v_last_date DATE;
  v_current INT;
  v_longest INT;
BEGIN
  SELECT last_active_date, current_streak, longest_streak
  INTO v_last_date, v_current, v_longest
  FROM streaks WHERE user_id = p_user_id;

  IF v_last_date = CURRENT_DATE - 1 THEN
    v_current := v_current + 1;
  ELSIF v_last_date = CURRENT_DATE THEN
    -- already updated today
    RETURN;
  ELSE
    v_current := 1;
  END IF;

  IF v_current > v_longest THEN v_longest := v_current; END IF;

  UPDATE streaks SET
    current_streak = v_current,
    longest_streak = v_longest,
    last_active_date = CURRENT_DATE,
    total_completions = total_completions + 1,
    updated_at = NOW()
  WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX idx_habits_user_id ON habits(user_id);
CREATE INDEX idx_completions_user_date ON habit_completions(user_id, completed_date);
CREATE INDEX idx_streaks_user_id ON streaks(user_id);
CREATE INDEX idx_profiles_plan ON profiles(plan);
CREATE INDEX idx_profiles_created ON profiles(created_at);
