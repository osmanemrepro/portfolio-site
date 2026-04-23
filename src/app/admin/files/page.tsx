'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAdmin } from '@/hooks/useAdmin';
import { useUploadThing } from '@/lib/uploadthing';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import {
  Trash2,
  Loader2,
  FileIcon,
  ImageIcon,
  FileText,
  FileVideo,
  FileAudio,
  Archive,
  Download,
  HardDrive,
  X,
  Copy,
  CloudUpload,
  FolderOpen,
  Search,
  Upload,
} from 'lucide-react';

interface UploadedFile {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  category: string;
  uploadThingKey?: string | null;
  createdAt: string;
}

const CATEGORIES = [
  { value: 'general', label: 'Genel' },
  { value: 'project', label: 'Proje' },
  { value: 'document', label: 'Belge' },
  { value: 'media', label: 'Medya' },
  { value: 'backup', label: 'Yedek' },
];

function getFileIcon(mimeType: string) {
  if (mimeType.startsWith('image/')) return <ImageIcon className="size-5 text-emerald-400" />;
  if (mimeType.startsWith('video/')) return <FileVideo className="size-5 text-purple-400" />;
  if (mimeType.startsWith('audio/')) return <FileAudio className="size-5 text-amber-400" />;
  if (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('7z') || mimeType.includes('octet-stream'))
    return <Archive className="size-5 text-orange-400" />;
  if (mimeType.includes('pdf') || mimeType.includes('word') || mimeType.includes('document') || mimeType.includes('text'))
    return <FileText className="size-5 text-blue-400" />;
  return <FileIcon className="size-5 text-zinc-400" />;
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

function formatDate(date: string): string {
  try {
    return new Date(date).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return date;
  }
}

function getCategoryLabel(value: string): string {
  return CATEGORIES.find((c) => c.value === value)?.label || value;
}

export default function AdminFilesPage() {
  const { token } = useAdmin();
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<UploadedFile | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('general');
  const [filterCategory, setFilterCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const headers = useCallback(
    () => ({ Authorization: `Bearer ${token}` }),
    [token]
  );

  const fetchFiles = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/files', { headers: headers() });
      const data = await res.json();
      setFiles(Array.isArray(data) ? data : []);
    } catch {
      toast.error('Dosyalar yüklenemedi');
    } finally {
      setLoading(false);
    }
  }, [token, headers]);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  // Uploadthing hook
  const { startUpload, isUploading } = useUploadThing('fileUploader', {
    onClientUploadComplete: async (uploadedFiles) => {
      if (!uploadedFiles || uploadedFiles.length === 0) return;

      try {
        const res = await fetch('/api/files', {
          method: 'POST',
          headers: { ...headers(), 'Content-Type': 'application/json' },
          body: JSON.stringify({
            files: uploadedFiles.map((f) => ({
              name: f.name,
              size: f.size,
              type: f.type,
              url: f.url,
              key: f.key,
            })),
            category: selectedCategory,
          }),
        });
        const data = await res.json();
        if (res.ok) {
          toast.success(data.message || 'Dosyalar başarıyla yüklendi');
          fetchFiles();
          setDialogOpen(false);
        } else {
          toast.error(data.error || 'Dosya kaydedilemedi');
        }
      } catch {
        toast.error('Dosya kaydedilirken hata oluştu');
      }
    },
    onUploadError: (error) => {
      console.error('Uploadthing error:', error);
      toast.error('Yükleme sırasında hata oluştu');
    },
  });

  const handleFileUpload = (fileList: FileList | File[]) => {
    const filesArray = Array.from(fileList);
    if (filesArray.length === 0) return;
    startUpload(filesArray);
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch('/api/files', {
        method: 'DELETE',
        headers: { ...headers(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        toast.success('Dosya silindi');
        fetchFiles();
        setDeleteConfirm(null);
      } else {
        const data = await res.json();
        toast.error(data.error || 'Silme başarısız');
      }
    } catch {
      toast.error('Bir şeyler ters gitti');
    }
  };

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success('URL kopyalandı!');
  };

  const totalSize = files.reduce((acc, f) => acc + f.size, 0);

  const filteredFiles = files.filter((f) => {
    const matchCategory = filterCategory === 'all' || f.category === filterCategory;
    const matchSearch = searchQuery === '' || f.originalName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

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
          <h1 className="text-2xl font-bold text-white">Dosya Yönetimi</h1>
          <p className="text-zinc-400 mt-1">Bulut tabanlı dosya yükleme ve yönetim sistemi</p>
        </div>
        <Button onClick={() => setDialogOpen(true)} className="bg-white text-black hover:bg-zinc-200">
          <CloudUpload className="size-4 mr-2" />
          Dosya Yükle
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/10">
              <FolderOpen className="size-5 text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{files.length}</p>
              <p className="text-xs text-zinc-500">Toplam Dosya</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-500/10">
              <HardDrive className="size-5 text-purple-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{formatFileSize(totalSize)}</p>
              <p className="text-xs text-zinc-500">Toplam Boyut</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10">
              <ImageIcon className="size-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">
                {files.filter((f) => f.mimeType.startsWith('image/')).length}
              </p>
              <p className="text-xs text-zinc-500">Görsel</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10">
              <FileText className="size-5 text-amber-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">
                {files.filter((f) => f.mimeType.includes('pdf') || f.mimeType.includes('document')).length}
              </p>
              <p className="text-xs text-zinc-500">Belge</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Dosya ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-black/50 border border-zinc-700 text-white text-sm placeholder:text-zinc-500 focus:outline-none focus:border-zinc-500 transition-colors"
          />
        </div>
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-full sm:w-44 bg-black/50 border-zinc-700 text-white">
            <SelectValue placeholder="Kategori" />
          </SelectTrigger>
          <SelectContent className="bg-zinc-900 border-zinc-700">
            <SelectItem value="all">Tümü</SelectItem>
            {CATEGORIES.map((c) => (
              <SelectItem key={c.value} value={c.value}>
                {c.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Drag & Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); setDragOver(true); }}
        onDragLeave={(e) => { e.preventDefault(); e.stopPropagation(); setDragOver(false); }}
        onDrop={(e) => { e.preventDefault(); e.stopPropagation(); setDragOver(false); if (e.dataTransfer.files.length > 0) handleFileUpload(e.dataTransfer.files); }}
        className={`rounded-xl border-2 border-dashed transition-all duration-300 p-8 text-center cursor-pointer ${
          dragOver ? 'border-purple-500 bg-purple-500/5' : 'border-zinc-700 bg-zinc-900/30 hover:border-zinc-500 hover:bg-zinc-900/50'
        }`}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
        />
        <Upload className={`size-10 mx-auto mb-3 ${dragOver ? 'text-purple-400' : 'text-zinc-600'}`} />
        <p className="text-sm text-zinc-400">
          {dragOver ? 'Dosyaları buraya bırakın!' : 'Dosyaları sürükleyip bırakın veya tıklayarak seçin'}
        </p>
        <p className="text-xs text-zinc-600 mt-1">Maks. 4MB — Görsel, PDF, Metin, Arşiv desteklenir</p>
      </div>

      {/* Upload progress */}
      {isUploading && (
        <div className="rounded-xl border border-purple-500/20 bg-purple-500/5 p-4 flex items-center gap-3">
          <Loader2 className="size-5 text-purple-400 animate-spin" />
          <p className="text-sm text-purple-300">Uploadthing buluta yükleniyor...</p>
        </div>
      )}

      {/* Files table */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 backdrop-blur-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-zinc-800 hover:bg-transparent">
                <TableHead className="text-zinc-400">Dosya</TableHead>
                <TableHead className="text-zinc-400 hidden sm:table-cell">Tür</TableHead>
                <TableHead className="text-zinc-400 hidden md:table-cell">Boyut</TableHead>
                <TableHead className="text-zinc-400 hidden lg:table-cell">Kategori</TableHead>
                <TableHead className="text-zinc-400 hidden lg:table-cell">Tarih</TableHead>
                <TableHead className="text-zinc-400 text-right">İşlemler</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredFiles.length === 0 ? (
                <TableRow className="border-zinc-800">
                  <TableCell colSpan={6} className="text-center py-12 text-zinc-500">
                    <FolderOpen className="size-10 mx-auto mb-3 text-zinc-700" />
                    Henüz dosya yüklenmemiş. Yukarıdaki alandan dosya yükleyebilirsiniz.
                  </TableCell>
                </TableRow>
              ) : (
                filteredFiles.map((file) => (
                  <TableRow key={file.id} className="border-zinc-800">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {file.mimeType.startsWith('image/') ? (
                          <div className="size-10 rounded-lg overflow-hidden bg-zinc-800 shrink-0 border border-zinc-700">
                            <img src={file.url} alt={file.originalName} className="w-full h-full object-cover" loading="lazy" />
                          </div>
                        ) : (
                          <div className="size-10 rounded-lg bg-zinc-800 flex items-center justify-center shrink-0 border border-zinc-700">
                            {getFileIcon(file.mimeType)}
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="text-sm text-white font-medium truncate max-w-[200px]">{file.originalName}</p>
                          <p className="text-xs text-zinc-500 truncate max-w-[200px]">{file.url}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <Badge variant="secondary" className="bg-zinc-800 text-zinc-400 text-xs">
                        {file.mimeType.split('/')[1]?.toUpperCase() || 'BİN'}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-zinc-400 text-sm">
                      {formatFileSize(file.size)}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <Badge variant="secondary" className="text-xs bg-purple-500/10 text-purple-400 border-purple-500/20">
                        {getCategoryLabel(file.category)}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-zinc-500 text-xs">
                      {formatDate(file.createdAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        {file.mimeType.startsWith('image/') && (
                          <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-blue-400" onClick={() => setSelectedFile(file)}>
                            <ImageIcon className="size-4" />
                          </Button>
                        )}
                        <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-emerald-400" onClick={() => window.open(file.url, '_blank')}>
                          <Download className="size-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-purple-400" onClick={() => copyUrl(file.url)}>
                          <Copy className="size-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-red-400" onClick={() => setDeleteConfirm(file.id)}>
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

      {/* Upload Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-white sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CloudUpload className="size-5 text-purple-400" />
              Dosya Yükle
            </DialogTitle>
            <DialogDescription className="text-zinc-400">
              Yüklemek istediğiniz dosyaları seçin veya sürükleyip bırakın
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Category selection */}
            <div className="space-y-2">
              <label className="text-sm text-zinc-300 font-medium">Kategori</label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="bg-black/50 border-zinc-700 text-white">
                  <SelectValue placeholder="Kategori seçin" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-700">
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Drop zone */}
            <div
              onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); setDragOver(true); }}
              onDragLeave={(e) => { e.preventDefault(); e.stopPropagation(); setDragOver(false); }}
              onDrop={(e) => { e.preventDefault(); e.stopPropagation(); setDragOver(false); if (e.dataTransfer.files.length > 0) handleFileUpload(e.dataTransfer.files); }}
              className={`rounded-xl border-2 border-dashed transition-all duration-300 p-8 text-center ${
                dragOver ? 'border-purple-500 bg-purple-500/5' : 'border-zinc-700 hover:border-zinc-500'
              }`}
            >
              <Upload className={`size-10 mx-auto mb-3 ${dragOver ? 'text-purple-400' : 'text-zinc-600'}`} />
              <p className="text-sm text-zinc-400">Dosyaları sürükleyin veya tıklayın</p>
              <p className="text-xs text-zinc-600 mt-1">Çoklu seçim desteklenir — Maks. 4MB</p>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                className="hidden"
                onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
              />
            </div>

            {/* Supported formats */}
            <div className="rounded-lg border border-zinc-800 p-3">
              <p className="text-xs text-zinc-500 mb-2 font-medium">Desteklenen Formatlar:</p>
              <div className="flex flex-wrap gap-1.5">
                {['JPG', 'PNG', 'GIF', 'WebP', 'SVG', 'PDF', 'ZIP', 'RAR', 'TXT', 'CSV'].map(
                  (fmt) => (
                    <span key={fmt} className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 font-mono">
                      {fmt}
                    </span>
                  )
                )}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setDialogOpen(false)} className="text-zinc-400 hover:text-white">
              <X className="size-4 mr-2" />
              Kapat
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Image Preview Dialog */}
      <Dialog open={!!selectedFile} onOpenChange={() => setSelectedFile(null)}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-white sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ImageIcon className="size-5 text-emerald-400" />
              {selectedFile?.originalName}
            </DialogTitle>
            <DialogDescription className="text-zinc-400">
              {selectedFile && `${formatFileSize(selectedFile.size)} — ${getCategoryLabel(selectedFile.category)}`}
            </DialogDescription>
          </DialogHeader>
          {selectedFile && (
            <div className="space-y-4">
              <div className="rounded-lg overflow-hidden border border-zinc-800 bg-black/50">
                <img src={selectedFile.url} alt={selectedFile.originalName} className="w-full h-auto max-h-[60vh] object-contain" />
              </div>
              <div className="flex items-center gap-2">
                <input
                  readOnly
                  value={selectedFile.url}
                  className="flex-1 px-3 py-2 rounded-lg bg-black/50 border border-zinc-700 text-zinc-300 text-xs font-mono"
                />
                <Button variant="ghost" size="sm" onClick={() => copyUrl(selectedFile.url)} className="text-purple-400 hover:text-purple-300">
                  <Copy className="size-4 mr-1" />
                  Kopyala
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirm Dialog */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-white sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-red-400">Dosyayı Sil</DialogTitle>
            <DialogDescription className="text-zinc-400">
              Bu dosyayı buluttan ve veritabanından silmek istediğinize emin misiniz? Bu işlem geri alınamaz.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="ghost" onClick={() => setDeleteConfirm(null)} className="text-zinc-400 hover:text-white">
              İptal
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
              className="bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/20"
            >
              <Trash2 className="size-4 mr-2" />
              Sil
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
