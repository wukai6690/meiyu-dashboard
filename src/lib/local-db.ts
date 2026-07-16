/**
 * 浏览器本地存储数据库 — Supabase 不可用时的回退方案
 * 用于比赛 Demo 场景，确保评画→审核→查看全链路可演示
 */

const STORAGE_KEY = 'meiyu_local_db';

interface LocalDB {
  artworks: Record<string, unknown>[];
  evaluations: Record<string, unknown>[];
  lastUpdated: string;
}

function read(): LocalDB {
  if (typeof window === 'undefined') {
    return { artworks: [], evaluations: [], lastUpdated: '' };
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { artworks: [], evaluations: [], lastUpdated: '' };
    return JSON.parse(raw);
  } catch {
    return { artworks: [], evaluations: [], lastUpdated: '' };
  }
}

function write(db: LocalDB) {
  if (typeof window === 'undefined') return;
  db.lastUpdated = new Date().toISOString();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
}

export function saveArtwork(artwork: Record<string, unknown>) {
  const db = read();
  const idx = db.artworks.findIndex((a) => a.id === artwork.id);
  if (idx >= 0) {
    db.artworks[idx] = { ...db.artworks[idx], ...artwork };
  } else {
    db.artworks.unshift(artwork);
  }
  write(db);
}

export function saveEvaluation(evaluation: Record<string, unknown>) {
  const db = read();
  const idx = db.evaluations.findIndex((e) => e.artwork_id === evaluation.artwork_id);
  if (idx >= 0) {
    db.evaluations[idx] = { ...db.evaluations[idx], ...evaluation };
  } else {
    db.evaluations.unshift(evaluation);
  }
  write(db);
}

export function getAllArtworks(): Record<string, unknown>[] {
  return read().artworks || [];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getStudentArtworks(studentId: string): any[] {
  const db = read();
  const arts = db.artworks.filter((a) => a.student_id === studentId);
  // Attach evaluations
  return arts.map((a) => {
    const ev = db.evaluations.find((e) => e.artwork_id === a.id);
    return { ...a, evaluations: ev || null };
  });
}

export function getPendingReviews(): Record<string, unknown>[] {
  const db = read();
  return db.evaluations.filter((e) => e.status === 'pending_review' || !e.status);
}

export function getApprovedReviews(): Record<string, unknown>[] {
  const db = read();
  return db.evaluations.filter((e) => e.status === 'approved');
}

export function updateEvaluationStatus(artworkId: string, status: string) {
  const db = read();
  const idx = db.evaluations.findIndex((e) => e.artwork_id === artworkId);
  if (idx >= 0) {
    db.evaluations[idx].status = status;
    write(db);
    return true;
  }
  return false;
}

export function getStats() {
  const db = read();
  const evaled = db.evaluations;
  if (!evaled.length) return null;

  const dims = ['score_composition', 'score_color', 'score_modeling', 'score_creativity', 'score_completeness'];
  const labels = ['构图', '色彩', '造型', '创意', '完整性'];

  const avgScores = labels.map((label, i) => {
    const vals = evaled.map((e) => Number(e[dims[i]]) || 2);
    return { dimension: label, score: Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 10) / 10 };
  });

  const gradeCounts: Record<string, number> = {};
  evaled.forEach((e) => {
    const g = (e.grade as string) || '良好';
    gradeCounts[g] = (gradeCounts[g] || 0) + 1;
  });
  const gradeDist = Object.entries(gradeCounts).map(([grade, count]) => ({ grade, count }));

  const topDims = [...labels].sort((a, b) => {
    const sa = evaled.reduce((s, e) => s + (Number(e[dims[labels.indexOf(a)]]) || 2), 0) / evaled.length;
    const sb = evaled.reduce((s, e) => s + (Number(e[dims[labels.indexOf(b)]]) || 2), 0) / evaled.length;
    return sb - sa;
  });

  return {
    avg_scores: avgScores,
    grade_distribution: gradeDist,
    common_strengths: topDims.slice(0, 2),
    common_weaknesses: topDims.slice(-2).reverse(),
    teaching_advice: `${topDims[0]}、${topDims[1]}表现较好。${topDims[topDims.length - 1]}维度整体偏弱，建议增加针对性训练。`,
    total_count: evaled.length,
  };
}
