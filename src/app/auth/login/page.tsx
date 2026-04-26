'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToastStore } from '@/lib/store';
import { Sparkles, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<'student' | 'teacher'>('student');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();
  const { addToast } = useToastStore();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      addToast({ title: '登录失败', description: error.message, variant: 'destructive' });
    } else {
      const { data: { user } } = await supabase.auth.getUser();
      const { data: profile } = await supabase.from('profiles').select('role').eq('id', user!.id).single();
      router.push(profile?.role === 'teacher' ? '/teacher' : '/student');
      router.refresh();
    }
    setLoading(false);
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, role },
      },
    });
    if (error) {
      addToast({ title: '注册失败', description: error.message, variant: 'destructive' });
    } else {
      addToast({ title: '注册成功', description: '请查收验证邮件，点击邮件中的链接完成激活。' });
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <span className="font-bold text-xl">美育观止</span>
          </div>
          <p className="text-gray-500">AI 驱动的 K12 美育数字化评价平台</p>
        </div>

        {/* Auth Form */}
        <div className="bg-white rounded-2xl shadow-xl border p-8">
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="w-full grid grid-cols-2 mb-6">
              <TabsTrigger value="login">登录</TabsTrigger>
              <TabsTrigger value="register">注册</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <Label htmlFor="login-email">邮箱</Label>
                  <Input id="login-email" type="email" placeholder="your@email.com" value={email} onChange={e => setEmail(e.target.value)} required />
                </div>
                <div>
                  <Label htmlFor="login-password">密码</Label>
                  <Input id="login-password" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : '登录'}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="register">
              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <Label htmlFor="reg-name">姓名</Label>
                  <Input id="reg-name" placeholder="请输入真实姓名" value={fullName} onChange={e => setFullName(e.target.value)} required />
                </div>
                <div>
                  <Label htmlFor="reg-email">邮箱</Label>
                  <Input id="reg-email" type="email" placeholder="your@email.com" value={email} onChange={e => setEmail(e.target.value)} required />
                </div>
                <div>
                  <Label htmlFor="reg-password">密码</Label>
                  <Input id="reg-password" type="password" placeholder="至少6位" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} />
                </div>
                <div>
                  <Label>身份</Label>
                  <div className="flex gap-3 mt-2">
                    {(['student', 'teacher'] as const).map(r => (
                      <button key={r} type="button" onClick={() => setRole(r)}
                        className={`flex-1 py-2 px-4 rounded-lg border text-sm font-medium transition-all ${role === r ? 'border-purple-600 bg-purple-50 text-purple-700' : 'border-gray-200 text-gray-600 hover:border-purple-300'}`}>
                        {r === 'student' ? '学生' : '教师'}
                      </button>
                    ))}
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : '注册'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </div>

        <div className="text-center mt-6">
          <Link href="/" className="text-sm text-gray-500 hover:text-purple-600">
            ← 返回首页
          </Link>
        </div>
      </div>
    </div>
  );
}
