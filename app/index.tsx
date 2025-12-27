import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AuthScreen() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSSO = () => {
    setIsLoading(true);
    // Simulate UW SSO authentication
    setTimeout(() => {
      setIsLoading(false);
      router.push('/profile-setup');
    }, 1500);
  };

  const handleEmailVerify = () => {
    if (!email.endsWith('@uw.edu')) {
      alert('Please use a valid @uw.edu email address');
      return;
    }

    setIsLoading(true);
    // Simulate email verification
    setTimeout(() => {
      setIsLoading(false);
      setTimeout(() => {
        router.push('/profile-setup');
      }, 1000);
    }, 1500);
  };

  const handleSkipAuth = () => {
    router.push('/(tabs)');
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
            {/* Logo/Header */}
            <View style={styles.header}>
              <View style={styles.logoOuter}>
                <View style={styles.logoMiddle}>
                  <View style={styles.logoInner} />
                </View>
              </View>
              <Text style={styles.title}>CueU</Text>
              <Text style={styles.subtitle}>University of Washington Pool Club</Text>
            </View>

            {/* Auth Card */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>Welcome to CueU</Text>
                <Text style={styles.cardDescription}>
                  Sign in with your UW credentials to join the pool club
                </Text>
              </View>

              <View style={styles.cardContent}>
                <TouchableOpacity
                  style={[styles.button, styles.primaryButton, isLoading && styles.buttonDisabled]}
                  onPress={handleSSO}
                  disabled={isLoading}
                >
                  <Text style={styles.buttonText}>🛡️ Sign in with UW SSO</Text>
                </TouchableOpacity>

                <View style={styles.divider}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>OR</Text>
                  <View style={styles.dividerLine} />
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.label}>UW Email Address</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="husky@uw.edu"
                    placeholderTextColor="#9CA3AF"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    editable={!isLoading}
                  />
                  <Text style={styles.helperText}>
                    A verification link will be sent to your email
                  </Text>
                </View>

                <TouchableOpacity
                  style={[styles.button, styles.primaryButton, (isLoading || !email) && styles.buttonDisabled]}
                  onPress={handleEmailVerify}
                  disabled={isLoading || !email}
                >
                  <Text style={styles.buttonText}>
                    {isLoading ? 'Sending...' : 'Send Verification Link'}
                  </Text>
                </TouchableOpacity>

                <View style={styles.badge}>
                  <Text style={styles.badgeText}>UW Students & Staff Only</Text>
                </View>
              </View>
            </View>

            <Text style={styles.footer}>
              By signing in, you agree to the UW Pool Club terms and conditions
            </Text>

            {/* Skip Login for Testing */}
            <View style={styles.skipContainer}>
              <TouchableOpacity
                style={[styles.button, styles.outlineButton]}
                onPress={handleSkipAuth}
              >
                <Text style={styles.outlineButtonText}>Skip Login (Testing Only)</Text>
              </TouchableOpacity>
              <Text style={styles.skipText}>
                For development and testing purposes
              </Text>
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
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoOuter: {
    width: 80,
    height: 80,
    backgroundColor: 'white',
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  logoMiddle: {
    width: 48,
    height: 48,
    backgroundColor: '#7C3AED',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoInner: {
    width: 32,
    height: 32,
    backgroundColor: '#FCD34D',
    borderRadius: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#FCD34D',
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
    marginBottom: 20,
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
  cardContent: {
    gap: 16,
  },
  button: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#7C3AED',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  dividerText: {
    paddingHorizontal: 8,
    fontSize: 12,
    color: '#9CA3AF',
    textTransform: 'uppercase',
  },
  inputContainer: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
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
  helperText: {
    fontSize: 12,
    color: '#6B7280',
  },
  badge: {
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  badgeText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4B5563',
  },
  footer: {
    textAlign: 'center',
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 24,
  },
  skipContainer: {
    marginTop: 24,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  outlineButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  outlineButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  skipText: {
    textAlign: 'center',
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
    marginTop: 8,
  },
});

