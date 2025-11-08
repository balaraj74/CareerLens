/**
 * Internet Archive eBooks Service
 * Fetches books from Internet Archive API
 */

export interface Book {
  id: string;
  identifier: string;
  title: string;
  author: string[];
  publishYear: string;
  description: string;
  thumbnail: string;
  directLink: string;
  previewLink?: string;
  format: string[];
  downloads: number;
  language: string[];
  subjects: string[];
  averageRating?: number;
  reviewCount?: number;
}

export interface SearchFilters {
  genre?: string;
  author?: string;
  yearFrom?: number;
  yearTo?: number;
  language?: string;
  format?: string;
  accessType?: 'all' | 'public' | 'borrowing';
}

const ARCHIVE_API_BASE = 'https://archive.org';
const ARCHIVE_SEARCH_API = `${ARCHIVE_API_BASE}/advancedsearch.php`;

/**
 * Search Internet Archive for books
 */
export async function searchBooks(
  query: string,
  filters?: SearchFilters,
  page: number = 1,
  rows: number = 20
): Promise<{ books: Book[]; total: number }> {
  try {
    // Build search query
    let searchQuery = `(${query})`;
    
    // Add mediatype:texts for books
    searchQuery += ' AND mediatype:texts';
    
    // Apply filters
    if (filters?.genre) {
      searchQuery += ` AND subject:"${filters.genre}"`;
    }
    if (filters?.author) {
      searchQuery += ` AND creator:"${filters.author}"`;
    }
    if (filters?.yearFrom || filters?.yearTo) {
      const yearFrom = filters.yearFrom || 1000;
      const yearTo = filters.yearTo || new Date().getFullYear();
      searchQuery += ` AND year:[${yearFrom} TO ${yearTo}]`;
    }
    if (filters?.language) {
      searchQuery += ` AND language:"${filters.language}"`;
    }
    if (filters?.format) {
      searchQuery += ` AND format:"${filters.format}"`;
    }

    // Build API URL
    const params = new URLSearchParams({
      q: searchQuery,
      fl: 'identifier,title,creator,year,description,downloads,language,subject,format',
      rows: rows.toString(),
      page: page.toString(),
      output: 'json',
      sort: 'downloads desc'
    });

    const url = `${ARCHIVE_SEARCH_API}?${params}`;
    console.log('Fetching from Internet Archive:', url);

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Archive API error: ${response.status}`);
    }

    const data = await response.json();
    const docs = data.response?.docs || [];
    const total = data.response?.numFound || 0;

    // Parse and format books
    const books: Book[] = docs.map((doc: any) => ({
      id: doc.identifier,
      identifier: doc.identifier,
      title: doc.title || 'Untitled',
      author: Array.isArray(doc.creator) ? doc.creator : [doc.creator || 'Unknown Author'],
      publishYear: doc.year || 'Unknown',
      description: doc.description || 'No description available.',
      thumbnail: `${ARCHIVE_API_BASE}/services/img/${doc.identifier}`,
      directLink: `${ARCHIVE_API_BASE}/details/${doc.identifier}`,
      previewLink: `${ARCHIVE_API_BASE}/embed/${doc.identifier}`,
      format: Array.isArray(doc.format) ? doc.format : [doc.format || 'PDF'],
      downloads: doc.downloads || 0,
      language: Array.isArray(doc.language) ? doc.language : [doc.language || 'English'],
      subjects: Array.isArray(doc.subject) ? doc.subject : [doc.subject || 'General'],
    }));

    console.log(`Found ${books.length} books out of ${total} total`);
    return { books, total };
  } catch (error) {
    console.error('Error searching Internet Archive:', error);
    throw error;
  }
}

/**
 * Get book details by identifier
 */
export async function getBookDetails(identifier: string): Promise<Book | null> {
  try {
    const metadataUrl = `${ARCHIVE_API_BASE}/metadata/${identifier}`;
    const response = await fetch(metadataUrl);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch book details: ${response.status}`);
    }

    const data = await response.json();
    const metadata = data.metadata;

    const book: Book = {
      id: identifier,
      identifier,
      title: metadata.title || 'Untitled',
      author: Array.isArray(metadata.creator) ? metadata.creator : [metadata.creator || 'Unknown'],
      publishYear: metadata.year || metadata.date || 'Unknown',
      description: metadata.description || 'No description available.',
      thumbnail: `${ARCHIVE_API_BASE}/services/img/${identifier}`,
      directLink: `${ARCHIVE_API_BASE}/details/${identifier}`,
      previewLink: `${ARCHIVE_API_BASE}/embed/${identifier}`,
      format: Array.isArray(metadata.format) ? metadata.format : [metadata.format || 'PDF'],
      downloads: metadata.downloads || 0,
      language: Array.isArray(metadata.language) ? metadata.language : [metadata.language || 'English'],
      subjects: Array.isArray(metadata.subject) ? metadata.subject : [metadata.subject || 'General'],
    };

    return book;
  } catch (error) {
    console.error('Error fetching book details:', error);
    return null;
  }
}

/**
 * Get popular/recommended books
 */
export async function getPopularBooks(category?: string): Promise<Book[]> {
  const query = category || 'engineering OR programming OR mathematics OR science';
  const { books } = await searchBooks(query, undefined, 1, 12);
  return books;
}

/**
 * Get AI-powered recommendations based on user's search history
 */
export async function getRecommendations(searchHistory: string[]): Promise<Book[]> {
  if (searchHistory.length === 0) {
    return getPopularBooks();
  }

  // Use last 3 searches to generate recommendations
  const recentSearches = searchHistory.slice(-3).join(' OR ');
  const { books } = await searchBooks(recentSearches, undefined, 1, 10);
  return books;
}

/**
 * Get trending genres/subjects
 */
export const POPULAR_GENRES = [
  'Computer Science',
  'Engineering',
  'Mathematics',
  'Physics',
  'Chemistry',
  'Biology',
  'Business',
  'Economics',
  'Psychology',
  'Philosophy',
  'History',
  'Literature',
  'Programming',
  'Data Science',
  'Artificial Intelligence'
];

/**
 * Get available languages
 */
export const LANGUAGES = [
  'English',
  'Hindi',
  'Spanish',
  'French',
  'German',
  'Chinese',
  'Japanese',
  'Russian',
  'Arabic',
  'Portuguese'
];

/**
 * Get available formats
 */
export const FORMATS = [
  'PDF',
  'ePub',
  'Text',
  'Kindle',
  'MOBI',
  'DAISY'
];
