import { NextRequest, NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: artworks } = await supabase
      .from('artworks')
      .select('*, evaluations(*)')
      .eq('student_id', user.id)
      .order('created_at', { ascending: false });

    return NextResponse.json(artworks || []);
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { title, description, image_url, course_name } = body;
    if (!title || !image_url) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });

    const admin = await createAdminClient();
    const { data: artwork, error } = await admin
      .from('artworks')
      .insert({ student_id: user.id, title, description, image_url, course_name })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    await admin.from('student_exp').insert({
      student_id: user.id,
      exp_amount: 20,
      source: '上传作品',
      artwork_id: artwork.id,
    });

    return NextResponse.json(artwork, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
