import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme';

interface NewsArticle {
  id: string;
  title: string;
  date: string;
  author: string;
  excerpt: string;
  category: 'club' | 'industry';
  source?: string;
  link?: string;
}

export function NewsScreen() {
  const [activeFilter, setActiveFilter] = useState<'all' | 'club' | 'industry'>('all');

  const clubNews: NewsArticle[] = [
    {
      id: '1',
      title: '2026 UW Pool Championship Registration Open',
      date: '12/9/25',
      author: 'Alex Johnson, President',
      excerpt: 'Registration is now OPEN for the 2026 UW Pool Championship Qualifier. Don\'t miss your chance to compete for the title!',
      category: 'club',
    },
    {
      id: '2',
      title: 'Holiday Tournament & Party',
      date: '12/15/25',
      author: 'Sarah Chen, Events Coordinator',
      excerpt: 'Ho ho ho! Join us for a festive holiday party pool tournament at HUB Games Area. Prizes, snacks, and fun for all skill levels!',
      category: 'club',
    },
    {
      id: '3',
      title: 'New Season Starting in 2026',
      date: '12/3/25',
      author: 'Michael Torres, League Director',
      excerpt: 'Hi Everyone! As we wrap up another great year and prepare for 2026, we\'re excited to announce our new season schedule and format changes.',
      category: 'club',
    },
    {
      id: '4',
      title: 'Beginner Workshop Series Announcement',
      date: '11/28/25',
      author: 'Jennifer Park, Training Lead',
      excerpt: 'New to pool? We\'re launching a beginner workshop series starting in January. Learn fundamentals from our experienced players!',
      category: 'club',
    },
  ];

  const industryNews: NewsArticle[] = [
    {
      id: '5',
      title: 'Shane Van Boening Wins 2024 U.S. Open',
      date: '12/20/25',
      author: 'OxBilliards',
      excerpt: 'The "South Dakota Kid" claims his sixth U.S. Open 9-Ball Championship title in Atlantic City, defeating Jayson Shaw in the finals.',
      category: 'industry',
      source: 'OxBilliards.com',
      link: 'https://www.oxbilliards.com/news-blog',
    },
    {
      id: '6',
      title: 'New Carbon Fiber Cue Technology Released',
      date: '12/18/25',
      author: 'OxBilliards',
      excerpt: 'Predator announces breakthrough carbon fiber shaft design promising unprecedented accuracy and reduced deflection.',
      category: 'industry',
      source: 'OxBilliards.com',
      link: 'https://www.oxbilliards.com/news-blog',
    },
    {
      id: '7',
      title: 'Mosconi Cup Returns to Las Vegas',
      date: '12/10/25',
      author: 'OxBilliards',
      excerpt: 'The prestigious team event returns to Las Vegas for 2026, featuring Team USA vs Team Europe in the annual pool showdown.',
      category: 'industry',
      source: 'OxBilliards.com',
      link: 'https://www.oxbilliards.com/news-blog',
    },
    {
      id: '8',
      title: 'APA National Championships Preview',
      date: '12/5/25',
      author: 'OxBilliards',
      excerpt: 'Over 650 teams are set to compete in the 2026 APA National Team Championships in Las Vegas this summer.',
      category: 'industry',
      source: 'OxBilliards.com',
      link: 'https://www.oxbilliards.com/news-blog',
    },
  ];

  const allNews = [...clubNews, ...industryNews].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const getFilteredNews = () => {
    if (activeFilter === 'club') return clubNews;
    if (activeFilter === 'industry') return industryNews;
    return allNews;
  };

  const filteredNews = getFilteredNews();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>News & Updates</Text>
        <Text style={styles.headerSubtitle}>
          Stay updated with club announcements and pool industry news
        </Text>
      </View>

      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[
            styles.filterButton,
            activeFilter === 'all' && styles.filterButtonActive,
          ]}
          onPress={() => setActiveFilter('all')}
        >
          <Text
            style={[
              styles.filterButtonText,
              activeFilter === 'all' && styles.filterButtonTextActive,
            ]}
          >
            All News
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterButton,
            activeFilter === 'club' && styles.filterButtonActive,
          ]}
          onPress={() => setActiveFilter('club')}
        >
          <Text
            style={[
              styles.filterButtonText,
              activeFilter === 'club' && styles.filterButtonTextActive,
            ]}
          >
            Club Updates
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterButton,
            activeFilter === 'industry' && styles.filterButtonActive,
          ]}
          onPress={() => setActiveFilter('industry')}
        >
          <Text
            style={[
              styles.filterButtonText,
              activeFilter === 'industry' && styles.filterButtonTextActive,
            ]}
          >
            Industry News
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.articlesList}>
        {filteredNews.map((article) => (
          <View key={article.id} style={styles.articleCard}>
            <View style={styles.articleContent}>
              <View style={styles.articleIcon}>
                <Ionicons name="newspaper-outline" size={28} color={theme.colors.primary} />
              </View>
              <View style={styles.articleInfo}>
                <View style={styles.articleHeader}>
                  <Text style={styles.articleTitle} numberOfLines={2}>
                    {article.title}
                  </Text>
                  {article.category === 'industry' && (
                    <Ionicons name="open-outline" size={16} color={theme.colors.textSecondary} />
                  )}
                </View>
                <Text style={styles.articleExcerpt} numberOfLines={2}>
                  {article.excerpt}
                </Text>
                <View style={styles.articleMeta}>
                  <View style={styles.metaItem}>
                    <Ionicons name="calendar-outline" size={12} color={theme.colors.textSecondary} />
                    <Text style={styles.metaText}>{article.date}</Text>
                  </View>
                  <View style={styles.metaItem}>
                    <Ionicons name="person-outline" size={12} color={theme.colors.textSecondary} />
                    <Text style={styles.metaText}>{article.author}</Text>
                  </View>
                  {article.source && (
                    <View style={styles.sourceBadge}>
                      <Text style={styles.sourceBadgeText}>{article.source}</Text>
                    </View>
                  )}
                </View>
              </View>
            </View>
          </View>
        ))}
      </View>

      {filteredNews.length === 0 && (
        <View style={styles.emptyState}>
          <Ionicons name="newspaper-outline" size={48} color={theme.colors.textSecondary} />
          <Text style={styles.emptyText}>No news articles found</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    padding: theme.spacing.md,
  },
  header: {
    marginBottom: theme.spacing.md,
  },
  headerTitle: {
    ...theme.typography.h2,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  headerSubtitle: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
  },
  filterContainer: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    paddingBottom: theme.spacing.sm,
  },
  filterButton: {
    flex: 1,
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  filterButtonActive: {
    backgroundColor: theme.colors.primary,
  },
  filterButtonText: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    fontWeight: '600',
  },
  filterButtonTextActive: {
    color: theme.colors.white,
  },
  articlesList: {
    gap: theme.spacing.sm,
  },
  articleCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  articleContent: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  articleIcon: {
    width: 56,
    height: 56,
    borderRadius: theme.borderRadius.md,
    backgroundColor: `${theme.colors.primary}20`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  articleInfo: {
    flex: 1,
  },
  articleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.xs,
  },
  articleTitle: {
    ...theme.typography.body,
    color: theme.colors.text,
    fontWeight: '600',
    flex: 1,
  },
  articleExcerpt: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
  },
  articleMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
    alignItems: 'center',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  metaText: {
    ...theme.typography.small,
    color: theme.colors.textSecondary,
  },
  sourceBadge: {
    paddingHorizontal: theme.spacing.xs,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.background,
  },
  sourceBadgeText: {
    ...theme.typography.small,
    color: theme.colors.textSecondary,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.xl,
  },
  emptyText: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.md,
  },
});

