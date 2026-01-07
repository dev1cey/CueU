import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Modal, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Trophy, Calendar, Users, X } from 'lucide-react-native';
import { useActiveSeason } from '../../hooks/useSeasons';
import { useSeasonTopPlayers } from '../../hooks/useUsers';
import { useAuth } from '../../contexts/AuthContext';
import { registerForSeason, completeMatch, getUserById } from '../../firebase/services';
import { useState, useEffect } from 'react';
import { useUpcomingMatches } from '../../hooks/useMatches';
import { Match, User } from '../../firebase/types';
import { getRacksNeeded } from '../../firebase/utils/handicapUtils';

export default function LeagueTab() {
  const { season, loading: seasonLoading, refetch: refetchSeason } = useActiveSeason();
  const { players, loading: playersLoading } = useSeasonTopPlayers(
    season?.playerIds || null,
    undefined,
    season?.id
  );
  const { currentUserId } = useAuth();
  const [registering, setRegistering] = useState(false);
  const { matches: upcomingMatches, loading: matchesLoading, refetch: refetchMatches } = useUpcomingMatches(currentUserId || undefined);
  
  // Modal state for match details and score reporting
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [player1Score, setPlayer1Score] = useState('');
  const [player2Score, setPlayer2Score] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  // State for match details (skill levels, racks needed, opponent info)
  const [player1Data, setPlayer1Data] = useState<User | null>(null);
  const [player2Data, setPlayer2Data] = useState<User | null>(null);
  const [loadingMatchDetails, setLoadingMatchDetails] = useState(false);

  const loading = seasonLoading || playersLoading;

  // Determine user's registration status
  const isEnrolled = season && currentUserId ? season.playerIds.includes(currentUserId) : false;
  const isPending = season && currentUserId ? season.pendingPlayerIds.includes(currentUserId) : false;
  const canRegister = season && currentUserId && !isEnrolled && !isPending;

  // Calculate standings with season points (APA scoring system)
  const standings = players.map((player, index) => {
    const seasonPoints = season?.id 
      ? (player.seasonPoints?.[season.id] || 0)
      : 0;
    return {
      rank: index + 1,
      name: player.name,
      wins: player.wins,
      losses: player.losses,
      seasonPoints: seasonPoints,
      hasMatches: player.matchesPlayed > 0,
    };
  });

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

  const handleMatchClick = async (match: Match) => {
    setSelectedMatch(match);
    setPlayer1Score('');
    setPlayer2Score('');
    setModalVisible(true);
    
    // Load player details for the match
    setLoadingMatchDetails(true);
    try {
      const [p1, p2] = await Promise.all([
        getUserById(match.player1Id),
        getUserById(match.player2Id),
      ]);
      setPlayer1Data(p1);
      setPlayer2Data(p2);
    } catch (error) {
      console.error('Error loading match details:', error);
    } finally {
      setLoadingMatchDetails(false);
    }
  };

  const handleSubmitScore = async () => {
    if (!selectedMatch || !currentUserId) return;

    const p1Score = parseInt(player1Score);
    const p2Score = parseInt(player2Score);

    // Validate scores
    if (isNaN(p1Score) || isNaN(p2Score) || p1Score < 0 || p2Score < 0) {
      Alert.alert('Invalid Score', 'Please enter valid scores for both players.');
      return;
    }

    if (p1Score === p2Score) {
      Alert.alert('Invalid Score', 'Matches cannot end in a tie. One player must win.');
      return;
    }

    // Determine winner
    const winnerId = p1Score > p2Score ? selectedMatch.player1Id : selectedMatch.player2Id;

    try {
      setSubmitting(true);
      await completeMatch(selectedMatch.id, winnerId, {
        player1: p1Score,
        player2: p2Score,
      });
      
      Alert.alert('Success', 'Match completed successfully!');
      setModalVisible(false);
      setSelectedMatch(null);
      
      // Refetch data
      await Promise.all([refetchMatches(), refetchSeason()]);
    } catch (error) {
      console.error('Error completing match:', error);
      Alert.alert(
        'Error',
        error instanceof Error ? error.message : 'Failed to complete match. Please try again.'
      );
    } finally {
      setSubmitting(false);
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

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
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
            {isEnrolled && upcomingMatches.length > 0 && (
              <View style={styles.card}>
                <Text style={styles.cardTitle}>YOUR UPCOMING MATCHES</Text>
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

      {/* Match Details and Score Reporting Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Match Details</Text>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.closeButton}
              >
                <X color="#6B7280" size={24} />
              </TouchableOpacity>
            </View>

            {selectedMatch && (
              <ScrollView style={styles.modalScrollView} showsVerticalScrollIndicator={false}>
                <View style={styles.modalMatchInfo}>
                  <Text style={styles.modalWeek}>Week {selectedMatch.weekNumber}</Text>
                  <Text style={styles.modalSeasonName}>{season?.name}</Text>
                </View>

                {loadingMatchDetails ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="small" color="#7C3AED" />
                    <Text style={styles.loadingText}>Loading match details...</Text>
                  </View>
                ) : player1Data && player2Data ? (
                  <>
                    {/* Match Handicap Info */}
                    <View style={styles.handicapSection}>
                      <Text style={styles.sectionTitle}>Match Format (APA Handicap)</Text>
                      <View style={styles.handicapGrid}>
                        <View style={styles.handicapCard}>
                          <Text style={[
                            styles.handicapPlayerName,
                            selectedMatch.player1Id === currentUserId && styles.modalCurrentUser
                          ]}>
                            {selectedMatch.player1Name}
                            {selectedMatch.player1Id === currentUserId && ' (You)'}
                          </Text>
                          <Text style={styles.handicapSkillLevel}>
                            Skill Level: {player1Data.skillLevelNum}
                          </Text>
                          <Text style={styles.handicapRacks}>
                            Needs {getRacksNeeded(player1Data.skillLevelNum, player2Data.skillLevelNum).player1} racks to win
                          </Text>
                        </View>
                        <View style={styles.handicapCard}>
                          <Text style={[
                            styles.handicapPlayerName,
                            selectedMatch.player2Id === currentUserId && styles.modalCurrentUser
                          ]}>
                            {selectedMatch.player2Name}
                            {selectedMatch.player2Id === currentUserId && ' (You)'}
                          </Text>
                          <Text style={styles.handicapSkillLevel}>
                            Skill Level: {player2Data.skillLevelNum}
                          </Text>
                          <Text style={styles.handicapRacks}>
                            Needs {getRacksNeeded(player1Data.skillLevelNum, player2Data.skillLevelNum).player2} racks to win
                          </Text>
                        </View>
                      </View>
                    </View>

                    {/* Opponent Contact Info */}
                    {(() => {
                      const isPlayer1 = selectedMatch.player1Id === currentUserId;
                      const opponent = isPlayer1 ? player2Data : player1Data;
                      
                      return (
                        <View style={styles.contactSection}>
                          <Text style={styles.sectionTitle}>Opponent Contact</Text>
                          <View style={styles.contactCard}>
                            <Text style={styles.contactName}>{opponent.name}</Text>
                            {opponent.email && (
                              <View style={styles.contactItem}>
                                <Text style={styles.contactLabel}>Email:</Text>
                                <Text style={styles.contactValue}>{opponent.email}</Text>
                              </View>
                            )}
                            {opponent.phone && (
                              <View style={styles.contactItem}>
                                <Text style={styles.contactLabel}>Phone:</Text>
                                <Text style={styles.contactValue}>{opponent.phone}</Text>
                              </View>
                            )}
                            {opponent.wechat && (
                              <View style={styles.contactItem}>
                                <Text style={styles.contactLabel}>WeChat:</Text>
                                <Text style={styles.contactValue}>{opponent.wechat}</Text>
                              </View>
                            )}
                            {!opponent.phone && !opponent.wechat && !opponent.email && (
                              <Text style={styles.noContactInfo}>No contact information available</Text>
                            )}
                          </View>
                        </View>
                      );
                    })()}

                    {/* Score Reporting Section */}
                    <View style={styles.scoreSection}>
                      <Text style={styles.sectionTitle}>Report Score</Text>
                      <View style={styles.scoreInputContainer}>
                        <View style={styles.playerScoreSection}>
                          <Text style={[
                            styles.modalPlayerName,
                            selectedMatch.player1Id === currentUserId && styles.modalCurrentUser
                          ]}>
                            {selectedMatch.player1Name}
                            {selectedMatch.player1Id === currentUserId && ' (You)'}
                          </Text>
                          <TextInput
                            style={styles.scoreInput}
                            placeholder="Racks won"
                            keyboardType="number-pad"
                            value={player1Score}
                            onChangeText={setPlayer1Score}
                          />
                        </View>

                        <Text style={styles.modalVsText}>VS</Text>

                        <View style={styles.playerScoreSection}>
                          <Text style={[
                            styles.modalPlayerName,
                            selectedMatch.player2Id === currentUserId && styles.modalCurrentUser
                          ]}>
                            {selectedMatch.player2Name}
                            {selectedMatch.player2Id === currentUserId && ' (You)'}
                          </Text>
                          <TextInput
                            style={styles.scoreInput}
                            placeholder="Racks won"
                            keyboardType="number-pad"
                            value={player2Score}
                            onChangeText={setPlayer2Score}
                          />
                        </View>
                      </View>
                    </View>

                    <View style={styles.modalButtons}>
                      <TouchableOpacity
                        style={[styles.modalButton, styles.cancelButton]}
                        onPress={() => setModalVisible(false)}
                      >
                        <Text style={styles.cancelButtonText}>Close</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.modalButton, styles.submitButton]}
                        onPress={handleSubmitScore}
                        disabled={submitting}
                      >
                        <Text style={styles.submitButtonText}>
                          {submitting ? 'Submitting...' : 'Submit Score'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </>
                ) : (
                  <Text style={styles.errorText}>Unable to load match details</Text>
                )}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
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
});