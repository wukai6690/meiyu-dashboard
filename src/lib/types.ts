export interface Profile {
  id: string;
  full_name: string;
  avatar_url?: string;
  role: 'student' | 'teacher' | 'admin';
  school_id?: string;
  class_id?: string;
  school_name?: string;
  class_name?: string;
  created_at: string;
  updated_at: string;
}

export interface Artwork {
  id: string;
  student_id: string;
  title: string;
  description?: string;
  image_url: string;
  reference_image_url?: string;
  course_id?: string;
  course_name?: string;
  created_at: string;
  updated_at: string;
  profiles?: Profile;
  evaluations?: Evaluation;
}

export interface DimEval {
  score: number;
  level: string;
  feedback: string;
}

export interface EvaluationDetail {
  composition: DimEval;
  color: DimEval;
  modeling: DimEval;
  creativity: DimEval;
  completeness: DimEval;
  total_score: number;
  grade: '杰出' | '优秀' | '良好' | '一般';
  overall_feedback: string;
}

export interface Evaluation {
  id: string;
  artwork_id: string;
  score_composition: number;
  score_color: number;
  score_modeling: number;
  score_creativity: number;
  score_completeness: number;
  total_score: number;
  grade: '杰出' | '优秀' | '良好' | '一般';
  ai_raw_json?: EvaluationDetail;
  ai_feedback?: string;
  comp_feedback?: string;
  color_feedback?: string;
  modeling_feedback?: string;
  creativity_feedback?: string;
  completeness_feedback?: string;
  is_teacher_overridden?: boolean;
  teacher_comment?: string;
  reviewed_by?: string;
  reviewed_at?: string;
  status: 'pending_review' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
}

export interface ClassStats {
  avg_scores: { dimension: string; score: number }[];
  grade_distribution: { grade: string; count: number }[];
  common_strengths: string[];
  common_weaknesses: string[];
  teaching_advice: string;
  total_count: number;
}

export interface StudentExp {
  id: string;
  student_id: string;
  exp_amount: number;
  source: string;
  artwork_id?: string;
  created_at: string;
}

export interface Badge {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  requirement_type: string;
  requirement_metric?: string;
  requirement_threshold: number;
  created_at: string;
}

export interface StudentBadge {
  id: string;
  student_id: string;
  badge_id: string;
  unlocked_at: string;
  badges?: Badge;
}

export interface Course {
  id: string;
  name: string;
  description?: string;
  reference_image_url?: string;
  teacher_id?: string;
  created_at: string;
}

export interface GrowthData {
  date: string;
  exp: number;
  score: number;
}

export interface RadarData {
  dimension: string;
  score: number;
}
