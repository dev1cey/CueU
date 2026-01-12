import React, { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { Match, Event, Season, News, User } from '../firebase/types';
import { 
  getActiveSeason, 
  getUpcomingEvents, 
  getUpcomingMatches, 
  getAllNews,
  getTopPlayersByIds,
  getMatchesForUser
} from '../firebase/services';
import { getUnreadNotificationCount } from '../firebase/services/notificationService';
import { auth } from '../firebase/config';
import { onAuthStateChanged } from 'firebase/auth';

interface DataContextType {
  // Season data
  season: Season | null;
  seasonLoading: boolean;
  seasonError: Error | null;
  refetchSeason: () => Promise<void>;
  
  // Events data
  events: Event[];
  eventsLoading: boolean;
  eventsError: Error | null;
  refetchEvents: () => Promise<void>;
  
  // Matches data
  upcomingMatches: Match[];
  matchesLoading: boolean;
  matchesError: Error | null;
  refetchMatches: (userId?: string) => Promise<void>;
  
  // News data
  news: News[];
  newsLoading: boolean;
  newsError: Error | null;
  refetchNews: () => Promise<void>;
  
  // Players data (season-specific)
  seasonPlayers: User[];
  playersLoading: boolean;
  playersError: Error | null;
  refetchPlayers: (playerIds: string[] | null, limit?: number, seasonId?: string) => Promise<void>;
  
  // Notification count
  unreadNotificationCount: number;
  refetchNotificationCount: (userId: string) => Promise<void>;
  
  // Manual refresh all (silent parameter for background refreshes)
  refreshAll: (userId?: string, silent?: boolean) => Promise<void>;
  
  // Auto-refresh state
  autoRefreshEnabled: boolean;
  setAutoRefreshEnabled: (enabled: boolean) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

// Auto-refresh interval in milliseconds (30 seconds)
const AUTO_REFRESH_INTERVAL = 30000;

export const DataProvider = ({ children }: { children: ReactNode }) => {
  // Season state
  const [season, setSeason] = useState<Season | null>(null);
  const [seasonLoading, setSeasonLoading] = useState(true);
  const [seasonError, setSeasonError] = useState<Error | null>(null);
  
  // Events state
  const [events, setEvents] = useState<Event[]>([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [eventsError, setEventsError] = useState<Error | null>(null);
  
  // Matches state
  const [upcomingMatches, setUpcomingMatches] = useState<Match[]>([]);
  const [matchesLoading, setMatchesLoading] = useState(false); // Start as false, only load when userId is provided
  const [matchesError, setMatchesError] = useState<Error | null>(null);
  const matchesUserIdRef = useRef<string | undefined>(undefined);
  
  // News state
  const [news, setNews] = useState<News[]>([]);
  const [newsLoading, setNewsLoading] = useState(true);
  const [newsError, setNewsError] = useState<Error | null>(null);
  
  // Players state
  const [seasonPlayers, setSeasonPlayers] = useState<User[]>([]);
  const [playersLoading, setPlayersLoading] = useState(true);
  const [playersError, setPlayersError] = useState<Error | null>(null);
  const playersParamsRef = useRef<{ playerIds: string[] | null; limit?: number; seasonId?: string }>({ playerIds: null });
  
  // Notification count state
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);
  
  // Auto-refresh state
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(true);
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);
  const isRefreshingRef = useRef(false);
  const lastRefreshTimeRef = useRef<number>(0);
  const MIN_REFRESH_INTERVAL = 2000; // Minimum 2 seconds between refreshes
  
  // Track initial loading states to ensure they get cleared even on silent refreshes
  const initialLoadCompleteRef = useRef({
    season: false,
    events: false,
    news: false,
    players: false,
  });

  // Refetch season
  const refetchSeason = useCallback(async (silent: boolean = false) => {
    const needsInitialClear = !initialLoadCompleteRef.current.season;
    try {
      if (!silent) {
        setSeasonLoading(true);
      }
      setSeasonError(null);
      const seasonData = await getActiveSeason();
      setSeason(seasonData);
      initialLoadCompleteRef.current.season = true;
    } catch (err) {
      setSeasonError(err as Error);
      console.error('Error fetching season:', err);
    } finally {
      // Always set loading to false if not silent, or if this is the initial load
      if (!silent || needsInitialClear) {
        setSeasonLoading(false);
      }
    }
  }, []); // No dependencies to prevent infinite loop

  // Refetch events
  const refetchEvents = useCallback(async (silent: boolean = false) => {
    const needsInitialClear = !initialLoadCompleteRef.current.events;
    try {
      if (!silent) {
        setEventsLoading(true);
      }
      setEventsError(null);
      const eventsData = await getUpcomingEvents();
      setEvents(eventsData);
      initialLoadCompleteRef.current.events = true;
    } catch (err) {
      setEventsError(err as Error);
      console.error('Error fetching events:', err);
    } finally {
      // Always set loading to false if not silent, or if this is the initial load
      if (!silent || needsInitialClear) {
        setEventsLoading(false);
      }
    }
  }, []); // No dependencies to prevent infinite loop

  // Refetch matches
  const refetchMatches = useCallback(async (userId?: string, silent: boolean = false) => {
    if (userId !== undefined) {
      matchesUserIdRef.current = userId;
    }
    const currentUserId = matchesUserIdRef.current;
    
    // Only set loading if we have a userId or if we're explicitly fetching, and not silent
    if ((currentUserId !== undefined || userId !== undefined) && !silent) {
      setMatchesLoading(true);
    }
    setMatchesError(null);
    
    try {
      const matchesData = await getUpcomingMatches(currentUserId);
      // Force a new array reference to ensure React detects the change
      setUpcomingMatches([...matchesData]);
    } catch (err) {
      setMatchesError(err as Error);
      console.error('Error fetching matches:', err);
    } finally {
      if ((currentUserId !== undefined || userId !== undefined) && !silent) {
        setMatchesLoading(false);
      }
    }
  }, []); // No dependencies to prevent infinite loop - state updates will trigger re-renders automatically

  // Refetch news
  const refetchNews = useCallback(async (silent: boolean = false) => {
    const needsInitialClear = !initialLoadCompleteRef.current.news;
    try {
      if (!silent) {
        setNewsLoading(true);
      }
      setNewsError(null);
      const newsData = await getAllNews();
      setNews(newsData);
      initialLoadCompleteRef.current.news = true;
    } catch (err) {
      setNewsError(err as Error);
      console.error('Error fetching news:', err);
    } finally {
      // Always set loading to false if not silent, or if this is the initial load
      if (!silent || needsInitialClear) {
        setNewsLoading(false);
      }
    }
  }, []); // No dependencies to prevent infinite loop

  // Refetch players
  const refetchPlayers = useCallback(async (playerIds: string[] | null, limit?: number, seasonId?: string, silent: boolean = false) => {
    const needsInitialClear = !initialLoadCompleteRef.current.players;
    if (playerIds !== undefined) {
      playersParamsRef.current = { playerIds, limit, seasonId };
    }
    const params = playersParamsRef.current;
    
    if (!params.playerIds || params.playerIds.length === 0) {
      setSeasonPlayers([]);
      // Always set loading to false if not silent, or if this is the initial load
      if (!silent || needsInitialClear) {
        setPlayersLoading(false);
      }
      return;
    }
    
    try {
      if (!silent) {
        setPlayersLoading(true);
      }
      setPlayersError(null);
      const playersData = await getTopPlayersByIds(params.playerIds, params.limit, params.seasonId);
      setSeasonPlayers(playersData);
      initialLoadCompleteRef.current.players = true;
    } catch (err) {
      setPlayersError(err as Error);
      console.error('Error fetching players:', err);
    } finally {
      // Always set loading to false if not silent, or if this is the initial load
      if (!silent || needsInitialClear) {
        setPlayersLoading(false);
      }
    }
  }, []); // No dependencies to prevent infinite loop

  // Refetch notification count
  const refetchNotificationCount = useCallback(async (userId: string) => {
    try {
      const count = await getUnreadNotificationCount(userId);
      setUnreadNotificationCount(count);
    } catch (err) {
      console.error('Error fetching notification count:', err);
    }
  }, []);

  // Refresh all data
  const refreshAll = useCallback(async (userId?: string, silent: boolean = false) => {
    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/1b6a20ab-a1d9-409f-8117-56c59c909504',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'DataContext.tsx:251',message:'refreshAll called',data:{hasCurrentUser:!!auth.currentUser,email:auth.currentUser?.email,isUwEmail:auth.currentUser?.email?.endsWith('@uw.edu'),userId},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
    // #endregion
    // CRITICAL: Don't fetch if not authenticated or if email is not valid @uw.edu
    // This prevents fetching for invalid users during the sign-in race condition
    if (!auth.currentUser || !auth.currentUser.email || !auth.currentUser.email.endsWith('@uw.edu')) {
      // #region agent log
      fetch('http://127.0.0.1:7244/ingest/1b6a20ab-a1d9-409f-8117-56c59c909504',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'DataContext.tsx:253',message:'refreshAll early return - invalid auth',data:{hasCurrentUser:!!auth.currentUser,email:auth.currentUser?.email},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
      // #endregion
      return;
    }
    
    const now = Date.now();
    // Throttle refreshes to prevent excessive calls
    if (isRefreshingRef.current || (now - lastRefreshTimeRef.current < MIN_REFRESH_INTERVAL && silent)) {
      return;
    }
    
    isRefreshingRef.current = true;
    lastRefreshTimeRef.current = now;
    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/1b6a20ab-a1d9-409f-8117-56c59c909504',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'DataContext.tsx:265',message:'refreshAll starting data fetch',data:{email:auth.currentUser?.email,isUwEmail:auth.currentUser?.email?.endsWith('@uw.edu')},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
    // #endregion
    try {
      await Promise.all([
        refetchSeason(silent),
        refetchEvents(silent),
        refetchMatches(userId, silent),
        refetchNews(silent),
        season ? refetchPlayers(season.playerIds, undefined, season.id, silent) : Promise.resolve(),
        userId ? refetchNotificationCount(userId) : Promise.resolve(),
      ]);
    } finally {
      isRefreshingRef.current = false;
    }
  }, [refetchSeason, refetchEvents, refetchMatches, refetchNews, refetchPlayers, refetchNotificationCount, season]);

  // Auto-refresh effect - use refs to avoid dependency issues
  const refreshAllRef = useRef(refreshAll);
  const refetchSeasonRef = useRef(refetchSeason);
  const refetchEventsRef = useRef(refetchEvents);
  const refetchNewsRef = useRef(refetchNews);
  
  // Update refs when functions change
  useEffect(() => {
    refreshAllRef.current = refreshAll;
    refetchSeasonRef.current = refetchSeason;
    refetchEventsRef.current = refetchEvents;
    refetchNewsRef.current = refetchNews;
  }, [refreshAll, refetchSeason, refetchEvents, refetchNews]);

  // Track if initial fetch has been done
  const initialFetchDoneRef = useRef(false);
  
  // Auto-refresh effect - only depend on autoRefreshEnabled to prevent re-runs
  useEffect(() => {
    if (!autoRefreshEnabled) {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
        refreshIntervalRef.current = null;
      }
      return;
    }

    // Initial fetch - only show loading on first mount, not on subsequent auto-refresh setups
    // Wait for Firebase Auth to be ready before fetching (auth state must be determined)
    if (!initialFetchDoneRef.current) {
      const initialFetch = async () => {
        // Wait for Firebase Auth to initialize - check if auth state has been determined
        // We'll wait up to 3 seconds for auth to be ready
        let attempts = 0;
        const maxAttempts = 30; // 3 seconds total
        while (attempts < maxAttempts) {
          // Check if we have a current user OR if auth has been initialized
          // If auth.currentUser is null but auth is initialized, that's fine - we'll still try to fetch
          // The key is waiting a bit for onAuthStateChanged to fire at least once
          await new Promise(resolve => setTimeout(resolve, 100));
          attempts++;
          // If we have a user, we can proceed immediately
          if (auth.currentUser) break;
        }
        // Only show loading if we don't have data yet (first mount)
        const isFirstMount = !season && events.length === 0 && news.length === 0;
        // Only fetch if authenticated with valid @uw.edu email (rules require auth)
        // #region agent log
        fetch('http://127.0.0.1:7244/ingest/1b6a20ab-a1d9-409f-8117-56c59c909504',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'DataContext.tsx:326',message:'Initial fetch check',data:{hasCurrentUser:!!auth.currentUser,email:auth.currentUser?.email,isUwEmail:auth.currentUser?.email?.endsWith('@uw.edu')},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
        // #endregion
        // CRITICAL: Check both auth.currentUser and email validity to prevent fetching for invalid users
        if (auth.currentUser && auth.currentUser.email && auth.currentUser.email.endsWith('@uw.edu')) {
          // #region agent log
          fetch('http://127.0.0.1:7244/ingest/1b6a20ab-a1d9-409f-8117-56c59c909504',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'DataContext.tsx:327',message:'Starting initial fetch',data:{email:auth.currentUser.email,isUwEmail:auth.currentUser.email?.endsWith('@uw.edu')},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
          // #endregion
          await Promise.all([
            refetchSeasonRef.current(!isFirstMount), // Silent if we already have data
            refetchEventsRef.current(!isFirstMount),
            refetchNewsRef.current(!isFirstMount),
          ]);
        } else if (auth.currentUser && !auth.currentUser.email?.endsWith('@uw.edu')) {
          // #region agent log
          fetch('http://127.0.0.1:7244/ingest/1b6a20ab-a1d9-409f-8117-56c59c909504',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'DataContext.tsx:333',message:'Skipping initial fetch - invalid email',data:{email:auth.currentUser.email},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
          // #endregion
        }
        initialFetchDoneRef.current = true;
      };
      initialFetch();
    }

    // Set up interval
    refreshIntervalRef.current = setInterval(() => {
      // Only refresh if app is in foreground and user is authenticated with valid @uw.edu email
      if (appStateRef.current === 'active' && !isRefreshingRef.current && auth.currentUser && auth.currentUser.email && auth.currentUser.email.endsWith('@uw.edu')) {
        refreshAllRef.current(matchesUserIdRef.current, true); // Silent refresh for auto-refresh
      }
    }, AUTO_REFRESH_INTERVAL);

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
        refreshIntervalRef.current = null;
      }
    };
  }, [autoRefreshEnabled]); // Only depend on autoRefreshEnabled - removed season, events.length, news.length to prevent constant re-runs

  // Listen to app state changes
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (
        appStateRef.current.match(/inactive|background/) &&
        nextAppState === 'active' &&
        autoRefreshEnabled &&
        !isRefreshingRef.current &&
        auth.currentUser && // Only refresh if authenticated
        auth.currentUser.email && // And has valid email
        auth.currentUser.email.endsWith('@uw.edu') // And email is @uw.edu
      ) {
        // App has come to the foreground, refresh data silently
        refreshAllRef.current(matchesUserIdRef.current, true); // Silent refresh when app comes to foreground
      }
      appStateRef.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, [autoRefreshEnabled]); // Only depend on autoRefreshEnabled

  // Listen to auth state changes and refetch when user authenticates
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      // #region agent log
      fetch('http://127.0.0.1:7244/ingest/1b6a20ab-a1d9-409f-8117-56c59c909504',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'DataContext.tsx:377',message:'onAuthStateChanged fired in DataContext',data:{hasUser:!!user,email:user?.email,uid:user?.uid,initialFetchDone:initialFetchDoneRef.current,isUwEmail:user?.email?.endsWith('@uw.edu')},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
      // #endregion
      // CRITICAL: Only fetch data if user has valid @uw.edu email
      // This prevents fetching for invalid users during the sign-in race condition
      if (user && initialFetchDoneRef.current && user.email && user.email.endsWith('@uw.edu')) {
        // #region agent log
        fetch('http://127.0.0.1:7244/ingest/1b6a20ab-a1d9-409f-8117-56c59c909504',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'DataContext.tsx:378',message:'About to call refreshAll',data:{email:user.email,isUwEmail:user.email?.endsWith('@uw.edu')},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
        // #endregion
        // User just authenticated, refetch data
        refreshAllRef.current(matchesUserIdRef.current, true);
      } else if (user && !user.email?.endsWith('@uw.edu')) {
        // #region agent log
        fetch('http://127.0.0.1:7244/ingest/1b6a20ab-a1d9-409f-8117-56c59c909504',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'DataContext.tsx:382',message:'Skipping refreshAll - invalid email',data:{email:user.email},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
        // #endregion
      }
    });
    return unsubscribe;
  }, []);

  // Update players when season changes - use silent refresh
  const prevSeasonRef = useRef<{ id: string | undefined; playerIdsLength: number }>({ id: undefined, playerIdsLength: 0 });
  useEffect(() => {
    const currentSeasonId = season?.id;
    const currentPlayerIdsLength = season?.playerIds?.length || 0;
    const seasonChanged = currentSeasonId !== prevSeasonRef.current.id || currentPlayerIdsLength !== prevSeasonRef.current.playerIdsLength;
    
    if (season?.playerIds && seasonChanged) {
      prevSeasonRef.current = { id: currentSeasonId, playerIdsLength: currentPlayerIdsLength };
      refetchPlayers(season.playerIds, undefined, season.id, true); // Silent refresh when season changes
    } else if (season?.playerIds) {
      // Update ref even if we don't refetch (to track current state)
      prevSeasonRef.current = { id: currentSeasonId, playerIdsLength: currentPlayerIdsLength };
    }
  }, [season?.id, season?.playerIds, refetchPlayers]);

  return (
    <DataContext.Provider
      value={{
        season,
        seasonLoading,
        seasonError,
        refetchSeason,
        events,
        eventsLoading,
        eventsError,
        refetchEvents,
        upcomingMatches,
        matchesLoading,
        matchesError,
        refetchMatches,
        news,
        newsLoading,
        newsError,
        refetchNews,
        seasonPlayers,
        playersLoading,
        playersError,
        refetchPlayers,
        unreadNotificationCount,
        refetchNotificationCount,
        refreshAll,
        autoRefreshEnabled,
        setAutoRefreshEnabled,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

