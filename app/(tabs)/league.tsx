import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator, Modal, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useState, useEffect } from 'react';
import { 
  getAllPlayers, 
  getLeagueStats, 
  createTestPlayers, 
  updatePlayerSkillLevel,
  updatePlayerRecord,
  type Player, 
  type LeagueStats 
} from '../../lib/leagueData';

export default function LeagueTab() {
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [leagueStats, setLeagueStats] = useState<LeagueStats>({
    players: 0,
    currentWeek: 1,
    totalWeeks: 12,
    matches: 0,
  });
  const [standings, setStandings] = useState<Player[]>([]);
  
  // Edit modal state
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [editSkillLevel, setEditSkillLevel] = useState('');
  const [editWins, setEditWins] = useState('');
  const [editLosses, setEditLosses] = useState('');

  // Fetch league data
  const fetchLeagueData = async () => {
    try {
      setLoading(true);
      const [players, stats] = await Promise.all([
        getAllPlayers(),
        getLeagueStats(),
      ]);
      
      setStandings(players);
      setLeagueStats(stats);
    } catch (error) {
      console.error('Error fetching league data:', error);
      Alert.alert('Error', 'Failed to load league data');
    } finally {
      setLoading(false);
    }
  };

  // Load data on mount
  useEffect(() => {
    fetchLeagueData();
  }, []);

  const handleBypassSignup = () => {
    setIsEnrolled(true);
  };

  const handleSignUp = () => {
    // TODO: Open Google Form or navigate to signup
    console.log('Sign up for league');
    // For now, also set as enrolled
    setIsEnrolled(true);
  };

  const handleCreateTestPlayers = async () => {
    Alert.alert(
      'Create Test Players',
      'This will add 5 test players to the league. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Create',
          onPress: async () => {
            try {
              setLoading(true);
              await createTestPlayers();
              await fetchLeagueData();
              Alert.alert('Success', 'Test players created!');
            } catch (error) {
              console.error('Error creating test players:', error);
              Alert.alert('Error', 'Failed to create test players');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const toggleAdminMode = () => {
    if (!isAdminMode) {
      Alert.alert(
        'Admin Mode',
        'Enable admin mode to edit player stats?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Enable',
            onPress: () => setIsAdminMode(true),
          },
        ]
      );
    } else {
      setIsAdminMode(false);
    }
  };

  const handleEditPlayer = (player: Player) => {
    setEditingPlayer(player);
    setEditSkillLevel(player.skillLevel.toString());
    setEditWins(player.wins.toString());
    setEditLosses(player.losses.toString());
    setEditModalVisible(true);
  };

  const handleSavePlayerEdit = async () => {
    if (!editingPlayer) return;

    try {
      const skillLevel = parseInt(editSkillLevel);
      const wins = parseInt(editWins);
      const losses = parseInt(editLosses);

      if (isNaN(skillLevel) || skillLevel < 1 || skillLevel > 7) {
        Alert.alert('Error', 'Skill level must be between 1 and 7');
        return;
      }

      if (isNaN(wins) || isNaN(losses) || wins < 0 || losses < 0) {
        Alert.alert('Error', 'Wins and losses must be valid numbers');
        return;
      }

      setLoading(true);
      
      await updatePlayerSkillLevel(editingPlayer.id, skillLevel);
      await updatePlayerRecord(editingPlayer.id, wins, losses);
      
      await fetchLeagueData();
      setEditModalVisible(false);
      Alert.alert('Success', 'Player updated successfully');
    } catch (error) {
      console.error('Error updating player:', error);
      Alert.alert('Error', 'Failed to update player');
    } finally {
      setLoading(false);
    }
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
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#7C3AED" />
                <Text style={styles.loadingText}>Loading standings...</Text>
              </View>
            ) : standings.length === 0 ? (
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
                  <Text style={[styles.tableHeaderText, { flex: 0.8 }]}>Skill</Text>
              <Text style={[styles.tableHeaderText, { flex: 1 }]}>W-L</Text>
                  <Text style={[styles.tableHeaderText, { flex: 0.8 }]}>Win %</Text>
                  {isAdminMode && <Text style={[styles.tableHeaderText, { flex: 0.5 }]}></Text>}
            </View>
                {standings.map((player, index) => (
                  <TouchableOpacity 
                    key={player.id} 
                    style={styles.tableRow}
                    onPress={() => isAdminMode && handleEditPlayer(player)}
                    disabled={!isAdminMode}
                  >
                <Text style={[styles.tableCellRank, { flex: 0.7 }]}>
                      {index + 1 <= 3 ? 
                        (index + 1 === 1 ? '🥇' : index + 1 === 2 ? '🥈' : '🥉') 
                        : index + 1}
                </Text>
                <Text style={[styles.tableCell, { flex: 2, fontWeight: '600' }]}>
                  {player.name}
                </Text>
                    <Text style={[styles.tableCell, { flex: 0.8, textAlign: 'center' }]}>
                      {player.skillLevel}
                    </Text>
                <Text style={[styles.tableCell, { flex: 1 }]}>
                  {player.wins}-{player.losses}
                </Text>
                    <Text style={[styles.tableCell, { flex: 0.8 }]}>
                      {player.winRate}%
                </Text>
                    {isAdminMode && (
                      <TouchableOpacity 
                        style={[styles.editButton, { flex: 0.5 }]}
                        onPress={() => handleEditPlayer(player)}
                      >
                        <Ionicons name="pencil" size={16} color="#7C3AED" />
                      </TouchableOpacity>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </ScrollView>

        {/* Edit Player Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={editModalVisible}
          onRequestClose={() => setEditModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Edit Player</Text>
                <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                  <Ionicons name="close" size={24} color="#6B7280" />
                </TouchableOpacity>
              </View>

              {editingPlayer && (
                <>
                  <Text style={styles.editPlayerName}>{editingPlayer.name}</Text>

                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Skill Level (1-7)</Text>
                    <TextInput
                      style={styles.input}
                      value={editSkillLevel}
                      onChangeText={setEditSkillLevel}
                      keyboardType="number-pad"
                      placeholder="5"
                    />
                  </View>

                  <View style={styles.inputRow}>
                    <View style={[styles.inputGroup, { flex: 1 }]}>
                      <Text style={styles.inputLabel}>Wins</Text>
                      <TextInput
                        style={styles.input}
                        value={editWins}
                        onChangeText={setEditWins}
                        keyboardType="number-pad"
                        placeholder="0"
                      />
                    </View>

                    <View style={[styles.inputGroup, { flex: 1, marginLeft: 12 }]}>
                      <Text style={styles.inputLabel}>Losses</Text>
                      <TextInput
                        style={styles.input}
                        value={editLosses}
                        onChangeText={setEditLosses}
                        keyboardType="number-pad"
                        placeholder="0"
                      />
                    </View>
                  </View>

                  <View style={styles.modalButtons}>
                    <TouchableOpacity 
                      style={[styles.modalButton, styles.cancelButton]}
                      onPress={() => setEditModalVisible(false)}
                    >
                      <Text style={styles.cancelButtonText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={[styles.modalButton, styles.saveButton]}
                      onPress={handleSavePlayerEdit}
                    >
                      <Text style={styles.saveButtonText}>Save Changes</Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </View>
          </View>
        </Modal>
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
          <TouchableOpacity onPress={toggleAdminMode} style={styles.adminButton}>
            <Ionicons 
              name={isAdminMode ? "shield-checkmark" : "shield-outline"} 
              size={24} 
              color={isAdminMode ? "#FCD34D" : "white"} 
            />
          </TouchableOpacity>
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
              <Text style={styles.testingSubtitle}>Skip signup or create test players</Text>
            </View>
          </View>
          <View style={styles.testingButtons}>
            <TouchableOpacity style={styles.bypassButtonSmall} onPress={handleCreateTestPlayers}>
              <Ionicons name="people" size={16} color="#92400E" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.bypassButton} onPress={handleBypassSignup}>
              <Text style={styles.bypassButtonText}>Bypass</Text>
            </TouchableOpacity>
          </View>
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
  adminButton: {
    padding: 8,
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
  testingButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  bypassButton: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D97706',
  },
  bypassButtonSmall: {
    backgroundColor: 'white',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D97706',
    alignItems: 'center',
    justifyContent: 'center',
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
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 24,
  },
  loadingText: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 12,
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
  editButton: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
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
  editPlayerName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#7C3AED',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 12,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#1F2937',
    backgroundColor: '#F9FAFB',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  cancelButtonText: {
    color: '#6B7280',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#7C3AED',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

