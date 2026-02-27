import {
  collection, query, where, orderBy, onSnapshot,
  addDoc, updateDoc, deleteDoc, doc, serverTimestamp, Timestamp,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Book, BookMeta, BookStatus } from '../types';

// ---------------------------------------------------------------------------
// FirestoreBookDoc — the raw shape of a book document as returned by a
// Firestore snapshot. Dates arrive as Timestamp, not Date.
// Used to type the mapper input, replacing `data: any`.
// ---------------------------------------------------------------------------

interface FirestoreBookDoc {
  title:         string;
  author:        string;
  status:        BookStatus;
  date_started:  Timestamp | null;
  date_finished: Timestamp | null;
  rating:        number;
  total_pages:   number;
  pages_read:    number;
  thoughts:      string;
  dnf_reason:    string;
  ai_summary:    string;
  themes:        string[];
  cover_url:     string;
  created_by:    string;
  created_at:    Timestamp;
}

// ---------------------------------------------------------------------------
// BookMetaUpdate — the Firestore write payload for metadata updates.
// Identical to Partial<BookMeta> except the two date fields are Timestamp,
// not Date (Firestore requires Timestamp on write).
// ---------------------------------------------------------------------------

type BookMetaUpdate = Omit<Partial<BookMeta>, 'date_started' | 'date_finished'> & {
  date_started?:  Timestamp | null;
  date_finished?: Timestamp | null;
};

// ---------------------------------------------------------------------------
// Mapper — normalises a raw Firestore book document into a typed Book object
// ---------------------------------------------------------------------------

export function toBook(id: string, data: FirestoreBookDoc): Book {
  return {
    id,
    title:         data.title         || '',
    author:        data.author        || '',
    status:        data.status        || BookStatus.Reading,
    date_started:  data.date_started  ? data.date_started.toDate()  : null,
    date_finished: data.date_finished ? data.date_finished.toDate() : null,
    rating:        data.rating        || 0,
    total_pages:   data.total_pages   || 0,
    pages_read:    data.pages_read    || 0,
    thoughts:      data.thoughts      || '',
    dnf_reason:    data.dnf_reason    || '',
    ai_summary:    data.ai_summary    || '',
    themes:        data.themes        || [],
    cover_url:     data.cover_url     || '',
    created_by:    data.created_by    || '',
    created_at:    data.created_at    ? data.created_at.toDate() : new Date(),
  };
}

// ---------------------------------------------------------------------------
// Read — sets up a real-time listener for all books belonging to a user.
// The snapshot data is cast to FirestoreBookDoc at the SDK boundary.
// Returns the unsubscribe function; caller is responsible for cleanup.
// ---------------------------------------------------------------------------

export function subscribeToBooks(
  uid: string,
  onData: (books: Book[]) => void,
): () => void {
  const q = query(
    collection(db, 'books'),
    where('created_by', '==', uid),
    orderBy('created_at', 'desc'),
  );
  return onSnapshot(q, (snap) => {
    onData(snap.docs.map(d => toBook(d.id, d.data() as FirestoreBookDoc)));
  });
}

// ---------------------------------------------------------------------------
// Write — book metadata operations (objective facts about a book).
// Reflection fields (thoughts, dnf_reason, ai_summary, themes) are handled
// by reflectionService.ts.
// ---------------------------------------------------------------------------

export async function createBook(
  uid: string,
  bookData: Omit<Book, 'id' | 'created_by' | 'created_at'>,
): Promise<void> {
  try {
    await addDoc(collection(db, 'books'), {
      ...bookData,
      created_by:   uid,
      created_at:   serverTimestamp(),
      date_started: bookData.date_started ? Timestamp.fromDate(bookData.date_started) : null,
      date_finished: null,
    });
  } catch {
    throw new Error('Failed to add book. Please try again.');
  }
}

export async function updateBookMeta(
  id: string,
  updates: Partial<BookMeta>,
): Promise<void> {
  try {
    const ref = doc(db, 'books', id);
    const { date_started, date_finished, ...rest } = updates;
    const payload: BookMetaUpdate = { ...rest };
    if ('date_started' in updates) {
      payload.date_started = date_started ? Timestamp.fromDate(date_started) : null;
    }
    if ('date_finished' in updates) {
      payload.date_finished = date_finished ? Timestamp.fromDate(date_finished) : null;
    }
    await updateDoc(ref, payload);
  } catch {
    throw new Error('Failed to update book. Please try again.');
  }
}

export async function deleteBook(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'books', id));
  } catch {
    throw new Error('Failed to delete book. Please try again.');
  }
}
