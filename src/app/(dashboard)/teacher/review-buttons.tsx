'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

interface Props {
  artworkId: string;
}

export function TeacherReviewButtons({ artworkId }: Props) {
  const [loading, setLoading] = useState<'approve' | 'reject' | null>(null);
  const router = useRouter();

  const handleReview = async (status: 'approved' | 'rejected') => {
    setLoading(status === 'approved' ? 'approve' : 'reject');
    try {
      const resp = await fetch('/api/teacher/review', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ artwork_id: artworkId, status }),
      });
      if (resp.ok) {
        router.refresh();
      }
    } catch {
      // silently fail, user can retry
    } finally {
      setLoading(null);
    }
  };

  return (
    <>
      <Button
        size="sm"
        className="bg-emerald-600 hover:bg-emerald-500 gap-1"
        onClick={() => handleReview('approved')}
        disabled={loading !== null}
      >
        {loading === 'approve' ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle className="w-3 h-3" />}
        通过
      </Button>
      <Button
        size="sm"
        variant="outline"
        className="gap-1 border-white/20 text-gray-300"
        onClick={() => handleReview('rejected')}
        disabled={loading !== null}
      >
        {loading === 'reject' ? <Loader2 className="w-3 h-3 animate-spin" /> : <XCircle className="w-3 h-3" />}
        驳回
      </Button>
    </>
  );
}
