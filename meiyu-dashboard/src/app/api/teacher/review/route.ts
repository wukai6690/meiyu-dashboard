import { NextRequest, NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'teacher' && profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { data: artworks } = await supabase
      .from('artworks')
      .select('*, evaluations(*), profiles(full_name, school_name, class_name)')
      .order('created_at', { ascending: false });

    return NextResponse.json(artworks || []);
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { artwork_id, status, teacher_comment } = body;
    if (!artwork_id || !status) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });

    const admin = await createAdminClient();
    const { error } = await admin
      .from('evaluations')
      .update({ status, teacher_comment, reviewed_by: user.id, reviewed_at: new Date().toISOString() })
      .eq('artwork_id', artwork_id);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    if (status === 'approved') {
      const { data: artwork } = await admin
        .from('artworks')
        .select('student_id, evaluations(total_score)')
        .eq('id', artwork_id)
        .single();

      if (artwork) {
        const score = artwork.evaluations?.total_score || 0;
        await admin.from('student_exp').insert({
          student_id: artwork.student_id,
          exp_amount: score >= 14 ? 50 : score >= 12 ? 30 : 20,
          source: '作品通过审核',
          artwork_id,
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
