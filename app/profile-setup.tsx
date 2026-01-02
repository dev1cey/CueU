import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Picker } from '@react-native-picker/picker';

export default function ProfileSetup() {
  const [name, setName] = useState('');
  const [skillLevel, setSkillLevel] = useState('');
  const [department, setDepartment] = useState('');
  const [bio, setBio] = useState('');
  const router = useRouter();

  const handleSubmit = () => {
    if (!name || !skillLevel || !department) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    Alert.alert('Success', 'Profile created successfully!', [
      {
        text: 'OK',
        onPress: () => router.replace('/(tabs)'),
      },
    ]);
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
                <Text style={styles.cardTitle}>Create Your Billiards Profile</Text>
                <Text style={styles.cardDescription}>
                  Tell us about yourself to get started with the UW Pool League
                </Text>
              </View>

              <View style={styles.form}>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Full Name *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="John Husky"
                    placeholderTextColor="#9CA3AF"
                    value={name}
                    onChangeText={setName}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Email</Text>
                  <TextInput
                    style={[styles.input, styles.inputDisabled]}
                    value="student@uw.edu"
                    editable={false}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Department / College *</Text>
                  <View style={styles.pickerContainer}>
                    <Picker
                      selectedValue={department}
                      onValueChange={setDepartment}
                      style={styles.picker}
                    >
                      <Picker.Item label="Select your department" value="" />
                      <Picker.Item label="College of Engineering" value="engineering" />
                      <Picker.Item label="College of Arts & Sciences" value="arts-sciences" />
                      <Picker.Item label="Foster School of Business" value="business" />
                      <Picker.Item label="Information School" value="information" />
                      <Picker.Item label="College of the Environment" value="environment" />
                      <Picker.Item label="College of Education" value="education" />
                      <Picker.Item label="School of Medicine" value="medicine" />
                      <Picker.Item label="School of Law" value="law" />
                      <Picker.Item label="School of Social Work" value="social-work" />
                      <Picker.Item label="UW Staff" value="staff" />
                      <Picker.Item label="Other" value="other" />
                    </Picker>
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Skill Level *</Text>
                  <View style={styles.pickerContainer}>
                    <Picker
                      selectedValue={skillLevel}
                      onValueChange={setSkillLevel}
                      style={styles.picker}
                    >
                      <Picker.Item label="Select your skill level" value="" />
                      <Picker.Item label="Beginner - Just learning the game" value="beginner" />
                      <Picker.Item label="Intermediate - Regular player" value="intermediate" />
                      <Picker.Item label="Advanced - Competitive player" value="advanced" />
                      <Picker.Item label="Expert - Tournament experience" value="expert" />
                    </Picker>
                  </View>
                  <Text style={styles.helperText}>
                    Your skill level helps us create fair matchups with handicap adjustments
                  </Text>
                </View>

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
                  />
                </View>

                <TouchableOpacity
                  style={styles.submitButton}
                  onPress={handleSubmit}
                >
                  <Text style={styles.submitButtonText}>
                    Complete Profile & Join League
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
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
    justifyContent: 'center',
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
    marginBottom: 16,
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
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
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
});