import { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { X, Upload, FileText, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Note, Attachment, NoteTag } from '@/types';
import { STATUS_COLORS } from '@/hooks/useStatusColors';

interface NoteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  siteId: number;
  note?: Note;
  mode: 'create' | 'edit';
  noteTags: NoteTag[];
  onSave: (noteData: Omit<Note, 'id' | 'createdAt' | 'createdById'>) => void;
  getSalesRepName: (id: number) => string;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_FILES = 10;

export const NoteModal = ({
  open,
  onOpenChange,
  note,
  mode,
  noteTags,
  onSave,
  getSalesRepName,
}: NoteModalProps) => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [content, setContent] = useState('');
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (open) {
      if (mode === 'edit' && note) {
        setContent(note.content);
        setSelectedTagIds(note.tagIds || []);
        setAttachments(note.attachments || []);
      } else {
        setContent('');
        setSelectedTagIds([]);
        setAttachments([]);
      }
    }
  }, [open, mode, note]);

  const handleTagToggle = (tagId: string) => {
    setSelectedTagIds(prev =>
      prev.includes(tagId)
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    );
  };

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;

    const newAttachments: Attachment[] = [];
    const currentCount = attachments.length;

    for (let i = 0; i < files.length; i++) {
      if (currentCount + newAttachments.length >= MAX_FILES) {
        toast({
          title: 'File limit reached',
          description: `Maximum ${MAX_FILES} files per note.`,
          variant: 'destructive',
        });
        break;
      }

      const file = files[i];

      if (file.size > MAX_FILE_SIZE) {
        toast({
          title: 'File too large',
          description: `${file.name} exceeds 5MB limit.`,
          variant: 'destructive',
        });
        continue;
      }

      const attachment: Attachment = {
        id: Date.now() + i,
        fileName: file.name,
        fileUrl: URL.createObjectURL(file),
        fileType: file.type,
        fileSize: file.size,
        uploadedAt: new Date().toISOString(),
      };

      newAttachments.push(attachment);
    }

    setAttachments(prev => [...prev, ...newAttachments]);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleRemoveAttachment = (attachmentId: number) => {
    setAttachments(prev => prev.filter(a => a.id !== attachmentId));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleSave = () => {
    if (!content.trim()) {
      toast({
        title: 'Content required',
        description: 'Please enter note content.',
        variant: 'destructive',
      });
      return;
    }

    onSave({
      content: content.trim(),
      tagIds: selectedTagIds,
      attachments,
    });

    onOpenChange(false);
  };

  const getTagColor = (colorId: string) => {
    const colorConfig = STATUS_COLORS.find(c => c.id === colorId);
    return colorConfig || STATUS_COLORS[0];
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Add Note' : 'Edit Note'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {mode === 'edit' && note && (
            <div className="text-sm text-muted-foreground">
              Created: {new Date(note.createdAt).toLocaleString()} by{' '}
              {getSalesRepName(note.createdById)}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="content">Note Content *</Label>
            <Textarea
              id="content"
              placeholder="Enter note content..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label>Tags</Label>
            <div className="flex flex-wrap gap-2">
              {noteTags.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No tags available. Add tags in Settings &gt; Manage Dropdowns.
                </p>
              ) : (
                noteTags.map(tag => {
                  const colorConfig = getTagColor(tag.color);
                  const isSelected = selectedTagIds.includes(tag.id);
                  return (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() => handleTagToggle(tag.id)}
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium transition-all ${
                        isSelected
                          ? `${colorConfig.bg} ${colorConfig.text} ring-2 ring-primary/30`
                          : 'bg-muted text-muted-foreground hover:bg-muted/80'
                      }`}
                    >
                      {tag.label}
                      {isSelected && <X className="h-3 w-3" />}
                    </button>
                  );
                })
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Attachments</Label>
            <div
              className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                isDragging
                  ? 'border-primary bg-primary/5'
                  : 'border-muted-foreground/25 hover:border-muted-foreground/50'
              }`}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Drop files here or click to upload
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Max 5MB per file, {MAX_FILES} files max
              </p>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                className="hidden"
                onChange={(e) => handleFileSelect(e.target.files)}
              />
            </div>

            {attachments.length > 0 && (
              <div className="space-y-2 mt-3">
                {attachments.map(attachment => (
                  <div
                    key={attachment.id}
                    className="flex items-center justify-between p-2 bg-muted rounded-md"
                  >
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm truncate max-w-[300px]">
                        {attachment.fileName}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        ({formatFileSize(attachment.fileSize)})
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => handleRemoveAttachment(attachment.id)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            {mode === 'create' ? 'Add Note' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
