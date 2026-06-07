export default function StudentLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">美</span>
            </div>
            <span className="font-bold text-lg">美育观止</span>
            <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-full font-medium">学生端</span>
          </div>
          <div className="flex items-center gap-4">
            <nav className="hidden md:flex items-center gap-6 text-sm text-gray-600">
              <a href="/student" className="text-purple-600 font-medium">首页</a>
              <a href="/student" className="hover:text-purple-600">作品</a>
              <a href="/student" className="hover:text-purple-600">成长</a>
            </nav>
            <form action="/auth/signout" method="post">
              <button className="text-sm text-gray-500 hover:text-red-500">退出</button>
            </form>
          </div>
        </div>
      </header>
      {children}
    </div>
  );
}
