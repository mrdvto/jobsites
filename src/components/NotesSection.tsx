import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
import { Input } from '@/components/ui/input';
import { Plus, Pencil, X, FileText, Download, Search } from 'lucide-react';
import { Note, NoteTag } from '@/types';
import { NoteModal } from '@/components/NoteModal';
import { STATUS_COLORS } from '@/hooks/useStatusColors';

interface NotesSectionProps {
  notes: Note[];
  noteTags: NoteTag[];
  onAddNote: (noteData: Omit<Note, 'id' | 'createdAt' | 'createdById'>) => void;
  onUpdateNote: (noteId: number, noteData: Partial<Note>) => void;
  onDeleteNote: (noteId: number) => void;
  getSalesRepName: (id: number) => string;
  siteId: number;
}

export const NotesSection = ({
  notes,
  noteTags,
  onAddNote,
  onUpdateNote,
  onDeleteNote,
  getSalesRepName,
  siteId,
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
              ? 'No notes recorded for this site yet.'
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

                  <div className="flex items-center justify-between text-xs text-muted-foreground">
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
                </div>
              );
            })}
          </div>
        )}
      </Card>

      <NoteModal
        open={showNoteModal}
        onOpenChange={setShowNoteModal}
        siteId={siteId}
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
