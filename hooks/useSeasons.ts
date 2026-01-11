import { useData } from '../contexts/DataContext';

// Hook to get active season (uses shared DataContext)
export const useActiveSeason = () => {
  const { season, seasonLoading, seasonError, refetchSeason } = useData();
  return { 
    season, 
    loading: seasonLoading, 
    error: seasonError, 
    refetch: refetchSeason 
  };
};

import { useState, useEffect } from 'react';
import { Season } from '../firebase/types';
import { getAllSeasons } from '../firebase/services';

// Hook to get all seasons (kept separate as it's not commonly used)
export const useAllSeasons = () => {
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchSeasons = async () => {
      try {
        setLoading(true);
        const seasonsData = await getAllSeasons();
        setSeasons(seasonsData);
        setError(null);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchSeasons();
  }, []);

  const refetch = async () => {
    try {
      setLoading(true);
      const seasonsData = await getAllSeasons();
      setSeasons(seasonsData);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  return { seasons, loading, error, refetch };
};

