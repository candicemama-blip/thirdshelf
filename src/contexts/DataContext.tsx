import React, { createContext, useContext, useEffect, useState } from 'react';
import * as bookService from '../services/bookService';
import * as reflectionService from '../services/reflectionService';
import * as dictionaryService from '../services/dictionaryService';
import { useAuth } from './AuthContext';
import { Book, BookMeta, VocabWord } from '../types';

// ---------------------------------------------------------------------------
// Context type
// ---------------------------------------------------------------------------

interface DataContextType {
  books: Book[];
  booksLoading: boolean;
  addBook: (bookData: Omit<Book, 'id' | 'created_by' | 'created_at'>) => Promise<void>;
  updateBook: (id: string, updates: Partial<Book>) => Promise<void>;
  deleteBook: (id: string) => Promise<void>;
  vocab: VocabWord[];
  vocabLoading: boolean;
  addWord: (word: string, definition: string, bookRef: string, bookTitle: string) => Promise<void>;
  deleteWord: (id: string) => Promise<void>;
}

const DataContext = createContext<DataContextType | null>(null);

// ---------------------------------------------------------------------------
// Provider — orchestrates state only. All Firestore operations are delegated
// to the service layer. No firebase/firestore imports here.
// ---------------------------------------------------------------------------

export function DataProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();

  const [books, setBooks] = useState<Book[]>([]);
  const [booksLoading, setBooksLoading] = useState(true);

  const [vocab, setVocab] = useState<VocabWord[]>([]);
  const [vocabLoading, setVocabLoading] = useState(true);

  // Single books listener — delegated to bookService
  useEffect(() => {
    if (!user) {
      setBooks([]);
      setBooksLoading(false);
      return;
    }
    setBooksLoading(true);
    const unsub = bookService.subscribeToBooks(user.uid, (data) => {
      setBooks(data);
      setBooksLoading(false);
    });
    return unsub;
  }, [user]);

  // Single vocab listener — delegated to dictionaryService.
  // Per-book filtering is done client-side in useVocab(bookId).
  useEffect(() => {
    if (!user) {
      setVocab([]);
      setVocabLoading(false);
      return;
    }
    setVocabLoading(true);
    const unsub = dictionaryService.subscribeToVocab(user.uid, (data) => {
      setVocab(data);
      setVocabLoading(false);
    });
    return unsub;
  }, [user]);

  // ---------------------------------------------------------------------------
  // Mutations — delegate to services. updateBook routes to bookService or
  // reflectionService depending on which fields are present in the update.
  // All error handling lives in the service layer.
  // ---------------------------------------------------------------------------

  const addBook = async (bookData: Omit<Book, 'id' | 'created_by' | 'created_at'>) => {
    if (!user) return;
    await bookService.createBook(user.uid, bookData);
  };

  const updateBook = async (id: string, updates: Partial<Book>) => {
    if ('thoughts' in updates) {
      await reflectionService.saveThoughts(id, updates.thoughts!);
    } else if ('dnf_reason' in updates) {
      await reflectionService.saveDnfReason(id, updates.dnf_reason!);
    } else if ('ai_summary' in updates) {
      await reflectionService.saveAiSummary(id, updates.ai_summary!);
    } else if ('themes' in updates) {
      await reflectionService.saveThemes(id, updates.themes!);
    } else {
      // Reflection fields have been handled above; remaining keys are BookMeta fields.
      await bookService.updateBookMeta(id, updates as Partial<BookMeta>);
    }
  };

  const deleteBook = async (id: string) => {
    await bookService.deleteBook(id);
  };

  const addWord = async (
    word: string,
    definition: string,
    bookRef: string,
    bookTitle: string,
  ) => {
    if (!user) return;
    await dictionaryService.createWord(user.uid, {
      word,
      definition,
      book_ref:   bookRef,
      book_title: bookTitle,
    });
  };

  const deleteWord = async (id: string) => {
    await dictionaryService.deleteWord(id);
  };

  return (
    <DataContext.Provider value={{
      books,
      booksLoading,
      addBook,
      updateBook,
      deleteBook,
      vocab,
      vocabLoading,
      addWord,
      deleteWord,
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData must be used within DataProvider');
  return context;
}
