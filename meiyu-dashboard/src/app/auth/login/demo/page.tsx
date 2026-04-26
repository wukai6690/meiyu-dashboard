import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function DemoPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-gradient-to-br from-purple-50 to-indigo-50">
      <div className="text-center max-w-md">
        <h1 className="text-2xl font-bold mb-4">演示模式</h1>
        <p className="text-gray-600 mb-8">无需注册即可预览完整功能</p>
        <div className="space-y-3">
          <Link href="/student">
            <Button className="w-full" size="lg">进入学生演示版</Button>
          </Link>
          <Link href="/teacher">
            <Button variant="outline" className="w-full" size="lg">进入教师演示版</Button>
          </Link>
        </div>
        <Link href="/" className="inline-flex items-center gap-2 mt-8 text-gray-500 hover:text-purple-600 text-sm">
          <ArrowLeft className="w-4 h-4" /> 返回首页
        </Link>
      </div>
    </div>
  );
}
