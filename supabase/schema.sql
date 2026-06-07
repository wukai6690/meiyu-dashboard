-- ================================================
-- 美育观止 - Supabase PostgreSQL Schema
-- ================================================

-- 启用 UUID 扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. profiles 表
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    avatar_url TEXT,
    role TEXT NOT NULL CHECK (role IN ('student', 'teacher', 'admin')) DEFAULT 'student',
    school_id TEXT,
    class_id TEXT,
    school_name TEXT,
    class_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 触发器：创建用户时自动创建 profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, avatar_url, role)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', '新用户'),
        NEW.raw_user_meta_data->>'avatar_url',
        COALESCE(NEW.raw_user_meta_data->>'role', 'student')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 2. artworks 表
CREATE TABLE IF NOT EXISTS public.artworks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    image_url TEXT NOT NULL,
    reference_image_url TEXT,
    course_id UUID,
    course_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_artworks_student_id ON public.artworks(student_id);
CREATE INDEX IF NOT EXISTS idx_artworks_created_at ON public.artworks(created_at DESC);

-- 3. evaluations 表
CREATE TABLE IF NOT EXISTS public.evaluations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    artwork_id UUID NOT NULL UNIQUE REFERENCES public.artworks(id) ON DELETE CASCADE,
    score_composition INTEGER NOT NULL CHECK (score_composition BETWEEN 1 AND 3),
    score_color INTEGER NOT NULL CHECK (score_color BETWEEN 1 AND 3),
    score_modeling INTEGER NOT NULL CHECK (score_modeling BETWEEN 1 AND 3),
    score_creativity INTEGER NOT NULL CHECK (score_creativity BETWEEN 1 AND 3),
    score_completeness INTEGER NOT NULL CHECK (score_completeness BETWEEN 1 AND 3),
    total_score INTEGER NOT NULL,
    grade TEXT NOT NULL CHECK (grade IN ('杰出', '优秀', '良好', '一般')),
    ai_raw_json JSONB,
    ai_feedback TEXT,
    comp_feedback TEXT,
    color_feedback TEXT,
    modeling_feedback TEXT,
    creativity_feedback TEXT,
    completeness_feedback TEXT,
    is_teacher_overridden BOOLEAN DEFAULT FALSE,
    teacher_comment TEXT,
    reviewed_by UUID REFERENCES public.profiles(id),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    status TEXT NOT NULL CHECK (status IN ('pending_review', 'approved', 'rejected')) DEFAULT 'pending_review',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_evaluations_artwork_id ON public.evaluations(artwork_id);
CREATE INDEX IF NOT EXISTS idx_evaluations_status ON public.evaluations(status);
CREATE INDEX IF NOT EXISTS idx_evaluations_created_at ON public.evaluations(created_at DESC);

-- 4. courses 表
CREATE TABLE IF NOT EXISTS public.courses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    reference_image_url TEXT,
    teacher_id UUID REFERENCES public.profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. badges 表
CREATE TABLE IF NOT EXISTS public.badges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    requirement_type TEXT NOT NULL CHECK (requirement_type IN ('streak', 'score', 'metric', 'count')),
    requirement_metric TEXT,
    requirement_threshold INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. student_badges 表
CREATE TABLE IF NOT EXISTS public.student_badges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    badge_id UUID NOT NULL REFERENCES public.badges(id) ON DELETE CASCADE,
    unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(student_id, badge_id)
);

CREATE INDEX IF NOT EXISTS idx_student_badges_student_id ON public.student_badges(student_id);

-- 7. student_exp 表
CREATE TABLE IF NOT EXISTS public.student_exp (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    exp_amount INTEGER NOT NULL,
    source TEXT NOT NULL,
    artwork_id UUID REFERENCES public.artworks(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_student_exp_student_id ON public.student_exp(student_id);
CREATE INDEX IF NOT EXISTS idx_student_exp_created_at ON public.student_exp(created_at DESC);

-- ================================================
-- 行级安全策略 (RLS)
-- ================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.artworks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_exp ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

-- profiles 策略
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
DROP POLICY IF EXISTS "Teachers can view all profiles" ON public.profiles;
CREATE POLICY "Teachers can view all profiles" ON public.profiles FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('teacher', 'admin'))
);

-- artworks 策略
DROP POLICY IF EXISTS "Students can view own artworks" ON public.artworks;
CREATE POLICY "Students can view own artworks" ON public.artworks FOR SELECT USING (auth.uid() = student_id);
DROP POLICY IF EXISTS "Students can insert own artworks" ON public.artworks;
CREATE POLICY "Students can insert own artworks" ON public.artworks FOR INSERT WITH CHECK (auth.uid() = student_id);
DROP POLICY IF EXISTS "Students can update own artworks" ON public.artworks;
CREATE POLICY "Students can update own artworks" ON public.artworks FOR UPDATE USING (auth.uid() = student_id);
DROP POLICY IF EXISTS "Teachers can view all artworks" ON public.artworks;
CREATE POLICY "Teachers can view all artworks" ON public.artworks FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('teacher', 'admin'))
);
DROP POLICY IF EXISTS "Teachers can update all artworks" ON public.artworks;
CREATE POLICY "Teachers can update all artworks" ON public.artworks FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('teacher', 'admin'))
);

-- evaluations 策略
DROP POLICY IF EXISTS "Students can view own evaluations" ON public.evaluations;
CREATE POLICY "Students can view own evaluations" ON public.evaluations FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.artworks a WHERE a.id = artwork_id AND a.student_id = auth.uid())
);
DROP POLICY IF EXISTS "Teachers can manage all evaluations" ON public.evaluations;
CREATE POLICY "Teachers can manage all evaluations" ON public.evaluations FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('teacher', 'admin'))
);

-- student_badges 策略
DROP POLICY IF EXISTS "Students can view own badges" ON public.student_badges;
CREATE POLICY "Students can view own badges" ON public.student_badges FOR SELECT USING (auth.uid() = student_id);

-- student_exp 策略
DROP POLICY IF EXISTS "Students can view own exp" ON public.student_exp;
CREATE POLICY "Students can view own exp" ON public.student_exp FOR SELECT USING (auth.uid() = student_id);
DROP POLICY IF EXISTS "Students can insert own exp" ON public.student_exp;
CREATE POLICY "Students can insert own exp" ON public.student_exp FOR INSERT WITH CHECK (auth.uid() = student_id);

-- courses 策略
DROP POLICY IF EXISTS "Everyone can view courses" ON public.courses;
CREATE POLICY "Everyone can view courses" ON public.courses FOR SELECT USING (true);
DROP POLICY IF EXISTS "Teachers can manage courses" ON public.courses;
CREATE POLICY "Teachers can manage courses" ON public.courses FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('teacher', 'admin'))
);

-- ================================================
-- 初始徽章数据
-- ================================================
INSERT INTO public.badges (name, description, icon, requirement_type, requirement_threshold) VALUES
    ('初露锋芒', '完成首次作品评价', 'star', 'count', 1),
    ('调色盘大师', '连续3次在色彩维度获得A级', 'palette', 'streak', 3),
    ('构图巧匠', '连续3次在构图维度获得A级', 'layout', 'streak', 3),
    ('创意之星', '连续3次在创意维度获得A级', 'sparkles', 'streak', 3),
    ('完美主义者', '单幅作品五维全A', 'score', 'score', 15),
    ('成长达人', '累计获得500经验值', 'trending-up', 'count', 500),
    ('美育新星', '累计获得1000经验值', 'rocket', 'count', 1000)
ON CONFLICT DO NOTHING;
