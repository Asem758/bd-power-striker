-- ==============================================================================
-- BD POWER STRIKERS CLUB (BDPSC) - SUPABASE RELATIONAL DATABASE SCHEMA
-- Project ID: ooqeoqxhogrmcbzjtmjk
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================================================
-- 2. USER PROFILES & AUTHENTICATION
-- Syncs automatically with Supabase Auth (auth.users)
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  gaming_name TEXT,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'USER', -- 'SUPER_ADMIN', 'ADMIN', 'STAFF', 'CAPTAIN', 'PLAYER', 'USER'
  status TEXT NOT NULL DEFAULT 'ACTIVE', -- 'ACTIVE', 'PENDING', 'SUSPENDED'
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Trigger to automatically create a profile row when a new user signs up in auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, gaming_name, avatar_url, role, status)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'gaming_name',
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'),
    CASE 
      WHEN NEW.email = 'ashrafulashem@gmail.com' THEN 'SUPER_ADMIN'
      ELSE COALESCE(NEW.raw_user_meta_data->>'role', 'USER')
    END,
    'ACTIVE'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    name = COALESCE(EXCLUDED.name, public.profiles.name),
    avatar_url = COALESCE(EXCLUDED.avatar_url, public.profiles.avatar_url),
    updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==============================================================================
