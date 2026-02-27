import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

// ---------------------------------------------------------------------------
// Reflection service — focused write surface for the subjective, reader-facing
// fields on a book document. These fields capture the reading experience rather
// than objective facts about the book itself.
//
// All functions write to the `books` collection. Objective book metadata
// (status, rating, progress, dates) is handled by bookService.ts.
// ---------------------------------------------------------------------------

export async function saveThoughts(id: string, thoughts: string): Promise<void> {
  try {
    await updateDoc(doc(db, 'books', id), { thoughts });
  } catch {
    throw new Error('Failed to save thoughts. Please try again.');
  }
}

export async function saveDnfReason(id: string, reason: string): Promise<void> {
  try {
    await updateDoc(doc(db, 'books', id), { dnf_reason: reason });
  } catch {
    throw new Error('Failed to save reason. Please try again.');
  }
}

export async function saveAiSummary(id: string, summary: string): Promise<void> {
  try {
    await updateDoc(doc(db, 'books', id), { ai_summary: summary });
  } catch {
    throw new Error('Failed to save summary. Please try again.');
  }
}

export async function saveThemes(id: string, themes: string[]): Promise<void> {
  try {
    await updateDoc(doc(db, 'books', id), { themes });
  } catch {
    throw new Error('Failed to save themes. Please try again.');
  }
}
