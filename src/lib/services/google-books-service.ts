/**
 * Google Books API Service
 * Fetches books from Google Books API
 */

export interface GoogleBook {
  id: string;
  title: string;
  authors: string[];
  publisher?: string;
  publishedDate?: string;
  description?: string;
  pageCount?: number;
  categories?: string[];
  averageRating?: number;
  ratingsCount?: number;
  thumbnail?: string;
  previewLink?: string;
  infoLink?: string;
  language?: string;
  isEbook?: boolean;
  webReaderLink?: string;
  accessViewStatus?: string;
  price?: {
    amount: number;
    currencyCode: string;
  };
}

export interface GoogleBooksSearchFilters {
  subject?: string;
  author?: string;
  publisher?: string;
  isbn?: string;
  orderBy?: 'relevance' | 'newest';
  printType?: 'all' | 'books' | 'magazines';
  filter?: 'partial' | 'full' | 'free-ebooks' | 'paid-ebooks' | 'ebooks';
  langRestrict?: string;
}

const GOOGLE_BOOKS_API_BASE = 'https://www.googleapis.com/books/v1';

/**
 * Search Google Books
 */
export async function searchGoogleBooks(
  query: string,
  filters?: GoogleBooksSearchFilters,
  startIndex: number = 0,
  maxResults: number = 20
): Promise<{ books: GoogleBook[]; totalItems: number }> {
  try {
    // Build search query
    let searchQuery = query;

    // Add filters to query
    if (filters?.subject) {
      searchQuery += `+subject:${filters.subject}`;
    }
    if (filters?.author) {
      searchQuery += `+inauthor:${filters.author}`;
    }
    if (filters?.publisher) {
      searchQuery += `+inpublisher:${filters.publisher}`;
    }
    if (filters?.isbn) {
      searchQuery += `+isbn:${filters.isbn}`;
    }

    // Build API URL
    const params = new URLSearchParams({
      q: searchQuery,
      startIndex: startIndex.toString(),
      maxResults: maxResults.toString(),
      printType: filters?.printType || 'books',
      orderBy: filters?.orderBy || 'relevance',
    });

    if (filters?.filter) {
      params.append('filter', filters.filter);
    }
    if (filters?.langRestrict) {
      params.append('langRestrict', filters.langRestrict);
    }

    const url = `${GOOGLE_BOOKS_API_BASE}/volumes?${params}`;
    console.log('Fetching from Google Books:', url);

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Google Books API error: ${response.status}`);
    }

    const data = await response.json();
    const items = data.items || [];
    const totalItems = data.totalItems || 0;

    // Parse and format books
    const books: GoogleBook[] = items.map((item: any) => {
      const volumeInfo = item.volumeInfo || {};
      const saleInfo = item.saleInfo || {};
      const accessInfo = item.accessInfo || {};

      return {
        id: item.id,
        title: volumeInfo.title || 'Untitled',
        authors: volumeInfo.authors || ['Unknown Author'],
        publisher: volumeInfo.publisher,
        publishedDate: volumeInfo.publishedDate,
        description: volumeInfo.description || 'No description available.',
        pageCount: volumeInfo.pageCount,
        categories: volumeInfo.categories || [],
        averageRating: volumeInfo.averageRating,
        ratingsCount: volumeInfo.ratingsCount,
        thumbnail: volumeInfo.imageLinks?.thumbnail?.replace('http:', 'https:') || 
                   volumeInfo.imageLinks?.smallThumbnail?.replace('http:', 'https:'),
        previewLink: volumeInfo.previewLink,
        infoLink: volumeInfo.infoLink,
        language: volumeInfo.language || 'en',
        isEbook: accessInfo.epub?.isAvailable || accessInfo.pdf?.isAvailable,
        webReaderLink: accessInfo.webReaderLink,
        accessViewStatus: accessInfo.accessViewStatus,
        price: saleInfo.listPrice ? {
          amount: saleInfo.listPrice.amount,
          currencyCode: saleInfo.listPrice.currencyCode
        } : undefined,
      };
    });

    console.log(`Found ${books.length} books out of ${totalItems} total`);
    return { books, totalItems };
  } catch (error) {
    console.error('Error searching Google Books:', error);
    throw error;
  }
}

/**
 * Get book details by Google Books ID
 */
export async function getGoogleBookDetails(bookId: string): Promise<GoogleBook | null> {
  try {
    const url = `${GOOGLE_BOOKS_API_BASE}/volumes/${bookId}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to fetch book details: ${response.status}`);
    }

    const item = await response.json();
    const volumeInfo = item.volumeInfo || {};
    const saleInfo = item.saleInfo || {};
    const accessInfo = item.accessInfo || {};

    const book: GoogleBook = {
      id: item.id,
      title: volumeInfo.title || 'Untitled',
      authors: volumeInfo.authors || ['Unknown Author'],
      publisher: volumeInfo.publisher,
      publishedDate: volumeInfo.publishedDate,
      description: volumeInfo.description || 'No description available.',
      pageCount: volumeInfo.pageCount,
      categories: volumeInfo.categories || [],
      averageRating: volumeInfo.averageRating,
      ratingsCount: volumeInfo.ratingsCount,
      thumbnail: volumeInfo.imageLinks?.thumbnail?.replace('http:', 'https:') || 
                 volumeInfo.imageLinks?.smallThumbnail?.replace('http:', 'https:'),
      previewLink: volumeInfo.previewLink,
      infoLink: volumeInfo.infoLink,
      language: volumeInfo.language || 'en',
      isEbook: accessInfo.epub?.isAvailable || accessInfo.pdf?.isAvailable,
      webReaderLink: accessInfo.webReaderLink,
      accessViewStatus: accessInfo.accessViewStatus,
      price: saleInfo.listPrice ? {
        amount: saleInfo.listPrice.amount,
        currencyCode: saleInfo.listPrice.currencyCode
      } : undefined,
    };

    return book;
  } catch (error) {
    console.error('Error fetching Google Book details:', error);
    return null;
  }
}

/**
 * Get trending/popular books from Google Books
 */
export async function getPopularGoogleBooks(subject?: string): Promise<GoogleBook[]> {
  const query = subject || 'engineering programming mathematics science';
  const { books } = await searchGoogleBooks(
    query,
    { 
      orderBy: 'newest',
      filter: 'free-ebooks' // Only free ebooks
    },
    0,
    12
  );
  return books;
}

/**
 * Get free ebooks only
 */
export async function getFreeEbooks(query: string, startIndex: number = 0): Promise<{ books: GoogleBook[]; totalItems: number }> {
  return searchGoogleBooks(
    query,
    { filter: 'free-ebooks' },
    startIndex,
    20
  );
}

/**
 * Get books by category
 */
export async function getBooksByCategory(category: string, startIndex: number = 0): Promise<{ books: GoogleBook[]; totalItems: number }> {
  return searchGoogleBooks(
    '',
    { 
      subject: category,
      filter: 'free-ebooks',
      orderBy: 'relevance'
    },
    startIndex,
    20
  );
}

/**
 * Popular subjects/categories for Google Books
 */
export const GOOGLE_BOOKS_CATEGORIES = [
  'Computer Science',
  'Programming',
  'Mathematics',
  'Physics',
  'Engineering',
  'Data Science',
  'Machine Learning',
  'Artificial Intelligence',
  'Web Development',
  'Mobile Development',
  'Cybersecurity',
  'Cloud Computing',
  'Business',
  'Finance',
  'Marketing',
  'Psychology',
  'Philosophy',
  'History',
  'Literature',
  'Science',
];

/**
 * Language codes for Google Books
 */
export const GOOGLE_BOOKS_LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'it', name: 'Italian' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'ru', name: 'Russian' },
  { code: 'zh', name: 'Chinese' },
  { code: 'ja', name: 'Japanese' },
  { code: 'hi', name: 'Hindi' },
];
