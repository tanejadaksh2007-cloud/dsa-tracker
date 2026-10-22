import { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useToast } from '../context/ToastContext';
import Input from '../components/Input';
import ConfirmDialog from '../components/ConfirmDialog';
import DropdownMenu from '../components/DropdownMenu';

export default function NotesPage() {
  const { logout } = useAuth();
  const { toast } = useToast();
  const [notes, setNotes] = useLocalStorage('dsa_notes', []);

  // Form states for creating a new note
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [createErrors, setCreateErrors] = useState({});
  const titleInputRef = useRef(null);

  // Form states for editing an existing note
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editErrors, setEditErrors] = useState({});

  // Deletion modal state
  const [deleteNoteId, setDeleteNoteId] = useState(null);

  // ─── VALIDATION ───────────────────────────────────────────────────────────
  function validateNote(noteTitle, noteContent) {
    const errs = {};
    if (!noteTitle || !noteTitle.trim()) {
      errs.title = 'Title is required';
    }
    if (!noteContent || !noteContent.trim()) {
      errs.content = 'Content is required';
    }
    return errs;
  }

  // ─── CREATE ───────────────────────────────────────────────────────────────
  function handleAddNote(event) {
    event.preventDefault();
    const validationErrors = validateNote(title, content);
    if (Object.keys(validationErrors).length > 0) {
      setCreateErrors(validationErrors);
      return;
    }

    const newNote = {
      id: Date.now(),
      title: title.trim(),
      content: content.trim(),
      createdAt: new Date().toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
    };

    setNotes((prev) => [newNote, ...prev]);
    setTitle('');
    setContent('');
    setCreateErrors({});
    toast.success('Note created successfully.');
    titleInputRef.current?.focus();
  }

  // ─── UPDATE ───────────────────────────────────────────────────────────────
  function startEditing(note) {
    setEditingId(note.id);
    setEditTitle(note.title || note.text || '');
    setEditContent(note.content || note.text || '');
    setEditErrors({});
  }

  function cancelEditing() {
    setEditingId(null);
    setEditTitle('');
    setEditContent('');
    setEditErrors({});
  }

  function handleSaveEdit(id) {
    const validationErrors = validateNote(editTitle, editContent);
    if (Object.keys(validationErrors).length > 0) {
      setEditErrors(validationErrors);
      return;
    }

    setNotes((prev) =>
      prev.map((n) =>
        n.id === id
          ? {
              ...n,
              title: editTitle.trim(),
              content: editContent.trim(),
              updatedAt: new Date().toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
              }),
            }
          : n
      )
    );

    cancelEditing();
    toast.success('Note updated successfully.');
  }

  // ─── DELETE ───────────────────────────────────────────────────────────────
  function handleConfirmDelete() {
    if (deleteNoteId) {
      setNotes((prev) => prev.filter((n) => n.id !== deleteNoteId));
      if (editingId === deleteNoteId) {
        cancelEditing();
      }
      setDeleteNoteId(null);
      toast.info('Note deleted successfully.');
    }
  }

  return (
    <div className="home-content">
      <header className="home-header">
        <div className="home-title-row">
          <h1>Prep notes</h1>
          <p className="home-subtitle">Personal study notes with complete CRUD functionality.</p>
        </div>
        <button
          type="button"
          className="reset-all-btn"
          style={{ width: 'auto' }}
          onClick={logout}
        >
          Log out
        </button>
      </header>

      {/* CREATE FORM */}
      <section className="form-card" aria-labelledby="create-note-heading">
        <h2 id="create-note-heading" className="card-heading">Add a new note</h2>
        <form onSubmit={handleAddNote} noValidate>
          <Input
            id="note-title"
            label="Title"
            name="title"
            placeholder="e.g. Kadane's Algorithm Key Insight"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (createErrors.title) setCreateErrors((prev) => ({ ...prev, title: null }));
            }}
            error={createErrors.title}
            required
          />

          <Input
            id="note-content"
            label="Content"
            name="content"
            as="textarea"
            rows={3}
            placeholder="e.g. dp[i] = max(nums[i], dp[i-1] + nums[i]). Reset if sum becomes negative."
            value={content}
            onChange={(e) => {
              setContent(e.target.value);
              if (createErrors.content) setCreateErrors((prev) => ({ ...prev, content: null }));
            }}
            error={createErrors.content}
            required
          />

          <button type="submit" className="primary-btn">
            Save Note
          </button>
        </form>
      </section>

      {/* READ / DISPLAY NOTES */}
      <section aria-labelledby="notes-list-heading">
        <h2 id="notes-list-heading" className="section-title">
          Saved Notes ({notes.length})
        </h2>

        {notes.length === 0 ? (
          <p className="empty-state">No notes saved yet. Add one above.</p>
        ) : (
          <div className="records-list">
            {notes.map((note) => {
              const isEditing = editingId === note.id;
              const displayTitle = note.title || (note.text ? note.text.slice(0, 40) : 'Untitled Note');
              const displayContent = note.content || note.text || '';

              if (isEditing) {
                return (
                  <div key={note.id} className="record-card record-card-editing">
                    <h3 className="card-heading">Edit Note</h3>
                    <Input
                      id={`edit-title-${note.id}`}
                      label="Title"
                      name="editTitle"
                      value={editTitle}
                      onChange={(e) => {
                        setEditTitle(e.target.value);
                        if (editErrors.title) setEditErrors((prev) => ({ ...prev, title: null }));
                      }}
                      error={editErrors.title}
                      required
                    />

                    <Input
                      id={`edit-content-${note.id}`}
                      label="Content"
                      name="editContent"
                      as="textarea"
                      rows={3}
                      value={editContent}
                      onChange={(e) => {
                        setEditContent(e.target.value);
                        if (editErrors.content) setEditErrors((prev) => ({ ...prev, content: null }));
                      }}
                      error={editErrors.content}
                      required
                    />

                    <div className="card-actions-row">
                      <button
                        type="button"
                        className="primary-btn"
                        onClick={() => handleSaveEdit(note.id)}
                      >
                        Save Changes
                      </button>
                      <button
                        type="button"
                        className="qa-btn"
                        onClick={cancelEditing}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                );
              }

              return (
                <article key={note.id} className="record-card">
                  <div className="record-header">
                    <h3 className="record-title">{displayTitle}</h3>
                    {note.createdAt && <span className="record-meta">{note.createdAt}</span>}
                  </div>
                  <p className="record-body">{displayContent}</p>
                  <div className="record-footer">
                    <button
                      type="button"
                      className="qa-btn"
                      onClick={() => startEditing(note)}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="qa-btn qa-reset"
                      onClick={() => setDeleteNoteId(note.id)}
                    >
                      Delete
                    </button>
                    <DropdownMenu
                      ariaLabel={`Options for ${displayTitle}`}
                      trigger={<span className="qa-btn" style={{ padding: '4px 8px' }}>•••</span>}
                      items={[
                        { label: 'Edit note', icon: '✎', onClick: () => startEditing(note) },
                        { label: 'Delete note', icon: '✕', isDanger: true, onClick: () => setDeleteNoteId(note.id) },
                      ]}
                    />
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* CONFIRMATION DIALOG (replaces window.confirm) */}
      <ConfirmDialog
        isOpen={Boolean(deleteNoteId)}
        title="Delete Note"
        message="Are you sure you want to delete this note? This action cannot be undone."
        confirmText="Yes, Delete Note"
        cancelText="Cancel"
        isDanger={true}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteNoteId(null)}
      />
    </div>
  );
}
