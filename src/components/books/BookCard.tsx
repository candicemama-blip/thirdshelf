import { Link } from 'react-router-dom';
import { Book } from '../../types';
import StarRating from '../ui/StarRating';
import styles from './BookCard.module.css';

interface BookCardProps {
  book: Book;
}

const statusColors: Record<string, string> = {
  'Reading': 'var(--accent)',
  'Finished': 'var(--grey)',
  'Want to Read': 'var(--gold)',
  'Did Not Finish': 'var(--text-light)',
};

const statusClass: Record<string, string> = {
  'Reading': styles.statusReading,
  'Finished': styles.statusFinished,
  'Want to Read': styles.statusWantToRead,
  'Did Not Finish': styles.statusDNF,
};

export default function BookCard({ book }: BookCardProps) {
  const progress = book.total_pages > 0 ? (book.pages_read / book.total_pages) * 100 : 0;
  const spineColor = statusColors[book.status] || 'var(--grey)';

  return (
    <Link to={`/book/${book.id}`} className={styles.card} style={{ '--spine-color': spineColor } as React.CSSProperties}>
      <div className={styles.cover}>
        {book.cover_url ? (
          <img src={book.cover_url} alt={book.title} className={styles.coverImg} />
        ) : (
          <div className={styles.coverPlaceholder}>
            <span>{book.title[0]}</span>
          </div>
        )}
      </div>
      <div className={styles.info}>
        <div className={styles.titleRow}>
          <h3 className={styles.title}>{book.title}</h3>
          <span className={`${styles.statusBadge} ${statusClass[book.status] || ''}`}>
            {book.status}
          </span>
        </div>
        <p className={styles.author}>{book.author}</p>

        {book.rating > 0 && (
          <div className={styles.rating}>
            <StarRating value={book.rating} readonly size={13} />
          </div>
        )}

        {book.total_pages > 0 && book.status === 'Reading' && (
          <div className={styles.progressSection}>
            <div className={styles.progressBar}>
              <div className={styles.progressFill} style={{ width: `${progress}%`, background: spineColor }} />
            </div>
            <span className={styles.progressText}>
              {book.pages_read} / {book.total_pages} pages
            </span>
          </div>
        )}

        {book.themes.length > 0 && (
          <div className={styles.themes}>
            {book.themes.slice(0, 3).map(t => (
              <span key={t} className={styles.theme}>{t}</span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}
