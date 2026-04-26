import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: expRecords } = await supabase
      .from('student_exp')
      .select('*')
      .eq('student_id', user.id)
      .order('created_at', { ascending: false });

    const totalExp = (expRecords || []).reduce((sum, e) => sum + e.exp_amount, 0);

    return NextResponse.json({ totalExp, records: expRecords || [] });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
