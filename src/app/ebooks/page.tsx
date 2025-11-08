'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  BookOpen, 
  Download, 
  Bookmark, 
  BookmarkCheck,
  Filter,
  Star,
  Eye,
  ExternalLink,
  TrendingUp,
  History,
  X
} from 'lucide-react';
import { 
  searchBooks, 
  getPopularBooks, 
  getRecommendations,
  POPULAR_GENRES,
  LANGUAGES,
  FORMATS,
  type Book,
  type SearchFilters 
} from '@/lib/services/internet-archive-service';
import {
  getBookmarkedBooks,
  addBookmark,
  removeBookmark,
  isBookmarked as checkIsBookmarked,
  getSearchHistory,
  addToSearchHistory
} from '@/lib/services/bookmark-service';

export default function EBooksPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({});
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [bookmarkedBooks, setBookmarkedBooks] = useState<Book[]>([]);
  const [recommendations, setRecommendations] = useState<Book[]>([]);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'search' | 'bookmarks' | 'trending'>('search');

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      const [popular, history] = await Promise.all([
        getPopularBooks(),
        Promise.resolve(getSearchHistory())
      ]);
      
      setBooks(popular);
      setSearchHistory(history);
      setBookmarkedBooks(getBookmarkedBooks());
      
      if (history.length > 0) {
        const recs = await getRecommendations(history);
        setRecommendations(recs);
      }
    } catch (error) {
      console.error('Error loading initial data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    setActiveTab('search');
    
    try {
      addToSearchHistory(searchQuery);
      setSearchHistory(getSearchHistory());
      
      const { books: results, total } = await searchBooks(searchQuery, filters, currentPage);
      setBooks(results);
      setTotalResults(total);
    } catch (error) {
      console.error('Error searching books:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBookmark = (book: Book) => {
    if (checkIsBookmarked(book.id)) {
      removeBookmark(book.id);
    } else {
      addBookmark(book);
    }
    setBookmarkedBooks(getBookmarkedBooks());
  };

  const displayBooks = activeTab === 'bookmarks' ? bookmarkedBooks : books;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <div className="flex items-center justify-center gap-3">
            <BookOpen className="w-12 h-12 text-purple-400" />
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              eBooks Library
            </h1>
          </div>
          <p className="text-gray-400 text-lg">
            Search millions of free books from Internet Archive
          </p>
        </motion.div>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="relative"
        >
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Enter book title, author, or keyword..."
                className="w-full pl-12 pr-4 py-4 bg-white/10 border border-purple-500/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
              />
            </div>
            <button
              onClick={handleSearch}
              disabled={loading}
              className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 rounded-xl font-semibold transition-all"
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-6 py-4 rounded-xl font-semibold transition-all ${
                showFilters
                  ? 'bg-purple-600 text-white'
                  : 'bg-white/10 border border-purple-500/30 hover:bg-white/20'
              }`}
            >
              <Filter className="w-5 h-5" />
            </button>
          </div>

          {/* Search History */}
          {searchHistory.length > 0 && !searchQuery && (
            <div className="mt-2 flex flex-wrap gap-2">
              {searchHistory.slice(0, 5).map((query, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setSearchQuery(query);
                    setTimeout(handleSearch, 100);
                  }}
                  className="px-3 py-1 text-sm bg-white/5 border border-purple-500/20 rounded-full text-gray-300 hover:bg-white/10 transition-all flex items-center gap-1"
                >
                  <History className="w-3 h-3" />
                  {query}
                </button>
              ))}
            </div>
          )}
        </motion.div>

        {/* Filters Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-white/5 border border-purple-500/20 rounded-xl p-6 space-y-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Filter className="w-5 h-5" />
                  Filters
                </h3>
                <button
                  onClick={() => {
                    setFilters({});
                    setShowFilters(false);
                  }}
                  className="text-sm text-purple-400 hover:text-purple-300"
                >
                  Clear All
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Genre */}
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Genre</label>
                  <select
                    value={filters.genre || ''}
                    onChange={(e) => setFilters({ ...filters, genre: e.target.value || undefined })}
                    className="w-full px-4 py-2 bg-white/10 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="">All Genres</option>
                    {POPULAR_GENRES.map((genre) => (
                      <option key={genre} value={genre}>{genre}</option>
                    ))}
                  </select>
                </div>

                {/* Language */}
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Language</label>
                  <select
                    value={filters.language || ''}
                    onChange={(e) => setFilters({ ...filters, language: e.target.value || undefined })}
                    className="w-full px-4 py-2 bg-white/10 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="">All Languages</option>
                    {LANGUAGES.map((lang) => (
                      <option key={lang} value={lang}>{lang}</option>
                    ))}
                  </select>
                </div>

                {/* Format */}
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Format</label>
                  <select
                    value={filters.format || ''}
                    onChange={(e) => setFilters({ ...filters, format: e.target.value || undefined })}
                    className="w-full px-4 py-2 bg-white/10 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="">All Formats</option>
                    {FORMATS.map((format) => (
                      <option key={format} value={format}>{format}</option>
                    ))}
                  </select>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tabs */}
        <div className="flex gap-4 border-b border-purple-500/20">
          <button
            onClick={() => setActiveTab('search')}
            className={`px-4 py-2 font-semibold transition-all ${
              activeTab === 'search'
                ? 'text-purple-400 border-b-2 border-purple-400'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Search className="w-4 h-4 inline mr-2" />
            Search Results ({totalResults || books.length})
          </button>
          <button
            onClick={() => setActiveTab('bookmarks')}
            className={`px-4 py-2 font-semibold transition-all ${
              activeTab === 'bookmarks'
                ? 'text-purple-400 border-b-2 border-purple-400'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Bookmark className="w-4 h-4 inline mr-2" />
            Bookmarks ({bookmarkedBooks.length})
          </button>
          <button
            onClick={() => {
              setActiveTab('trending');
              loadInitialData();
            }}
            className={`px-4 py-2 font-semibold transition-all ${
              activeTab === 'trending'
                ? 'text-purple-400 border-b-2 border-purple-400'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <TrendingUp className="w-4 h-4 inline mr-2" />
            Trending
          </button>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent"></div>
          </div>
        )}

        {/* Books Grid */}
        {!loading && displayBooks.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {displayBooks.map((book, idx) => (
              <BookCard
                key={book.id}
                book={book}
                isBookmarked={checkIsBookmarked(book.id)}
                onBookmark={() => handleBookmark(book)}
                delay={idx * 0.05}
              />
            ))}
          </motion.div>
        )}

        {/* Empty State */}
        {!loading && displayBooks.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <BookOpen className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg">
              {activeTab === 'bookmarks' 
                ? 'No bookmarked books yet. Start exploring!' 
                : 'No books found. Try a different search.'}
            </p>
          </div>
        )}

        {/* Recommendations */}
        {recommendations.length > 0 && activeTab === 'search' && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <Star className="w-6 h-6 text-yellow-400" />
              Recommended for You
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {recommendations.slice(0, 6).map((book) => (
                <div
                  key={book.id}
                  className="bg-white/5 border border-purple-500/20 rounded-lg p-3 hover:bg-white/10 transition-all cursor-pointer"
                  onClick={() => window.open(book.directLink, '_blank')}
                >
                  <img
                    src={book.thumbnail}
                    alt={book.title}
                    className="w-full h-32 object-cover rounded mb-2"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/placeholder-book.png';
                    }}
                  />
                  <p className="text-sm text-white font-semibold line-clamp-2">
                    {book.title}
                  </p>
                  <p className="text-xs text-gray-400 line-clamp-1">
                    {book.author[0]}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Book Card Component
function BookCard({ 
  book, 
  isBookmarked, 
  onBookmark, 
  delay 
}: { 
  book: Book; 
  isBookmarked: boolean; 
  onBookmark: () => void; 
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-white/5 border border-purple-500/20 rounded-xl overflow-hidden hover:border-purple-500/50 transition-all group"
    >
      {/* Book Cover */}
      <div className="relative h-64 bg-gradient-to-br from-purple-900/20 to-pink-900/20">
        <img
          src={book.thumbnail}
          alt={book.title}
          className="w-full h-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/placeholder-book.png';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
          <div className="flex gap-2">
            <a
              href={book.directLink}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm font-semibold flex items-center gap-1"
            >
              <Eye className="w-4 h-4" />
              View
            </a>
            <a
              href={book.previewLink}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-2 bg-pink-600 hover:bg-pink-700 rounded-lg text-sm font-semibold flex items-center gap-1"
            >
              <ExternalLink className="w-4 h-4" />
              Preview
            </a>
          </div>
        </div>
        <button
          onClick={onBookmark}
          className="absolute top-2 right-2 p-2 bg-black/50 backdrop-blur-sm rounded-full hover:bg-black/70 transition-all"
        >
          {isBookmarked ? (
            <BookmarkCheck className="w-5 h-5 text-yellow-400" />
          ) : (
            <Bookmark className="w-5 h-5 text-white" />
          )}
        </button>
      </div>

      {/* Book Info */}
      <div className="p-4 space-y-2">
        <h3 className="text-white font-bold line-clamp-2 text-lg">
          {book.title}
        </h3>
        <p className="text-purple-400 text-sm line-clamp-1">
          {book.author.join(', ')}
        </p>
        <p className="text-gray-400 text-sm line-clamp-2">
          {book.description}
        </p>

        {/* Metadata */}
        <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-white/10">
          <span className="flex items-center gap-1">
            <Download className="w-3 h-3" />
            {book.downloads.toLocaleString()}
          </span>
          <span>{book.publishYear}</span>
          <span className="px-2 py-1 bg-purple-500/20 rounded">
            {book.format[0]}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
