import { useState } from 'react';
import { useBooks } from '../hooks/useBooks';
import BookCard from '../components/books/BookCard';
import AddBookModal from '../components/books/AddBookModal';
import styles from './LibraryPage.module.css';
import { BookStatus } from '../types';

const filters: { label: string; value: BookStatus | 'All' }[] = [
  { label: 'All', value: 'All' },
  { label: 'Reading', value: 'Reading' },
  { label: 'Finished', value: 'Finished' },
  { label: 'Want to Read', value: 'Want to Read' },
  { label: 'Did Not Finish', value: 'Did Not Finish' },
];

export default function LibraryPage() {
  const { books, loading, addBook } = useBooks();
  const [filter, setFilter] = useState<BookStatus | 'All'>('All');
  const [showAdd, setShowAdd] = useState(false);

  const filtered = filter === 'All' ? books : books.filter(b => b.status === filter);

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.heading}>Library</h1>
          <p className={styles.sub}>{books.length} book{books.length !== 1 ? 's' : ''} on your shelf</p>
        </div>
        <button className={styles.addBtn} onClick={() => setShowAdd(true)}>+ Add</button>
      </div>

      <div className={styles.filters}>
        {filters.map(f => (
          <button
            key={f.value}
            className={`${styles.filterBtn} ${filter === f.value ? styles.filterActive : ''}`}
            onClick={() => setFilter(f.value)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className={styles.loading}>Loading…</div>
      ) : filtered.length > 0 ? (
        <div className={styles.list}>
          {filtered.map(book => <BookCard key={book.id} book={book} />)}
        </div>
      ) : (
        <div className={styles.empty}>
          <p>{filter === 'All' ? 'No books yet.' : `No "${filter}" books yet.`}</p>
        </div>
      )}

      {showAdd && <AddBookModal onClose={() => setShowAdd(false)} onAdd={addBook} />}
    </div>
  );
}