-- 3. ROSTER & ATHLETE PROFILES
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.players (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  gaming_name TEXT NOT NULL,
  squad_number INTEGER,
  position TEXT NOT NULL, -- 'CF', 'SS', 'LWF', 'RWF', 'AMF', 'CMF', 'DMF', 'CB', 'LB', 'RB', 'GK'
  dominant_foot TEXT DEFAULT 'Right',
  age INTEGER,
  nationality TEXT DEFAULT 'Bangladesh',
  avatar_url TEXT,
  card_image_url TEXT,
  status TEXT NOT NULL DEFAULT 'ACTIVE', -- 'ACTIVE', 'INACTIVE', 'INJURED', 'RESERVE', 'LOANED'
  bio TEXT,
  rating NUMERIC(4, 1) DEFAULT 75.0,
  power_ranking INTEGER,
  matches_played INTEGER DEFAULT 0,
  goals INTEGER DEFAULT 0,
  assists INTEGER DEFAULT 0,
  clean_sheets INTEGER DEFAULT 0,
  wins INTEGER DEFAULT 0,
  draws INTEGER DEFAULT 0,
  losses INTEGER DEFAULT 0,
  win_rate NUMERIC(5, 2) DEFAULT 0.0,
  mvp_awards INTEGER DEFAULT 0,
  specialties TEXT[],
  joined_date DATE DEFAULT CURRENT_DATE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- 4. SEASONS & TOURNAMENTS
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.seasons (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  year TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  is_active BOOLEAN DEFAULT false,
  total_matches INTEGER DEFAULT 0,
  wins INTEGER DEFAULT 0,
  draws INTEGER DEFAULT 0,
  losses INTEGER DEFAULT 0,
  goals_for INTEGER DEFAULT 0,
  goals_against INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.tournaments (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  edition TEXT,
  season_id TEXT REFERENCES public.seasons(id) ON DELETE SET NULL,
  format TEXT NOT NULL DEFAULT 'KNOCKOUT', -- 'LEAGUE', 'KNOCKOUT', 'GROUP_AND_KNOCKOUT'
  status TEXT NOT NULL DEFAULT 'UPCOMING', -- 'UPCOMING', 'ONGOING', 'COMPLETED'
  start_date DATE,
  end_date DATE,
  teams_count INTEGER DEFAULT 16,
  champion TEXT,
  runner_up TEXT,
  brackets JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- 5. MATCH OPERATIONS & RESULTS
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.matches (
  id TEXT PRIMARY KEY,
  match_code TEXT UNIQUE,
  opponent TEXT NOT NULL,
  date DATE NOT NULL,
  time TEXT,
  competition_type TEXT NOT NULL, -- 'LEAGUE', 'TOURNAMENT', 'FRIENDLY', 'SCRIM'
  season_id TEXT REFERENCES public.seasons(id) ON DELETE SET NULL,
  tournament_id TEXT REFERENCES public.tournaments(id) ON DELETE SET NULL,
  score_bdpsc INTEGER NOT NULL DEFAULT 0,
  score_opponent INTEGER NOT NULL DEFAULT 0,
  result TEXT NOT NULL, -- 'WIN', 'DRAW', 'LOSS'
  stream_url TEXT,
  highlight_url TEXT,
  notes TEXT,
  mvp_player_id TEXT REFERENCES public.players(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.match_performances (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  match_id TEXT NOT NULL REFERENCES public.matches(id) ON DELETE CASCADE,
  player_id TEXT NOT NULL REFERENCES public.players(id) ON DELETE CASCADE,
  goals INTEGER DEFAULT 0,
  assists INTEGER DEFAULT 0,
  saves INTEGER DEFAULT 0,
  rating NUMERIC(4, 2) DEFAULT 6.0,
  is_mvp BOOLEAN DEFAULT false,
  clean_sheet BOOLEAN DEFAULT false,
  minutes_played INTEGER DEFAULT 90,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- 6. TROPHY CABINET & AWARDS
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.trophies (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  tournament TEXT NOT NULL,
  year TEXT NOT NULL,
  category TEXT DEFAULT 'CHAMPION',
  image_url TEXT,
  description TEXT,
  highlight_stat TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.player_awards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  player_id TEXT NOT NULL REFERENCES public.players(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  event TEXT NOT NULL,
  date DATE NOT NULL,
  badge_color TEXT DEFAULT 'amber',
  icon TEXT DEFAULT 'Trophy',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- 7. FIXTURES, NEWS, MEDIA & ANNOUNCEMENTS
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.fixtures (
  id TEXT PRIMARY KEY,
  opponent TEXT NOT NULL,
  date DATE NOT NULL,
  time TEXT NOT NULL,
  competition TEXT NOT NULL,
  venue TEXT DEFAULT 'Online eFootball Server',
  status TEXT NOT NULL DEFAULT 'UPCOMING', -- 'UPCOMING', 'LIVE', 'COMPLETED', 'POSTPONED'
  stream_url TEXT,
  season_id TEXT REFERENCES public.seasons(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.news_articles (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  excerpt TEXT,
  content TEXT NOT NULL,
  cover_image TEXT,
  category TEXT NOT NULL DEFAULT 'CLUB_UPDATE',
  author TEXT NOT NULL DEFAULT 'BDPSC Media Team',
  published_at TIMESTAMPTZ DEFAULT NOW(),
  is_featured BOOLEAN DEFAULT false,
  tags TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.media_items (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'IMAGE', -- 'IMAGE', 'VIDEO', 'CLIP', 'WALLPAPER'
  url TEXT NOT NULL,
  thumbnail TEXT,
  description TEXT,
  tags TEXT[],
  uploaded_at TIMESTAMPTZ DEFAULT NOW(),
  views INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS public.announcements (
  id TEXT PRIMARY KEY,
  text TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'INFO', -- 'INFO', 'ALERT', 'MATCH', 'SIGNING'
  is_active BOOLEAN DEFAULT true,
  priority INTEGER DEFAULT 1,
  link TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.rating_configs (
  id TEXT PRIMARY KEY DEFAULT 'current',
  version TEXT NOT NULL DEFAULT 'v1.2',
  base_rating NUMERIC(4, 1) DEFAULT 70.0,
  win_bonus NUMERIC(4, 2) DEFAULT 3.0,
  draw_penalty NUMERIC(4, 2) DEFAULT 0.5,
  loss_penalty NUMERIC(4, 2) DEFAULT 2.0,
  goal_weight NUMERIC(4, 2) DEFAULT 0.8,
  assist_weight NUMERIC(4, 2) DEFAULT 0.5,
  clean_sheet_bonus NUMERIC(4, 2) DEFAULT 1.5,
  mvp_multiplier NUMERIC(4, 2) DEFAULT 1.5,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  user_name TEXT,
  action TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id TEXT,
  details TEXT,
  ip_address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- 8. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.match_performances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seasons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trophies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.player_awards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fixtures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rating_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Helper function: Check if current user is Super Admin or Admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('SUPER_ADMIN', 'ADMIN')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Profiles Policies
CREATE POLICY "Public read profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins manage profiles" ON public.profiles FOR ALL USING (public.is_admin());

-- Public Content (Read-all for public/authenticated, write for Admins)
CREATE POLICY "Public read players" ON public.players FOR SELECT USING (true);
CREATE POLICY "Admins manage players" ON public.players FOR ALL USING (public.is_admin());

CREATE POLICY "Public read matches" ON public.matches FOR SELECT USING (true);
CREATE POLICY "Admins manage matches" ON public.matches FOR ALL USING (public.is_admin());

CREATE POLICY "Public read match_performances" ON public.match_performances FOR SELECT USING (true);
CREATE POLICY "Admins manage match_performances" ON public.match_performances FOR ALL USING (public.is_admin());

CREATE POLICY "Public read seasons" ON public.seasons FOR SELECT USING (true);
CREATE POLICY "Admins manage seasons" ON public.seasons FOR ALL USING (public.is_admin());

CREATE POLICY "Public read tournaments" ON public.tournaments FOR SELECT USING (true);
CREATE POLICY "Admins manage tournaments" ON public.tournaments FOR ALL USING (public.is_admin());

CREATE POLICY "Public read trophies" ON public.trophies FOR SELECT USING (true);
CREATE POLICY "Admins manage trophies" ON public.trophies FOR ALL USING (public.is_admin());

CREATE POLICY "Public read player_awards" ON public.player_awards FOR SELECT USING (true);
CREATE POLICY "Admins manage player_awards" ON public.player_awards FOR ALL USING (public.is_admin());

CREATE POLICY "Public read fixtures" ON public.fixtures FOR SELECT USING (true);
CREATE POLICY "Admins manage fixtures" ON public.fixtures FOR ALL USING (public.is_admin());

CREATE POLICY "Public read news_articles" ON public.news_articles FOR SELECT USING (true);
CREATE POLICY "Admins manage news_articles" ON public.news_articles FOR ALL USING (public.is_admin());

CREATE POLICY "Public read media_items" ON public.media_items FOR SELECT USING (true);
CREATE POLICY "Admins manage media_items" ON public.media_items FOR ALL USING (public.is_admin());

CREATE POLICY "Public read announcements" ON public.announcements FOR SELECT USING (true);
CREATE POLICY "Admins manage announcements" ON public.announcements FOR ALL USING (public.is_admin());

CREATE POLICY "Public read rating_configs" ON public.rating_configs FOR SELECT USING (true);
CREATE POLICY "Admins manage rating_configs" ON public.rating_configs FOR ALL USING (public.is_admin());

CREATE POLICY "Admins manage audit_logs" ON public.audit_logs FOR ALL USING (public.is_admin());

-- ==============================================================================
-- 9. INITIAL DATA SEEDING
-- ==============================================================================

INSERT INTO public.rating_configs (id, version, base_rating, win_bonus, draw_penalty, loss_penalty, clean_sheet_bonus, mvp_multiplier)
VALUES ('current', 'v1.2', 70.0, 3.0, 0.5, 2.0, 1.5, 1.5)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.seasons (id, name, year, start_date, is_active, total_matches, wins, draws, losses, goals_for, goals_against)
VALUES 
  ('season-2025', '2025 National Season', '2025', '2025-01-01', true, 28, 22, 4, 2, 74, 21),
  ('season-2024', '2024 Championship Season', '2024', '2024-01-01', false, 32, 25, 4, 3, 86, 28)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.announcements (id, text, type, is_active, priority)
VALUES 
  ('ann-1', 'BDPSC officially crowned 2025 National eFootball Winter Cup Champions! Glory to Power Strikers!', 'ALERT', true, 1),
  ('ann-2', 'Next fixture: BDPSC vs Dhaka Titans on Sunday 8:00 PM GMT+6.', 'MATCH', true, 2),
  ('ann-3', 'Official v1.2 Player Rating Engine activated across all competitive roster profiles.', 'INFO', true, 3)
ON CONFLICT (id) DO NOTHING;
