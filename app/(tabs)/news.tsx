import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface NewsItem {
  id: string;
  title: string;
  date: string;
  author: string;
  content: string;
}

export default function NewsTab() {
  const newsItems: NewsItem[] = [
    {
      id: '1',
      title: 'Winter Tournament Registration Open!',
      date: 'Dec 20, 2024',
      author: 'UW Pool Club',
      content: 'Register now for our annual Winter Tournament. Open to all skill levels with handicap adjustments. Prizes for top 3 finishers!',
    },
    {
      id: '2',
      title: 'New Practice Hours at HUB',
      date: 'Dec 18, 2024',
      author: 'UW Pool Club',
      content: 'The HUB Games Area has extended hours for pool practice. Now open Monday-Friday 8am-10pm and weekends 10am-8pm.',
    },
    {
      id: '3',
      title: 'Congratulations to Our Fall Champions',
      date: 'Dec 15, 2024',
      author: 'UW Pool Club',
      content: 'Huge congratulations to Friday Mufasa for winning the Fall 2024 league! Great season everyone!',
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.logoContainer}>
            <View style={styles.logo}>
              <View style={styles.logoInner} />
            </View>
            <View>
              <Text style={styles.headerTitle}>CueU</Text>
              <Text style={styles.headerSubtitle}>UW Pool Club</Text>
            </View>
          </View>
        </View>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.titleSection}>
          <Text style={styles.pageTitle}>News & Updates</Text>
          <Text style={styles.pageSubtitle}>Stay updated with the latest from the club</Text>
        </View>

        {newsItems.map((item) => (
          <TouchableOpacity key={item.id} style={styles.newsCard}>
            <Text style={styles.newsTitle}>{item.title}</Text>
            <View style={styles.newsMeta}>
              <Text style={styles.newsAuthor}>{item.author}</Text>
              <Text style={styles.newsSeparator}>•</Text>
              <Text style={styles.newsDate}>{item.date}</Text>
            </View>
            <Text style={styles.newsContent}>{item.content}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    backgroundColor: '#7C3AED',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(252, 211, 77, 0.3)',
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
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#FCD34D',
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
});