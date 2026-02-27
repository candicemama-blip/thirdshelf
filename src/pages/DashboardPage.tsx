import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useBooks } from '../hooks/useBooks';
import { useVocab } from '../hooks/useVocab';
import { useAuth } from '../contexts/AuthContext';
import BookCard from '../components/books/BookCard';
import AddBookModal from '../components/books/AddBookModal';
import styles from './DashboardPage.module.css';

export default function DashboardPage() {
  const { user } = useAuth();
  const { books, loading, addBook } = useBooks();
  const { vocab } = useVocab();
  const [showAdd, setShowAdd] = useState(false);

  const reading = books.filter(b => b.status === 'Reading');
  const finished = books.filter(b => b.status === 'Finished').slice(0, 3);
  const name = user?.displayName?.split(' ')[0] || 'reader';

  const stats = [
    { label: 'Total books', value: books.length },
    { label: 'Reading', value: reading.length },
    { label: 'Finished', value: books.filter(b => b.status === 'Finished').length },
    { label: 'Words learned', value: vocab.length },
  ];

  if (loading) return <div className={styles.loading}>Loading…</div>;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.heading}>Dashboard</h1>
          <p className={styles.sub}>Your reading at a glance.</p>
        </div>
        <button className={styles.addBtn} onClick={() => setShowAdd(true)}>
          + Add book
        </button>
      </div>

      {/* Stats */}
      <div className={styles.statsGrid}>
        {stats.map(s => (
          <div key={s.label} className={styles.statCard}>
            <span className={styles.statValue}>{s.value}</span>
            <span className={styles.statLabel}>{s.label}</span>
          </div>
        ))}
      </div>

      {/* Currently reading */}
      {reading.length > 0 && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Currently reading</h2>
          <div className={styles.bookList}>
            {reading.map(book => <BookCard key={book.id} book={book} />)}
          </div>
        </section>
      )}

      {/* Recently finished */}
      {finished.length > 0 && (
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Recently finished</h2>
            <Link to="/books" className={styles.seeAll}>See all</Link>
          </div>
          <div className={styles.bookList}>
            {finished.map(book => <BookCard key={book.id} book={book} />)}
          </div>
        </section>
      )}

      {/* Empty state */}
      {books.length === 0 && (
        <div className={styles.empty}>
          <p className={styles.emptyText}>Your shelf is waiting.</p>
          <p className={styles.emptySubtext}>Add your first book to begin.</p>
          <button className={styles.addBtn} onClick={() => setShowAdd(true)}>
            Add a book
          </button>
        </div>
      )}

      {showAdd && <AddBookModal onClose={() => setShowAdd(false)} onAdd={addBook} />}
    </div>
  );
}
