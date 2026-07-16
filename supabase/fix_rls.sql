-- ================================================
-- RLS 无限递归修复
-- 在 Supabase SQL Editor 中执行
-- ================================================

-- 1. 创建 SECURITY DEFINER 函数绕过 RLS（避免递归）
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS TEXT
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
STABLE
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

-- 2. 重建 profiles 策略
DROP POLICY IF EXISTS "Teachers can view all profiles" ON public.profiles;
CREATE POLICY "Teachers can view all profiles" ON public.profiles
  FOR SELECT
  USING (public.get_my_role() IN ('teacher', 'admin'));

-- 3. 同样修复 artworks 中的教师策略（避免嵌套查询）
DROP POLICY IF EXISTS "Teachers can view all artworks" ON public.artworks;
CREATE POLICY "Teachers can view all artworks" ON public.artworks
  FOR SELECT
  USING (public.get_my_role() IN ('teacher', 'admin'));

DROP POLICY IF EXISTS "Teachers can update all artworks" ON public.artworks;
CREATE POLICY "Teachers can update all artworks" ON public.artworks
  FOR UPDATE
  USING (public.get_my_role() IN ('teacher', 'admin'));

-- 4. 同样修复 evaluations 策略
DROP POLICY IF EXISTS "Teachers can manage all evaluations" ON public.evaluations;
CREATE POLICY "Teachers can manage all evaluations" ON public.evaluations
  FOR ALL
  USING (public.get_my_role() IN ('teacher', 'admin'));

-- 5. 同样修复 courses 策略
DROP POLICY IF EXISTS "Teachers can manage courses" ON public.courses;
CREATE POLICY "Teachers can manage courses" ON public.courses
  FOR ALL
  USING (public.get_my_role() IN ('teacher', 'admin'));
