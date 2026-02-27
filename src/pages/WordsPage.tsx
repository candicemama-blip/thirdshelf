import { useState } from 'react';
import { useVocab } from '../hooks/useVocab';
import styles from './WordsPage.module.css';

export default function WordsPage() {
  const { vocab, loading, deleteWord } = useVocab();
  const [search, setSearch] = useState('');

  const filtered = search.trim()
    ? vocab.filter(v =>
        v.word.toLowerCase().includes(search.toLowerCase()) ||
        v.definition.toLowerCase().includes(search.toLowerCase())
      )
    : vocab;

  // Group by book
  const grouped = filtered.reduce<Record<string, typeof vocab>>((acc, v) => {
    const key = v.book_title || v.book_ref;
    if (!acc[key]) acc[key] = [];
    acc[key].push(v);
    return acc;
  }, {});

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.heading}>Words Learned</h1>
        <p className={styles.sub}>{vocab.length} word{vocab.length !== 1 ? 's' : ''} across {Object.keys(grouped).length} book{Object.keys(grouped).length !== 1 ? 's' : ''}</p>
      </div>

      {vocab.length > 0 && (
        <div className={styles.searchWrap}>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search words…"
            className={styles.search}
          />
        </div>
      )}

      {loading ? (
        <div className={styles.empty}>Loading…</div>
      ) : vocab.length === 0 ? (
        <div className={styles.empty}>
          <p className={styles.emptyText}>No words yet.</p>
          <p className={styles.emptySub}>Add vocabulary while reading a book.</p>
        </div>
      ) : Object.keys(grouped).length === 0 ? (
        <div className={styles.empty}>No words match your search.</div>
      ) : (
        Object.entries(grouped).map(([bookTitle, words]) => (
          <div key={bookTitle} className={styles.group}>
            <h2 className={styles.bookTitle}>{bookTitle}</h2>
            <div className={styles.wordList}>
              {words.map(v => (
                <div key={v.id} className={styles.wordItem}>
                  <div className={styles.wordContent}>
                    <span className={styles.word}>{v.word}</span>
                    <span className={styles.definition}>{v.definition}</span>
                  </div>
                  <button className={styles.deleteBtn} onClick={() => deleteWord(v.id)}>×</button>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
