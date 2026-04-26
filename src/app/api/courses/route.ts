import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: courses } = await supabase
      .from('courses')
      .select('*')
      .order('created_at', { ascending: false });
    return NextResponse.json(courses || []);
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
