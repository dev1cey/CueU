import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar, MapPin, Trophy, Bell, ChevronRight } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useSeasonTopPlayers } from '../../hooks/useUsers';
import { useUpcomingEvents } from '../../hooks/useEvents';
import { useActiveSeason } from '../../hooks/useSeasons';
import { useAuth } from '../../contexts/AuthContext';
import { useUpcomingMatches } from '../../hooks/useMatches';

interface QuickStat {
  label: string;
  value: string;
  subtext?: string;
}

export default function HomeTab() {
  // Fetch data from Firebase
  const router = useRouter();
  const { season, loading: seasonLoading } = useActiveSeason();
  const { players: topPlayers, loading: playersLoading } = useSeasonTopPlayers(
    season?.playerIds || null, 
    3,
    season?.id
  );
  const { events, loading: eventsLoading } = useUpcomingEvents();
  const { currentUser, currentUserId } = useAuth();
  const { matches: upcomingMatches, loading: matchesLoading } = useUpcomingMatches(currentUserId || undefined);

  // Fetch all season players to calculate rank
  const { players: allPlayers, loading: allPlayersLoading } = useSeasonTopPlayers(
    season?.playerIds || null,
    undefined,
    season?.id
  );

  // Get current user's season points
  const getSeasonPoints = (user: typeof currentUser) => {
    if (!user || !season?.id) return 0;
    return user.seasonPoints?.[season.id] || 0;
  };

  // Calculate current user's rank
  const calculateUserRank = () => {
    if (!currentUser || allPlayersLoading) return '-';
    const userIndex = allPlayers.findIndex(player => player.id === currentUser.id);
    return userIndex !== -1 ? `${userIndex + 1}` : '-';
  };

  // User stats based on logged in user
  const quickStats: QuickStat[] = currentUser ? [
    { label: 'Skill Level', value: currentUser.skillLevel, subtext: currentUser.skillLevel.charAt(0).toUpperCase() + currentUser.skillLevel.slice(1) },
    { label: 'Season Points', value: getSeasonPoints(currentUser).toFixed(1), subtext: `${currentUser.wins}-${currentUser.losses} record` },
    { label: 'Rank', value: calculateUserRank(), subtext: `of ${season?.playerIds.length || 0} players` },
    { label: 'Matches', value: `${currentUser.matchesPlayed}`, subtext: 'total played' }
  ] : [
    { label: 'Skill Level', value: '-', subtext: 'Not logged in' },
    { label: 'Season Points', value: '-', subtext: '-' },
    { label: 'Rank', value: '-', subtext: '-' },
    { label: 'Matches', value: '-', subtext: '-' }
  ];

  const formatEventDate = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate();
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const formatEventTime = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate();
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  };

  return (
    <SafeAreaView style={styles.container} edges={[]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.logoContainer}>
            <View style={styles.logo}>
              <View style={styles.logoInner} />
            </View>
            <View style={styles.titleContainer}>
              <Text style={styles.headerTitle}>CueU</Text>
              <Text style={styles.headerSubtitle}> - UW Pool Club</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.notificationButton}>
            <Bell color="#7C3AED" size={24} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <Text style={styles.sectionTitle}>Dashboard</Text>
          <Text style={styles.welcomeText}>
            {currentUser ? `Welcome back, ${currentUser.name.split(' ')[0]}!` : 'Welcome!'}
          </Text>
        </View>

        {/* Upcoming Matches */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>UPCOMING MATCHES</Text>
            <TouchableOpacity
              style={styles.viewAllButton}
              onPress={() => router.push('/(tabs)/league')}
            >
              <Text style={styles.viewAllText}>View Schedule</Text>
              <ChevronRight color="#7C3AED" size={16} />
            </TouchableOpacity>
          </View>

          {!currentUserId ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>Sign in to see your matches</Text>
              <Text style={styles.emptyStateSubtext}>
                Log in with your UW account to view your league schedule.
              </Text>
            </View>
          ) : matchesLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#7C3AED" />
              <Text style={styles.loadingText}>Loading matches...</Text>
            </View>
          ) : upcomingMatches.length > 0 ? (
            <View style={styles.eventsList}>
              {upcomingMatches.slice(0, 3).map((match) => {
                const isPlayer1 = match.player1Id === currentUserId;
                const opponentName = isPlayer1 ? match.player2Name : match.player1Name;
                const scheduledDate: any = (match as any).scheduledDate;

                return (
                  <View key={match.id} style={styles.eventItem}>
                    <View style={styles.eventIconContainer}>
                      <Trophy color="#7C3AED" size={20} />
                    </View>
                    <View style={styles.eventInfo}>
                      <Text style={styles.eventTitle}>vs {opponentName}</Text>
                      {scheduledDate && (
                        <View style={styles.eventDetails}>
                          <Calendar color="#6B7280" size={12} />
                          <Text style={styles.eventDetailText}>
                            {formatEventDate(scheduledDate)}, {formatEventTime(scheduledDate)}
                          </Text>
                        </View>
                      )}
                      <View style={styles.eventDetails}>
                        <Text style={styles.eventDetailText}>Week {match.weekNumber}</Text>
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No upcoming matches</Text>
              <Text style={styles.emptyStateSubtext}>
                Your next league match will be scheduled soon.
              </Text>
            </View>
          )}
        </View>

        {/* Quick Stats Section */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>YOUR STATS</Text>
          <View style={styles.statsGrid}>
            {quickStats.map((stat, idx) => (
              <View key={idx} style={styles.statCard}>
                <Text style={stat.label === 'Skill Level' ? styles.statValueSmall : styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
                {stat.subtext && (
                  <Text style={styles.statSubtext}>{stat.subtext}</Text>
                )}
              </View>
            ))}
          </View>
        </View>

        {/* Rankings Preview */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View>
              <Text style={styles.cardTitle}>TOP RANKINGS</Text>
              <Text style={styles.cardDescription}>
                {seasonLoading ? 'Loading...' : season ? season.name : 'Current Season'}
              </Text>
            </View>
          </View>
          
          {playersLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#7C3AED" />
              <Text style={styles.loadingText}>Loading rankings...</Text>
            </View>
          ) : topPlayers.length > 0 ? (
            <View style={styles.rankingsList}>
              {topPlayers.map((player, index) => {
                const seasonPoints = season?.id 
                  ? (player.seasonPoints?.[season.id] || 0)
                  : 0;
                return (
                  <View key={player.id} style={styles.rankingItem}>
                    <Text style={styles.rankingEmoji}>
                      {index === 0 && '🥇'}
                      {index === 1 && '🥈'}
                      {index === 2 && '🥉'}
                    </Text>
                    <View style={styles.rankingInfo}>
                      <Text style={styles.rankingName}>{player.name}</Text>
                      <View style={styles.recordContainer}>
                        <Text style={styles.wins}>{seasonPoints.toFixed(1)}</Text>
                        <Text style={styles.recordSeparator}> pts</Text>
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No rankings available yet</Text>
              <Text style={styles.emptyStateSubtext}>Start playing matches to see rankings!</Text>
            </View>
          )}
        </View>

        {/* Events Section */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>UPCOMING EVENTS</Text>
            <TouchableOpacity style={styles.viewAllButton}>
              <Text style={styles.viewAllText}>See All</Text>
              <ChevronRight color="#7C3AED" size={16} />
            </TouchableOpacity>
          </View>
          
          {eventsLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#7C3AED" />
              <Text style={styles.loadingText}>Loading events...</Text>
            </View>
          ) : events.length > 0 ? (
            <View style={styles.eventsList}>
              {events.slice(0, 3).map((event) => (
                <TouchableOpacity key={event.id} style={styles.eventItem}>
                  <View style={styles.eventIconContainer}>
                    <Trophy color="#7C3AED" size={20} />
                  </View>
                  <View style={styles.eventInfo}>
                    <Text style={styles.eventTitle}>{event.title}</Text>
                    <View style={styles.eventDetails}>
                      <Calendar color="#6B7280" size={12} />
                      <Text style={styles.eventDetailText}>
                        {formatEventDate(event.time)}, {formatEventTime(event.time)}
                      </Text>
                    </View>
                    <View style={styles.eventDetails}>
                      <MapPin color="#6B7280" size={12} />
                      <Text style={styles.eventDetailText}>{event.location}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No upcoming events</Text>
              <Text style={styles.emptyStateSubtext}>Check back soon for new events!</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
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
    paddingTop: 50,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logo: {
    width: 40,
    height: 40,
    backgroundColor: '#FCD34D',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoInner: {
    width: 24,
    height: 24,
    backgroundColor: '#7C3AED',
    borderRadius: 12,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#7C3AED',
  },
  headerSubtitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#7C3AED',
  },
  notificationButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    gap: 16,
  },
  welcomeSection: {
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  welcomeText: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  matchNoticeCard: {
    backgroundColor: 'rgba(124, 58, 237, 0.05)',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(124, 58, 237, 0.2)',
  },
  matchIcon: {
    marginBottom: 12,
  },
  matchNoticeTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  matchNoticeText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 16,
  },
  outlineButton: {
    borderWidth: 1,
    borderColor: '#7C3AED',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  outlineButtonText: {
    color: '#7C3AED',
    fontSize: 14,
    fontWeight: '600',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    letterSpacing: 0.5,
  },
  cardDescription: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewAllText: {
    fontSize: 14,
    color: '#7C3AED',
    fontWeight: '600',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 12,
  },
  statCard: {
    width: '47%',
    padding: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(124, 58, 237, 0.05)',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#7C3AED',
    marginBottom: 4,
  },
  statValueSmall: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#7C3AED',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#1F2937',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  statSubtext: {
    fontSize: 11,
    color: '#6B7280',
  },
  loadingContainer: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6B7280',
  },
  emptyState: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  rankingsList: {
    gap: 8,
  },
  rankingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#F9FAFB',
    gap: 12,
  },
  rankingEmoji: {
    fontSize: 24,
  },
  rankingInfo: {
    flex: 1,
  },
  rankingName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  recordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  wins: {
    fontSize: 12,
    fontWeight: '600',
    color: '#10B981',
  },
  recordSeparator: {
    fontSize: 12,
    color: '#6B7280',
  },
  losses: {
    fontSize: 12,
    fontWeight: '600',
    color: '#EF4444',
  },
  eventsList: {
    gap: 8,
  },
  eventItem: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#F9FAFB',
    gap: 12,
  },
  eventIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(124, 58, 237, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  eventInfo: {
    flex: 1,
    gap: 4,
  },
  eventTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  eventDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  eventDetailText: {
    fontSize: 12,
    color: '#6B7280',
  },
});
