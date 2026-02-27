import { useData } from '../contexts/DataContext';

// Thin wrapper over DataContext.
// If bookId is provided, filters the shared vocab array client-side —
// no additional Firestore listener is created.
// Returns the same shape as before so no call site needs to change.
export function useVocab(bookId?: string) {
  const { vocab: allVocab, vocabLoading: loading, addWord, deleteWord } = useData();
  const vocab = bookId ? allVocab.filter(v => v.book_ref === bookId) : allVocab;
  return { vocab, loading, addWord, deleteWord };
}
