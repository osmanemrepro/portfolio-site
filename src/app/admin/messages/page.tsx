'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAdmin } from '@/hooks/useAdmin';
import { Button } from '@/components/ui/button';
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
import { Trash2, Eye, EyeOff, Loader2, Mail, Clock, User } from 'lucide-react';

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export default function AdminMessagesPage() {
  const { token } = useAdmin();
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const headers = useCallback(() => ({
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  }), [token]);

  const fetchMessages = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/contact', { headers: headers() });
      const data = await res.json();
      setMessages(Array.isArray(data) ? data : []);
    } catch {
      toast.error('Failed to fetch messages');
    } finally {
      setLoading(false);
    }
  }, [token, headers]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  const unreadCount = messages.filter((m) => !m.read).length;

  const openMessage = (msg: ContactMessage) => {
    setSelectedMessage(msg);
    setDialogOpen(true);
  };

  const handleMarkAsRead = async (msg: ContactMessage) => {
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify({ action: 'mark_read', id: msg.id }),
      });

      if (res.ok) {
        toast.success('Message marked as read');
        fetchMessages();
      } else {
        toast.error('Failed to mark as read');
      }
    } catch {
      toast.error('Something went wrong');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this message?')) return;

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify({ action: 'delete', id }),
      });

      if (res.ok) {
        toast.success('Message deleted');
        fetchMessages();
      } else {
        toast.error('Failed to delete message');
      }
    } catch {
      toast.error('Something went wrong');
    }
  };

  const formatDate = (date: string) => {
    try {
      return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
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
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Messages</h1>
            <p className="text-zinc-400 mt-1">Messages from your contact form</p>
          </div>
          {unreadCount > 0 && (
            <Badge className="bg-rose-500/10 text-rose-400 border-rose-500/20 hover:bg-rose-500/20">
              {unreadCount} unread
            </Badge>
          )}
        </div>
      </div>

      {/* Messages table */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 backdrop-blur-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-zinc-800 hover:bg-transparent">
                <TableHead className="text-zinc-400">Name</TableHead>
                <TableHead className="text-zinc-400 hidden sm:table-cell">Email</TableHead>
                <TableHead className="text-zinc-400 hidden md:table-cell">Message</TableHead>
                <TableHead className="text-zinc-400 hidden lg:table-cell">Date</TableHead>
                <TableHead className="text-zinc-400">Status</TableHead>
                <TableHead className="text-zinc-400 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {messages.length === 0 ? (
                <TableRow className="border-zinc-800">
                  <TableCell colSpan={6} className="text-center py-12 text-zinc-500">
                    No messages yet. They will appear here when visitors use your contact form.
                  </TableCell>
                </TableRow>
              ) : (
                messages.map((msg) => (
                  <TableRow
                    key={msg.id}
                    className={`border-zinc-800 cursor-pointer ${!msg.read ? 'bg-white/[0.02]' : ''}`}
                    onClick={() => openMessage(msg)}
                  >
                    <TableCell className="font-medium text-white">
                      <div className="flex items-center gap-2">
                        {!msg.read && <div className="size-2 rounded-full bg-blue-400 shrink-0" />}
                        <span className={!msg.read ? 'font-semibold' : ''}>{msg.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-zinc-400 hidden sm:table-cell">{msg.email}</TableCell>
                    <TableCell className="text-zinc-400 hidden md:table-cell max-w-xs truncate">
                      {msg.message}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-zinc-500 text-xs">
                      <div className="flex items-center gap-1.5">
                        <Clock className="size-3" />
                        {formatDate(msg.createdAt)}
                      </div>
                    </TableCell>
                    <TableCell>
                      {msg.read ? (
                        <Badge variant="secondary" className="bg-zinc-800 text-zinc-400 text-xs">
                          <Eye className="size-3 mr-1" />
                          Read
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-blue-500/10 text-blue-400 border-blue-500/20 text-xs">
                          <EyeOff className="size-3 mr-1" />
                          Unread
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1">
                        {!msg.read && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-zinc-400 hover:text-emerald-400"
                            onClick={() => handleMarkAsRead(msg)}
                          >
                            <Eye className="size-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-zinc-400 hover:text-red-400"
                          onClick={() => handleDelete(msg.id)}
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

      {/* Message detail dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-white sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="size-5 text-zinc-400" />
              Message Details
            </DialogTitle>
            <DialogDescription className="text-zinc-400">
              Contact form submission
            </DialogDescription>
          </DialogHeader>

          {selectedMessage && (
            <div className="space-y-4 py-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-xs text-zinc-500 uppercase tracking-wider">Name</p>
                  <div className="flex items-center gap-2 text-sm text-white">
                    <User className="size-4 text-zinc-500" />
                    {selectedMessage.name}
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-zinc-500 uppercase tracking-wider">Email</p>
                  <p className="text-sm text-zinc-300">{selectedMessage.email}</p>
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-xs text-zinc-500 uppercase tracking-wider">Date</p>
                <div className="flex items-center gap-2 text-sm text-zinc-400">
                  <Clock className="size-4 text-zinc-600" />
                  {formatDate(selectedMessage.createdAt)}
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-xs text-zinc-500 uppercase tracking-wider">Message</p>
                <div className="rounded-lg border border-zinc-800 bg-black/30 p-4">
                  <p className="text-sm text-zinc-300 whitespace-pre-wrap">{selectedMessage.message}</p>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            {selectedMessage && !selectedMessage.read && (
              <Button
                onClick={() => {
                  handleMarkAsRead(selectedMessage);
                  setDialogOpen(false);
                }}
                variant="ghost"
                className="text-emerald-400 hover:text-emerald-300 mr-auto"
              >
                <Eye className="size-4 mr-2" />
                Mark as Read
              </Button>
            )}
            <Button
              variant="ghost"
              onClick={() => setDialogOpen(false)}
              className="text-zinc-400 hover:text-white"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
