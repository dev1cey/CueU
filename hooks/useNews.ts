import { useData } from '../contexts/DataContext';
import { useState, useEffect } from 'react';
import { News } from '../firebase/types';
import { getRecentNews } from '../firebase/services';

// Hook to get all news (uses shared DataContext)
export const useAllNews = () => {
  const { news, newsLoading, newsError, refetchNews } = useData();
  return { 
    news, 
    loading: newsLoading, 
    error: newsError, 
    refetch: refetchNews 
  };
};

// Hook to get recent news
export const useRecentNews = (count: number = 5) => {
  const [news, setNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);
        const newsData = await getRecentNews(count);
        setNews(newsData);
        setError(null);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, [count]);

  const refetch = async () => {
    try {
      setLoading(true);
      const newsData = await getRecentNews(count);
      setNews(newsData);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  return { news, loading, error, refetch };
};

