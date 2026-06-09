import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import GlassCard from '../../src/components/GlassCard';
import { COLORS, GRADIENTS } from '../../src/theme/colors';


interface Book {
  id: string;
  title: string;
  author: string;
  genre: string;
  year: string;
  link: string;
  progress: number; // 0 - 100
  bookmarked?: boolean;
}

export default function EBookLibrary() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('All');
  const mockBooks: Book[] = [
    {
      id: 'book1',
      title: 'Clean Code: A Handbook of Agile Software Craftsmanship',
      author: 'Robert C. Martin',
      genre: 'Software Eng',
      year: '2008',
      link: 'https://archive.org/details/cleancodehandboo0000mart',
      progress: 42,
    },
    {
      id: 'book2',
      title: 'Design Patterns: Elements of Reusable Object-Oriented Software',
      author: 'Erich Gamma, Richard Helm',
      genre: 'Architecture',
      year: '1994',
      link: 'https://archive.org/details/designpatternsel00gamm',
      progress: 15,
    },
    {
      id: 'book3',
      title: 'Introduction to Algorithms',
      author: 'Thomas H. Cormen',
      genre: 'Algorithms',
      year: '2009',
      link: 'https://archive.org/details/introductiontoal00corm',
      progress: 0,
    },
  ];

  const genres = ['All', 'Software Eng', 'Architecture', 'Algorithms'];

  const [books, setBooks] = useState<Book[]>(mockBooks);
  const [isLoading, setIsLoading] = useState(false);

  const fetchBooks = async () => {
    setIsLoading(true);
    try {
      const genreQ = selectedGenre !== 'All' ? `+subject:${selectedGenre}` : '';
      const searchQ = searchQuery.trim() || 'software engineering programming';
      const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(searchQ)}${genreQ}&filter=free-ebooks&maxResults=12&printType=books&orderBy=relevance`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.items && data.items.length > 0) {
        const mapped: Book[] = data.items.map((item: any) => ({
          id: item.id,
          title: item.volumeInfo?.title || 'Unknown Title',
          author: item.volumeInfo?.authors?.join(', ') || 'Unknown Author',
          genre: item.volumeInfo?.categories?.[0] || selectedGenre,
          year: item.volumeInfo?.publishedDate?.slice(0, 4) || '—',
          link: item.accessInfo?.webReaderLink || item.volumeInfo?.infoLink || `https://play.google.com/store/books/details?id=${item.id}`,
          progress: 0,
        }));
        setBooks(mapped);
      } else {
        setBooks(mockBooks);
      }
    } catch (e) {
      console.error('[eBooks] Google Books API error:', e);
      setBooks(mockBooks);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchBooks();
    }, 600);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, selectedGenre]);


  const toggleBookmark = (id: string) => {
    setBooks(prev => prev.map(b => b.id === id ? { ...b, bookmarked: !b.bookmarked } : b));
  };

  const filteredBooks = books;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <LinearGradient
          colors={GRADIENTS.screenLight as any}
          style={StyleSheet.absoluteFill}
        />

        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={COLORS.secondary[500]} />
          </TouchableOpacity>
          <Text style={styles.title}>eBook Library</Text>
          <Text style={styles.subtitle}>Browse digital textbooks indexed from the Internet Archive</Text>
        </View>

        {/* SEARCH BAR */}
        <View style={styles.searchRow}>
          <Ionicons name="search" size={20} color={COLORS.text.muted} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by book title or author..."
            placeholderTextColor={COLORS.text.faint}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* GENRE HORIZONTAL FILTER */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.genreScroll}>
          {genres.map((g) => {
            const isSelected = selectedGenre === g;
            return (
              <TouchableOpacity
                key={g}
                style={[styles.genreBtn, isSelected && styles.genreBtnSelected]}
                onPress={() => setSelectedGenre(g)}
              >
                <Text style={[styles.genreBtnText, isSelected && styles.genreBtnTextSelected]}>{g}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* EBOOKS LIST */}
        <Text style={styles.sectionHeader}>Indexed Digital Texts</Text>
        <View style={styles.booksContainer}>
          {filteredBooks.map((book) => (
            <GlassCard key={book.id} style={styles.bookCard}>
              <View style={styles.cardHeader}>
                <View style={styles.genreBadge}>
                  <Text style={styles.genreBadgeText}>{book.genre}</Text>
                </View>
                <TouchableOpacity onPress={() => toggleBookmark(book.id)}>
                  <Ionicons
                    name={book.bookmarked ? 'bookmark' : 'bookmark-outline'}
                    size={18}
                    color={COLORS.secondary[500]}
                  />
                </TouchableOpacity>
              </View>

              <Text style={styles.bookTitle}>{book.title}</Text>
              <Text style={styles.bookAuthor}>By {book.author} • {book.year}</Text>

              {/* Progress Bar for reading */}
              <View style={styles.progressRow}>
                <Text style={styles.progressLabel}>Reading Progress</Text>
                <Text style={styles.progressVal}>{book.progress}%</Text>
              </View>
              <View style={styles.progressBarBg}>
                <View style={[styles.progressBarFill, { width: `${book.progress}%` }]} />
              </View>

              <TouchableOpacity style={styles.readBtn} onPress={() => Linking.openURL(book.link)}>
                <Text style={styles.readBtnText}>Read on Archive.org</Text>
                <Ionicons name="book-outline" size={14} color={COLORS.bg.base} />
              </TouchableOpacity>
            </GlassCard>
          ))}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.bg.base,
  },
  scrollContainer: {
    padding: 20,
    paddingTop: 40,
  },
  header: {
    marginBottom: 20,
  },
  backBtn: {
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    color: COLORS.text.primary,
    fontFamily: 'System',
  },
  subtitle: {
    fontSize: 13,
    color: COLORS.primary[500],
    marginTop: 4,
    fontWeight: '500',
    fontFamily: 'System',
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.secondary[200],
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.secondary[200],
    paddingHorizontal: 12,
    height: 48,
    marginBottom: 16,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: COLORS.text.primary,
    fontSize: 13,
    fontFamily: 'System',
  },
  genreScroll: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  genreBtn: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.secondary[200],
    backgroundColor: COLORS.secondary[200],
    marginRight: 8,
  },
  genreBtnSelected: {
    borderColor: COLORS.secondary[500],
    backgroundColor: 'rgba(0, 229, 255, 0.1)',
  },
  genreBtnText: {
    color: COLORS.text.muted,
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'System',
  },
  genreBtnTextSelected: {
    color: COLORS.secondary[500],
  },
  sectionHeader: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.text.primary,
    marginBottom: 12,
    fontFamily: 'System',
  },
  booksContainer: {
    gap: 12,
  },
  bookCard: {
    padding: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  genreBadge: {
    backgroundColor: 'rgba(0, 229, 255, 0.15)',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  genreBadgeText: {
    color: COLORS.secondary[500],
    fontSize: 10,
    fontWeight: 'bold',
    fontFamily: 'System',
  },
  bookTitle: {
    color: COLORS.text.primary,
    fontSize: 14,
    fontWeight: '800',
    marginVertical: 8,
    fontFamily: 'System',
  },
  bookAuthor: {
    color: COLORS.text.muted,
    fontSize: 11,
    marginBottom: 12,
    fontFamily: 'System',
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  progressLabel: {
    color: COLORS.text.muted,
    fontSize: 10,
    fontFamily: 'System',
  },
  progressVal: {
    color: COLORS.emerald[500],
    fontSize: 10,
    fontWeight: 'bold',
    fontFamily: 'System',
  },
  progressBarBg: {
    height: 4,
    backgroundColor: COLORS.secondary[200],
    borderRadius: 2,
    marginBottom: 16,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: COLORS.emerald[500],
    borderRadius: 2,
  },
  readBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.secondary[500],
    borderRadius: 12,
    height: 38,
    gap: 6,
  },
  readBtnText: {
    color: COLORS.bg.base,
    fontSize: 12,
    fontWeight: '800',
    fontFamily: 'System',
  },
});
