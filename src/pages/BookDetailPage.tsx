import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useBooks } from '../hooks/useBooks';
import { useVocab } from '../hooks/useVocab';
import { summariseNotes, extractThemes, suggestBooks } from '../lib/ai';
import { Book } from '../types';
import StarRating from '../components/ui/StarRating';
import styles from './BookDetailPage.module.css';
import { format } from 'date-fns';

export default function BookDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { books, updateBook, deleteBook } = useBooks();
  const { vocab, addWord, deleteWord } = useVocab(id);

  const book = books.find(b => b.id === id);
  const [thoughts, setThoughts] = useState('');
  const [pagesRead, setPagesRead] = useState('');
  const [aiLoading, setAiLoading] = useState<string | null>(null);
  const [aiError, setAiError] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [dnfReason, setDnfReason] = useState('');
  const dnfTimeout = useRef<any>(null);
  const [newWord, setNewWord] = useState('');
  const [newDef, setNewDef] = useState('');
  const saveTimeout = useRef<any>(null);

  useEffect(() => {
    if (book) {
      setThoughts(book.thoughts);
      setDnfReason(book.dnf_reason || '');
      setPagesRead(String(book.pages_read || ''));
    }
  }, [book?.id]);

  if (!book) return <div className={styles.notFound}>Book not found.</div>;

  const progress = book.total_pages > 0 ? (book.pages_read / book.total_pages) * 100 : 0;
  const spineColor = book.status === 'Reading' ? 'var(--accent)' : book.status === 'Finished' ? 'var(--grey)' : book.status === 'Want to Read' ? 'var(--gold)' : 'var(--text-light)';

  const handleThoughtsChange = (val: string) => {
    setThoughts(val);
    clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(() => {
      updateBook(book.id, { thoughts: val });
    }, 1000);
  };

  const handlePagesBlur = () => {
    const n = parseInt(pagesRead) || 0;
    updateBook(book.id, { pages_read: n });
  };

  const handleStatus = (status: Book['status']) => {
    const updates: any = { status };
    if (status === 'Finished' && !book.date_finished) updates.date_finished = new Date();
    updateBook(book.id, updates);
  };

  const handleAI = async (action: 'summarise' | 'themes' | 'suggest') => {
    if (!thoughts.trim()) { setAiError('Add some reflections first.'); return; }
    setAiError('');
    setAiLoading(action);
    try {
      if (action === 'summarise') {
        const summary = await summariseNotes(book.title, book.author, thoughts);
        await updateBook(book.id, { ai_summary: summary });
      } else if (action === 'themes') {
        const themes = await extractThemes(book.title, book.author, thoughts);
        await updateBook(book.id, { themes });
      } else {
        const sug = await suggestBooks(book.title, book.author, thoughts);
        setSuggestions(sug);
      }
    } catch {
      setAiError('AI unavailable. Check your API key.');
    } finally {
      setAiLoading(null);
    }
  };

  const handleAddWord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWord.trim() || !newDef.trim()) return;
    try {
      await addWord(newWord.trim(), newDef.trim(), book.id, book.title);
      setNewWord('');
      setNewDef('');
    } catch {
      setAiError('Could not add word. Please try again.');
    }
  };

  const handleDelete = async () => {
    if (confirm(`Delete "${book.title}"? This cannot be undone.`)) {
      try {
        await deleteBook(book.id);
        navigate('/books');
      } catch {
        setAiError('Could not remove book. Please try again.');
      }
    }
  };

  return (
    <div className={styles.page}>
      {/* Back */}
      <button className={styles.back} onClick={() => navigate(-1)}>← Back</button>

      {/* Header */}
      <div className={styles.header} style={{ borderLeft: `4px solid ${spineColor}` }}>
        {book.cover_url && (
          <img src={book.cover_url} alt={book.title} className={styles.cover} />
        )}
        <div className={styles.headerInfo}>
          <h1 className={styles.title}>{book.title}</h1>
          <p className={styles.author}>{book.author}</p>
          <div className={styles.statusRow}>
            {((['Reading', 'Finished', 'Want to Read', 'Did Not Finish'] as const)).map(s => (
              <button
                key={s}
                className={`${styles.statusBtn} ${book.status === s ? styles.statusBtnActive : ''}`}
                onClick={() => handleStatus(s)}
                style={book.status === s ? { color: spineColor, borderColor: spineColor } : undefined}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Progress */}
      <section className={styles.section}>
        <label className={styles.sectionLabel}>Progress</label>
        <div className={styles.progressRow}>
          <input
            type="number"
            value={pagesRead}
            onChange={e => setPagesRead(e.target.value)}
            onBlur={handlePagesBlur}
            className={styles.pagesInput}
            min="0"
            max={book.total_pages}
          />
          <span className={styles.pagesOf}>of {book.total_pages || '?'} pages</span>
        </div>
        <div className={styles.progressBar}>
          <div className={styles.progressFill} style={{ width: `${progress}%`, background: spineColor }} />
        </div>
      </section>

      {/* Dates */}
      <section className={styles.section}>
        <label className={styles.sectionLabel}>Dates</label>
        <div className={styles.datesRow}>
          <div className={styles.dateField}>
            <span className={styles.dateLabel}>Started</span>
            <input
              type="date"
              value={book.date_started ? format(book.date_started, 'yyyy-MM-dd') : ''}
              onChange={e => updateBook(book.id, { date_started: e.target.value ? new Date(e.target.value) : null })}
              className={styles.dateInput}
            />
          </div>
          <div className={styles.dateField}>
            <span className={styles.dateLabel}>Finished</span>
            <input
              type="date"
              value={book.date_finished ? format(book.date_finished, 'yyyy-MM-dd') : ''}
              onChange={e => updateBook(book.id, { date_finished: e.target.value ? new Date(e.target.value) : null })}
              className={styles.dateInput}
            />
          </div>
        </div>
      </section>

      {/* Rating */}
      <section className={styles.section}>
        <label className={styles.sectionLabel}>Rating</label>
        <StarRating
          value={book.rating}
          onChange={r => updateBook(book.id, { rating: r })}
          size={24}
        />
      </section>

      {/* Reflections */}
      <section className={styles.section}>
        <label className={styles.sectionLabel}>Your thoughts</label>
        <textarea
          value={thoughts}
          onChange={e => handleThoughtsChange(e.target.value)}
          placeholder="Write freely about this book — what moved you, what you noticed, what stayed with you…"
          className={styles.textarea}
          rows={6}
        />
      </section>

      {/* DNF Reason */}
      {book.status === 'Did Not Finish' && (
        <section className={styles.section}>
          <label className={styles.sectionLabel}>Why did you stop reading?</label>
          <textarea
            value={dnfReason}
            onChange={e => {
              setDnfReason(e.target.value);
              clearTimeout(dnfTimeout.current);
              dnfTimeout.current = setTimeout(() => updateBook(book.id, { dnf_reason: e.target.value }), 1000);
            }}
            placeholder="It wasn't the right time, the pacing didn't work for me…"
            className={styles.textarea}
            rows={3}
          />
        </section>
      )}

      {/* AI Features */}
      <section className={styles.aiSection}>
        <div className={styles.aiButtons}>
          <button
            className={styles.aiBtn}
            onClick={() => handleAI('summarise')}
            disabled={aiLoading !== null}
          >
            {aiLoading === 'summarise' ? 'Summarising…' : 'Summarise my notes'}
          </button>
          <button
            className={styles.aiBtn}
            onClick={() => handleAI('themes')}
            disabled={aiLoading !== null}
          >
            {aiLoading === 'themes' ? 'Extracting…' : 'Extract themes'}
          </button>
          <button
            className={styles.aiBtn}
            onClick={() => handleAI('suggest')}
            disabled={aiLoading !== null}
          >
            {aiLoading === 'suggest' ? 'Thinking…' : 'Suggest similar books'}
          </button>
        </div>
        {aiError && <p className={styles.aiError}>{aiError}</p>}

        {book.ai_summary && (
          <div className={styles.aiResult}>
            <p className={styles.aiResultLabel}>Summary</p>
            <p className={styles.aiSummary}>{book.ai_summary}</p>
          </div>
        )}

        {book.themes.length > 0 && (
          <div className={styles.aiResult}>
            <p className={styles.aiResultLabel}>Themes</p>
            <div className={styles.themes}>
              {book.themes.map(t => (
                <span key={t} className={styles.theme}>{t}</span>
              ))}
            </div>
          </div>
        )}

        {suggestions.length > 0 && (
          <div className={styles.aiResult}>
            <p className={styles.aiResultLabel}>You might also love</p>
            <div className={styles.suggestions}>
              {suggestions.map((s, i) => (
                <div key={i} className={styles.suggestion}>
                  <span className={styles.suggestionTitle}>{s.title}</span>
                  <span className={styles.suggestionAuthor}>{s.author}</span>
                  <span className={styles.suggestionReason}>{s.reason}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Vocabulary */}
      <section className={styles.section}>
        <label className={styles.sectionLabel}>Words learned</label>
        <form onSubmit={handleAddWord} className={styles.wordForm}>
          <input
            type="text"
            value={newWord}
            onChange={e => setNewWord(e.target.value)}
            placeholder="Word"
            className={styles.wordInput}
          />
          <input
            type="text"
            value={newDef}
            onChange={e => setNewDef(e.target.value)}
            placeholder="Definition"
            className={styles.defInput}
          />
          <button type="submit" className={styles.wordAddBtn}>Add</button>
        </form>

        {vocab.length > 0 && (
          <div className={styles.wordList}>
            {vocab.map(v => (
              <div key={v.id} className={styles.wordItem}>
                <div className={styles.wordContent}>
                  <span className={styles.word}>{v.word}</span>
                  <span className={styles.definition}>{v.definition}</span>
                </div>
                <button className={styles.wordDelete} onClick={() => deleteWord(v.id)}>×</button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Delete */}
      <div className={styles.deleteSection}>
        <button className={styles.deleteBtn} onClick={handleDelete}>Remove from shelf</button>
      </div>
    </div>
  );
}
