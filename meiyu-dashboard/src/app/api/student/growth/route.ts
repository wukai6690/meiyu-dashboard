import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: expData } = await supabase
      .from('student_exp')
      .select('*')
      .eq('student_id', user.id)
      .order('created_at', { ascending: true });

    const totalExp = (expData || []).reduce((sum, e) => sum + e.exp_amount, 0);

    const { data: artworks } = await supabase
      .from('artworks')
      .select('id, created_at, evaluations(total_score)')
      .eq('student_id', user.id)
      .order('created_at', { ascending: true });

    const growth = (artworks || []).map((a: { created_at: string; evaluations?: { total_score: number }[] }) => ({
      date: new Date(a.created_at).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' }),
      exp: totalExp,
      score: a.evaluations?.[0]?.total_score || 0,
    }));

    return NextResponse.json({ totalExp, growth, count: artworks?.length || 0 });
  } catch (err: unknown) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
