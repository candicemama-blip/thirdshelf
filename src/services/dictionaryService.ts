import {
  collection, query, where, orderBy, onSnapshot,
  addDoc, deleteDoc, doc, serverTimestamp, Timestamp,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { VocabWord, NewDictionaryEntry } from '../types';

// ---------------------------------------------------------------------------
// FirestoreVocabDoc — the raw shape of a vocab document as returned by a
// Firestore snapshot. Dates arrive as Timestamp, not Date.
// Used to type the mapper input, replacing `data: any`.
// ---------------------------------------------------------------------------

interface FirestoreVocabDoc {
  word:       string;
  definition: string;
  book_ref:   string;
  book_title: string;
  created_by: string;
  created_at: Timestamp;
}

// ---------------------------------------------------------------------------
// Mapper — normalises a raw Firestore vocab document into a typed VocabWord
// ---------------------------------------------------------------------------

export function toVocab(id: string, data: FirestoreVocabDoc): VocabWord {
  return {
    id,
    word:       data.word       || '',
    definition: data.definition || '',
    book_ref:   data.book_ref   || '',
    book_title: data.book_title || '',
    created_by: data.created_by || '',
    created_at: data.created_at ? data.created_at.toDate() : new Date(),
  };
}

// ---------------------------------------------------------------------------
// Read — sets up a real-time listener for all vocab words belonging to a user.
// No bookId filter is applied here; per-book filtering is done client-side
// in useVocab(bookId). Returns the unsubscribe function; caller handles cleanup.
// ---------------------------------------------------------------------------

export function subscribeToVocab(
  uid: string,
  onData: (vocab: VocabWord[]) => void,
): () => void {
  const q = query(
    collection(db, 'vocab'),
    where('created_by', '==', uid),
    orderBy('created_at', 'asc'),
  );
  return onSnapshot(q, (snap) => {
    onData(snap.docs.map(d => toVocab(d.id, d.data() as FirestoreVocabDoc)));
  });
}

// ---------------------------------------------------------------------------
// Write
// ---------------------------------------------------------------------------

export async function createWord(
  uid: string,
  entry: NewDictionaryEntry,
): Promise<void> {
  try {
    await addDoc(collection(db, 'vocab'), {
      word:       entry.word,
      definition: entry.definition,
      book_ref:   entry.book_ref,
      book_title: entry.book_title,
      created_by: uid,
      created_at: serverTimestamp(),
    });
  } catch {
    throw new Error('Failed to add word. Please try again.');
  }
}

export async function deleteWord(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'vocab', id));
  } catch {
    throw new Error('Failed to delete word. Please try again.');
  }
}
