import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getGrade(totalScore: number): '杰出' | '优秀' | '良好' | '一般' {
  if (totalScore >= 14) return '杰出';
  if (totalScore >= 12) return '优秀';
  if (totalScore >= 10) return '良好';
  return '一般';
}

export function scoreToLetter(score: number): string {
  if (score >= 3) return 'A';
  if (score >= 2) return 'B';
  return 'C';
}

export function getLevelInfo(totalExp: number): { level: number; currentExp: number; nextExp: number } {
  const baseExp = 100;
  let level = 1;
  let remaining = totalExp;
  
  while (remaining >= baseExp * level) {
    remaining -= baseExp * level;
    level++;
  }
  
  return {
    level,
    currentExp: remaining,
    nextExp: baseExp * level,
  };
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' });
}
