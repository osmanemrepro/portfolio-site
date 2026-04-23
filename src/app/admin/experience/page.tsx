'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAdmin } from '@/hooks/useAdmin';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
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
import { Plus, Pencil, Trash2, Loader2, Eye, Calendar } from 'lucide-react';

interface Experience {
  id: string;
  title: string;
  company: string;
  description: string;
  startDate: string;
  endDate: string;
  current: boolean;
  visible: boolean;
  order: number;
}

const emptyExperience: Omit<Experience, 'id'> = {
  title: '',
  company: '',
  description: '',
  startDate: '',
  endDate: '',
  current: false,
  visible: true,
  order: 0,
};

export default function AdminExperiencePage() {
  const { token } = useAdmin();
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingExperience, setEditingExperience] = useState<Experience | null>(null);
  const [form, setForm] = useState(emptyExperience);

  const headers = useCallback(() => ({
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  }), [token]);

  const fetchExperiences = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/experiences', { headers: headers() });
      const data = await res.json();
      setExperiences(Array.isArray(data) ? data : []);
    } catch {
      toast.error('Failed to fetch experiences');
    } finally {
      setLoading(false);
    }
  }, [token, headers]);

  useEffect(() => {
    fetchExperiences();
  }, [fetchExperiences]);

  const openNew = () => {
    setEditingExperience(null);
    setForm(emptyExperience);
    setDialogOpen(true);
  };

  const openEdit = (exp: Experience) => {
    setEditingExperience(exp);
    setForm({
      title: exp.title,
      company: exp.company,
      description: exp.description,
      startDate: exp.startDate,
      endDate: exp.endDate,
      current: exp.current,
      visible: exp.visible,
      order: exp.order,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.company.trim()) {
      toast.error('Title and company are required');
      return;
    }

    setSaving(true);
    try {
      const url = '/api/experiences';
      const method = editingExperience ? 'PUT' : 'POST';
      const body = editingExperience ? { id: editingExperience.id, ...form } : form;

      const res = await fetch(url, {
        method,
        headers: headers(),
        body: JSON.stringify(body),
      });

      if (res.ok) {
        toast.success(editingExperience ? 'Experience updated' : 'Experience created');
        setDialogOpen(false);
        fetchExperiences();
      } else {
        const data = await res.json();
        toast.error(data.error || 'Failed to save experience');
      }
    } catch {
      toast.error('Something went wrong');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this experience?')) return;

    try {
      const res = await fetch('/api/experiences', {
        method: 'DELETE',
        headers: headers(),
        body: JSON.stringify({ id }),
      });

      if (res.ok) {
        toast.success('Experience deleted');
        fetchExperiences();
      } else {
        toast.error('Failed to delete experience');
      }
    } catch {
      toast.error('Something went wrong');
    }
  };

  const formatDate = (date: string) => {
    if (!date) return 'N/A';
    try {
      return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
      });
    } catch {
      return date;
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
          <h1 className="text-2xl font-bold text-white">Experience</h1>
          <p className="text-zinc-400 mt-1">Manage your work experience</p>
        </div>
        <Button onClick={openNew} className="bg-white text-black hover:bg-zinc-200">
          <Plus className="size-4 mr-2" />
          Add Experience
        </Button>
      </div>

      {/* Experience table */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 backdrop-blur-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-zinc-800 hover:bg-transparent">
                <TableHead className="text-zinc-400">Title</TableHead>
                <TableHead className="text-zinc-400 hidden sm:table-cell">Company</TableHead>
                <TableHead className="text-zinc-400 hidden md:table-cell">Dates</TableHead>
                <TableHead className="text-zinc-400">Status</TableHead>
                <TableHead className="text-zinc-400 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {experiences.length === 0 ? (
                <TableRow className="border-zinc-800">
                  <TableCell colSpan={5} className="text-center py-12 text-zinc-500">
                    No experiences yet. Click &quot;Add Experience&quot; to create one.
                  </TableCell>
                </TableRow>
              ) : (
                experiences.map((exp) => (
                  <TableRow key={exp.id} className="border-zinc-800">
                    <TableCell className="font-medium text-white">{exp.title}</TableCell>
                    <TableCell className="text-zinc-400 hidden sm:table-cell">{exp.company}</TableCell>
                    <TableCell className="hidden md:table-cell text-zinc-400">
                      <div className="flex items-center gap-1.5 text-xs">
                        <Calendar className="size-3" />
                        {formatDate(exp.startDate)} — {exp.current ? 'Present' : formatDate(exp.endDate)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1.5">
                        {exp.current && (
                          <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-xs">
                            Current
                          </Badge>
                        )}
                        <Badge
                          variant="secondary"
                          className={`text-xs ${exp.visible ? 'bg-zinc-500/10 text-zinc-300 border-zinc-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}
                        >
                          <Eye className="size-3 mr-1" />
                          {exp.visible ? 'Visible' : 'Hidden'}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-zinc-400 hover:text-white"
                          onClick={() => openEdit(exp)}
                        >
                          <Pencil className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-zinc-400 hover:text-red-400"
                          onClick={() => handleDelete(exp.id)}
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
        <DialogContent className="bg-zinc-900 border-zinc-800 text-white sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingExperience ? 'Edit Experience' : 'Add New Experience'}</DialogTitle>
            <DialogDescription className="text-zinc-400">
              {editingExperience ? 'Update the experience details below.' : 'Fill in the details for the new experience.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label className="text-zinc-300">Title *</Label>
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Senior Developer"
                className="bg-black/50 border-zinc-700 text-white placeholder:text-zinc-500"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-zinc-300">Company *</Label>
              <Input
                value={form.company}
                onChange={(e) => setForm({ ...form, company: e.target.value })}
                placeholder="Acme Corp"
                className="bg-black/50 border-zinc-700 text-white placeholder:text-zinc-500"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-zinc-300">Description</Label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Describe your role and responsibilities"
                rows={4}
                className="bg-black/50 border-zinc-700 text-white placeholder:text-zinc-500 resize-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-zinc-300">Start Date</Label>
                <Input
                  type="month"
                  value={form.startDate}
                  onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                  className="bg-black/50 border-zinc-700 text-white placeholder:text-zinc-500"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-zinc-300">End Date</Label>
                <Input
                  type="month"
                  value={form.endDate}
                  onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                  disabled={form.current}
                  className="bg-black/50 border-zinc-700 text-white placeholder:text-zinc-500 disabled:opacity-50"
                />
              </div>
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
                <p className="text-sm text-white font-medium">Current Position</p>
                <p className="text-xs text-zinc-500">I currently work here</p>
              </div>
              <Switch
                checked={form.current}
                onCheckedChange={(checked) => {
                  setForm({
                    ...form,
                    current: checked,
                    ...(checked ? { endDate: '' } : {}),
                  });
                }}
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
              ) : editingExperience ? (
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
