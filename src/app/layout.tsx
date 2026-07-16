import type { Metadata } from 'next';
import './globals.css';
import { ToastProvider } from '@/components/ui/toast';

export const metadata: Metadata = {
  title: '美育观止 - AI美育评价系统',
  description: 'AI驱动的K12美育数字化评价平台，五维度量化分析学生美术作品',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body className="antialiased">
        <ToastProvider>
          <div className="page-enter">{children}</div>
        </ToastProvider>
      </body>
    </html>
  );
}
