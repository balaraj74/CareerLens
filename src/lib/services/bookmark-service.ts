/**
 * Local storage service for bookmarked eBooks
 */

import { Book } from './internet-archive-service';

const BOOKMARKS_KEY = 'careerlens_bookmarked_books';
const SEARCH_HISTORY_KEY = 'careerlens_ebook_search_history';

/**
 * Get all bookmarked books
 */
export function getBookmarkedBooks(): Book[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const stored = localStorage.getItem(BOOKMARKS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error loading bookmarks:', error);
    return [];
  }
}

/**
 * Add book to bookmarks
 */
export function addBookmark(book: Book): void {
  if (typeof window === 'undefined') return;
  
  try {
    const bookmarks = getBookmarkedBooks();
    const exists = bookmarks.some(b => b.id === book.id);
    
    if (!exists) {
      bookmarks.push(book);
      localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(bookmarks));
    }
  } catch (error) {
    console.error('Error adding bookmark:', error);
  }
}

/**
 * Remove book from bookmarks
 */
export function removeBookmark(bookId: string): void {
  if (typeof window === 'undefined') return;
  
  try {
    const bookmarks = getBookmarkedBooks();
    const filtered = bookmarks.filter(b => b.id !== bookId);
    localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Error removing bookmark:', error);
  }
}

/**
 * Check if book is bookmarked
 */
export function isBookmarked(bookId: string): boolean {
  const bookmarks = getBookmarkedBooks();
  return bookmarks.some(b => b.id === bookId);
}

/**
 * Get search history
 */
export function getSearchHistory(): string[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const stored = localStorage.getItem(SEARCH_HISTORY_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error loading search history:', error);
    return [];
  }
}

/**
 * Add search to history
 */
export function addToSearchHistory(query: string): void {
  if (typeof window === 'undefined' || !query.trim()) return;
  
  try {
    const history = getSearchHistory();
    const filtered = history.filter(q => q.toLowerCase() !== query.toLowerCase());
    filtered.unshift(query);
    
    // Keep only last 20 searches
    const trimmed = filtered.slice(0, 20);
    localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(trimmed));
  } catch (error) {
    console.error('Error adding to search history:', error);
  }
}

/**
 * Clear search history
 */
export function clearSearchHistory(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(SEARCH_HISTORY_KEY);
}
