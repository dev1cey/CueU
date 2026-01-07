import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Bell, X, Trophy, Calendar, Newspaper, ChevronRight } from 'lucide-react-native';
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  getNotificationsForUser,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  getUnreadNotificationCount,
} from '../firebase/services/notificationService';
import { Notification } from '../firebase/types';
import { formatDistanceToNow } from 'date-fns';

export default function NotificationsScreen() {
  const router = useRouter();
  const { currentUserId } = useAuth();
  const insets = useSafeAreaInsets();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const loadNotifications = async () => {
    if (!currentUserId) return;

    try {
      const [notifs, count] = await Promise.all([
        getNotificationsForUser(currentUserId),
        getUnreadNotificationCount(currentUserId),
      ]);
      setNotifications(notifs);
      setUnreadCount(count);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, [currentUserId]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadNotifications();
  };

  const handleNotificationPress = async (notification: Notification) => {
    // Mark as read
    if (!notification.read) {
      try {
        await markNotificationAsRead(notification.id);
        setNotifications((prev) =>
          prev.map((n) => (n.id === notification.id ? { ...n, read: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      } catch (error) {
        console.error('Error marking notification as read:', error);
      }
    }

    // Navigate based on notification type
    if (notification.type === 'match_scheduled' && notification.matchId) {
      router.push(`/match-details?id=${notification.matchId}`);
    } else if (notification.type === 'news_released' && notification.newsId) {
      router.push(`/(tabs)/news`);
    } else if (notification.type === 'ranking_changed' && notification.seasonId) {
      router.push(`/(tabs)/league`);
    }
  };

  const handleMarkAllRead = async () => {
    if (!currentUserId) return;

    try {
      await markAllNotificationsAsRead(currentUserId);
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'match_scheduled':
        return <Calendar color="#7C3AED" size={20} />;
      case 'news_released':
        return <Newspaper color="#7C3AED" size={20} />;
      case 'ranking_changed':
        return <Trophy color="#7C3AED" size={20} />;
      default:
        return <Bell color="#7C3AED" size={20} />;
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return '';
    try {
      const date = timestamp.toDate();
      return formatDistanceToNow(date, { addSuffix: true });
    } catch {
      return '';
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        {/* Header */}
        <View style={[styles.header, { paddingTop: insets.top }]}>
          <View style={styles.headerContent}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <X color="#1F2937" size={24} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Notifications</Text>
            <View style={styles.placeholder} />
          </View>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#7C3AED" />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <X color="#1F2937" size={24} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Notifications</Text>
          {unreadCount > 0 ? (
            <TouchableOpacity onPress={handleMarkAllRead} style={styles.markAllButton}>
              <Text style={styles.markAllText}>Mark all read</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.placeholder} />
          )}
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {notifications.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Bell color="#9CA3AF" size={48} />
            <Text style={styles.emptyText}>No notifications yet</Text>
            <Text style={styles.emptySubtext}>You'll see notifications here when you have updates</Text>
          </View>
        ) : (
          notifications.map((notification) => (
            <TouchableOpacity
              key={notification.id}
              style={[styles.notificationCard, !notification.read && styles.unreadCard]}
              onPress={() => handleNotificationPress(notification)}
            >
              <View style={styles.notificationIcon}>
                {getNotificationIcon(notification.type)}
              </View>
              <View style={styles.notificationContent}>
                <View style={styles.notificationHeader}>
                  <Text style={styles.notificationTitle}>{notification.title}</Text>
                  {!notification.read && <View style={styles.unreadDot} />}
                </View>
                <Text style={styles.notificationMessage}>{notification.message}</Text>
                <Text style={styles.notificationDate}>{formatDate(notification.createdAt)}</Text>
              </View>
              <ChevronRight color="#9CA3AF" size={20} />
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
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
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
  },
  markAllButton: {
    padding: 4,
  },
  markAllText: {
    fontSize: 14,
    color: '#7C3AED',
    fontWeight: '600',
  },
  placeholder: {
    width: 32,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 8,
    textAlign: 'center',
  },
  notificationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  unreadCard: {
    backgroundColor: '#F3F4F6',
    borderColor: '#7C3AED',
    borderWidth: 1,
  },
  notificationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EDE9FE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    flex: 1,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#7C3AED',
    marginLeft: 8,
  },
  notificationMessage: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  notificationDate: {
    fontSize: 12,
    color: '#9CA3AF',
  },
});

