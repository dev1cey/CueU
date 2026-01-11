import { useData } from '../contexts/DataContext';
import { useState, useEffect } from 'react';
import { Event } from '../firebase/types';
import { getAllEvents, getUserEvents } from '../firebase/services';

// Hook to get upcoming events (uses shared DataContext)
export const useUpcomingEvents = () => {
  const { events, eventsLoading, eventsError, refetchEvents } = useData();
  return { 
    events, 
    loading: eventsLoading, 
    error: eventsError, 
    refetch: refetchEvents 
  };
};

// Hook to get all events
export const useAllEvents = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const eventsData = await getAllEvents();
        setEvents(eventsData);
        setError(null);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const refetch = async () => {
    try {
      setLoading(true);
      const eventsData = await getAllEvents();
      setEvents(eventsData);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  return { events, loading, error, refetch };
};

// Hook to get user's events
export const useUserEvents = (userId: string | null) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const fetchEvents = async () => {
      try {
        setLoading(true);
        const eventsData = await getUserEvents(userId);
        setEvents(eventsData);
        setError(null);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [userId]);

  const refetch = async () => {
    if (!userId) return;
    
    try {
      setLoading(true);
      const eventsData = await getUserEvents(userId);
      setEvents(eventsData);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  return { events, loading, error, refetch };
};

