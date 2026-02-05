-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('user', 'admin');

-- Create enum for user status
CREATE TYPE public.user_status AS ENUM ('pending', 'approved', 'blocked');

-- Create enum for subscription tier
CREATE TYPE public.subscription_tier AS ENUM ('free', 'vip', 'special');

-- Create enum for tip status
CREATE TYPE public.tip_status AS ENUM ('pending', 'won', 'lost', 'void');

-- ============================================
-- PROFILES TABLE (extends auth.users)
-- ============================================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  subscription subscription_tier NOT NULL DEFAULT 'free',
  status user_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles RLS policies
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- ============================================
-- USER ROLES TABLE (separate from profiles for security)
-- ============================================
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles (prevents infinite recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Function to get user's highest role
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id UUID)
RETURNS app_role
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT role FROM public.user_roles WHERE user_id = _user_id ORDER BY role DESC LIMIT 1),
    'user'::app_role
  )
$$;

-- User roles RLS policies
CREATE POLICY "Users can view own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles"
  ON public.user_roles FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- ============================================
-- FREE TIPS TABLE
-- ============================================
CREATE TABLE public.free_tips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  home_team TEXT NOT NULL,
  away_team TEXT NOT NULL,
  prediction TEXT NOT NULL,
  odds TEXT NOT NULL,
  match_time TEXT NOT NULL,
  league TEXT NOT NULL,
  category TEXT NOT NULL,
  status tip_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.free_tips ENABLE ROW LEVEL SECURITY;

-- Free tips are viewable by all approved users
CREATE POLICY "Approved users can view free tips"
  ON public.free_tips FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.status = 'approved'
    )
  );

-- Admins can manage free tips
CREATE POLICY "Admins can manage free tips"
  ON public.free_tips FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- ============================================
-- VIP TIPS TABLE
-- ============================================
CREATE TABLE public.vip_tips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  home_team TEXT NOT NULL,
  away_team TEXT NOT NULL,
  prediction TEXT NOT NULL,
  odds TEXT NOT NULL,
  match_time TEXT NOT NULL,
  league TEXT NOT NULL,
  category TEXT NOT NULL,
  status tip_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.vip_tips ENABLE ROW LEVEL SECURITY;

-- VIP tips are viewable by VIP/Special users
CREATE POLICY "VIP users can view vip tips"
  ON public.vip_tips FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.status = 'approved'
      AND profiles.subscription IN ('vip', 'special')
    )
  );

-- Admins can manage vip tips
CREATE POLICY "Admins can manage vip tips"
  ON public.vip_tips FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- ============================================
-- SPECIAL TIPS TABLE
-- ============================================
CREATE TABLE public.special_tips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  home_team TEXT NOT NULL,
  away_team TEXT NOT NULL,
  prediction TEXT NOT NULL,
  odds TEXT NOT NULL,
  match_time TEXT NOT NULL,
  league TEXT NOT NULL,
  category TEXT NOT NULL,
  status tip_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.special_tips ENABLE ROW LEVEL SECURITY;

-- Special tips are viewable by Special users only
CREATE POLICY "Special users can view special tips"
  ON public.special_tips FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.status = 'approved'
      AND profiles.subscription = 'special'
    )
  );

-- Admins can manage special tips
CREATE POLICY "Admins can manage special tips"
  ON public.special_tips FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- ============================================
-- ANNOUNCEMENTS TABLE
-- ============================================
CREATE TABLE public.announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

-- All approved users can view announcements
CREATE POLICY "Approved users can view announcements"
  ON public.announcements FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.status = 'approved'
    )
  );

-- Admins can manage announcements
CREATE POLICY "Admins can manage announcements"
  ON public.announcements FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- ============================================
-- APP INFORMATION TABLE
-- ============================================
CREATE TABLE public.app_information (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL DEFAULT 'About Mega Odds',
  content TEXT NOT NULL DEFAULT 'Welcome to Mega Odds!',
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.app_information ENABLE ROW LEVEL SECURITY;

-- Everyone can view app info
CREATE POLICY "Anyone can view app info"
  ON public.app_information FOR SELECT
  USING (true);

-- Admins can manage app info
CREATE POLICY "Admins can manage app info"
  ON public.app_information FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- ============================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_free_tips_updated_at
  BEFORE UPDATE ON public.free_tips
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_vip_tips_updated_at
  BEFORE UPDATE ON public.vip_tips
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_special_tips_updated_at
  BEFORE UPDATE ON public.special_tips
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_announcements_updated_at
  BEFORE UPDATE ON public.announcements
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- TRIGGER TO CREATE PROFILE ON USER SIGNUP
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  
  -- Also create default user role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- ADMIN RLS POLICIES FOR PROFILES (Admin can view/update all)
-- ============================================
CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update all profiles"
  ON public.profiles FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

-- ============================================
-- INSERT DEFAULT APP INFO
-- ============================================
INSERT INTO public.app_information (title, content)
VALUES (
  'About Mega Odds',
  'Welcome to Mega Odds — your ultimate football predictions platform.

**Our Mission**
We provide expert football predictions to help you make smarter betting decisions.

**What We Offer**
- Free daily tips across multiple categories
- Premium VIP predictions with higher accuracy
- Exclusive Special tips for serious bettors

**Disclaimer**
Bet responsibly. Mega Odds provides predictions for entertainment purposes. Always gamble within your means.

Contact: support@megaodds.com'
);