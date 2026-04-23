'use client';

import { useState, useEffect, type ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAdmin } from '@/hooks/useAdmin';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {
  LayoutDashboard,
  FolderKanban,
  Wrench,
  Briefcase,
  Link as LinkIcon,
  Settings,
  Mail,
  ArrowLeft,
  LogOut,
  Menu,
  X,
  ShieldCheck,
  Activity,
  CloudUpload,
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

const navItems = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { label: 'Projects', href: '/admin/projects', icon: FolderKanban },
  { label: 'Skills', href: '/admin/skills', icon: Wrench },
  { label: 'Experience', href: '/admin/experience', icon: Briefcase },
  { label: 'Social Links', href: '/admin/social', icon: LinkIcon },
  { label: 'Activity', href: '/admin/activity', icon: Activity },
  { label: 'Files', href: '/admin/files', icon: CloudUpload },
  { label: 'Settings', href: '/admin/settings', icon: Settings },
  { label: 'Messages', href: '/admin/messages', icon: Mail },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isAdminLogin = pathname === '/admin/login';
  const { admin, loading, token } = useAdmin();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    toast.success('Logged out successfully');
    router.push('/admin/login');
  };

  // Login page renders its own full-screen layout, bypass sidebar & auth guard
  if (isAdminLogin) {
    return <>{children}</>;
  }

  // Other admin pages: show loading while checking auth
  if (!mounted || loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin size-8 border-2 border-zinc-600 border-t-white rounded-full" />
      </div>
    );
  }

  // Not authenticated → redirect to login (useAdmin already handles this)
  if (!admin) return null;

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 left-0 z-50 h-full w-64 bg-zinc-900/80 backdrop-blur-xl border-r border-zinc-800 transition-transform duration-300 lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo / Header */}
          <div className="p-6 border-b border-zinc-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="size-8 rounded-lg bg-white/10 flex items-center justify-center">
                  <ShieldCheck className="size-5 text-white" />
                </div>
                <div>
                  <h2 className="font-semibold text-sm">Admin Panel</h2>
                  <p className="text-xs text-zinc-500">{admin.email}</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden text-zinc-400 hover:text-white"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="size-5" />
              </Button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200',
                    isActive
                      ? 'bg-white/10 text-white font-medium'
                      : 'text-zinc-400 hover:text-white hover:bg-white/5'
                  )}
                >
                  <item.icon className="size-4 shrink-0" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Bottom actions */}
          <div className="p-4 border-t border-zinc-800 space-y-1">
            <Link
              href="/"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-zinc-400 hover:text-white hover:bg-white/5 transition-all duration-200"
            >
              <ArrowLeft className="size-4 shrink-0" />
              Back to Portfolio
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-zinc-400 hover:text-red-400 hover:bg-red-400/5 transition-all duration-200 w-full cursor-pointer"
            >
              <LogOut className="size-4 shrink-0" />
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-64 min-h-screen">
        {/* Top bar for mobile */}
        <header className="sticky top-0 z-30 bg-black/80 backdrop-blur-xl border-b border-zinc-800 px-4 py-3 lg:px-8 lg:py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden text-zinc-400 hover:text-white"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="size-5" />
            </Button>
            <div className="hidden lg:block" />
            <div className="flex items-center gap-3">
              <span className="text-sm text-zinc-400 hidden sm:inline">
                {admin.name || 'Admin'}
              </span>
              <div className="size-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center">
                <span className="text-xs font-medium text-zinc-300">
                  {(admin.name || 'A').charAt(0).toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
