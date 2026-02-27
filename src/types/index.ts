// ---------------------------------------------------------------------------
// BookStatus — const object + derived type.
// The type is identical to the previous union, so all existing comparisons
// (e.g. `b.status === 'Reading'`) continue to compile unchanged.
// New code can additionally use BookStatus.Reading, BookStatus.Finished, etc.
// ---------------------------------------------------------------------------

export const BookStatus = {
  Reading:      'Reading',
  Finished:     'Finished',
  WantToRead:   'Want to Read',
  DidNotFinish: 'Did Not Finish',
} as const;

export type BookStatus = typeof BookStatus[keyof typeof BookStatus];

// ---------------------------------------------------------------------------
// ReflectionFields — the subjective, reader-facing fields on a book document.
// Separated from BookMeta to enforce the service boundary at the type level:
// updateBookMeta accepts Partial<BookMeta>, not Partial<Book>.
// ---------------------------------------------------------------------------

export interface ReflectionFields {
  thoughts:   string;
  dnf_reason: string;
  ai_summary: string;
  themes:     string[];
}

// ---------------------------------------------------------------------------
// BookMeta — objective, factual fields about a book.
// Dates are Date | null (not optional): the mapper always provides them,
// defaulting to null. Using undefined as a separate state is not meaningful.
// ---------------------------------------------------------------------------

export interface BookMeta {
  id:            string;
  title:         string;
  author:        string;
  status:        BookStatus;
  date_started:  Date | null;
  date_finished: Date | null;
  rating:        number;
  total_pages:   number;
  pages_read:    number;
  cover_url:     string;
  created_by:    string;
  created_at:    Date;
}

// ---------------------------------------------------------------------------
// Book — the full domain model, composing metadata and reflection fields.
// The resulting shape is structurally identical to the previous flat interface.
// ---------------------------------------------------------------------------

export interface Book extends BookMeta, ReflectionFields {}

// ---------------------------------------------------------------------------
// VocabWord — the read shape for a vocabulary entry.
// book_title is non-optional: the mapper always provides it (defaulting to '').
// ---------------------------------------------------------------------------

export interface VocabWord {
  id:         string;
  word:       string;
  definition: string;
  book_ref:   string;
  book_title: string;
  created_by: string;
  created_at: Date;
}

// ---------------------------------------------------------------------------
// NewDictionaryEntry — the write shape for creating a vocabulary entry.
// Used by dictionaryService.createWord instead of four positional strings.
// ---------------------------------------------------------------------------

export interface NewDictionaryEntry {
  word:       string;
  definition: string;
  book_ref:   string;
  book_title: string;
}

// ---------------------------------------------------------------------------
// User — Firestore user document shape.
// ---------------------------------------------------------------------------

export interface User {
  uid:          string;
  email:        string;
  display_name: string;
  photo_url?:   string;
  created_time: Date;
}

// ---------------------------------------------------------------------------
// GoogleBook — shape of a Google Books API volume result.
// Used in AddBookModal for search results.
// ---------------------------------------------------------------------------

export interface GoogleBook {
  id: string;
  volumeInfo: {
    title:       string;
    authors?:    string[];
    imageLinks?: {
      thumbnail?:      string;
      smallThumbnail?: string;
    };
    pageCount?:   number;
    description?: string;
  };
}
