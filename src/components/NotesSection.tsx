import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Input } from '@/components/ui/input';
import { Plus, Pencil, X, FileText, Download, Search, History, ChevronDown } from 'lucide-react';
import { Note, NoteTag, NoteModification } from '@/types';
import { NoteModal } from '@/components/NoteModal';
import { STATUS_COLORS } from '@/hooks/useStatusColors';

const HISTORY_PREVIEW_COUNT = 3;

const NoteHistoryBlock = ({ history, getSalesRepName }: { history: NoteModification[]; getSalesRepName: (id: number) => string }) => {
  const [showAll, setShowAll] = useState(false);
  const sorted = [...history].reverse();
  const visible = showAll ? sorted : sorted.slice(0, HISTORY_PREVIEW_COUNT);
  const hasMore = sorted.length > HISTORY_PREVIEW_COUNT;

  const entries = (
    <div className="space-y-1">
      {visible.map((mod, idx) => (
        <div key={idx} className="text-xs">
          <span className="text-muted-foreground">
            {new Date(mod.modifiedAt).toLocaleString()} — {getSalesRepName(mod.modifiedById)}
          </span>
          <span className="ml-1">{mod.summary}</span>
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
    <Collapsible className="mt-2">
      <CollapsibleTrigger className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
        <History className="h-3 w-3" />
        <span>View history ({history.length} edit{history.length !== 1 ? 's' : ''})</span>
        <ChevronDown className="h-3 w-3" />
      </CollapsibleTrigger>
      <CollapsibleContent className="mt-1 pl-4 border-l-2 border-muted">
        {showAll ? (
          <ScrollArea className="max-h-[200px]">{entries}</ScrollArea>
        ) : (
          entries
        )}
        {hasMore && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); setShowAll(!showAll); }}
            className="text-xs text-primary hover:underline mt-1"
          >
            {showAll ? 'Show less' : `Show all ${history.length} edits`}
          </button>
        )}
      </CollapsibleContent>
    </Collapsible>
  );
};

interface NotesSectionProps {
  notes: Note[];
  noteTags: NoteTag[];
  onAddNote: (noteData: Omit<Note, 'id' | 'createdAt' | 'createdById'>) => void;
  onUpdateNote: (noteId: number, noteData: Partial<Note>) => void;
  onDeleteNote: (noteId: number) => void;
  getSalesRepName: (id: number) => string;
  projectId: number;
}

