import { useEffect, useRef } from 'react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
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
import { ScrollArea } from '@/components/ui/scroll-area';
import { X, Upload, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Note, Attachment, NoteTag, NoteModification } from '@/types';
import { STATUS_COLORS } from '@/hooks/useStatusColors';
import { noteSchema, NOTE_DEFAULTS, type NoteInput } from '@/lib/schemas/note';

const HISTORY_PREVIEW_COUNT = 3;

const ModalHistoryBlock = ({ history, getSalesRepName }: { history: NoteModification[]; getSalesRepName: (id: number) => string }) => {
  const [showAll, setShowAll] = useState(false);
  const sorted = [...history].reverse();
  const visible = showAll ? sorted : sorted.slice(0, HISTORY_PREVIEW_COUNT);
  const hasMore = sorted.length > HISTORY_PREVIEW_COUNT;

  const entries = (
    <div className="space-y-1 pl-2 border-l-2 border-muted">
      {visible.map((mod, idx) => (
        <div key={idx} className="text-xs">
          <span>{new Date(mod.modifiedAt).toLocaleString()} — {getSalesRepName(mod.modifiedById)}</span>
          <span className="ml-1 text-foreground">{mod.summary}</span>
          {mod.previousContent && (
            <div className="mt-0.5 pl-2 border-l border-muted-foreground/30 text-muted-foreground italic line-clamp-2">
              "{mod.previousContent}"
            </div>
          )}
        </div>
      ))}
    </div>
  );

  return (
    <div className="mt-2">
      <div className="text-xs font-medium mb-1">Edit History</div>
      {showAll ? (
        <ScrollArea className="max-h-[200px]">{entries}</ScrollArea>
      ) : (
        entries
      )}
      {hasMore && (
        <button
          type="button"
          onClick={() => setShowAll(!showAll)}
          className="text-xs text-primary hover:underline mt-1"
        >
          {showAll ? 'Show less' : `Show all ${history.length} edits`}
        </button>
      )}
    </div>
  );
};

interface NoteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: number;
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
  const [isDragging, setIsDragging] = useState(false);

  const { register, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm<NoteInput>({
    resolver: zodResolver(noteSchema),
    defaultValues: NOTE_DEFAULTS,
  });

  const selectedTagIds = watch('selectedTagIds');
  const attachments = watch('attachments');

  useEffect(() => {
    if (open) {
      if (mode === 'edit' && note) {
        reset({
          content: note.content,
          selectedTagIds: note.tagIds || [],
          attachments: note.attachments || [],
        });
      } else {
        reset(NOTE_DEFAULTS);
      }
    }
  }, [open, mode, note, reset]);

  const handleTagToggle = (tagId: string) => {
    setValue('selectedTagIds',
      selectedTagIds.includes(tagId)
        ? selectedTagIds.filter(id => id !== tagId)
        : [...selectedTagIds, tagId]
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

    setValue('attachments', [...attachments, ...newAttachments]);
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
    setValue('attachments', attachments.filter(a => a.id !== attachmentId));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const onSubmit = (data: NoteInput) => {
    onSave({
      content: data.content.trim(),
      tagIds: data.selectedTagIds,
      attachments: data.attachments,
    });
    onOpenChange(false);
  };

  const onError = () => {
    toast({
      title: 'Content required',
      description: 'Please enter note content.',
      variant: 'destructive',
    });
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
            <div className="text-sm text-muted-foreground space-y-1">
              <div>
                Created: {new Date(note.createdAt).toLocaleString()} by{' '}
                {getSalesRepName(note.createdById)}
              </div>
              {note.lastModifiedAt && (
                <div>
                  Modified: {new Date(note.lastModifiedAt).toLocaleString()} by{' '}
                  {getSalesRepName(note.lastModifiedById!)}
                </div>
              )}
              {note.modificationHistory && note.modificationHistory.length > 0 && (
                <ModalHistoryBlock
                  history={note.modificationHistory}
                  getSalesRepName={getSalesRepName}
                />
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="content">Note Content *</Label>
            <Textarea
              id="content"
              placeholder="Enter note content..."
              {...register('content')}
              rows={4}
              className={errors.content ? 'border-destructive' : ''}
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
          <Button onClick={handleSubmit(onSubmit, onError)}>
            {mode === 'create' ? 'Add Note' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
