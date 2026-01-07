import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { useState, useEffect } from 'react';
import { News } from '../firebase/types';
import { getNewsById } from '../firebase/services/newsService';

// Helper function to format Firestore Timestamp to readable date string
const formatDate = (timestamp: any): string => {
  if (!timestamp) return '';
  const date = timestamp.toDate();
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
};

export default function NewsDetails() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { newsId } = useLocalSearchParams<{ newsId: string }>();
  
  const [news, setNews] = useState<News | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadNewsDetails = async () => {
      if (!newsId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const newsData = await getNewsById(newsId);
        if (!newsData) {
          router.back();
          return;
        }
        setNews(newsData);
      } catch (error) {
        console.error('Error loading news details:', error);
        router.back();
      } finally {
        setLoading(false);
      }
    };

    loadNewsDetails();
  }, [newsId]);

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={[styles.safeArea, { height: insets.top }]} />
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ChevronLeft color="#1F2937" size={24} />
          </TouchableOpacity>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#7C3AED" />
          <Text style={styles.loadingText}>Loading article...</Text>
        </View>
      </View>
    );
  }

  if (!news) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={[styles.safeArea, { height: insets.top }]} />
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ChevronLeft color="#1F2937" size={24} />
        </TouchableOpacity>
      </View>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>{news.title}</Text>
        <View style={styles.meta}>
          <Text style={styles.author}>{news.author}</Text>
          <Text style={styles.separator}>•</Text>
          <Text style={styles.date}>{formatDate(news.publishedDate)}</Text>
        </View>
        {news.tags && news.tags.length > 0 && (
          <View style={styles.tagsContainer}>
            {news.tags.map((tag, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        )}
        <Text style={styles.content}>{news.content}</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  safeArea: {
    backgroundColor: 'white',
  },
  header: {
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 4,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6B7280',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 12,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  author: {
    fontSize: 14,
    color: '#7C3AED',
    fontWeight: '600',
  },
  separator: {
    fontSize: 14,
    color: '#9CA3AF',
    marginHorizontal: 8,
  },
  date: {
    fontSize: 14,
    color: '#6B7280',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
    gap: 8,
  },
  tag: {
    backgroundColor: '#EDE9FE',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  tagText: {
    fontSize: 12,
    color: '#7C3AED',
    fontWeight: '500',
  },
  content: {
    fontSize: 16,
    color: '#4B5563',
    lineHeight: 24,
  },
});

