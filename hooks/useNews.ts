import { useState, useEffect } from 'react';
import { News } from '../firebase/types';
import { getAllNews, getRecentNews } from '../firebase/services';

// Hook to get all news
export const useAllNews = () => {
  const [news, setNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);
        const newsData = await getAllNews();
        setNews(newsData);
        setError(null);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  const refetch = async () => {
    try {
      setLoading(true);
      const newsData = await getAllNews();
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

