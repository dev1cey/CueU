import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert, Modal, Pressable, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { User, Bell, LogOut, ChevronRight, ChevronDown } from 'lucide-react-native';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { CommonActions, useNavigation } from '@react-navigation/native';
import { getAllUsers } from '../../firebase/services';
import { User as UserType } from '../../firebase/types';
import { requestNotificationPermissions } from '../../firebase/services/notificationService';
import AsyncStorage from '@react-native-async-storage/async-storage';

const NOTIFICATIONS_ENABLED_KEY = '@cueu:notifications_enabled';

export default function SettingsTab() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [showUserPicker, setShowUserPicker] = useState(false);
  const [allUsers, setAllUsers] = useState<UserType[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const router = useRouter();
  const { currentUser, logout, switchUser } = useAuth();
  const navigation = useNavigation();

  // Load notification preference on mount
  useEffect(() => {
    loadNotificationPreference();
  }, []);

  const loadNotificationPreference = async () => {
    try {
      const value = await AsyncStorage.getItem(NOTIFICATIONS_ENABLED_KEY);
      if (value !== null) {
        setNotificationsEnabled(value === 'true');
      }
    } catch (error) {
      console.error('Error loading notification preference:', error);
    }
  };

  const handleNotificationToggle = async (value: boolean) => {
    try {
      await AsyncStorage.setItem(NOTIFICATIONS_ENABLED_KEY, value.toString());
      setNotificationsEnabled(value);
      
      if (value) {
        // Request permissions when enabling
        const granted = await requestNotificationPermissions();
        if (!granted) {
          Alert.alert(
            'Permission Required',
            'Please enable notifications in your device settings to receive notifications.',
            [{ text: 'OK' }]
          );
        }
      }
    } catch (error) {
      console.error('Error saving notification preference:', error);
      Alert.alert('Error', 'Failed to update notification settings.');
    }
  };

  // Check if current user is a test user (email contains 'test' or name contains 'test')
  const isTestUser = currentUser && (
    currentUser.email.toLowerCase().includes('test') || 
    currentUser.name.toLowerCase().includes('test')
  );

  // Fetch all users when component mounts if user is a test user
  useEffect(() => {
    if (isTestUser) {
      fetchAllUsers();
    }
  }, [isTestUser]);

  const fetchAllUsers = async () => {
    try {
      setLoadingUsers(true);
      const users = await getAllUsers();
      setAllUsers(users);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive',
          onPress: async () => {
            await logout();
            
            // Navigate to root by going up to parent navigator and resetting
            const parentNav = navigation.getParent();
            if (parentNav) {
              parentNav.dispatch(
                CommonActions.reset({
                  index: 0,
                  routes: [{ name: 'index' }],
                })
              );
            }
          },
        },
      ]
    );
  };

  const handleUserSwitch = async (userId: string) => {
    try {
      setShowUserPicker(false);
      await switchUser(userId);
      Alert.alert('Success', 'Switched user successfully!');
    } catch (error) {
      console.error('Error switching user:', error);
      Alert.alert('Error', 'Failed to switch user. Please try again.');
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
      >
        <View style={styles.titleSection}>
          <Text style={styles.pageTitle}>Settings</Text>
        </View>

        {/* Profile Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>PROFILE</Text>
          <View style={styles.card}>
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => router.push('/edit-profile')}
            >
              <View style={styles.menuItemLeft}>
                <User color="#7C3AED" size={20} />
                <View>
                  <Text style={styles.menuItemTitle}>Profile Information</Text>
                  <Text style={styles.menuItemSubtitle}>
                    {currentUser ? `${currentUser.name} • ${currentUser.skillLevel}` : 'Not logged in'}
                  </Text>
                </View>
              </View>
              <ChevronRight color="#9CA3AF" size={20} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Test User Switcher Section */}
        {isTestUser && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>TEST MODE</Text>
            <View style={styles.card}>
              <TouchableOpacity 
                style={styles.menuItem}
                onPress={() => setShowUserPicker(true)}
                disabled={loadingUsers}
              >
                <View style={styles.menuItemLeft}>
                  <User color="#F59E0B" size={20} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.menuItemTitle}>Switch User</Text>
                    <Text style={styles.menuItemSubtitle}>
                      {currentUser ? `Currently: ${currentUser.name}` : 'Select a user'}
                    </Text>
                  </View>
                </View>
                {loadingUsers ? (
                  <ActivityIndicator size="small" color="#7C3AED" />
                ) : (
                  <ChevronDown color="#9CA3AF" size={20} />
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Preferences Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>PREFERENCES</Text>
          <View style={styles.card}>
            <View style={styles.menuItem}>
              <View style={styles.menuItemLeft}>
                <Bell color="#7C3AED" size={20} />
                <Text style={styles.menuItemTitle}>Notifications</Text>
              </View>
              <Switch
                value={notificationsEnabled}
                onValueChange={handleNotificationToggle}
                trackColor={{ false: '#D1D5DB', true: '#C4B5FD' }}
                thumbColor={notificationsEnabled ? '#7C3AED' : '#F3F4F6'}
              />
            </View>
          </View>
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <LogOut color="#DC2626" size={20} />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

        <Text style={styles.version}>Version 1.0.0</Text>
      </ScrollView>

      {/* User Picker Modal */}
      <Modal
        visible={showUserPicker}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowUserPicker(false)}
      >
        <Pressable 
          style={styles.modalOverlay}
          onPress={() => setShowUserPicker(false)}
        >
          <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Switch User</Text>
              <TouchableOpacity onPress={() => setShowUserPicker(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.userList}>
              {allUsers
                .filter(user => user.id !== currentUser?.id) // Exclude current user
                .map((user) => (
                  <TouchableOpacity
                    key={user.id}
                    style={styles.userItem}
                    onPress={() => handleUserSwitch(user.id)}
                  >
                    <View style={styles.userItemContent}>
                      <Text style={styles.userItemName}>{user.name}</Text>
                      <Text style={styles.userItemEmail}>{user.email}</Text>
                      <Text style={styles.userItemSkill}>
                        {user.skillLevel} • {user.matchesPlayed} matches
                      </Text>
                    </View>
                    <ChevronRight color="#9CA3AF" size={20} />
                  </TouchableOpacity>
                ))}
            </ScrollView>
          </Pressable>
        </Pressable>
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
  },
  titleSection: {
    marginBottom: 24,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#6B7280',
    letterSpacing: 0.5,
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  menuItemTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
  },
  menuItemSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginLeft: 48,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    backgroundColor: 'white',
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#DC2626',
  },
  version: {
    textAlign: 'center',
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 24,
    marginBottom: 32,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  modalClose: {
    fontSize: 24,
    color: '#6B7280',
    fontWeight: '300',
  },
  userList: {
    padding: 16,
  },
  userItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  userItemContent: {
    flex: 1,
  },
  userItemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  userItemEmail: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  userItemSkill: {
    fontSize: 12,
    color: '#9CA3AF',
  },
});