'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAdmin } from '@/hooks/useAdmin';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { Plus, Pencil, Trash2, Loader2, Eye } from 'lucide-react';

interface Skill {
  id: string;
  name: string;
  category: string;
  level: number;
  icon: string;
  visible: boolean;
  order: number;
}

const categories = ['Frontend', 'Backend', 'Full Stack', 'DevOps', 'Database', 'Mobile', 'General', 'Design', 'Other'];

const emptySkill: Omit<Skill, 'id'> = {
  name: '',
  category: 'General',
  level: 80,
  icon: '',
  visible: true,
  order: 0,
};

export default function AdminSkillsPage() {
  const { token } = useAdmin();
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null);
  const [form, setForm] = useState(emptySkill);

  const headers = useCallback(() => ({
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  }), [token]);

  const fetchSkills = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/skills', { headers: headers() });
      const data = await res.json();
      setSkills(Array.isArray(data) ? data : []);
    } catch {
      toast.error('Failed to fetch skills');
    } finally {
      setLoading(false);
    }
  }, [token, headers]);

  useEffect(() => {
    fetchSkills();
  }, [fetchSkills]);

  const openNew = () => {
    setEditingSkill(null);
    setForm(emptySkill);
    setDialogOpen(true);
  };

  const openEdit = (skill: Skill) => {
    setEditingSkill(skill);
    setForm({
      name: skill.name,
      category: skill.category,
      level: skill.level,
      icon: skill.icon,
      visible: skill.visible,
      order: skill.order,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast.error('Name is required');
      return;
    }

    setSaving(true);
    try {
      const url = '/api/skills';
      const method = editingSkill ? 'PUT' : 'POST';
      const body = editingSkill ? { id: editingSkill.id, ...form } : form;

      const res = await fetch(url, {
        method,
        headers: headers(),
        body: JSON.stringify(body),
      });

      if (res.ok) {
        toast.success(editingSkill ? 'Skill updated' : 'Skill created');
        setDialogOpen(false);
        fetchSkills();
      } else {
        const data = await res.json();
        toast.error(data.error || 'Failed to save skill');
      }
    } catch {
      toast.error('Something went wrong');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this skill?')) return;

    try {
      const res = await fetch('/api/skills', {
        method: 'DELETE',
        headers: headers(),
        body: JSON.stringify({ id }),
      });

      if (res.ok) {
        toast.success('Skill deleted');
        fetchSkills();
      } else {
        toast.error('Failed to delete skill');
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
          <h1 className="text-2xl font-bold text-white">Skills</h1>
          <p className="text-zinc-400 mt-1">Manage your skills and proficiencies</p>
        </div>
        <Button onClick={openNew} className="bg-white text-black hover:bg-zinc-200">
          <Plus className="size-4 mr-2" />
          Add Skill
        </Button>
      </div>

      {/* Skills table */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 backdrop-blur-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-zinc-800 hover:bg-transparent">
                <TableHead className="text-zinc-400">Name</TableHead>
                <TableHead className="text-zinc-400 hidden sm:table-cell">Category</TableHead>
                <TableHead className="text-zinc-400 hidden md:table-cell">Level</TableHead>
                <TableHead className="text-zinc-400">Visible</TableHead>
                <TableHead className="text-zinc-400 hidden lg:table-cell">Order</TableHead>
                <TableHead className="text-zinc-400 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {skills.length === 0 ? (
                <TableRow className="border-zinc-800">
                  <TableCell colSpan={6} className="text-center py-12 text-zinc-500">
                    No skills yet. Click &quot;Add Skill&quot; to create one.
                  </TableCell>
                </TableRow>
              ) : (
                skills.map((skill) => (
                  <TableRow key={skill.id} className="border-zinc-800">
                    <TableCell className="font-medium text-white">
                      {skill.icon && <span className="mr-2">{skill.icon}</span>}
                      {skill.name}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <Badge variant="secondary" className="bg-zinc-800 text-zinc-300 text-xs">
                        {skill.category}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="flex items-center gap-3 min-w-[140px]">
                        <div className="flex-1 h-2 rounded-full bg-zinc-800 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-zinc-600 to-white"
                            style={{ width: `${skill.level}%` }}
                          />
                        </div>
                        <span className="text-xs text-zinc-400 w-8 text-right">{skill.level}%</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={`text-xs ${skill.visible ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20'}`}
                      >
                        <Eye className="size-3 mr-1" />
                        {skill.visible ? 'Yes' : 'No'}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-zinc-400">{skill.order}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-zinc-400 hover:text-white"
                          onClick={() => openEdit(skill)}
                        >
                          <Pencil className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-zinc-400 hover:text-red-400"
                          onClick={() => handleDelete(skill.id)}
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
            <DialogTitle>{editingSkill ? 'Edit Skill' : 'Add New Skill'}</DialogTitle>
            <DialogDescription className="text-zinc-400">
              {editingSkill ? 'Update the skill details below.' : 'Fill in the details for the new skill.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label className="text-zinc-300">Name *</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="JavaScript"
                className="bg-black/50 border-zinc-700 text-white placeholder:text-zinc-500"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-zinc-300">Category</Label>
              <Select
                value={form.category}
                onValueChange={(value) => setForm({ ...form, category: value })}
              >
                <SelectTrigger className="w-full bg-black/50 border-zinc-700 text-white">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-800">
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat} className="text-zinc-300 focus:bg-zinc-800 focus:text-white">
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-zinc-300">Level: {form.level}%</Label>
              <Slider
                value={[form.level]}
                onValueChange={(value) => setForm({ ...form, level: value[0] })}
                min={0}
                max={100}
                step={5}
                className="py-2"
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
              ) : editingSkill ? (
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
