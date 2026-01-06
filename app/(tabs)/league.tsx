import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Trophy, Calendar, Users } from 'lucide-react-native';
import { useActiveSeason } from '../../hooks/useSeasons';
import { useTopPlayers } from '../../hooks/useUsers';

export default function LeagueTab() {
  const { season, loading: seasonLoading } = useActiveSeason();
  const { players, loading: playersLoading } = useTopPlayers(10);

  const loading = seasonLoading || playersLoading;

  // Calculate standings with win rate
  const standings = players.map((player, index) => ({
    rank: index + 1,
    name: player.name,
    wins: player.wins,
    losses: player.losses,
    winRate: player.matchesPlayed > 0 
      ? `${Math.round((player.wins / player.matchesPlayed) * 100)}%`
      : '0%',
  }));

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
        </View>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.titleSection}>
          <Text style={styles.pageTitle}>League</Text>
          <Text style={styles.pageSubtitle}>
            {season ? season.name : 'No Active Season'}
          </Text>
        </View>

        {/* League Info Cards */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#7C3AED" />
          </View>
        ) : (
          <>
            <View style={styles.infoGrid}>
              <View style={styles.infoCard}>
                <Trophy color="#7C3AED" size={24} />
                <Text style={styles.infoValue}>
                  {season?.totalPlayers || 0}
                </Text>
                <Text style={styles.infoLabel}>Players</Text>
              </View>
              <View style={styles.infoCard}>
                <Calendar color="#7C3AED" size={24} />
                <Text style={styles.infoValue}>
                  {season ? `Week ${season.currentWeek}` : 'N/A'}
                </Text>
                <Text style={styles.infoLabel}>
                  {season ? `of ${season.totalWeeks}` : ''}
                </Text>
              </View>
              <View style={styles.infoCard}>
                <Users color="#7C3AED" size={24} />
                <Text style={styles.infoValue}>
                  {season?.totalMatches || 0}
                </Text>
                <Text style={styles.infoLabel}>Matches</Text>
              </View>
            </View>

            {/* Standings */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>STANDINGS</Text>
              {standings.length === 0 ? (
                <Text style={styles.emptyText}>No standings available yet</Text>
              ) : (
                <View style={styles.standingsTable}>
                  <View style={styles.tableHeader}>
                    <Text style={[styles.tableHeaderText, { flex: 0.7 }]}>Rank</Text>
                    <Text style={[styles.tableHeaderText, { flex: 2 }]}>Player</Text>
                    <Text style={[styles.tableHeaderText, { flex: 1 }]}>W-L</Text>
                    <Text style={[styles.tableHeaderText, { flex: 1 }]}>Win %</Text>
                  </View>
                  {standings.map((player) => (
                    <View key={player.rank} style={styles.tableRow}>
                      <Text style={[styles.tableCellRank, { flex: 0.7 }]}>
                        {player.rank <= 3 ? 
                          (player.rank === 1 ? '🥇' : player.rank === 2 ? '🥈' : '🥉') 
                          : player.rank}
                      </Text>
                      <Text style={[styles.tableCell, { flex: 2, fontWeight: '600' }]}>
                        {player.name}
                      </Text>
                      <Text style={[styles.tableCell, { flex: 1 }]}>
                        {player.wins}-{player.losses}
                      </Text>
                      <Text style={[styles.tableCell, { flex: 1 }]}>
                        {player.winRate}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </>
        )}

        {/* Join League CTA */}
        <View style={styles.ctaCard}>
          <Text style={styles.ctaTitle}>Want to Join?</Text>
          <Text style={styles.ctaText}>
            Sign up for the next season and compete with fellow UW students!
          </Text>
          <TouchableOpacity style={styles.ctaButton}>
            <Text style={styles.ctaButtonText}>Register for Spring 2025</Text>
          </TouchableOpacity>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    gap: 16,
  },
  titleSection: {
    marginBottom: 8,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  pageSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  infoGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  infoCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  infoValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 8,
  },
  infoLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
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
    marginBottom: 16,
  },
  standingsTable: {
    gap: 8,
  },
  tableHeader: {
    flexDirection: 'row',
    paddingBottom: 12,
    borderBottomWidth: 2,
    borderBottomColor: '#E5E7EB',
  },
  tableHeaderText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#6B7280',
    textTransform: 'uppercase',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  tableCellRank: {
    fontSize: 14,
    color: '#1F2937',
    textAlign: 'center',
  },
  tableCell: {
    fontSize: 14,
    color: '#1F2937',
  },
  ctaCard: {
    backgroundColor: '#7C3AED',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  ctaTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  ctaText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginBottom: 16,
  },
  ctaButton: {
    backgroundColor: 'white',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  ctaButtonText: {
    color: '#7C3AED',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    paddingVertical: 16,
  },
});