'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAdmin } from '@/hooks/useAdmin';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Loader2, Eye, ExternalLink } from 'lucide-react';

interface SocialLink {
  id: string;
  platform: string;
  url: string;
  icon: string;
  visible: boolean;
  order: number;
}

const emptySocialLink: Omit<SocialLink, 'id'> = {
  platform: '',
  url: '',
  icon: '',
  visible: true,
  order: 0,
};

export default function AdminSocialPage() {
  const { token } = useAdmin();
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<SocialLink | null>(null);
  const [form, setForm] = useState(emptySocialLink);

  const headers = useCallback(() => ({
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  }), [token]);

  const fetchSocialLinks = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/social-links', { headers: headers() });
      const data = await res.json();
      setSocialLinks(Array.isArray(data) ? data : []);
    } catch {
      toast.error('Failed to fetch social links');
    } finally {
      setLoading(false);
    }
  }, [token, headers]);

  useEffect(() => {
    fetchSocialLinks();
  }, [fetchSocialLinks]);

  const openNew = () => {
    setEditingLink(null);
    setForm(emptySocialLink);
    setDialogOpen(true);
  };

  const openEdit = (link: SocialLink) => {
    setEditingLink(link);
    setForm({
      platform: link.platform,
      url: link.url,
      icon: link.icon,
      visible: link.visible,
      order: link.order,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.platform.trim() || !form.url.trim()) {
      toast.error('Platform and URL are required');
      return;
    }

    setSaving(true);
    try {
      const url = '/api/social-links';
      const method = editingLink ? 'PUT' : 'POST';
      const body = editingLink ? { id: editingLink.id, ...form } : form;

      const res = await fetch(url, {
        method,
        headers: headers(),
        body: JSON.stringify(body),
      });

      if (res.ok) {
        toast.success(editingLink ? 'Social link updated' : 'Social link created');
        setDialogOpen(false);
        fetchSocialLinks();
      } else {
        const data = await res.json();
        toast.error(data.error || 'Failed to save social link');
      }
    } catch {
      toast.error('Something went wrong');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this social link?')) return;

    try {
      const res = await fetch('/api/social-links', {
        method: 'DELETE',
        headers: headers(),
        body: JSON.stringify({ id }),
      });

      if (res.ok) {
        toast.success('Social link deleted');
        fetchSocialLinks();
      } else {
        toast.error('Failed to delete social link');
      }
    } catch {
      toast.error('Something went wrong');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-zinc-800 rounded w-48 animate-pulse" />
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 animate-pulse">
          <div className="h-4 bg-zinc-800 rounded w-full mb-3" />
          <div className="h-4 bg-zinc-800 rounded w-3/4" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Social Links</h1>
          <p className="text-zinc-400 mt-1">Manage your social media links</p>
        </div>
        <Button onClick={openNew} className="bg-white text-black hover:bg-zinc-200">
          <Plus className="size-4 mr-2" />
          Add Link
        </Button>
      </div>

      {/* Social links table */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 backdrop-blur-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-zinc-800 hover:bg-transparent">
                <TableHead className="text-zinc-400">Platform</TableHead>
                <TableHead className="text-zinc-400 hidden md:table-cell">URL</TableHead>
                <TableHead className="text-zinc-400 hidden sm:table-cell">Icon</TableHead>
                <TableHead className="text-zinc-400">Visible</TableHead>
                <TableHead className="text-zinc-400 hidden lg:table-cell">Order</TableHead>
                <TableHead className="text-zinc-400 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {socialLinks.length === 0 ? (
                <TableRow className="border-zinc-800">
                  <TableCell colSpan={6} className="text-center py-12 text-zinc-500">
                    No social links yet. Click &quot;Add Link&quot; to create one.
                  </TableCell>
                </TableRow>
              ) : (
                socialLinks.map((link) => (
                  <TableRow key={link.id} className="border-zinc-800">
                    <TableCell className="font-medium text-white">{link.platform}</TableCell>
                    <TableCell className="hidden md:table-cell">
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-zinc-400 hover:text-white flex items-center gap-1 text-xs max-w-[200px] truncate"
                      >
                        {link.url}
                        <ExternalLink className="size-3 shrink-0" />
                      </a>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-zinc-400">
                      {link.icon || '—'}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={`text-xs ${link.visible ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20'}`}
                      >
                        <Eye className="size-3 mr-1" />
                        {link.visible ? 'Yes' : 'No'}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-zinc-400">{link.order}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-zinc-400 hover:text-white"
                          onClick={() => openEdit(link)}
                        >
                          <Pencil className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-zinc-400 hover:text-red-400"
                          onClick={() => handleDelete(link.id)}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-white sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingLink ? 'Edit Social Link' : 'Add New Social Link'}</DialogTitle>
            <DialogDescription className="text-zinc-400">
              {editingLink ? 'Update the social link details below.' : 'Fill in the details for the new social link.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label className="text-zinc-300">Platform *</Label>
              <Input
                value={form.platform}
                onChange={(e) => setForm({ ...form, platform: e.target.value })}
                placeholder="GitHub, LinkedIn, Twitter..."
                className="bg-black/50 border-zinc-700 text-white placeholder:text-zinc-500"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-zinc-300">URL *</Label>
              <Input
                value={form.url}
                onChange={(e) => setForm({ ...form, url: e.target.value })}
                placeholder="https://github.com/username"
                className="bg-black/50 border-zinc-700 text-white placeholder:text-zinc-500"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-zinc-300">Icon</Label>
              <Input
                value={form.icon}
                onChange={(e) => setForm({ ...form, icon: e.target.value })}
                placeholder="emoji or icon class"
                className="bg-black/50 border-zinc-700 text-white placeholder:text-zinc-500"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-zinc-300">Order</Label>
              <Input
                type="number"
                value={form.order}
                onChange={(e) => setForm({ ...form, order: parseInt(e.target.value) || 0 })}
                className="bg-black/50 border-zinc-700 text-white placeholder:text-zinc-500"
              />
            </div>

            <div className="flex items-center justify-between rounded-lg border border-zinc-800 p-4">
              <div>
                <p className="text-sm text-white font-medium">Visible</p>
                <p className="text-xs text-zinc-500">Show on public portfolio</p>
              </div>
              <Switch
                checked={form.visible}
                onCheckedChange={(checked) => setForm({ ...form, visible: checked })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setDialogOpen(false)}
              className="text-zinc-400 hover:text-white"
            >
              Cancel
            </Button>
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
              ) : editingLink ? (
                'Update'
              ) : (
                'Create'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
