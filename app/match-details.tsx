import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Modal, TextInput, Alert } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ChevronLeft, X, Flag } from 'lucide-react-native';
import { useState, useEffect } from 'react';
import { Match, User } from '../firebase/types';
import { getUserById, getMatchById, createMatchReport, hasUserReportedMatch, acceptByeMatch } from '../firebase/services';
import { getRacksNeeded } from '../firebase/utils/handicapUtils';
import { useActiveSeason } from '../hooks/useSeasons';
import { useAuth } from '../contexts/AuthContext';

export default function MatchDetails() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { matchId } = useLocalSearchParams<{ matchId: string }>();
  const { currentUserId, currentUser } = useAuth();
  const { season } = useActiveSeason();
  
  const [match, setMatch] = useState<Match | null>(null);
  const [player1Data, setPlayer1Data] = useState<User | null>(null);
  const [player2Data, setPlayer2Data] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  
  // State for report issue
  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [reportMessage, setReportMessage] = useState('');
  const [submittingReport, setSubmittingReport] = useState(false);
  const [hasExistingReport, setHasExistingReport] = useState(false);
  const [acceptingBye, setAcceptingBye] = useState(false);

  useEffect(() => {
    const loadMatchDetails = async () => {
      if (!matchId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const matchData = await getMatchById(matchId);
        if (!matchData) {
          Alert.alert('Error', 'Match not found');
          router.back();
          return;
        }

        setMatch(matchData);

        // Check if this is a bye match (player1Id === player2Id)
        const isByeMatch = matchData.player1Id === matchData.player2Id;
        
        // Load players first (required), then reports separately (non-blocking)
        if (isByeMatch) {
          // For bye matches, both players are the same
          const player = await getUserById(matchData.player1Id);
          setPlayer1Data(player);
          setPlayer2Data(player);
        } else {
          const [p1, p2] = await Promise.all([
            getUserById(matchData.player1Id),
            getUserById(matchData.player2Id),
          ]);
          setPlayer1Data(p1);
          setPlayer2Data(p2);
        }
        
        // Check if current user has already reported this match (any status)
        // Don't block match details if this check fails
        if (currentUserId) {
          try {
            const hasReported = await hasUserReportedMatch(currentUserId, matchId);
            setHasExistingReport(hasReported);
          } catch (reportError) {
            console.error('Error checking for existing report (non-blocking):', reportError);
            // If we can't check, default to false (allow reporting)
            setHasExistingReport(false);
          }
        }
      } catch (error) {
        console.error('Error loading match details:', error);
        Alert.alert('Error', 'Failed to load match details');
        router.back();
      } finally {
        setLoading(false);
      }
    };

    loadMatchDetails();
  }, [matchId, currentUserId]);

  const handleReportIssue = () => {
    if (hasExistingReport) {
      Alert.alert(
        'Report Under Review',
        'You have already submitted a report for this match. An admin will review it shortly.',
        [{ text: 'OK' }]
      );
      return;
    }
    setReportModalVisible(true);
    setReportMessage('');
  };

  const handleSubmitReport = async () => {
    if (!match || !currentUserId || !currentUser) return;

    if (!reportMessage.trim()) {
      Alert.alert('Error', 'Please enter a message describing the issue.');
      return;
    }

    try {
      setSubmittingReport(true);
      await createMatchReport({
        matchId: match.id,
        reportedBy: currentUserId,
        reportedByName: currentUser.name,
        message: reportMessage.trim(),
      });
      
      // Update state to reflect that a report has been submitted
      setHasExistingReport(true);
      
      Alert.alert('Success', 'Your report has been submitted. An admin will review it shortly.');
      setReportModalVisible(false);
      setReportMessage('');
    } catch (error) {
      console.error('Error submitting report:', error);
      Alert.alert(
        'Error',
        error instanceof Error ? error.message : 'Failed to submit report. Please try again.'
      );
    } finally {
      setSubmittingReport(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
          <View style={styles.headerContent}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backButton}
            >
              <ChevronLeft color="#7C3AED" size={24} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Match Details</Text>
            <View style={styles.placeholder} />
          </View>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#7C3AED" />
          <Text style={styles.loadingText}>Loading match details...</Text>
        </View>
      </View>
    );
  }

  if (!match || !player1Data || !player2Data) {
    return (
      <View style={styles.container}>
        <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
          <View style={styles.headerContent}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backButton}
            >
              <ChevronLeft color="#7C3AED" size={24} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Match Details</Text>
            <View style={styles.placeholder} />
          </View>
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.errorText}>Unable to load match details</Text>
        </View>
      </View>
    );
  }

  // Check if this is a bye match
  const isByeMatch = match.player1Id === match.player2Id || match.status === 'bye';

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <View style={styles.headerContent}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <ChevronLeft color="#7C3AED" size={24} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Match Details</Text>
          <View style={styles.placeholder} />
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.matchInfo}>
          <Text style={styles.weekText}>Week {match.weekNumber}</Text>
          <Text style={styles.seasonName}>{season?.name}</Text>
        </View>

        {isByeMatch ? (
          /* Bye Match Info */
          <View style={styles.section}>
            <View style={styles.byeMatchCard}>
              <Text style={styles.byeMatchTitle}>BYE WEEK</Text>
              <Text style={styles.byeMatchDescription}>
                You have a bye for this week's matchup. This means you don't have an opponent due to an odd number of players in the season.
              </Text>
              <Text style={styles.byeMatchPoints}>
                You will receive full points (10) for this week.
              </Text>
              {match.status === 'bye' && (
                <TouchableOpacity
                  style={styles.acceptByeButton}
                  onPress={async () => {
                    try {
                      setAcceptingBye(true);
                      await acceptByeMatch(match.id);
                      Alert.alert('Success', 'Bye match accepted! You received 10 points.', [
                        { text: 'OK', onPress: () => router.back() }
                      ]);
                    } catch (error) {
                      console.error('Error accepting bye match:', error);
                      Alert.alert(
                        'Error',
                        error instanceof Error ? error.message : 'Failed to accept bye match. Please try again.'
                      );
                    } finally {
                      setAcceptingBye(false);
                    }
                  }}
                  disabled={acceptingBye}
                >
                  <Text style={styles.acceptByeButtonText}>
                    {acceptingBye ? 'Accepting...' : 'Accept Bye'}
                  </Text>
                </TouchableOpacity>
              )}
              {match.status === 'completed' && (
                <View style={styles.completedByeBadge}>
                  <Text style={styles.completedByeText}>Bye Match Accepted</Text>
                  {match.player1Points !== undefined && (
                    <Text style={styles.completedByePoints}>
                      Points Earned: {match.player1Points.toFixed(1)}
                    </Text>
                  )}
                </View>
              )}
            </View>
          </View>
        ) : (
          <>
            {/* Match Handicap Info */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Match Format</Text>
              {(() => {
                // For completed matches, use stored values
                const racksNeeded = match.status === 'completed' && 
                  match.player1RacksNeeded && match.player2RacksNeeded
                  ? {
                      player1: match.player1RacksNeeded,
                      player2: match.player2RacksNeeded
                    }
                  : getRacksNeeded(
                      player1Data.skillLevelNum,
                      player2Data.skillLevelNum
                    );
                
                const isPlayer1CurrentUser = match.player1Id === currentUserId;
                const opponentName = isPlayer1CurrentUser
                  ? match.player2Name
                  : match.player1Name;
                
                // For completed matches, use stored skill levels
                const opponentSkillLevel = match.status === 'completed' && 
                  match.player1SkillLevel && match.player2SkillLevel
                  ? (isPlayer1CurrentUser ? match.player2SkillLevel : match.player1SkillLevel)
                  : (isPlayer1CurrentUser ? player2Data.skillLevelNum : player1Data.skillLevelNum);
                
                const currentUserRacks = isPlayer1CurrentUser
                  ? racksNeeded.player1
                  : racksNeeded.player2;
                const opponentRacks = isPlayer1CurrentUser
                  ? racksNeeded.player2
                  : racksNeeded.player1;

                return (
                  <View style={styles.handicapCard}>
                    <Text style={styles.handicapPlayerName}>
                      Opponent: {opponentName} (Skill Level {opponentSkillLevel})
                    </Text>

                    <Text style={styles.handicapRacks}>
                      Racks to win — You: {currentUserRacks}   |   {opponentName}: {opponentRacks}
                    </Text>
                  </View>
                );
              })()}
            </View>

            {/* Opponent Contact Info */}
            {(() => {
              const isPlayer1 = match.player1Id === currentUserId;
              const opponent = isPlayer1 ? player2Data : player1Data;
              
              return (
                <View style={styles.section}>
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
                    {opponent.discord && (
                      <View style={styles.contactItem}>
                        <Text style={styles.contactLabel}>Discord:</Text>
                        <Text style={styles.contactValue}>{opponent.discord}</Text>
                      </View>
                    )}
                    {!opponent.phone && !opponent.wechat && !opponent.email && !opponent.discord && (
                      <Text style={styles.noContactInfo}>No contact information available</Text>
                    )}
                  </View>
                </View>
              );
            })()}
          </>
        )}

        {/* Match Result (for completed matches) */}
        {match.status === 'completed' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Match Result</Text>
            <View style={styles.completedScoreContainer}>
              <View style={styles.completedScorePlayer}>
                <Text style={[
                  styles.completedScoreName,
                  match.player1Id === currentUserId && styles.currentUser
                ]}>
                  {match.player1Name}
                  {match.player1Id === currentUserId && ' (You)'}
                </Text>
                <Text style={[
                  styles.completedScoreValue,
                  match.winnerId === match.player1Id && styles.winnerScore
                ]}>
                  {match.score?.player1 ?? 0}
                </Text>
              </View>
              <Text style={styles.vsText}>VS</Text>
              <View style={styles.completedScorePlayer}>
                <Text style={[
                  styles.completedScoreName,
                  match.player2Id === currentUserId && styles.currentUser
                ]}>
                  {match.player2Name}
                  {match.player2Id === currentUserId && ' (You)'}
                </Text>
                <Text style={[
                  styles.completedScoreValue,
                  match.winnerId === match.player2Id && styles.winnerScore
                ]}>
                  {match.score?.player2 ?? 0}
                </Text>
              </View>
            </View>
            {match.winnerId && (
              <View style={styles.winnerBadge}>
                <Text style={styles.winnerText}>
                  Winner: {match.winnerId === match.player1Id 
                    ? match.player1Name 
                    : match.player2Name}
                </Text>
              </View>
            )}
            {(match.player1Points !== undefined || match.player2Points !== undefined) && (
              <View style={styles.pointsSection}>
                <Text style={styles.pointsLabel}>Points Earned:</Text>
                <View style={styles.pointsRow}>
                  <Text style={styles.pointsText}>
                    {match.player1Name}: {match.player1Points?.toFixed(1) ?? '0.0'}
                  </Text>
                  <Text style={styles.pointsText}>
                    {match.player2Name}: {match.player2Points?.toFixed(1) ?? '0.0'}
                  </Text>
                </View>
              </View>
            )}
          </View>
        )}

        {/* Report Issue Button */}
        <View style={styles.actionSection}>
          <TouchableOpacity
            style={[
              styles.reportButton,
              hasExistingReport && styles.reportButtonDisabled
            ]}
            onPress={handleReportIssue}
            disabled={hasExistingReport}
          >
            <Flag color={hasExistingReport ? "#9CA3AF" : "#EF4444"} size={16} />
            <Text style={[
              styles.reportButtonText,
              hasExistingReport && styles.reportButtonTextDisabled
            ]}>
              {hasExistingReport ? 'Report in Review' : 'Report Issue'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Report Issue Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={reportModalVisible}
        onRequestClose={() => setReportModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Report Match Issue</Text>
              <TouchableOpacity
                onPress={() => setReportModalVisible(false)}
                style={styles.closeButton}
              >
                <X color="#6B7280" size={24} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScrollView} showsVerticalScrollIndicator={false}>
              <View style={styles.reportSection}>
                <Text style={styles.reportLabel}>
                  Please describe the issue with this match:
                </Text>
                <TextInput
                  style={styles.reportTextInput}
                  placeholder="Enter details about the issue..."
                  multiline
                  numberOfLines={6}
                  value={reportMessage}
                  onChangeText={setReportMessage}
                  textAlignVertical="top"
                />
                <Text style={styles.reportHint}>
                  Your report will be reviewed by an admin. Please provide as much detail as possible.
                </Text>
              </View>

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => {
                    setReportModalVisible(false);
                    setReportMessage('');
                  }}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.submitButton]}
                  onPress={handleSubmitReport}
                  disabled={submittingReport}
                >
                  <Text style={styles.submitButtonText}>
                    {submittingReport ? 'Submitting...' : 'Submit Report'}
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
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
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  placeholder: {
    width: 32,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
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
  },
  matchInfo: {
    alignItems: 'center',
    marginBottom: 24,
  },
  weekText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#7C3AED',
    textTransform: 'uppercase',
  },
  seasonName: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1F2937',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
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
  handicapRacks: {
    fontSize: 13,
    color: '#7C3AED',
    fontWeight: '600',
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
  currentUser: {
    color: '#7C3AED',
  },
  completedScoreValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  winnerScore: {
    color: '#10B981',
  },
  vsText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#9CA3AF',
    textAlign: 'center',
    marginVertical: 4,
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
  actionSection: {
    marginTop: 8,
    marginBottom: 24,
  },
  reportButton: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FEE2E2',
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
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
  byeMatchCard: {
    backgroundColor: '#FEF3C7',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#FCD34D',
  },
  byeMatchTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#92400E',
    marginBottom: 12,
    textAlign: 'center',
  },
  byeMatchDescription: {
    fontSize: 14,
    color: '#78350F',
    marginBottom: 12,
    lineHeight: 20,
  },
  byeMatchPoints: {
    fontSize: 16,
    fontWeight: '600',
    color: '#92400E',
    marginBottom: 16,
    textAlign: 'center',
  },
  acceptByeButton: {
    backgroundColor: '#7C3AED',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  acceptByeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  completedByeBadge: {
    backgroundColor: '#ECFDF5',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#10B981',
    alignItems: 'center',
  },
  completedByeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10B981',
    marginBottom: 4,
  },
  completedByePoints: {
    fontSize: 14,
    color: '#059669',
    fontWeight: '500',
  },
});

