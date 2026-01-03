import { useState, useEffect } from 'react';
import { Season } from '../firebase/types';
import { getActiveSeason, getAllSeasons } from '../firebase/services';

// Hook to get active season
export const useActiveSeason = () => {
  const [season, setSeason] = useState<Season | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchSeason = async () => {
      try {
        setLoading(true);
        const seasonData = await getActiveSeason();
        setSeason(seasonData);
        setError(null);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchSeason();
  }, []);

  const refetch = async () => {
    try {
      setLoading(true);
      const seasonData = await getActiveSeason();
      setSeason(seasonData);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  return { season, loading, error, refetch };
};

// Hook to get all seasons
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

