import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar, MapPin, Trophy, Bell, ChevronRight } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface ClubEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  organizer: string;
}

interface QuickStat {
  label: string;
  value: string;
  subtext?: string;
}

export default function HomeTab() {
  // Mock Club Events
  const events: ClubEvent[] = [
    {
      id: '1',
      title: 'Holiday Party',
      date: 'Dec 24',
      time: '6:00 pm',
      location: 'HUB Games Area',
      organizer: 'UW Pool Club'
    },
    {
      id: '2',
      title: 'Beginner Workshop',
      date: 'Dec 26',
      time: '2:00 pm',
      location: 'IMA Recreation Center',
      organizer: 'UW Pool Club'
    },
    {
      id: '3',
      title: 'Winter Tournament',
      date: 'Dec 28',
      time: '10:00 am',
      location: 'HUB Games Area',
      organizer: 'UW Pool Club'
    }
  ];

  // Mock Quick Stats
  const quickStats: QuickStat[] = [
    { label: 'Skill Level', value: '5', subtext: 'Intermediate' },
    { label: 'Win Rate', value: '67%', subtext: '8-4 record' },
    { label: 'Rank', value: '#7', subtext: 'of 45 players' },
    { label: 'Matches', value: '12', subtext: 'this season' }
  ];

  // Mock Top Rankings
  const topRankings = [
    { rank: 1, name: 'Friday Mufasa', wins: 13, losses: 1 },
    { rank: 2, name: 'Oxygen', wins: 14, losses: 2 },
    { rank: 3, name: 'Fluke Twofer', wins: 12, losses: 4 }
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.logoContainer}>
            <View style={styles.logo}>
              <View style={styles.logoInner} />
            </View>
            <View>
              <Text style={styles.headerTitle}>CueU</Text>
              <Text style={styles.headerSubtitle}>UW Pool Club</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.notificationButton}>
            <Bell color="white" size={24} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <Text style={styles.sectionTitle}>Dashboard</Text>
          <Text style={styles.welcomeText}>Welcome back!</Text>
        </View>

        {/* Upcoming Matches Notice */}
        <View style={styles.matchNoticeCard}>
          <Calendar color="#7C3AED" size={48} style={styles.matchIcon} />
          <Text style={styles.matchNoticeTitle}>No Upcoming Matches</Text>
          <Text style={styles.matchNoticeText}>
            Your next league match will be scheduled soon
          </Text>
          <TouchableOpacity style={styles.outlineButton}>
            <Text style={styles.outlineButtonText}>View League Schedule</Text>
          </TouchableOpacity>
        </View>

        {/* Quick Stats Section */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>YOUR STATS</Text>
          <View style={styles.statsGrid}>
            {quickStats.map((stat, idx) => (
              <View key={idx} style={styles.statCard}>
                <Text style={styles.statValue}>{stat.value}</Text>
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
              <Text style={styles.cardDescription}>Fall 2025 Leaders</Text>
            </View>
            <TouchableOpacity style={styles.viewAllButton}>
              <Text style={styles.viewAllText}>View All</Text>
              <ChevronRight color="#7C3AED" size={16} />
            </TouchableOpacity>
          </View>
          <View style={styles.rankingsList}>
            {topRankings.map((player) => (
              <TouchableOpacity key={player.rank} style={styles.rankingItem}>
                <Text style={styles.rankingEmoji}>
                  {player.rank === 1 && '🥇'}
                  {player.rank === 2 && '🥈'}
                  {player.rank === 3 && '🥉'}
                </Text>
                <View style={styles.rankingInfo}>
                  <Text style={styles.rankingName}>{player.name}</Text>
                  <View style={styles.recordContainer}>
                    <Text style={styles.wins}>{player.wins}</Text>
                    <Text style={styles.recordSeparator}> - </Text>
                    <Text style={styles.losses}>{player.losses}</Text>
                  </View>
                </View>
                <ChevronRight color="#9CA3AF" size={16} />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Events Section */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>EVENTS</Text>
            <TouchableOpacity style={styles.viewAllButton}>
              <Text style={styles.viewAllText}>See All</Text>
              <ChevronRight color="#7C3AED" size={16} />
            </TouchableOpacity>
          </View>
          <View style={styles.eventsList}>
            {events.map((event) => (
              <TouchableOpacity key={event.id} style={styles.eventItem}>
                <View style={styles.eventIconContainer}>
                  <Trophy color="#7C3AED" size={20} />
                </View>
                <View style={styles.eventInfo}>
                  <Text style={styles.eventTitle}>{event.title}</Text>
                  <View style={styles.eventDetails}>
                    <Calendar color="#6B7280" size={12} />
                    <Text style={styles.eventDetailText}>{event.date}, {event.time}</Text>
                  </View>
                  <View style={styles.eventDetails}>
                    <MapPin color="#6B7280" size={12} />
                    <Text style={styles.eventDetailText}>{event.location}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
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
    backgroundColor: '#7C3AED',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(252, 211, 77, 0.3)',
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
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#FCD34D',
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
    fontSize: 28,
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

