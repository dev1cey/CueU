import { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Alert, ActivityIndicator, Modal } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../contexts/AuthContext';
import { createUser } from '../firebase/services';
import { SkillLevel } from '../firebase/types';

const SKILL_LEVELS = [
  { label: 'Beginner', value: 'beginner' as SkillLevel },
  { label: 'Intermediate', value: 'intermediate' as SkillLevel },
  { label: 'Advanced', value: 'advanced' as SkillLevel },
  { label: 'Expert', value: 'expert' as SkillLevel },
];

export default function ProfileSetup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [wechat, setWechat] = useState('');
  const [department, setDepartment] = useState('');
  const [skillLevel, setSkillLevel] = useState<SkillLevel | ''>('');
  const [bio, setBio] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSkillLevelPicker, setShowSkillLevelPicker] = useState(false);
  
  const router = useRouter();
  const { firebaseUser, login } = useAuth();

  const getSkillLevelLabel = (value: string) => {
    return SKILL_LEVELS.find(s => s.value === value)?.label || 'Select your skill level';
  };

  useEffect(() => {
    // Pre-fill email from Firebase auth
    if (firebaseUser?.email) {
      setEmail(firebaseUser.email);
    }
  }, [firebaseUser]);

  const validateForm = (): boolean => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter your name');
      return false;
    }

    if (!email.trim() || !email.endsWith('@uw.edu')) {
      Alert.alert('Error', 'Please use a valid @uw.edu email address');
      return false;
    }

    if (!skillLevel) {
      Alert.alert('Error', 'Please select your skill level');
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    if (!firebaseUser) {
      Alert.alert('Error', 'Please sign in first');
      router.replace('/');
      return;
    }

    try {
      setIsLoading(true);

      // Create user in Firestore
      await createUser(firebaseUser.uid, {
        email,
        name: name.trim(),
        phone: phone.trim() || undefined,
        wechat: wechat.trim() || undefined,
        department: department || undefined,
        skillLevel: skillLevel as SkillLevel,
        bio: bio.trim() || undefined,
      });

      // Log the user in
      await login(firebaseUser.uid);

      Alert.alert(
        'Success',
        'Your profile has been created successfully!',
        [
          {
            text: 'OK',
            onPress: () => router.replace('/(tabs)'),
          },
        ]
      );
    } catch (error) {
      console.error('Error creating profile:', error);
      Alert.alert(
        'Error',
        'Failed to create your profile. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={['#7C3AED', '#6D28D9', '#5B21B6']}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView 
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>Create Your Profile</Text>
                <Text style={styles.cardDescription}>
                  Tell us about yourself to get started with the UW Pool League
                </Text>
              </View>

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
                  <Text style={styles.label}>Email *</Text>
                  <TextInput
                    style={[styles.input, styles.inputDisabled]}
                    value={email}
                    editable={false}
                  />
                  <Text style={styles.helperText}>
                    Your UW email address from Google sign-in
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

                {/* Submit Button */}
                <TouchableOpacity
                  style={[styles.submitButton, isLoading && styles.buttonDisabled]}
                  onPress={handleSubmit}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <View style={styles.loadingContainer}>
                      <ActivityIndicator color="white" />
                      <Text style={styles.submitButtonText}>
                        Creating profile...
                      </Text>
                    </View>
                  ) : (
                    <Text style={styles.submitButtonText}>
                      Complete Profile & Join League
                    </Text>
                  )}
                </TouchableOpacity>

                <Text style={styles.requiredNote}>* Required fields</Text>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>

      {/* Loading Overlay */}
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingModal}>
            <ActivityIndicator size="large" color="#7C3AED" />
            <Text style={styles.loadingText}>
              Creating your account...
            </Text>
            <Text style={styles.loadingSubtext}>Please wait</Text>
          </View>
        </View>
      )}

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
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
    paddingTop: 40,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  cardHeader: {
    marginBottom: 24,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 14,
    color: '#6B7280',
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
  submitButton: {
    backgroundColor: '#7C3AED',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonText: {
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
    gap: 12,
  },
  requiredNote: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: -8,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingModal: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
    minWidth: 200,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  loadingSubtext: {
    marginTop: 4,
    fontSize: 14,
    color: '#6B7280',
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