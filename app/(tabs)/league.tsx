import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Trophy, Calendar, Users } from 'lucide-react-native';

export default function LeagueTab() {
  const standings = [
    { rank: 1, name: 'Friday Mufasa', wins: 13, losses: 1, winRate: '93%' },
    { rank: 2, name: 'Oxygen', wins: 14, losses: 2, winRate: '88%' },
    { rank: 3, name: 'Fluke Twofer', wins: 12, losses: 4, winRate: '75%' },
    { rank: 4, name: 'Pocket Pro', wins: 10, losses: 5, winRate: '67%' },
    { rank: 5, name: 'Cue Master', wins: 9, losses: 6, winRate: '60%' },
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
        </View>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.titleSection}>
          <Text style={styles.pageTitle}>League</Text>
          <Text style={styles.pageSubtitle}>Fall 2025 Season</Text>
        </View>

        {/* League Info Cards */}
        <View style={styles.infoGrid}>
          <View style={styles.infoCard}>
            <Trophy color="#7C3AED" size={24} />
            <Text style={styles.infoValue}>45</Text>
            <Text style={styles.infoLabel}>Players</Text>
          </View>
          <View style={styles.infoCard}>
            <Calendar color="#7C3AED" size={24} />
            <Text style={styles.infoValue}>Week 8</Text>
            <Text style={styles.infoLabel}>of 12</Text>
          </View>
          <View style={styles.infoCard}>
            <Users color="#7C3AED" size={24} />
            <Text style={styles.infoValue}>128</Text>
            <Text style={styles.infoLabel}>Matches</Text>
          </View>
        </View>

        {/* Standings */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>STANDINGS</Text>
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
        </View>

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
});