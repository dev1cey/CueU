import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAllNews } from '../../hooks/useNews';
import { News } from '../../firebase/types';
import { useState } from 'react';

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

export default function NewsTab() {
  const { news, loading, error, refetch } = useAllNews();
  const [selectedNews, setSelectedNews] = useState<News | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const handleNewsPress = (newsItem: News) => {
    setSelectedNews(newsItem);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedNews(null);
  };

  return (
    <SafeAreaView style={styles.container} edges={[]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.logoContainer}>
            <View style={styles.logo}>
              <View style={styles.logoInner} />
            </View>
            <View style={styles.titleContainer}>
              <Text style={styles.headerTitle}>CueU</Text>
              <Text style={styles.headerSubtitle}> - UW Pool Club</Text>
            </View>
          </View>
        </View>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.titleSection}>
          <Text style={styles.pageTitle}>News & Updates</Text>
          <Text style={styles.pageSubtitle}>Stay updated with the latest from the club</Text>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#7C3AED" />
            <Text style={styles.loadingText}>Loading news...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>Error loading news</Text>
            <Text style={styles.errorMessage}>{error.message}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={refetch}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : news.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No news articles yet</Text>
            <Text style={styles.emptySubtext}>Check back later for updates!</Text>
          </View>
        ) : (
          news.map((item) => (
            <TouchableOpacity 
              key={item.id} 
              style={styles.newsCard}
              onPress={() => handleNewsPress(item)}
            >
              <Text style={styles.newsTitle}>{item.title}</Text>
              <View style={styles.newsMeta}>
                <Text style={styles.newsAuthor}>{item.author}</Text>
                <Text style={styles.newsSeparator}>•</Text>
                <Text style={styles.newsDate}>{formatDate(item.publishedDate)}</Text>
              </View>
              <Text style={styles.newsContent} numberOfLines={3}>
                {item.content}
              </Text>
              {item.tags && item.tags.length > 0 && (
                <View style={styles.tagsContainer}>
                  {item.tags.map((tag, index) => (
                    <View key={index} style={styles.tag}>
                      <Text style={styles.tagText}>{tag}</Text>
                    </View>
                  ))}
                </View>
              )}
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      {/* News Detail Modal */}
      <Modal
        animationType="slide"
        transparent={false}
        visible={modalVisible}
        onRequestClose={closeModal}
      >
        <SafeAreaView style={styles.modalContainer} edges={['top']}>
          <View style={styles.modalHeader}>
            <TouchableOpacity style={styles.backButton} onPress={closeModal}>
              <Text style={styles.backButtonText}>← Back</Text>
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalScrollView} contentContainerStyle={styles.modalScrollContent}>
            {selectedNews && (
              <>
                <Text style={styles.modalTitle}>{selectedNews.title}</Text>
                <View style={styles.modalMeta}>
                  <Text style={styles.modalAuthor}>{selectedNews.author}</Text>
                  <Text style={styles.modalSeparator}>•</Text>
                  <Text style={styles.modalDate}>{formatDate(selectedNews.publishedDate)}</Text>
                </View>
                {selectedNews.tags && selectedNews.tags.length > 0 && (
                  <View style={styles.modalTagsContainer}>
                    {selectedNews.tags.map((tag, index) => (
                      <View key={index} style={styles.modalTag}>
                        <Text style={styles.modalTagText}>{tag}</Text>
                      </View>
                    ))}
                  </View>
                )}
                <Text style={styles.modalContentText}>{selectedNews.content}</Text>
              </>
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingTop: 50,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logo: {
    width: 40,
    height: 40,
    backgroundColor: '#FCD34D',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoInner: {
    width: 24,
    height: 24,
    backgroundColor: '#7C3AED',
    borderRadius: 12,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#7C3AED',
  },
  headerSubtitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#7C3AED',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    gap: 16,
  },
  titleSection: {
    marginBottom: 8,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  pageSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  newsCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  newsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  newsMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  newsAuthor: {
    fontSize: 12,
    color: '#7C3AED',
    fontWeight: '600',
  },
  newsSeparator: {
    fontSize: 12,
    color: '#9CA3AF',
    marginHorizontal: 8,
  },
  newsDate: {
    fontSize: 12,
    color: '#6B7280',
  },
  newsContent: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
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
  errorContainer: {
    backgroundColor: '#FEE2E2',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#991B1B',
    marginBottom: 4,
  },
  errorMessage: {
    fontSize: 14,
    color: '#B91C1C',
    textAlign: 'center',
    marginBottom: 12,
  },
  retryButton: {
    backgroundColor: '#7C3AED',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  emptyContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6B7280',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
    gap: 8,
  },
  tag: {
    backgroundColor: '#EDE9FE',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tagText: {
    fontSize: 12,
    color: '#7C3AED',
    fontWeight: '500',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  modalHeader: {
    backgroundColor: '#7C3AED',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(252, 211, 77, 0.3)',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  modalScrollView: {
    flex: 1,
  },
  modalScrollContent: {
    padding: 20,
  },
  modalTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 12,
  },
  modalMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalAuthor: {
    fontSize: 14,
    color: '#7C3AED',
    fontWeight: '600',
  },
  modalSeparator: {
    fontSize: 14,
    color: '#9CA3AF',
    marginHorizontal: 8,
  },
  modalDate: {
    fontSize: 14,
    color: '#6B7280',
  },
  modalTagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
    gap: 8,
  },
  modalTag: {
    backgroundColor: '#EDE9FE',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  modalTagText: {
    fontSize: 12,
    color: '#7C3AED',
    fontWeight: '500',
  },
  modalContentText: {
    fontSize: 16,
    color: '#4B5563',
    lineHeight: 24,
  },
});