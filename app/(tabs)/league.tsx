import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Trophy, Calendar, Users, X, Flag } from 'lucide-react-native';
import { useActiveSeason } from '../../hooks/useSeasons';
import { useSeasonTopPlayers } from '../../hooks/useUsers';
import { useAuth } from '../../contexts/AuthContext';
import { registerForSeason } from '../../firebase/services';
import { useState } from 'react';

export default function LeagueTab() {
  const { season, loading: seasonLoading, refetch: refetchSeason } = useActiveSeason();
  const { players, loading: playersLoading } = useSeasonTopPlayers(season?.playerIds || null);
  const { currentUserId } = useAuth();
  const [registering, setRegistering] = useState(false);

  const loading = seasonLoading || playersLoading;

  // Determine user's registration status
  const isEnrolled = season && currentUserId ? season.playerIds.includes(currentUserId) : false;
  const isPending = season && currentUserId ? season.pendingPlayerIds.includes(currentUserId) : false;
  const canRegister = season && currentUserId && !isEnrolled && !isPending;

  // Calculate standings with win rate
  const standings = players.map((player, index) => ({
    rank: index + 1,
    name: player.name,
    wins: player.wins,
    losses: player.losses,
    winRate: player.matchesPlayed > 0 
      ? `${Math.round((player.wins / player.matchesPlayed) * 100)}%`
      : '-',
    hasMatches: player.matchesPlayed > 0,
  }));

  const handleRegister = async () => {
    if (!season || !currentUserId) return;

    try {
      setRegistering(true);
      await registerForSeason(season.id, currentUserId);
      Alert.alert(
        'Registration Submitted',
        'Your registration has been submitted and is pending admin approval.',
        [{ text: 'OK' }]
      );
      // Refetch the season to update the UI
      await refetchSeason();
    } catch (error) {
      console.error('Error registering for season:', error);
      Alert.alert(
        'Registration Failed',
        error instanceof Error ? error.message : 'Failed to register for the season. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setRegistering(false);
    }
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
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.titleSection}>
          <Text style={styles.pageTitle}>League</Text>
          <Text style={styles.pageSubtitle}>
            {season ? season.name : 'No Active Season'}
          </Text>
        </View>

        {/* Join League CTA - Only show if not enrolled */}
        {!isEnrolled && season && (
          <View style={styles.ctaCard}>
            <Text style={styles.ctaTitle}>Want to Join?</Text>
            <Text style={styles.ctaText}>
              Sign up for {season.name} and compete with fellow UW students!
            </Text>
            {isPending ? (
              <View style={[styles.ctaButton, styles.ctaButtonDisabled]}>
                <Text style={styles.ctaButtonTextDisabled}>Pending Approval</Text>
              </View>
            ) : canRegister ? (
              <TouchableOpacity 
                style={styles.ctaButton} 
                onPress={handleRegister}
                disabled={registering}
              >
                <Text style={styles.ctaButtonText}>
                  {registering ? 'Registering...' : `Register for ${season.name}`}
                </Text>
              </TouchableOpacity>
            ) : null}
          </View>
        )}

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
                  {season?.playerIds.length || 0}
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

            {/* Upcoming Matches */}
            {isEnrolled && (
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardTitle}>UPCOMING MATCHES</Text>
                  <TouchableOpacity
                    style={styles.historyButton}
                    onPress={() => router.push('/match-history')}
                  >
                    <Text style={styles.historyButtonText}>View History</Text>
                  </TouchableOpacity>
                </View>
                {upcomingMatches.length > 0 ? (
                  <View style={styles.matchesList}>
                    {upcomingMatches.map((match) => {
                      const opponentName = match.player1Id === currentUserId 
                        ? match.player2Name 
                        : match.player1Name;
                      
                      return (
                        <TouchableOpacity
                          key={match.id}
                          style={styles.matchCardSimple}
                          onPress={() => handleMatchClick(match)}
                        >
                          <View style={styles.matchSimpleContent}>
                            <View>
                              <Text style={styles.matchWeekSimple}>Week {match.weekNumber}</Text>
                              <Text style={styles.opponentName}>vs {opponentName}</Text>
                            </View>
                            <Text style={styles.tapToView}>Tap to view →</Text>
                          </View>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                ) : (
                  <Text style={styles.emptyText}>No upcoming matches</Text>
                )}
              </View>
            )}

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
                    <Text style={[styles.tableHeaderText, { flex: 1 }]}>Points</Text>
                  </View>
                  {standings.map((player) => (
                    <View key={player.rank} style={styles.tableRow}>
                      <Text style={[styles.tableCellRank, { flex: 0.7 }]}>
                        {player.hasMatches && player.rank <= 3 ? 
                          (player.rank === 1 ? '🥇' : player.rank === 2 ? '🥈' : '🥉') 
                          : player.rank}
                      </Text>
                      <Text style={[styles.tableCell, { flex: 2, fontWeight: '600' }]}>
                        {player.name}
                      </Text>
                      <Text style={[styles.tableCell, { flex: 1 }]}>
                        {player.hasMatches ? `${player.wins}-${player.losses}` : '-'}
                      </Text>
                      <Text style={[styles.tableCell, { flex: 1, fontWeight: '600' }]}>
                        {player.seasonPoints.toFixed(1)}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </>
        )}
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
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    gap: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    letterSpacing: 0.5,
  },
  historyButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#F3F4F6',
    borderRadius: 6,
  },
  historyButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#7C3AED',
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
  ctaButtonDisabled: {
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
  },
  ctaButtonTextDisabled: {
    color: 'rgba(124, 58, 237, 0.7)',
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
  matchesList: {
    gap: 12,
  },
  matchCardSimple: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  matchSimpleContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  matchWeekSimple: {
    fontSize: 12,
    fontWeight: '600',
    color: '#7C3AED',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  opponentName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  tapToView: {
    fontSize: 14,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  currentUserName: {
    color: '#7C3AED',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    width: '90%',
    maxWidth: 500,
    maxHeight: '85%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  modalScrollView: {
    maxHeight: '100%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  closeButton: {
    padding: 4,
  },
  modalMatchInfo: {
    alignItems: 'center',
    marginBottom: 20,
  },
  modalWeek: {
    fontSize: 16,
    fontWeight: '600',
    color: '#7C3AED',
    textTransform: 'uppercase',
  },
  modalSeasonName: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1F2937',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  handicapSection: {
    marginBottom: 20,
  },
  handicapGrid: {
    gap: 12,
  },
  handicapCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  handicapPlayerName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 6,
  },
  handicapSkillLevel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  handicapRacks: {
    fontSize: 13,
    color: '#7C3AED',
    fontWeight: '600',
  },
  contactSection: {
    marginBottom: 20,
  },
  contactCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  contactName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  contactItem: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  contactLabel: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
    width: 70,
  },
  contactValue: {
    fontSize: 14,
    color: '#1F2937',
    flex: 1,
  },
  noContactInfo: {
    fontSize: 14,
    color: '#9CA3AF',
    fontStyle: 'italic',
  },
  scoreSection: {
    marginBottom: 20,
  },
  loadingText: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 8,
  },
  errorText: {
    fontSize: 14,
    color: '#EF4444',
    textAlign: 'center',
    padding: 16,
  },
  scoreInputContainer: {
    gap: 12,
  },
  playerScoreSection: {
    gap: 8,
  },
  modalPlayerName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    textAlign: 'center',
  },
  modalCurrentUser: {
    color: '#7C3AED',
  },
  scoreInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    textAlign: 'center',
    backgroundColor: 'white',
  },
  modalVsText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#9CA3AF',
    textAlign: 'center',
    marginVertical: 4,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#F3F4F6',
  },
  cancelButtonText: {
    color: '#6B7280',
    fontSize: 16,
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: '#7C3AED',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  reportButton: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FEE2E2',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  reportButtonText: {
    color: '#EF4444',
    fontSize: 16,
    fontWeight: '600',
  },
  reportButtonDisabled: {
    backgroundColor: '#F3F4F6',
    borderColor: '#E5E7EB',
  },
  reportButtonTextDisabled: {
    color: '#9CA3AF',
  },
  reportSection: {
    marginBottom: 20,
  },
  reportLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  reportTextInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#1F2937',
    backgroundColor: 'white',
    minHeight: 120,
    textAlignVertical: 'top',
  },
  reportHint: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 8,
    fontStyle: 'italic',
  },
  matchHistoryContent: {
    flex: 1,
  },
  matchResult: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 4,
  },
  matchWin: {
    color: '#10B981',
  },
  matchLoss: {
    color: '#EF4444',
  },
  completedScoreContainer: {
    gap: 12,
    marginBottom: 16,
  },
  completedScorePlayer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  completedScoreName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    flex: 1,
  },
  completedScoreValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  winnerScore: {
    color: '#10B981',
  },
  winnerBadge: {
    backgroundColor: '#ECFDF5',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#10B981',
  },
  winnerText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10B981',
    textAlign: 'center',
  },
  pointsSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  pointsLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  pointsRow: {
    gap: 8,
  },
  pointsText: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '500',
  },
});