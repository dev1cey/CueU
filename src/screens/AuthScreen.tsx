import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme';

interface AuthScreenProps {
  onAuthenticate: (email: string) => void;
  onSkipAuth?: () => void;
}

export function AuthScreen({ onAuthenticate, onSkipAuth }: AuthScreenProps) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSSO = () => {
    setIsLoading(true);
    // Simulate UW SSO authentication
    setTimeout(() => {
      setIsLoading(false);
      Alert.alert('Success', 'SSO authentication successful!');
      onAuthenticate('student@uw.edu');
    }, 1500);
  };

  const handleEmailVerify = () => {
    if (!email.endsWith('@uw.edu')) {
      Alert.alert('Error', 'Please use a valid @uw.edu email address');
      return;
    }

    setIsLoading(true);
    // Simulate email verification
    setTimeout(() => {
      setIsLoading(false);
      Alert.alert('Success', 'Verification link sent to your email!');
      // In real app, user would click link. For demo, auto-authenticate
      setTimeout(() => {
        onAuthenticate(email);
      }, 1000);
    }, 1500);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <LinearGradient
        colors={[theme.colors.background, theme.colors.backgroundGradientEnd]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.content}>
            {/* Logo/Header */}
            <View style={styles.logoContainer}>
              <View style={styles.logoCircle}>
                <View style={styles.logoInner}>
                  <View style={styles.logoDot} />
                </View>
              </View>
              <Text style={styles.title}>CueU</Text>
              <Text style={styles.subtitle}>University of Washington Pool League</Text>
            </View>

            {/* Auth Card */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Welcome to CueU</Text>
              <Text style={styles.cardDescription}>
                Sign in with your UW credentials to access the pool league
              </Text>

              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={[styles.button, styles.primaryButton, isLoading && styles.buttonDisabled]}
                  onPress={handleSSO}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator color={theme.colors.white} />
                  ) : (
                    <>
                      <Ionicons name="shield-checkmark" size={20} color={theme.colors.white} />
                      <Text style={styles.buttonText}>Sign in with UW SSO</Text>
                    </>
                  )}
                </TouchableOpacity>

                <View style={styles.divider}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>Or</Text>
                  <View style={styles.dividerLine} />
                </View>

                <TouchableOpacity
                  style={[styles.button, styles.secondaryButton]}
                  onPress={handleEmailVerify}
                  disabled={isLoading || !email}
                >
                  <Ionicons name="mail-outline" size={20} color={theme.colors.text} />
                  <Text style={styles.secondaryButtonText}>Verify via @uw.edu email</Text>
                </TouchableOpacity>

                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your @uw.edu email"
                    placeholderTextColor={theme.colors.textSecondary}
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                    editable={!isLoading}
                  />
                </View>

                <View style={styles.badgeContainer}>
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>UW Students & Staff Only</Text>
                  </View>
                </View>
              </View>
            </View>

            <Text style={styles.footerText}>
              By signing in, you agree to the UW Pool League terms and conditions
            </Text>

            {/* Skip Login for Testing */}
            {onSkipAuth && (
              <View style={styles.skipContainer}>
                <TouchableOpacity style={styles.skipButton} onPress={onSkipAuth}>
                  <Text style={styles.skipButtonText}>Skip Login (Testing Only)</Text>
                </TouchableOpacity>
                <Text style={styles.skipHint}>For development and testing purposes</Text>
              </View>
            )}
          </View>
        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: theme.spacing.lg,
  },
  content: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  logoInner: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.accent,
  },
  title: {
    ...theme.typography.h1,
    color: theme.colors.white,
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    ...theme.typography.body,
    color: theme.colors.highlight,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardTitle: {
    ...theme.typography.h2,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  cardDescription: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.lg,
  },
  buttonContainer: {
    gap: theme.spacing.md,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    gap: theme.spacing.sm,
  },
  primaryButton: {
    backgroundColor: theme.colors.primary,
  },
  secondaryButton: {
    backgroundColor: theme.colors.white,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    ...theme.typography.body,
    color: theme.colors.white,
    fontWeight: '600',
  },
  secondaryButtonText: {
    ...theme.typography.body,
    color: theme.colors.text,
    fontWeight: '600',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: theme.spacing.sm,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: theme.colors.border,
  },
  dividerText: {
    ...theme.typography.small,
    color: theme.colors.textSecondary,
    marginHorizontal: theme.spacing.md,
    textTransform: 'uppercase',
  },
  inputContainer: {
    marginVertical: theme.spacing.sm,
  },
  label: {
    ...theme.typography.body,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  input: {
    ...theme.typography.body,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    color: theme.colors.text,
  },
  hint: {
    ...theme.typography.small,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
  badgeContainer: {
    paddingTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  badge: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.md,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    alignItems: 'center',
  },
  badgeText: {
    ...theme.typography.small,
    color: theme.colors.textSecondary,
  },
  footerText: {
    ...theme.typography.small,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    marginTop: theme.spacing.lg,
  },
  skipContainer: {
    marginTop: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  skipButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    alignItems: 'center',
  },
  skipButtonText: {
    ...theme.typography.body,
    color: theme.colors.white,
  },
  skipHint: {
    ...theme.typography.small,
    color: 'rgba(255, 255, 255, 0.5)',
    textAlign: 'center',
    marginTop: theme.spacing.sm,
  },
});

