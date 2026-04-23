'use client';

import { useState, useEffect } from 'react';
import { useAdmin } from '@/hooks/useAdmin';
import { FolderKanban, Wrench, Briefcase, Mail, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface DashboardStats {
  projects: number;
  skills: number;
  experiences: number;
  unreadMessages: number;
}

export default function AdminDashboardPage() {
  const { token } = useAdmin();
  const [stats, setStats] = useState<DashboardStats>({
    projects: 0,
    skills: 0,
    experiences: 0,
    unreadMessages: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;

    const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

    Promise.all([
      fetch('/api/projects', { headers }).then((r) => r.json()).catch(() => []),
      fetch('/api/skills', { headers }).then((r) => r.json()).catch(() => []),
      fetch('/api/experiences', { headers }).then((r) => r.json()).catch(() => []),
      fetch('/api/contact', { headers }).then((r) => r.json()).catch(() => []),
    ])
      .then(([projects, skills, experiences, messages]) => {
        setStats({
          projects: Array.isArray(projects) ? projects.length : 0,
          skills: Array.isArray(skills) ? skills.length : 0,
          experiences: Array.isArray(experiences) ? experiences.length : 0,
          unreadMessages: Array.isArray(messages) ? messages.filter((m: any) => !m.read).length : 0,
        });
      })
      .finally(() => setLoading(false));
  }, [token]);

  const statCards = [
    {
      label: 'Total Projects',
      value: stats.projects,
      icon: FolderKanban,
      href: '/admin/projects',
      color: 'from-blue-500/20 to-blue-600/5',
      iconColor: 'text-blue-400',
    },
    {
      label: 'Total Skills',
      value: stats.skills,
      icon: Wrench,
      href: '/admin/skills',
      color: 'from-emerald-500/20 to-emerald-600/5',
      iconColor: 'text-emerald-400',
    },
    {
      label: 'Total Experience',
      value: stats.experiences,
      icon: Briefcase,
      href: '/admin/experience',
      color: 'from-amber-500/20 to-amber-600/5',
      iconColor: 'text-amber-400',
    },
    {
      label: 'Unread Messages',
      value: stats.unreadMessages,
      icon: Mail,
      href: '/admin/messages',
      color: 'from-rose-500/20 to-rose-600/5',
      iconColor: 'text-rose-400',
    },
  ];

  const quickActions = [
    { label: 'Add Project', href: '/admin/projects' },
    { label: 'Add Skill', href: '/admin/skills' },
    { label: 'Add Experience', href: '/admin/experience' },
    { label: 'View Messages', href: '/admin/messages' },
    { label: 'Edit Settings', href: '/admin/settings' },
    { label: 'Manage Social Links', href: '/admin/social' },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 animate-pulse">
              <div className="h-4 bg-zinc-800 rounded w-24 mb-3" />
              <div className="h-8 bg-zinc-800 rounded w-12" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-zinc-400 mt-1">Overview of your portfolio data</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className="group rounded-xl border border-zinc-800 bg-zinc-900/50 backdrop-blur-sm p-6 hover:border-zinc-700 transition-all duration-300"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`size-10 rounded-lg bg-gradient-to-br ${card.color} flex items-center justify-center`}>
                <card.icon className={`size-5 ${card.iconColor}`} />
              </div>
              <ArrowRight className="size-4 text-zinc-600 group-hover:text-zinc-400 group-hover:translate-x-0.5 transition-all" />
            </div>
            <div className="text-3xl font-bold text-white mb-1">{card.value}</div>
            <div className="text-sm text-zinc-400">{card.label}</div>
          </Link>
        ))}
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {quickActions.map((action) => (
            <Link
              key={action.label}
              href={action.href}
              className="rounded-lg border border-zinc-800 bg-zinc-900/30 px-4 py-3 text-sm text-zinc-300 hover:text-white hover:bg-zinc-900/60 hover:border-zinc-700 transition-all duration-200"
            >
              {action.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
