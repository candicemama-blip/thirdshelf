import { useData } from '../contexts/DataContext';

// Thin wrapper over DataContext.
// Returns the same shape as before so no call site needs to change.
export function useBooks() {
  const { books, booksLoading: loading, addBook, updateBook, deleteBook } = useData();
  return { books, loading, addBook, updateBook, deleteBook };
}
