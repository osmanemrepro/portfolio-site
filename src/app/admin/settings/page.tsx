'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAdmin } from '@/hooks/useAdmin';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Loader2, Save, Layout, User, Wrench, FolderKanban, Briefcase, Mail } from 'lucide-react';

interface SiteSettings {
  heroVisible: boolean;
  aboutVisible: boolean;
  skillsVisible: boolean;
  projectsVisible: boolean;
  experienceVisible: boolean;
  contactVisible: boolean;
}

const defaultSettings: SiteSettings = {
  heroVisible: true,
  aboutVisible: true,
  skillsVisible: true,
  projectsVisible: true,
  experienceVisible: true,
  contactVisible: true,
};

const sectionConfig = [
  { key: 'heroVisible' as keyof SiteSettings, label: 'Hero Section', description: 'The main hero/banner section at the top', icon: Layout },
  { key: 'aboutVisible' as keyof SiteSettings, label: 'About Section', description: 'Personal information and bio section', icon: User },
  { key: 'skillsVisible' as keyof SiteSettings, label: 'Skills Section', description: 'Technical skills and proficiencies', icon: Wrench },
  { key: 'projectsVisible' as keyof SiteSettings, label: 'Projects Section', description: 'Portfolio projects showcase', icon: FolderKanban },
  { key: 'experienceVisible' as keyof SiteSettings, label: 'Experience Section', description: 'Work experience timeline', icon: Briefcase },
  { key: 'contactVisible' as keyof SiteSettings, label: 'Contact Section', description: 'Contact form and information', icon: Mail },
];

export default function AdminSettingsPage() {
  const { token } = useAdmin();
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings);
  const [originalSettings, setOriginalSettings] = useState<SiteSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const headers = useCallback(() => ({
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  }), [token]);

  const fetchSettings = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/settings', { headers: headers() });
      const data = await res.json();
      if (data && typeof data === 'object') {
        const fetched: SiteSettings = { ...defaultSettings };
        for (const key of Object.keys(defaultSettings) as (keyof SiteSettings)[]) {
          if (data[key] !== undefined) {
            fetched[key] = data[key] === true || data[key] === 'true';
          }
        }
        setSettings(fetched);
        setOriginalSettings(fetched);
      }
    } catch {
      toast.error('Failed to fetch settings');
    } finally {
      setLoading(false);
    }
  }, [token, headers]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleToggle = (key: keyof SiteSettings) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: headers(),
        body: JSON.stringify(settings),
      });

      if (res.ok) {
        toast.success('Settings saved successfully');
        setOriginalSettings(settings);
      } else {
        toast.error('Failed to save settings');
      }
    } catch {
      toast.error('Something went wrong');
    } finally {
      setSaving(false);
    }
  };

  const hasChanges = JSON.stringify(settings) !== JSON.stringify(originalSettings);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-zinc-800 rounded w-48 animate-pulse" />
        <div className="space-y-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 animate-pulse">
              <div className="h-4 bg-zinc-800 rounded w-48 mb-3" />
              <div className="h-3 bg-zinc-800 rounded w-72" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Settings</h1>
          <p className="text-zinc-400 mt-1">Control which sections are visible on your portfolio</p>
        </div>
        {hasChanges && (
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-white text-black hover:bg-zinc-200"
          >
            {saving ? (
              <>
                <Loader2 className="size-4 animate-spin mr-2" />
                Saving...
              </>
            ) : (
              <>
                <Save className="size-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        )}
      </div>

      {/* Unsaved changes indicator */}
      {hasChanges && (
        <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 px-4 py-3">
          <p className="text-sm text-amber-400">
            You have unsaved changes. Click &quot;Save Changes&quot; to apply them.
          </p>
        </div>
      )}

      {/* Settings cards */}
      <div className="space-y-3">
        {sectionConfig.map((section) => (
          <div
            key={section.key}
            className="rounded-xl border border-zinc-800 bg-zinc-900/50 backdrop-blur-sm p-6 hover:border-zinc-700 transition-colors"
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="size-10 rounded-lg bg-zinc-800 flex items-center justify-center shrink-0 mt-0.5">
                  <section.icon className="size-5 text-zinc-400" />
                </div>
                <div>
                  <p className="text-white font-medium">{section.label}</p>
                  <p className="text-sm text-zinc-500 mt-0.5">{section.description}</p>
                </div>
              </div>
              <Switch
                checked={settings[section.key]}
                onCheckedChange={() => handleToggle(section.key)}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
