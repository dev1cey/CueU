import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
} from 'firebase/firestore';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { db } from '../config';
import { Notification, NotificationType, User } from '../types';

const NOTIFICATIONS_ENABLED_KEY = '@cueu:notifications_enabled';

const NOTIFICATIONS_COLLECTION = 'notifications';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// Request notification permissions
export const requestNotificationPermissions = async (): Promise<boolean> => {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    return finalStatus === 'granted';
  } catch (error) {
    console.error('Error requesting notification permissions:', error);
    return false;
  }
};

// Create a notification in Firestore and send local notification
export const createNotification = async (
  userId: string,
  type: NotificationType,
  title: string,
  message: string,
  data?: {
    matchId?: string;
    newsId?: string;
    seasonId?: string;
    oldRank?: number;
    newRank?: number;
  }
): Promise<string> => {
  try {
    const notificationsRef = collection(db, NOTIFICATIONS_COLLECTION);
    const now = Timestamp.now();

    // Build notification object, only including fields that are defined
    // Firebase doesn't allow undefined values in documents
    const newNotification: Omit<Notification, 'id'> = {
      userId,
      type,
      title,
      message,
      read: false,
      createdAt: now,
      ...(data?.matchId !== undefined && { matchId: data.matchId }),
      ...(data?.newsId !== undefined && { newsId: data.newsId }),
      ...(data?.seasonId !== undefined && { seasonId: data.seasonId }),
      ...(data?.oldRank !== undefined && { oldRank: data.oldRank }),
      ...(data?.newRank !== undefined && { newRank: data.newRank }),
    };

    const docRef = await addDoc(notificationsRef, newNotification);

    // Send local notification if user has notifications enabled and permissions are granted
    try {
      const notificationsEnabled = await AsyncStorage.getItem(NOTIFICATIONS_ENABLED_KEY);
      const isEnabled = notificationsEnabled !== 'false'; // Default to true if not set
      
      if (isEnabled) {
        const hasPermission = await requestNotificationPermissions();
        if (hasPermission) {
          await Notifications.scheduleNotificationAsync({
            content: {
              title,
              body: message,
              data: {
                notificationId: docRef.id,
                type,
                ...data,
              },
            },
            trigger: null, // Show immediately
          });
        }
      }
    } catch (error) {
      // Don't fail notification creation if local notification fails
      console.error('Error sending local notification:', error);
    }

    return docRef.id;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

// Get notifications for a user
export const getNotificationsForUser = async (
  userId: string,
  limitCount?: number
): Promise<Notification[]> => {
  try {
    const notificationsRef = collection(db, NOTIFICATIONS_COLLECTION);
    // Query without orderBy to avoid composite index requirement
    // We'll sort in memory instead
    let q = query(
      notificationsRef,
      where('userId', '==', userId)
    );

    const querySnapshot = await getDocs(q);
    
    // Map to notifications and sort by createdAt descending
    const notifications = querySnapshot.docs.map(
      (doc) => ({ id: doc.id, ...doc.data() } as Notification)
    );
    
    // Sort by createdAt descending (newest first)
    notifications.sort((a, b) => 
      b.createdAt.toMillis() - a.createdAt.toMillis()
    );
    
    // Apply limit if specified
    if (limitCount) {
      return notifications.slice(0, limitCount);
    }
    
    return notifications;
  } catch (error) {
    console.error('Error getting notifications for user:', error);
    throw error;
  }
};

// Get unread notifications count for a user
export const getUnreadNotificationCount = async (userId: string): Promise<number> => {
  try {
    const notificationsRef = collection(db, NOTIFICATIONS_COLLECTION);
    const q = query(
      notificationsRef,
      where('userId', '==', userId),
      where('read', '==', false)
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.size;
  } catch (error) {
    console.error('Error getting unread notification count:', error);
    throw error;
  }
};

// Mark notification as read
export const markNotificationAsRead = async (notificationId: string): Promise<void> => {
  try {
    const notificationRef = doc(db, NOTIFICATIONS_COLLECTION, notificationId);
    await updateDoc(notificationRef, {
      read: true,
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
};

// Mark all notifications as read for a user
export const markAllNotificationsAsRead = async (userId: string): Promise<void> => {
  try {
    const notificationsRef = collection(db, NOTIFICATIONS_COLLECTION);
    const q = query(
      notificationsRef,
      where('userId', '==', userId),
      where('read', '==', false)
    );

    const querySnapshot = await getDocs(q);
    const updatePromises = querySnapshot.docs.map((doc) =>
      updateDoc(doc.ref, { read: true })
    );

    await Promise.all(updatePromises);
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    throw error;
  }
};

// Delete notification
export const deleteNotification = async (notificationId: string): Promise<void> => {
  try {
    const notificationRef = doc(db, NOTIFICATIONS_COLLECTION, notificationId);
    await updateDoc(notificationRef, { read: true }); // Soft delete by marking as read
    // Or use deleteDoc if you want hard delete:
    // await deleteDoc(notificationRef);
  } catch (error) {
    console.error('Error deleting notification:', error);
    throw error;
  }
};

// Notify user about new match
export const notifyMatchScheduled = async (
  player1Id: string,
  player2Id: string,
  matchId: string,
  player1Name: string,
  player2Name: string
): Promise<void> => {
  try {
    // Notify player 1
    await createNotification(
      player1Id,
      'match_scheduled',
      'New Match Scheduled',
      `You have a new match scheduled with ${player2Name}`,
      { matchId }
    );

    // Notify player 2
    await createNotification(
      player2Id,
      'match_scheduled',
      'New Match Scheduled',
      `You have a new match scheduled with ${player1Name}`,
      { matchId }
    );
  } catch (error) {
    console.error('Error notifying about match:', error);
    // Don't throw - notifications are not critical
  }
};

// Notify all users about new news
// Accepts users array to avoid circular dependency with userService
export const notifyNewsReleased = async (
  newsId: string,
  newsTitle: string,
  users: User[]
): Promise<void> => {
  try {
    const notificationPromises = users.map((user) =>
      createNotification(
        user.id,
        'news_released',
        'New News Article',
        `New article: ${newsTitle}`,
        { newsId }
      )
    );

    await Promise.all(notificationPromises);
  } catch (error) {
    console.error('Error notifying about news:', error);
    // Don't throw - notifications are not critical
  }
};

// Notify user about ranking change
export const notifyRankingChanged = async (
  userId: string,
  seasonId: string,
  oldRank: number,
  newRank: number
): Promise<void> => {
  try {
    const rankChange = oldRank - newRank;
    const direction = rankChange > 0 ? 'improved' : rankChange < 0 ? 'dropped' : 'unchanged';
    
    let message = '';
    if (direction === 'improved') {
      message = `Your season ranking improved from #${oldRank} to #${newRank}!`;
    } else if (direction === 'dropped') {
      message = `Your season ranking changed from #${oldRank} to #${newRank}`;
    } else {
      // No notification if rank didn't change
      return;
    }

    await createNotification(
      userId,
      'ranking_changed',
      'Ranking Update',
      message,
      { seasonId, oldRank, newRank }
    );
  } catch (error) {
    console.error('Error notifying about ranking change:', error);
    // Don't throw - notifications are not critical
  }
};

