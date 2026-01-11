import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Modal, TextInput, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Trophy, Calendar, Users, X, Flag } from 'lucide-react-native';
import { useActiveSeason } from '../../hooks/useSeasons';
import { useSeasonTopPlayers } from '../../hooks/useUsers';
import { useAuth } from '../../contexts/AuthContext';
import { registerForSeason, completeMatch, getUserById, createMatchReport, getReportsByMatchId, acceptByeMatch, forfeitMatch } from '../../firebase/services';
import { useState, useEffect } from 'react';
import { useUpcomingMatches } from '../../hooks/useMatches';
import { Match, User } from '../../firebase/types';
import { getRacksNeeded } from '../../firebase/utils/handicapUtils';
import { getSeasonWeekInfo } from '../../firebase/utils/seasonUtils';

export default function LeagueTab() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);

  const { season, loading: seasonLoading, refetch: refetchSeason } = useActiveSeason();
  const { players, loading: playersLoading, refetch: refetchPlayers } = useSeasonTopPlayers(
    season?.playerIds || null,
    undefined,
    season?.id
  );
  const { currentUserId, currentUser } = useAuth();
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
  
  // State for report issue
  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [reportMessage, setReportMessage] = useState('');
  const [submittingReport, setSubmittingReport] = useState(false);
  const [hasExistingReport, setHasExistingReport] = useState(false);
  const [forfeiting, setForfeiting] = useState(false);
  
  // State for score submission modal
  const [scoreModalVisible, setScoreModalVisible] = useState(false);
  const [pendingScoreModalOpen, setPendingScoreModalOpen] = useState(false);
  
  // Open score modal after match modal closes
  useEffect(() => {
    if (pendingScoreModalOpen && !modalVisible) {
      setScoreModalVisible(true);
      setPendingScoreModalOpen(false);
    }
  }, [modalVisible, pendingScoreModalOpen]);

  const loading = seasonLoading || playersLoading;

  // Calculate week info dynamically
  const { currentWeek, totalWeeks } = getSeasonWeekInfo(season);

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
    
    // Load player details for the match and check for existing reports
    setLoadingMatchDetails(true);
    try {
      const [p1, p2, reports] = await Promise.all([
        getUserById(match.player1Id),
        getUserById(match.player2Id),
        getReportsByMatchId(match.id),
      ]);
      setPlayer1Data(p1);
      setPlayer2Data(p2);
      
      // Check if current user has already reported this match
      if (currentUserId) {
        const userReport = reports.find(report => 
          report.reportedBy === currentUserId && report.status === 'pending'
        );
        setHasExistingReport(!!userReport);
      }
    } catch (error) {
      console.error('Error loading match details:', error);
    } finally {
      setLoadingMatchDetails(false);
    }
  };

  const handleOpenScoreModal = () => {
    // Close match details modal first, then open score modal via useEffect
    setPendingScoreModalOpen(true);
    setModalVisible(false);
  };

  const handleSubmitScore = async () => {
    if (!selectedMatch || !currentUserId || !player1Data || !player2Data) return;

    const p1Score = parseInt(player1Score);
    const p2Score = parseInt(player2Score);

    // Validate scores are numbers
    if (isNaN(p1Score) || isNaN(p2Score) || p1Score < 0 || p2Score < 0) {
      Alert.alert('Invalid Score', 'Please enter valid scores for both players.');
      return;
    }

    if (p1Score === p2Score) {
      Alert.alert('Invalid Score', 'Matches cannot end in a tie. One player must win.');
      return;
    }

    // Get racks needed for each player
    const racksNeeded = getRacksNeeded(
      player1Data.skillLevelNum,
      player2Data.skillLevelNum
    );

    const player1Name = selectedMatch.player1Name;
    const player2Name = selectedMatch.player2Name;

    // Check if scores exceed target racks (invalid scenario)
    const player1ExceedsTarget = p1Score > racksNeeded.player1;
    const player2ExceedsTarget = p2Score > racksNeeded.player2;
    
    if (player1ExceedsTarget && player2ExceedsTarget) {
      Alert.alert(
        'Invalid Score',
        `Both players exceeded their target racks. ${player1Name} needs ${racksNeeded.player1} racks (entered ${p1Score}), and ${player2Name} needs ${racksNeeded.player2} racks (entered ${p2Score}). A player cannot exceed their target rack.`
      );
      return;
    }

    if (player1ExceedsTarget) {
      Alert.alert(
        'Invalid Score',
        `${player1Name} exceeded their target rack. They need exactly ${racksNeeded.player1} racks to win, but entered ${p1Score}. A player cannot exceed their target rack.`
      );
      return;
    }

    if (player2ExceedsTarget) {
      Alert.alert(
        'Invalid Score',
        `${player2Name} exceeded their target rack. They need exactly ${racksNeeded.player2} racks to win, but entered ${p2Score}. A player cannot exceed their target rack.`
      );
      return;
    }

    // Check if players reached their target racks
    const player1HasTarget = p1Score === racksNeeded.player1;
    const player2HasTarget = p2Score === racksNeeded.player2;

    // Scenario 1: Both scores are lower than target (neither reached target)
    if (!player1HasTarget && !player2HasTarget) {
      Alert.alert(
        'Invalid Score',
        `Neither player reached their target racks. ${player1Name} needs ${racksNeeded.player1} racks (entered ${p1Score}), and ${player2Name} needs ${racksNeeded.player2} racks (entered ${p2Score}). Exactly one player must reach their target rack to win.`
      );
      return;
    }

    // Scenario 2: Both players reached their target (both have exactly their target)
    if (player1HasTarget && player2HasTarget) {
      Alert.alert(
        'Invalid Score',
        `Both players reached their target racks. ${player1Name} has ${racksNeeded.player1} racks and ${player2Name} has ${racksNeeded.player2} racks. Only one player can reach their target rack to win the match.`
      );
      return;
    }

    // Validate that the losing player has a score between 0 and their target rack - 1
    // The winner is whoever reaches their target rack first, regardless of the other player's score
    if (player1HasTarget) {
      // Player 1 reached target, so player 2 should have score < player2's target rack
      if (p2Score >= racksNeeded.player2) {
        Alert.alert(
          'Invalid Score',
          `${player1Name} reached their target of ${racksNeeded.player1} racks, so ${player2Name} must have a score between 0 and ${racksNeeded.player2 - 1} racks. ${player2Name} entered ${p2Score}, which is invalid.`
        );
        return;
      }
    } else {
      // Player 2 reached target, so player 1 should have score < player1's target rack
      if (p1Score >= racksNeeded.player1) {
        Alert.alert(
          'Invalid Score',
          `${player2Name} reached their target of ${racksNeeded.player2} racks, so ${player1Name} must have a score between 0 and ${racksNeeded.player1 - 1} racks. ${player1Name} entered ${p1Score}, which is invalid.`
        );
        return;
      }
    }

    // Determine winner (should match the player who reached their target rack)
    const winnerId = p1Score > p2Score ? selectedMatch.player1Id : selectedMatch.player2Id;

    try {
      setSubmitting(true);
      await completeMatch(selectedMatch.id, winnerId, {
        player1: p1Score,
        player2: p2Score,
      });
      
      Alert.alert('Success', 'Match completed successfully!');
      setScoreModalVisible(false);
      setModalVisible(false);
      setSelectedMatch(null);
      setPlayer1Score('');
      setPlayer2Score('');
      
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

  const handleReportIssue = () => {
    setReportModalVisible(true);
    setReportMessage('');
  };

  const handleSubmitReport = async () => {
    if (!selectedMatch || !currentUserId || !currentUser) return;

    if (!reportMessage.trim()) {
      Alert.alert('Error', 'Please enter a message describing the issue.');
      return;
    }

    try {
      setSubmittingReport(true);
      await createMatchReport({
        matchId: selectedMatch.id,
        reportedBy: currentUserId,
        reportedByName: currentUser.name,
        message: reportMessage.trim(),
      });
      
      Alert.alert('Success', 'Your report has been submitted. An admin will review it shortly.');
      setReportModalVisible(false);
      setReportMessage('');
      setHasExistingReport(true);
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

  const handleForfeitMatch = async () => {
    if (!selectedMatch || !currentUserId) return;

    Alert.alert(
      'Forfeit Match',
      'Are you sure you want to forfeit this match? Your opponent will receive full points and you will receive 0 points.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Forfeit',
          style: 'destructive',
          onPress: async () => {
            try {
              setForfeiting(true);
              await forfeitMatch(selectedMatch.id, currentUserId);
              
              Alert.alert('Success', 'Match forfeited. Your opponent has been awarded the win.');
              setScoreModalVisible(false);
              setModalVisible(false);
              setSelectedMatch(null);
              
              // Refetch data
              await Promise.all([refetchMatches(), refetchSeason()]);
            } catch (error) {
              console.error('Error forfeiting match:', error);
              Alert.alert(
                'Error',
                error instanceof Error ? error.message : 'Failed to forfeit match. Please try again.'
              );
            } finally {
              setForfeiting(false);
            }
          },
        },
      ]
    );
  };

  const handleReportOpponentNotResponding = async () => {
    if (!selectedMatch || !currentUserId || !currentUser) return;

    const isPlayer1 = selectedMatch.player1Id === currentUserId;
    const opponentId = isPlayer1 ? selectedMatch.player2Id : selectedMatch.player1Id;
    const opponentName = isPlayer1 ? selectedMatch.player2Name : selectedMatch.player1Name;

    Alert.alert(
      'Report Opponent Not Responding',
      `Report that ${opponentName} is not responding and unable to schedule the match?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Report',
          onPress: async () => {
            try {
              setSubmittingReport(true);
              
              // Create match report
              await createMatchReport({
                matchId: selectedMatch.id,
                reportedBy: currentUserId,
                reportedByName: currentUser.name,
                message: `Opponent ${opponentName} is not responding and unable to schedule the match.`,
              });
              
              // After creating the report, prompt to mark opponent as forfeit
              Alert.alert(
                'Report Submitted',
                `Your report has been submitted. Would you like to mark ${opponentName} as forfeit?`,
                [
                  {
                    text: 'No',
                    style: 'cancel',
                    onPress: () => {
                      setHasExistingReport(true);
                    },
                  },
                  {
                    text: 'Yes, Mark Forfeit',
                    style: 'destructive',
                    onPress: async () => {
                      try {
                        setForfeiting(true);
                        // Mark the opponent as forfeiting (pass opponent's ID)
                        await forfeitMatch(selectedMatch.id, opponentId);
                        
                        Alert.alert('Success', `${opponentName} has been marked as forfeit. You have been awarded the win.`);
                        setScoreModalVisible(false);
                        setModalVisible(false);
                        setSelectedMatch(null);
                        
                        // Refetch data
                        await Promise.all([refetchMatches(), refetchSeason()]);
                      } catch (error) {
                        console.error('Error marking opponent as forfeit:', error);
                        Alert.alert(
                          'Error',
                          error instanceof Error ? error.message : 'Failed to mark opponent as forfeit. Please try again.'
                        );
                      } finally {
                        setForfeiting(false);
                        setSubmittingReport(false);
                      }
                    },
                  },
                ]
              );
            } catch (error) {
              console.error('Error submitting report:', error);
              Alert.alert(
                'Error',
                error instanceof Error ? error.message : 'Failed to submit report. Please try again.'
              );
              setSubmittingReport(false);
            }
          },
        },
      ]
    );
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        refetchSeason(),
        refetchPlayers(),
        refetchMatches(),
      ]);
    } finally {
      setRefreshing(false);
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
                  {season ? `Week ${currentWeek}` : 'N/A'}
                </Text>
                <Text style={styles.infoLabel}>
                  {season ? `of ${totalWeeks}` : ''}
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
                      // Check if this is a bye match
                      const isByeMatch = match.status === 'bye' || match.player1Id === match.player2Id;
                      
                      if (isByeMatch) {
                        return (
                          <View key={match.id} style={[styles.matchCardSimple, styles.byeMatchCard]}>
                            <View style={styles.matchSimpleContent}>
                              <View>
                                <Text style={styles.matchWeekSimple}>Week {match.weekNumber}</Text>
                                <Text style={styles.byeMatchText}>BYE WEEK</Text>
                                <Text style={styles.byeMatchSubtext}>
                                  You get full points (10) for this week
                                </Text>
                              </View>
                              <TouchableOpacity
                                style={styles.acceptByeButton}
                                onPress={async () => {
                                  try {
                                    await acceptByeMatch(match.id);
                                    Alert.alert('Success', 'Bye match accepted! You received 10 points.');
                                    await Promise.all([refetchMatches(), refetchSeason()]);
                                  } catch (error) {
                                    console.error('Error accepting bye match:', error);
                                    Alert.alert(
                                      'Error',
                                      error instanceof Error ? error.message : 'Failed to accept bye match. Please try again.'
                                    );
                                  }
                                }}
                              >
                                <Text style={styles.acceptByeButtonText}>Accept</Text>
                              </TouchableOpacity>
                            </View>
                          </View>
                        );
                      }
                      
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

      {/* Match Details and Score Reporting Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setPendingScoreModalOpen(false);
          setScoreModalVisible(false);
          setModalVisible(false);
          setPlayer1Score('');
          setPlayer2Score('');
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Match Details</Text>
              <TouchableOpacity
                onPress={() => {
                  setPendingScoreModalOpen(false);
                  setScoreModalVisible(false);
                  setModalVisible(false);
                  setPlayer1Score('');
                  setPlayer2Score('');
                }}
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
                      <Text style={styles.sectionTitle}>Match Format</Text>
                      {(() => {
                        // For completed matches, use stored values; for planned matches, calculate from current skill levels
                        const racksNeeded = selectedMatch.status === 'completed' && 
                          selectedMatch.player1RacksNeeded && selectedMatch.player2RacksNeeded
                          ? {
                              player1: selectedMatch.player1RacksNeeded,
                              player2: selectedMatch.player2RacksNeeded
                            }
                          : getRacksNeeded(
                              player1Data.skillLevelNum,
                              player2Data.skillLevelNum
                            );
                        
                        const isPlayer1CurrentUser = selectedMatch.player1Id === currentUserId;
                        const opponentName = isPlayer1CurrentUser
                          ? selectedMatch.player2Name
                          : selectedMatch.player1Name;
                        
                        // For completed matches, use stored skill levels
                        const opponentSkillLevel = selectedMatch.status === 'completed' && 
                          selectedMatch.player1SkillLevel && selectedMatch.player2SkillLevel
                          ? (isPlayer1CurrentUser ? selectedMatch.player2SkillLevel : selectedMatch.player1SkillLevel)
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
                          {selectedMatch.status === 'planned' && (
                            <TouchableOpacity
                              style={styles.reportNotRespondingButton}
                              onPress={handleReportOpponentNotResponding}
                              disabled={submittingReport || forfeiting}
                            >
                              <Text style={styles.reportNotRespondingButtonText}>
                                {submittingReport ? 'Reporting...' : 'Report Opponent Not Responding'}
                              </Text>
                            </TouchableOpacity>
                          )}
                        </View>
                      );
                    })()}

                    {/* Score Section - Different for completed vs planned matches */}
                    {selectedMatch.status === 'completed' ? (
                      <>
                        {/* Completed Match Score Display */}
                        <View style={styles.scoreSection}>
                          <Text style={styles.sectionTitle}>Match Result</Text>
                          <View style={styles.completedScoreContainer}>
                            <View style={styles.completedScorePlayer}>
                              <Text style={[
                                styles.completedScoreName,
                                selectedMatch.player1Id === currentUserId && styles.modalCurrentUser
                              ]}>
                                {selectedMatch.player1Name}
                                {selectedMatch.player1Id === currentUserId && ' (You)'}
                              </Text>
                              <Text style={[
                                styles.completedScoreValue,
                                selectedMatch.winnerId === selectedMatch.player1Id && styles.winnerScore
                              ]}>
                                {selectedMatch.score?.player1 ?? 0}
                              </Text>
                            </View>
                            <Text style={styles.modalVsText}>VS</Text>
                            <View style={styles.completedScorePlayer}>
                              <Text style={[
                                styles.completedScoreName,
                                selectedMatch.player2Id === currentUserId && styles.modalCurrentUser
                              ]}>
                                {selectedMatch.player2Name}
                                {selectedMatch.player2Id === currentUserId && ' (You)'}
                              </Text>
                              <Text style={[
                                styles.completedScoreValue,
                                selectedMatch.winnerId === selectedMatch.player2Id && styles.winnerScore
                              ]}>
                                {selectedMatch.score?.player2 ?? 0}
                              </Text>
                            </View>
                          </View>
                          {selectedMatch.winnerId && (
                            <View style={styles.winnerBadge}>
                              <Text style={styles.winnerText}>
                                Winner: {selectedMatch.winnerId === selectedMatch.player1Id 
                                  ? selectedMatch.player1Name 
                                  : selectedMatch.player2Name}
                              </Text>
                            </View>
                          )}
                          {(selectedMatch.player1Points !== undefined || selectedMatch.player2Points !== undefined) && (
                            <View style={styles.pointsSection}>
                              <Text style={styles.pointsLabel}>Points Earned:</Text>
                              <View style={styles.pointsRow}>
                                <Text style={styles.pointsText}>
                                  {selectedMatch.player1Name}: {selectedMatch.player1Points?.toFixed(1) ?? '0.0'}
                                </Text>
                                <Text style={styles.pointsText}>
                                  {selectedMatch.player2Name}: {selectedMatch.player2Points?.toFixed(1) ?? '0.0'}
                                </Text>
                              </View>
                            </View>
                          )}
                        </View>

                        <View style={styles.modalButtons}>
                          <TouchableOpacity
                            style={[
                              styles.modalButton,
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
                          <TouchableOpacity
                            style={[styles.modalButton, styles.cancelButton]}
                            onPress={() => {
                              setScoreModalVisible(false);
                              setModalVisible(false);
                              setPlayer1Score('');
                              setPlayer2Score('');
                            }}
                          >
                            <Text style={styles.cancelButtonText}>Close</Text>
                          </TouchableOpacity>
                        </View>
                      </>
                    ) : (
                      <>
                        {/* Action Buttons for Planned Matches */}
                        <View style={styles.modalButtons}>
                          <TouchableOpacity
                            style={[styles.modalButton, styles.forfeitButton]}
                            onPress={handleForfeitMatch}
                            disabled={forfeiting}
                          >
                            <Text style={styles.forfeitButtonText}>
                              {forfeiting ? 'Forfeiting...' : 'Forfeit'}
                            </Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={[styles.modalButton, styles.submitButton]}
                            onPress={handleOpenScoreModal}
                            disabled={submitting}
                          >
                            <Text style={styles.submitButtonText}>
                              Submit Score
                            </Text>
                          </TouchableOpacity>
                        </View>
                      </>
                    )}
                  </>
                ) : (
                  <Text style={styles.errorText}>Unable to load match details</Text>
                )}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* Score Submission Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={scoreModalVisible}
        onRequestClose={() => {
          setPendingScoreModalOpen(false);
          setScoreModalVisible(false);
          setPlayer1Score('');
          setPlayer2Score('');
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Report Score</Text>
              <TouchableOpacity
                onPress={() => {
                  setPendingScoreModalOpen(false);
                  setScoreModalVisible(false);
                  setPlayer1Score('');
                  setPlayer2Score('');
                }}
                style={styles.closeButton}
              >
                <X color="#6B7280" size={24} />
              </TouchableOpacity>
            </View>

            {selectedMatch && player1Data && player2Data ? (
              <ScrollView style={styles.modalScrollView} showsVerticalScrollIndicator={false}>
                {/* Racks to Win Info at the top */}
                <View style={styles.handicapSection}>
                  <Text style={styles.sectionTitle}>Racks to Win</Text>
                  {(() => {
                    // For completed matches, use stored values; for planned matches, calculate from current skill levels
                    const racksNeeded = selectedMatch.status === 'completed' && 
                      selectedMatch.player1RacksNeeded && selectedMatch.player2RacksNeeded
                      ? {
                          player1: selectedMatch.player1RacksNeeded,
                          player2: selectedMatch.player2RacksNeeded
                        }
                      : getRacksNeeded(
                          player1Data.skillLevelNum,
                          player2Data.skillLevelNum
                        );
                    
                    const isPlayer1CurrentUser = selectedMatch.player1Id === currentUserId;
                    const opponentName = isPlayer1CurrentUser
                      ? selectedMatch.player2Name
                      : selectedMatch.player1Name;
                    
                    // For completed matches, use stored skill levels
                    const opponentSkillLevel = selectedMatch.status === 'completed' && 
                      selectedMatch.player1SkillLevel && selectedMatch.player2SkillLevel
                      ? (isPlayer1CurrentUser ? selectedMatch.player2SkillLevel : selectedMatch.player1SkillLevel)
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

                {/* Score Input Section */}
                <View style={styles.scoreSection}>
                  <Text style={styles.sectionTitle}>Enter Scores</Text>
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
                        onChangeText={(text) => {
                          // Only allow numeric input
                          const numericValue = text.replace(/[^0-9]/g, '');
                          setPlayer1Score(numericValue);
                        }}
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
                        onChangeText={(text) => {
                          // Only allow numeric input
                          const numericValue = text.replace(/[^0-9]/g, '');
                          setPlayer2Score(numericValue);
                        }}
                      />
                    </View>
                  </View>
                </View>

                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.cancelButton]}
                    onPress={() => {
                      setPendingScoreModalOpen(false);
                      setScoreModalVisible(false);
                      setPlayer1Score('');
                      setPlayer2Score('');
                    }}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
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
              </ScrollView>
            ) : (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color="#7C3AED" />
                <Text style={styles.loadingText}>Loading match details...</Text>
              </View>
            )}
          </View>
        </View>
      </Modal>

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
  byeMatchCard: {
    backgroundColor: '#FEF3C7',
    borderColor: '#FCD34D',
  },
  byeMatchText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#92400E',
    marginTop: 4,
  },
  byeMatchSubtext: {
    fontSize: 12,
    color: '#78350F',
    marginTop: 2,
  },
  acceptByeButton: {
    backgroundColor: '#7C3AED',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  acceptByeButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
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
  reportNotRespondingButton: {
    marginTop: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#FEF2F2',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FEE2E2',
    alignItems: 'center',
  },
  reportNotRespondingButtonText: {
    color: '#EF4444',
    fontSize: 14,
    fontWeight: '600',
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
  forfeitButton: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FEE2E2',
  },
  forfeitButtonText: {
    color: '#EF4444',
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