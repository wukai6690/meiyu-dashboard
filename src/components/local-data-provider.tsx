'use client';

import { useEffect, useState } from 'react';
import { getPendingReviews, getApprovedReviews, getStats, getStudentArtworks, updateEvaluationStatus } from '@/lib/local-db';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Loader2, Clock, ThumbsUp, AlertCircle, BookOpen, Sparkles } from 'lucide-react';
import { scoreToLetter } from '@/lib/utils';
import { RadarChart } from '@/components/charts/radar-chart';
import Link from 'next/link';

const DIM_COLORS: Record<string, string> = { '构图': 'border-purple-500/30', '色彩': 'border-amber-500/30', '造型': 'border-emerald-500/30', '创意': 'border-rose-500/30', '完整性': 'border-blue-500/30' };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapLocalReview(evalItem: any) {
  return {
    id: evalItem.artwork_id,
    title: 'Demo评价作品',
    image_url: '',
    course_name: '',
    student: { full_name: 'Demo学生', school_name: '演示学校', class_name: '演示班级' },
    evaluations: {
      score_composition: evalItem.score_composition || 2,
      score_color: evalItem.score_color || 2,
      score_modeling: evalItem.score_modeling || 2,
      score_creativity: evalItem.score_creativity || 2,
      score_completeness: evalItem.score_completeness || 2,
      total_score: evalItem.total_score || 10,
      grade: evalItem.grade || '良好',
      ai_feedback: evalItem.ai_feedback || '',
      status: evalItem.status || 'pending_review',
    },
  };
}

export function LocalTeacherPanel() {
  const [pending, setPending] = useState<unknown[]>([]);
  const [approved, setApproved] = useState<unknown[]>([]);
  const [stats, setStats] = useState<Record<string, unknown> | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const p = getPendingReviews().map(mapLocalReview);
    const a = getApprovedReviews().map(mapLocalReview);
    const s = getStats();
    setPending(p);
    setApproved(a);
    setStats(s);
    setLoaded(true);
  }, [refreshKey]);

  const handleReview = async (artworkId: string, status: string) => {
    updateEvaluationStatus(artworkId, status);
    // Also call the API
    try {
      await fetch('/api/teacher/review', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ artwork_id: artworkId, status }),
      });
    } catch { /* API may fail, localStorage already updated */ }
    setRefreshKey((k) => k + 1);
  };

  if (!loaded || (pending.length === 0 && approved.length === 0)) return null;

  return (
    <div>
      <div className="mb-4 p-3 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-start gap-2">
        <AlertCircle className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-blue-400">以下数据来自浏览器本地存储（Demo 模式）。连接 Supabase 后将显示真实数据库内容。</p>
      </div>

      {/* Stats from localStorage */}
      {stats && (
        <div className="grid grid-cols-4 gap-4 mb-8">
          {[
            { label: '待批阅', value: pending.length, icon: <Clock className="w-5 h-5 text-amber-400" /> },
            { label: '已通过', value: approved.length, icon: <ThumbsUp className="w-5 h-5 text-emerald-400" /> },
            { label: '总数', value: (stats.total_count as number) || 0, icon: <BookOpen className="w-5 h-5 text-blue-400" /> },
            { label: '评级分布', value: `${(stats.grade_distribution as unknown[] || []).length}级`, icon: <Sparkles className="w-5 h-5 text-purple-400" /> },
          ].map((s, i) => (
            <Card key={i} className="bg-white/5 border-white/10"><CardContent className="p-4"><div className="flex items-center gap-2 mb-2">{s.icon}</div><p className="text-2xl font-bold">{s.value}</p><p className="text-xs text-gray-500 mt-1">{s.label}</p></CardContent></Card>
          ))}
        </div>
      )}

      {/* Pending */}
      {pending.length > 0 && (
        <>
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><Clock className="w-5 h-5 text-amber-400" />本地待批阅 ({pending.length})</h2>
          <div className="space-y-4 mb-8">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {pending.map((a: any) => (
              <Card key={a.id} className="bg-white/5 border-white/10 overflow-hidden">
                <div className="p-4">
                  <div className="mb-2">
                    <h3 className="font-semibold text-lg">{a.title}</h3>
                    <p className="text-sm text-gray-500">{a.student.full_name} · {a.student.school_name}</p>
                  </div>
                  <div className="grid grid-cols-5 gap-2 mb-3">
                    {[
                      { label: '构图', score: a.evaluations.score_composition },
                      { label: '色彩', score: a.evaluations.score_color },
                      { label: '造型', score: a.evaluations.score_modeling },
                      { label: '创意', score: a.evaluations.score_creativity },
                      { label: '完整性', score: a.evaluations.score_completeness },
                    ].map((d) => (
                      <div key={d.label} className={`text-center p-2 rounded-lg border ${DIM_COLORS[d.label] || 'border-white/10'} bg-white/5`}>
                        <p className="text-xs text-gray-500 mb-0.5">{d.label}</p>
                        <span className={`inline-block px-1.5 py-0.5 text-xs font-bold rounded ${d.score >= 3 ? 'bg-emerald-500/20 text-emerald-400' : d.score >= 2 ? 'bg-amber-500/20 text-amber-400' : 'bg-gray-500/20 text-gray-400'}`}>{scoreToLetter(d.score)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-lg font-bold text-purple-400">总分{a.evaluations.total_score}</span>
                    <span className="px-2 py-0.5 text-xs rounded-full bg-amber-500/20 text-amber-400">{a.evaluations.grade}</span>
                  </div>
                  <p className="text-sm text-gray-400 mb-3 line-clamp-2">{a.evaluations.ai_feedback}</p>
                  <div className="flex gap-2">
                    <Button size="sm" className="bg-emerald-600 hover:bg-emerald-500 gap-1" onClick={() => handleReview(a.id, 'approved')}><CheckCircle className="w-3 h-3" />通过</Button>
                    <Button size="sm" variant="outline" className="gap-1 border-white/20 text-gray-300" onClick={() => handleReview(a.id, 'rejected')}><XCircle className="w-3 h-3" />驳回</Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export function LocalStudentPanel() {
  const [artworks, setArtworks] = useState<unknown[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setArtworks(getStudentArtworks('32e87443-4b26-473d-87b3-775d5bf415ce'));
    setLoaded(true);
  }, []);

  if (!loaded || artworks.length === 0) return null;

  return (
    <div>
      <div className="mb-4 p-3 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-start gap-2">
        <AlertCircle className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-blue-400">以下数据来自浏览器本地存储（Demo 模式）。</p>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        {artworks.slice(0, 3).map((a: any) => (
          <Link key={a.id} href={`/evaluation/${a.id}`}>
            <Card className="overflow-hidden bg-white/5 border-white/10 hover:bg-white/10 hover:shadow-xl transition-all cursor-pointer h-full">
              <div className="aspect-[4/3] bg-gray-800 overflow-hidden">
                {a.image_url ? (
                  <img src={a.image_url as string} alt={a.title as string} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-600">
                    <BookOpen className="w-8 h-8" />
                  </div>
                )}
              </div>
              <CardContent className="p-3">
                <h3 className="font-medium text-sm mb-1 text-white">{a.title as string}</h3>
                <div className="flex items-center justify-between">
                  <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400">{a.evaluations?.grade || '良好'}</span>
                  <span className="text-xs text-gray-500">{a.evaluations?.total_score || '-'}分</span>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
