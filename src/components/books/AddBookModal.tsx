import { useState } from 'react';
import { GoogleBook, BookStatus } from '../../types';
import styles from './AddBookModal.module.css';

interface AddBookModalProps {
  onClose: () => void;
  onAdd: (book: any) => Promise<void>;
}

const STATUS_OPTIONS: { value: BookStatus; label: string; color: string }[] = [
  { value: 'Reading', label: 'Currently Reading', color: '#8B4513' },
  { value: 'Finished', label: 'Finished', color: '#9E9E9E' },
  { value: 'Want to Read', label: 'Want to Read', color: '#B8934A' },
  { value: 'Did Not Finish', label: 'Did Not Finish', color: '#6B5F52' },
];

export default function AddBookModal({ onClose, onAdd }: AddBookModalProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<GoogleBook[]>([]);
  const [searching, setSearching] = useState(false);
  const [selected, setSelected] = useState<any | null>(null);
  const [manual, setManual] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [totalPages, setTotalPages] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const [status, setStatus] = useState<BookStatus>('Reading');
  const [dnfReason, setDnfReason] = useState('');

  const searchBooks = async () => {
    if (!query.trim()) return;
    setSearching(true);
    setError('');
    try {
      const res = await fetch(
        `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=8`
      );
      const data = await res.json();
      setResults(data.items || []);
      if (!data.items?.length) setError('No books found. Try a different search or add manually.');
    } catch {
      setError('Search failed. Check your connection or add manually.');
      setResults([]);
    } finally {
      setSearching(false);
    }
  };

  const selectBook = (book: GoogleBook) => {
    setTitle(book.volumeInfo.title || '');
    setAuthor(book.volumeInfo.authors?.[0] || '');
    setTotalPages(String(book.volumeInfo.pageCount || ''));
    const cover = book.volumeInfo.imageLinks?.thumbnail?.replace('http://', 'https://') || '';
    setCoverUrl(cover);
    setSelected(book);
    setResults([]);
    setQuery('');
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !author.trim()) {
      setError('Please enter a title and author.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await onAdd({
        title: title.trim(),
        author: author.trim(),
        total_pages: parseInt(totalPages) || 0,
        cover_url: coverUrl,
        status,
        pages_read: 0,
        rating: 0,
        thoughts: '',
        dnf_reason: dnfReason.trim(),
        ai_summary: '',
        themes: [],
        date_started: (status === 'Reading' || status === 'Finished' || status === 'Did Not Finish') ? new Date() : null,
        date_finished: status === 'Finished' ? new Date() : null,
      });
      onClose();
    } catch (err: any) {
      setError('Failed to add book. Make sure Firebase Auth is enabled and try again.');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2 className={styles.heading}>Add a book</h2>
          <button className={styles.closeBtn} onClick={onClose}>×</button>
        </div>

        {!selected && !manual ? (
          <>
            <div className={styles.searchRow}>
              <input
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), searchBooks())}
                placeholder="Search by title or author…"
                autoFocus
              />
              <button className={styles.searchBtn} onClick={searchBooks} disabled={searching}>
                {searching ? '…' : 'Search'}
              </button>
            </div>

            {error && <p className={styles.errorMsg}>{error}</p>}

            {results.length > 0 && (
              <div className={styles.results}>
                {results.map(book => (
                  <button key={book.id} className={styles.resultItem} onClick={() => selectBook(book)}>
                    {book.volumeInfo.imageLinks?.smallThumbnail && (
                      <img
                        src={book.volumeInfo.imageLinks.smallThumbnail.replace('http://', 'https://')}
                        alt=""
                        className={styles.resultCover}
                      />
                    )}
                    <div className={styles.resultInfo}>
                      <span className={styles.resultTitle}>{book.volumeInfo.title}</span>
                      <span className={styles.resultAuthor}>{book.volumeInfo.authors?.[0]}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}

            <button className={styles.manualBtn} onClick={() => setManual(true)}>
              Add manually instead
            </button>
          </>
        ) : (
          <form onSubmit={handleSubmit} className={styles.form}>
            {selected && (
              <div className={styles.selectedPreview}>
                {coverUrl && <img src={coverUrl} alt="" className={styles.previewCover} />}
                <div>
                  <p className={styles.previewTitle}>{title}</p>
                  <p className={styles.previewAuthor}>{author}</p>
                </div>
                <button type="button" className={styles.changeBtn} onClick={() => { setSelected(null); setManual(false); }}>
                  Change
                </button>
              </div>
            )}

            {manual && (
              <>
                <div className={styles.field}>
                  <label className={styles.label}>Title</label>
                  <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Book title" required />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Author</label>
                  <input value={author} onChange={e => setAuthor(e.target.value)} placeholder="Author name" required />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Cover URL (optional)</label>
                  <input value={coverUrl} onChange={e => setCoverUrl(e.target.value)} placeholder="https://…" />
                </div>
              </>
            )}

            <div className={styles.field}>
              <label className={styles.label}>Total pages</label>
              <input
                type="number"
                value={totalPages}
                onChange={e => setTotalPages(e.target.value)}
                placeholder="0"
                min="0"
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Status</label>
              <div className={styles.statusGrid}>
                {STATUS_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    className={`${styles.statusOption} ${status === opt.value ? styles.statusOptionActive : ''}`}
                    style={status === opt.value ? { borderColor: opt.color, color: opt.color } : undefined}
                    onClick={() => setStatus(opt.value)}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {status === 'Did Not Finish' && (
              <div className={styles.field}>
                <label className={styles.label}>Why did you stop reading?</label>
                <textarea
                  value={dnfReason}
                  onChange={e => setDnfReason(e.target.value)}
                  placeholder="It wasn't the right time, the writing style didn't suit me…"
                  className={styles.dnfTextarea}
                  rows={3}
                />
              </div>
            )}

            {error && <p className={styles.errorMsg}>{error}</p>}

            <button type="submit" className={styles.addBtn} disabled={saving}>
              {saving ? 'Adding…' : 'Add to shelf'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
