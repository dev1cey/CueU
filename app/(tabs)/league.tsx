import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';

export default function LeagueTab() {
  const [isEnrolled, setIsEnrolled] = useState(false);

  // League stats - will be updated from backend
  const [leagueStats, setLeagueStats] = useState({
    players: 0,
    currentWeek: 1,
    totalWeeks: 12,
    matches: 0,
  });

  // Standings data - will be populated from backend
  const [standings, setStandings] = useState<any[]>([]);

  const handleBypassSignup = () => {
    setIsEnrolled(true);
  };

  const handleSignUp = () => {
    // TODO: Open Google Form or navigate to signup
    console.log('Sign up for league');
    // For now, also set as enrolled
    setIsEnrolled(true);
  };

  // If enrolled, show standings page, otherwise show signup page
  if (isEnrolled) {
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
              <Ionicons name="trophy-outline" color="#7C3AED" size={24} />
              <Text style={styles.infoValue}>{leagueStats.players}</Text>
              <Text style={styles.infoLabel}>Players</Text>
            </View>
            <View style={styles.infoCard}>
              <Ionicons name="calendar-outline" color="#7C3AED" size={24} />
              <Text style={styles.infoValue}>Week {leagueStats.currentWeek}</Text>
              <Text style={styles.infoLabel}>of {leagueStats.totalWeeks}</Text>
            </View>
            <View style={styles.infoCard}>
              <Ionicons name="people-outline" color="#7C3AED" size={24} />
              <Text style={styles.infoValue}>{leagueStats.matches}</Text>
              <Text style={styles.infoLabel}>Matches</Text>
            </View>
          </View>

          {/* Standings */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>STANDINGS</Text>
            {standings.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="trophy-outline" size={48} color="#D1D5DB" />
                <Text style={styles.emptyStateTitle}>No Standings Yet</Text>
                <Text style={styles.emptyStateText}>
                  Standings will appear once players start competing in matches.
                </Text>
              </View>
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
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Signup/Onboarding Page
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
        {/* Title Section */}
        <View style={styles.titleSection}>
          <Text style={styles.pageTitle}>UW Pool League</Text>
          <Text style={styles.pageSubtitle}>Join our competitive pool league</Text>
        </View>

        {/* Testing Mode Banner */}
        <View style={styles.testingBanner}>
          <View style={styles.testingLeft}>
            <Ionicons name="construct-outline" size={20} color="#92400E" />
            <View style={styles.testingTextContainer}>
              <Text style={styles.testingTitle}>Testing Mode</Text>
              <Text style={styles.testingSubtitle}>Skip signup to preview enrolled experience</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.bypassButton} onPress={handleBypassSignup}>
            <Text style={styles.bypassButtonText}>Bypass Signup</Text>
          </TouchableOpacity>
        </View>

        {/* Hero CTA Card */}
        <LinearGradient
          colors={['#7C3AED', '#D4AF37']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroCard}
        >
          <Ionicons name="trophy" size={64} color="white" style={styles.heroIcon} />
          <Text style={styles.heroTitle}>Join the Competition</Text>
          <Text style={styles.heroSubtitle}>
            Compete against other players, track your progress, and climb the rankings!
          </Text>
          <TouchableOpacity style={styles.signupButton} onPress={handleSignUp}>
            <Ionicons name="open-outline" size={18} color="#7C3AED" style={{ marginRight: 8 }} />
            <Text style={styles.signupButtonText}>Sign Up for League</Text>
          </TouchableOpacity>
          <Text style={styles.registrationNote}>Registration via Google Form</Text>
        </LinearGradient>

        {/* How It Works Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>How It Works</Text>
          <Text style={styles.sectionSubtitle}>Everything you need to know about the league</Text>
          
          <View style={styles.featuresGrid}>
            {/* Weekly Matches */}
            <View style={styles.featureItem}>
              <View style={styles.featureIconContainer}>
                <Ionicons name="calendar-outline" size={24} color="#7C3AED" />
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>Weekly Matches</Text>
                <Text style={styles.featureDescription}>
                  Get matched with opponents each week. Schedule matches at your convenience.
                </Text>
              </View>
            </View>

            {/* Rankings & Stats */}
            <View style={styles.featureItem}>
              <View style={styles.featureIconContainer}>
                <Ionicons name="trending-up-outline" size={24} color="#7C3AED" />
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>Rankings & Stats</Text>
                <Text style={styles.featureDescription}>
                  Track your wins, losses, and see how you stack up against other players.
                </Text>
              </View>
            </View>

            {/* Skill Levels */}
            <View style={styles.featureItem}>
              <View style={styles.featureIconContainer}>
                <Ionicons name="trophy-outline" size={24} color="#7C3AED" />
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>Skill Levels (1-7)</Text>
                <Text style={styles.featureDescription}>
                  APA-style skill system ensures fair competition between all players.
                </Text>
              </View>
            </View>

            {/* In-App Chat */}
            <View style={styles.featureItem}>
              <View style={styles.featureIconContainer}>
                <Ionicons name="chatbubble-outline" size={24} color="#7C3AED" />
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>In-App Chat</Text>
                <Text style={styles.featureDescription}>
                  Coordinate match times and locations directly with your opponents.
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Requirements Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Requirements</Text>
          <Text style={styles.sectionSubtitle}>What you need to participate</Text>
          
          <View style={styles.requirementsCard}>
            <View style={styles.requirementItem}>
              <Ionicons name="checkmark-circle" size={24} color="#10B981" />
              <Text style={styles.requirementText}>Active UW Pool Club membership</Text>
            </View>
            
            <View style={styles.requirementItem}>
              <Ionicons name="checkmark-circle" size={24} color="#10B981" />
              <Text style={styles.requirementText}>Commit to playing at least one match per week</Text>
            </View>
            
            <View style={styles.requirementItem}>
              <Ionicons name="checkmark-circle" size={24} color="#10B981" />
              <Text style={styles.requirementText}>Report match results within 24 hours</Text>
            </View>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  titleSection: {
    marginBottom: 16,
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
  // Testing Mode Banner
  testingBanner: {
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  testingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  testingTextContainer: {
    flex: 1,
  },
  testingTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#92400E',
  },
  testingSubtitle: {
    fontSize: 12,
    color: '#92400E',
    marginTop: 2,
    opacity: 0.8,
  },
  bypassButton: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D97706',
  },
  bypassButtonText: {
    color: '#92400E',
    fontSize: 14,
    fontWeight: '600',
  },
  // Hero Card
  heroCard: {
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  heroIcon: {
    marginBottom: 16,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 12,
  },
  heroSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  signupButton: {
    backgroundColor: 'white',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  signupButtonText: {
    color: '#7C3AED',
    fontSize: 16,
    fontWeight: '600',
  },
  registrationNote: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 12,
  },
  // Sections
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
  },
  // Features Grid
  featuresGrid: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  featureItem: {
    flexDirection: 'row',
    gap: 12,
  },
  featureIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(124, 58, 237, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  // Requirements
  requirementsCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  requirementText: {
    fontSize: 14,
    color: '#1F2937',
    flex: 1,
  },
  // Standings Page Styles
  infoGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
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
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 24,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 20,
  },
});

