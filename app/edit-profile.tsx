import { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Alert, ActivityIndicator, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft } from 'lucide-react-native';
import { useAuth } from '../contexts/AuthContext';
import { updateUserProfile } from '../firebase/services';
import { SkillLevel } from '../firebase/types';

const SKILL_LEVELS = [
  { label: 'Beginner', value: 'beginner' as SkillLevel },
  { label: 'Intermediate', value: 'intermediate' as SkillLevel },
  { label: 'Advanced', value: 'advanced' as SkillLevel },
  { label: 'Expert', value: 'expert' as SkillLevel },
];

export default function EditProfile() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [wechat, setWechat] = useState('');
  const [discord, setDiscord] = useState('');
  const [department, setDepartment] = useState('');
  const [skillLevel, setSkillLevel] = useState<SkillLevel | ''>('');
  const [bio, setBio] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSkillLevelPicker, setShowSkillLevelPicker] = useState(false);
  
  const router = useRouter();
  const { currentUser, currentUserId, login } = useAuth();

  const getSkillLevelLabel = (value: string) => {
    return SKILL_LEVELS.find(s => s.value === value)?.label || 'Select your skill level';
  };

  useEffect(() => {
    // Pre-fill form with current user data
    if (currentUser) {
      setName(currentUser.name || '');
      setEmail(currentUser.email || '');
      setPhone(currentUser.phone?.toString() || '');
      setWechat(currentUser.wechat || '');
      setDiscord(currentUser.discord || '');
      setDepartment(currentUser.department || '');
      setSkillLevel(currentUser.skillLevel || '');
      setBio(currentUser.bio || '');
    }
  }, [currentUser]);

  const validateForm = (): boolean => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter your name');
      return false;
    }

    if (!skillLevel) {
      Alert.alert('Error', 'Please select your skill level');
      return false;
    }

    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    if (!currentUserId) {
      Alert.alert('Error', 'User not found');
      return;
    }

    try {
      setIsLoading(true);

      // Map skill level to number
      const skillLevelMap: Record<SkillLevel, number> = {
        'beginner': 1,
        'intermediate': 2,
        'advanced': 3,
        'expert': 4,
      };

      // Update user profile in Firestore
      await updateUserProfile(currentUserId, {
        name: name.trim(),
        phone: phone.trim() ? Number(phone.trim()) : undefined,
        wechat: wechat.trim() || undefined,
        discord: discord.trim() || undefined,
        department: department.trim() || undefined,
        skillLevel: skillLevel as SkillLevel,
        skillLevelNum: skillLevelMap[skillLevel as SkillLevel],
        bio: bio.trim() || '',
      });

      // Refresh the user data in context
      await login(currentUserId);

      Alert.alert(
        'Success',
        'Your profile has been updated successfully!',
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert(
        'Error',
        'Failed to update your profile. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
            disabled={isLoading}
          >
            <ChevronLeft color="#1F2937" size={24} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Profile</Text>
          <View style={styles.headerRight} />
        </View>

        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.card}>
            <View style={styles.form}>
              {/* Name */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Full Name *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="John Husky"
                  placeholderTextColor="#9CA3AF"
                  value={name}
                  onChangeText={setName}
                  editable={!isLoading}
                />
              </View>

              {/* Email */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Email</Text>
                <TextInput
                  style={[styles.input, styles.inputDisabled]}
                  value={email}
                  editable={false}
                />
                <Text style={styles.helperText}>
                  Email cannot be changed
                </Text>
              </View>

              {/* Phone */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Phone Number (Optional)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="(206) 555-0123"
                  placeholderTextColor="#9CA3AF"
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                  editable={!isLoading}
                />
              </View>

              {/* WeChat */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>WeChat ID (Optional)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="your_wechat_id"
                  placeholderTextColor="#9CA3AF"
                  value={wechat}
                  onChangeText={setWechat}
                  editable={!isLoading}
                />
              </View>

              {/* Discord */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Discord Username (Optional)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="username#1234"
                  placeholderTextColor="#9CA3AF"
                  value={discord}
                  onChangeText={setDiscord}
                  editable={!isLoading}
                />
              </View>

              {/* Department */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Department / College (Optional)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., College of Engineering, Foster School of Business"
                  placeholderTextColor="#9CA3AF"
                  value={department}
                  onChangeText={setDepartment}
                  editable={!isLoading}
                />
              </View>

              {/* Skill Level */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Skill Level *</Text>
                <TouchableOpacity
                  style={styles.dropdownButton}
                  onPress={() => setShowSkillLevelPicker(true)}
                  disabled={isLoading}
                >
                  <Text style={[styles.dropdownButtonText, !skillLevel && styles.dropdownPlaceholder]}>
                    {getSkillLevelLabel(skillLevel)}
                  </Text>
                  <Text style={styles.dropdownIcon}>▼</Text>
                </TouchableOpacity>
                <Text style={styles.helperText}>
                  Your skill level helps us create fair matchups
                </Text>
              </View>

              {/* Bio */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Bio (Optional)</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Tell us about your pool playing experience, favorite games, or anything else..."
                  placeholderTextColor="#9CA3AF"
                  value={bio}
                  onChangeText={setBio}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                  editable={!isLoading}
                />
              </View>

              {/* Action Buttons */}
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={[styles.cancelButton]}
                  onPress={() => router.back()}
                  disabled={isLoading}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.saveButton, isLoading && styles.buttonDisabled]}
                  onPress={handleSave}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <View style={styles.loadingContainer}>
                      <ActivityIndicator color="white" size="small" />
                      <Text style={styles.saveButtonText}>Saving...</Text>
                    </View>
                  ) : (
                    <Text style={styles.saveButtonText}>Save Changes</Text>
                  )}
                </TouchableOpacity>
              </View>

              <Text style={styles.requiredNote}>* Required fields</Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Skill Level Picker Modal */}
      <Modal
        visible={showSkillLevelPicker}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowSkillLevelPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Skill Level</Text>
              <TouchableOpacity onPress={() => setShowSkillLevelPicker(false)}>
                <Text style={styles.modalCloseButton}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalScroll}>
              {SKILL_LEVELS.map((skill) => (
                <TouchableOpacity
                  key={skill.value}
                  style={[
                    styles.modalOption,
                    skillLevel === skill.value && styles.modalOptionSelected,
                  ]}
                  onPress={() => {
                    setSkillLevel(skill.value);
                    setShowSkillLevelPicker(false);
                  }}
                >
                  <Text
                    style={[
                      styles.modalOptionText,
                      skillLevel === skill.value && styles.modalOptionTextSelected,
                    ]}
                  >
                    {skill.label}
                  </Text>
                  {skillLevel === skill.value && (
                    <Text style={styles.modalCheckmark}>✓</Text>
                  )}
                </TouchableOpacity>
              ))}
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
    backgroundColor: 'white',
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  headerRight: {
    width: 32,
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollContent: {
    padding: 16,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  form: {
    gap: 20,
  },
  inputGroup: {
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
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
    backgroundColor: 'white',
  },
  inputDisabled: {
    backgroundColor: '#F3F4F6',
    color: '#6B7280',
  },
  textArea: {
    height: 100,
    paddingTop: 12,
  },
  dropdownButton: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  dropdownButtonText: {
    fontSize: 16,
    color: '#1F2937',
    flex: 1,
  },
  dropdownPlaceholder: {
    color: '#9CA3AF',
  },
  dropdownIcon: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 8,
  },
  helperText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: 'white',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  cancelButtonText: {
    color: '#6B7280',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#7C3AED',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  requiredNote: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: -8,
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
    maxHeight: '70%',
    paddingBottom: 20,
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
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  modalCloseButton: {
    fontSize: 24,
    color: '#6B7280',
    fontWeight: '300',
  },
  modalScroll: {
    maxHeight: 400,
  },
  modalOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  modalOptionSelected: {
    backgroundColor: '#F3F4F6',
  },
  modalOptionText: {
    fontSize: 16,
    color: '#1F2937',
    flex: 1,
  },
  modalOptionTextSelected: {
    color: '#7C3AED',
    fontWeight: '600',
  },
  modalCheckmark: {
    fontSize: 20,
    color: '#7C3AED',
    fontWeight: 'bold',
  },
});