export const NotesSection = ({
  notes,
  noteTags,
  onAddNote,
  onUpdateNote,
  onDeleteNote,
  getSalesRepName,
  projectId,
}: NotesSectionProps) => {
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [selectedNote, setSelectedNote] = useState<Note | undefined>(undefined);
  const [noteModalMode, setNoteModalMode] = useState<'create' | 'edit'>('create');
  const [filterTagId, setFilterTagId] = useState<string>('all');
  const [filterAuthorId, setFilterAuthorId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState<number | null>(null);

  const handleAddNote = () => {
    setSelectedNote(undefined);
    setNoteModalMode('create');
    setShowNoteModal(true);
  };

  const handleEditNote = (note: Note) => {
    setSelectedNote(note);
    setNoteModalMode('edit');
    setShowNoteModal(true);
  };

  const handleDeleteClick = (noteId: number) => {
    setNoteToDelete(noteId);
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = () => {
    if (noteToDelete !== null) {
      onDeleteNote(noteToDelete);
      setNoteToDelete(null);
      setShowDeleteDialog(false);
    }
  };

  const handleSaveNote = (noteData: Omit<Note, 'id' | 'createdAt' | 'createdById'>) => {
    if (noteModalMode === 'create') {
      onAddNote(noteData);
    } else if (selectedNote) {
      onUpdateNote(selectedNote.id, noteData);
    }
  };

  const getTagColor = (colorId: string) => {
    const colorConfig = STATUS_COLORS.find(c => c.id === colorId);
    return colorConfig || STATUS_COLORS[0];
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Unique authors from notes
  const uniqueAuthors = Array.from(new Set(notes.map(n => n.createdById)))
    .map(id => ({ id, name: getSalesRepName(id) }))
    .sort((a, b) => a.name.localeCompare(b.name));

  // Filter notes by tag, author, and search
  const filteredNotes = notes.filter(note => {
    if (filterTagId !== 'all' && !note.tagIds?.includes(filterTagId)) return false;
    if (filterAuthorId !== 'all' && note.createdById !== parseInt(filterAuthorId)) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      if (!note.content.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  // Sort notes newest first
  const sortedNotes = [...filteredNotes].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <>
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Notes</h2>
          <Button size="sm" onClick={handleAddNote}>
            <Plus className="h-4 w-4 mr-2" />
            Add Note
          </Button>
        </div>

        {notes.length > 0 && (
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search notes..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            {noteTags.length > 0 && (
              <Select value={filterTagId} onValueChange={setFilterTagId}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Filter by tag" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Tags</SelectItem>
                  {noteTags.map(tag => (
                    <SelectItem key={tag.id} value={tag.id}>
                      {tag.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            {uniqueAuthors.length > 1 && (
              <Select value={filterAuthorId} onValueChange={setFilterAuthorId}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by author" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Authors</SelectItem>
                  {uniqueAuthors.map(author => (
                    <SelectItem key={author.id} value={String(author.id)}>
                      {author.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        )}

        {sortedNotes.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            {notes.length === 0
              ? 'No notes recorded for this project yet.'
              : 'No notes match the selected filter.'}
          </p>
        ) : (
          <div className="space-y-4">
            {sortedNotes.map(note => {
              const noteTags_ = noteTags.filter(tag => note.tagIds?.includes(tag.id));
              return (
                <div
                  key={note.id}
                  className="p-4 border rounded-lg bg-card"
                >
                  <p className="text-sm whitespace-pre-wrap mb-3">{note.content}</p>

                  {noteTags_.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {noteTags_.map(tag => {
                        const colorConfig = getTagColor(tag.color);
                        return (
                          <span
                            key={tag.id}
                            className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${colorConfig.bg} ${colorConfig.text}`}
                          >
                            {tag.label}
                          </span>
                        );
                      })}
                    </div>
                  )}

                  {note.attachments && note.attachments.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {note.attachments.map(attachment => (
                        <a
                          key={attachment.id}
                          href={attachment.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-2 py-1 bg-muted rounded text-xs hover:bg-muted/80"
                        >
                          <FileText className="h-3 w-3" />
                          {attachment.fileName}
                          <Download className="h-3 w-3 ml-1" />
                        </a>
                      ))}
                    </div>
                  )}

                    <div className="text-xs text-muted-foreground">
                      <div className="flex items-center justify-between">
                        <div className="flex flex-col gap-0.5">
                          <span>
                            Created: {new Date(note.createdAt).toLocaleDateString()} by{' '}
                            {getSalesRepName(note.createdById)}
                          </span>
                          {note.lastModifiedAt && (
                            <span>
                              Modified: {new Date(note.lastModifiedAt).toLocaleDateString()} by{' '}
                              {getSalesRepName(note.lastModifiedById!)}
                            </span>
                          )}
                        </div>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2"
                            onClick={() => handleEditNote(note)}
                          >
                            <Pencil className="h-3 w-3 mr-1" />
                            Edit
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 text-destructive hover:text-destructive"
                            onClick={() => handleDeleteClick(note.id)}
                          >
                            <X className="h-3 w-3 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </div>

                      {note.modificationHistory && note.modificationHistory.length > 0 && (
                        <NoteHistoryBlock
                          history={note.modificationHistory}
                          getSalesRepName={getSalesRepName}
                        />
                      )}
                    </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      <NoteModal
        open={showNoteModal}
        onOpenChange={setShowNoteModal}
        projectId={projectId}
        note={selectedNote}
        mode={noteModalMode}
        noteTags={noteTags}
        onSave={handleSaveNote}
        getSalesRepName={getSalesRepName}
      />

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Note?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the note and its attachments.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
