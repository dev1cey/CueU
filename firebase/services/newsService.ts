import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  limit,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../config';
import { News } from '../types';

const NEWS_COLLECTION = 'news';

// Create a new news article
export const createNews = async (newsData: {
  title: string;
  content: string;
  author: string;
  authorId: string;
  imageUrl?: string;
  tags?: string[];
}): Promise<string> => {
  try {
    const newsRef = collection(db, NEWS_COLLECTION);
    const now = Timestamp.now();

    const newNews: Omit<News, 'id'> = {
      ...newsData,
      publishedDate: now,
      createdAt: now,
      updatedAt: now,
    };

    const docRef = await addDoc(newsRef, newNews);
    return docRef.id;
  } catch (error) {
    console.error('Error creating news:', error);
    throw error;
  }
};

// Get news by ID
export const getNewsById = async (newsId: string): Promise<News | null> => {
  try {
    const newsRef = doc(db, NEWS_COLLECTION, newsId);
    const newsSnap = await getDoc(newsRef);

    if (newsSnap.exists()) {
      return { id: newsSnap.id, ...newsSnap.data() } as News;
    }
    return null;
  } catch (error) {
    console.error('Error getting news:', error);
    throw error;
  }
};

// Update news article
export const updateNews = async (
  newsId: string,
  updates: Partial<Omit<News, 'id' | 'createdAt' | 'publishedDate'>>
): Promise<void> => {
  try {
    const newsRef = doc(db, NEWS_COLLECTION, newsId);
    await updateDoc(newsRef, {
      ...updates,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error updating news:', error);
    throw error;
  }
};

// Delete news article
export const deleteNews = async (newsId: string): Promise<void> => {
  try {
    const newsRef = doc(db, NEWS_COLLECTION, newsId);
    await deleteDoc(newsRef);
  } catch (error) {
    console.error('Error deleting news:', error);
    throw error;
  }
};

// Get all news articles (most recent first)
export const getAllNews = async (limitCount?: number): Promise<News[]> => {
  try {
    const newsRef = collection(db, NEWS_COLLECTION);
    let q = query(newsRef, orderBy('publishedDate', 'desc'));
    
    if (limitCount) {
      q = query(q, limit(limitCount));
    }
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as News));
  } catch (error) {
    console.error('Error getting all news:', error);
    throw error;
  }
};

// Get recent news (for homepage)
export const getRecentNews = async (count: number = 5): Promise<News[]> => {
  return getAllNews(count);
};

