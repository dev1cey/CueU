import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { useUserMatches } from '../hooks/useMatches';
import { useAuth } from '../contexts/AuthContext';
import { useState } from 'react';
import { Match } from '../firebase/types';

export default function MatchHistory() {
  const router = useRouter();
  const { currentUserId } = useAuth();
  const { matches: allUserMatches, loading: allMatchesLoading, refetch: refetchAllMatches } = useUserMatches(currentUserId);
  const [refreshing, setRefreshing] = useState(false);
  const insets = useSafeAreaInsets();
  
  // Filter completed matches for history
  const matchHistory = allUserMatches.filter(match => match.status === 'completed');

  const handleMatchClick = (match: Match) => {
    router.push(`/match-details?matchId=${match.id}`);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await refetchAllMatches();
    } finally {
      setRefreshing(false);
    }
  };

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
          <Text style={styles.headerTitle}>Match History</Text>
          <View style={styles.placeholder} />
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {allMatchesLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#7C3AED" />
            <Text style={styles.loadingText}>Loading match history...</Text>
          </View>
        ) : matchHistory.length > 0 ? (
          <View style={styles.matchesList}>
            {matchHistory.map((match) => {
              const opponentName = match.player1Id === currentUserId 
                ? match.player2Name 
                : match.player1Name;
              const isWinner = match.winnerId === currentUserId;
              const userScore = match.player1Id === currentUserId 
                ? (match.score?.player1 ?? 0)
                : (match.score?.player2 ?? 0);
              const opponentScore = match.player1Id === currentUserId 
                ? (match.score?.player2 ?? 0)
                : (match.score?.player1 ?? 0);
              
              return (
                <TouchableOpacity
                  key={match.id}
                  style={styles.matchCardSimple}
                  onPress={() => handleMatchClick(match)}
                >
                  <View style={styles.matchSimpleContent}>
                    <View style={styles.matchHistoryContent}>
                      <Text style={styles.matchWeekSimple}>Week {match.weekNumber}</Text>
                      <Text style={styles.opponentName}>vs {opponentName}</Text>
                      <Text style={[
                        styles.matchResult,
                        isWinner ? styles.matchWin : styles.matchLoss
                      ]}>
                        {isWinner ? 'W' : 'L'} {userScore}-{opponentScore}
                      </Text>
                    </View>
                    <Text style={styles.tapToView}>Tap to view →</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No match history yet</Text>
          </View>
        )}
      </ScrollView>
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
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 8,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
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
  matchHistoryContent: {
    flex: 1,
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
  tapToView: {
    fontSize: 14,
    color: '#9CA3AF',
    fontWeight: '500',
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
  modalCurrentUser: {
    color: '#7C3AED',
  },
  winnerScore: {
    color: '#10B981',
  },
  modalVsText: {
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
  errorText: {
    fontSize: 14,
    color: '#EF4444',
    textAlign: 'center',
    padding: 16,
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
  submitButton: {
    backgroundColor: '#7C3AED',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

