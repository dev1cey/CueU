import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { signIn, signUp } from '../lib/firebase';

// Complete the auth session on web
WebBrowser.maybeCompleteAuthSession();

export default function AuthScreen() {
  const [isLoading, setIsLoading] = useState(false);
  const [showReviewMode, setShowReviewMode] = useState(false);
  const [reviewCode, setReviewCode] = useState('');
  const router = useRouter();

  // Google Sign-In configuration (optional - only if credentials are set)
  const hasGoogleCredentials = !!(
    process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID ||
    process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID ||
    process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID
  );

  const googleConfig = hasGoogleCredentials ? {
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
  } : undefined;

  const [request, response, promptAsync] = Google.useAuthRequest(
    googleConfig || {
      // Dummy config to prevent crash if not configured
      iosClientId: 'dummy',
      androidClientId: 'dummy',
      webClientId: 'dummy',
    }
  );

  const handleGoogleSignIn = async () => {
    if (!hasGoogleCredentials) {
      Alert.alert(
        'Google Sign-In Not Configured',
        'Google authentication is not set up yet. Please use the skip button or review mode for testing.',
        [{ text: 'OK' }]
      );
      return;
    }

    try {
      setIsLoading(true);
      const result = await promptAsync();

      if (result?.type === 'success') {
        const { authentication } = result;
        
        // Get user info from Google
        const userInfoResponse = await fetch(
          'https://www.googleapis.com/userinfo/v2/me',
          {
            headers: { Authorization: `Bearer ${authentication?.accessToken}` },
          }
        );
        const userInfo = await userInfoResponse.json();

        // Check if email is @uw.edu
        if (!userInfo.email.endsWith('@uw.edu')) {
          Alert.alert(
            'Invalid Email',
            'Only @uw.edu email addresses are allowed.',
            [{ text: 'OK' }]
          );
          setIsLoading(false);
          return;
        }

        // Sign in with Firebase (you can use the Google token here)
        // For now, we'll just proceed to profile setup
        router.push('/profile-setup');
      }
    } catch (error) {
      console.error('Google Sign-In Error:', error);
      Alert.alert('Error', 'Failed to sign in with Google. Please try again or use review mode.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReviewMode = () => {
    if (reviewCode === 'CUEU2025') {
      router.push('/(tabs)');
    } else {
      Alert.alert('Invalid Code', 'Please enter a valid review access code');
    }
  };

  const handleSkipAuth = () => {
    router.push('/(tabs)');
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Logo and Title */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <View style={styles.logo}>
                <View style={styles.logoInner} />
              </View>
            </View>
            <Text style={styles.title}>CueU</Text>
            <Text style={styles.subtitle}>Find your activity partners at UW</Text>
          </View>

          {/* Sign In Card */}
          <View style={styles.card}>
            <Ionicons name="logo-google" size={64} color="#7C3AED" style={styles.googleIcon} />
            
            <Text style={styles.cardTitle}>Sign in with Google</Text>
            <Text style={styles.cardDescription}>
              Use your @uw.edu account to continue
            </Text>

            <TouchableOpacity
              style={[styles.googleButton, isLoading && styles.buttonDisabled]}
              onPress={handleGoogleSignIn}
              disabled={isLoading}
            >
              <Ionicons name="logo-google" size={24} color="white" />
              <Text style={styles.googleButtonText}>
                {isLoading ? 'Signing in...' : 'Sign in with Google'}
              </Text>
            </TouchableOpacity>

            <Text style={styles.restrictionText}>
              Only @uw.edu email addresses are allowed.
            </Text>

            {/* Review Mode Toggle */}
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity 
              onPress={() => setShowReviewMode(!showReviewMode)}
              style={styles.reviewToggle}
            >
              <Text style={styles.reviewToggleText}>
                {showReviewMode ? 'Hide' : ''} Review Mode Access
              </Text>
              <Ionicons 
                name={showReviewMode ? "chevron-up" : "chevron-down"} 
                size={20} 
                color="#6B7280" 
              />
            </TouchableOpacity>

            {showReviewMode && (
              <View style={styles.reviewSection}>
                <Text style={styles.reviewTitle}>App Store Review Access</Text>
                <Text style={styles.reviewDescription}>
                  Enter the review access code to test the app without a UW email.
                </Text>
                
                <TextInput
                  style={styles.reviewInput}
                  placeholder="Enter review access code"
                  placeholderTextColor="#9CA3AF"
                  value={reviewCode}
                  onChangeText={setReviewCode}
                  autoCapitalize="characters"
                />

                <TouchableOpacity
                  style={[styles.reviewButton, !reviewCode && styles.buttonDisabled]}
                  onPress={handleReviewMode}
                  disabled={!reviewCode}
                >
                  <Text style={styles.reviewButtonText}>Access Review Mode</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Testing Skip Button */}
          <TouchableOpacity
            style={styles.skipButton}
            onPress={handleSkipAuth}
          >
            <Text style={styles.skipButtonText}>Skip Login (Testing Only)</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoContainer: {
    marginBottom: 20,
  },
  logo: {
    width: 72,
    height: 72,
    backgroundColor: '#FCD34D',
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoInner: {
    width: 48,
    height: 48,
    backgroundColor: '#7C3AED',
    borderRadius: 24,
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#7C3AED',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  googleIcon: {
    marginBottom: 24,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  cardDescription: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  googleButton: {
    backgroundColor: '#7C3AED',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    width: '100%',
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  googleButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  restrictionText: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 16,
  },
  divider: {
    width: '100%',
    marginVertical: 24,
  },
  dividerLine: {
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  reviewToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
  },
  reviewToggleText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  reviewSection: {
    width: '100%',
    marginTop: 16,
    gap: 12,
  },
  reviewTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    textAlign: 'center',
  },
  reviewDescription: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 8,
  },
  reviewInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 14,
    color: '#1F2937',
    backgroundColor: '#F9FAFB',
    textAlign: 'center',
  },
  reviewButton: {
    backgroundColor: '#7C3AED',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  reviewButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  skipButton: {
    marginTop: 24,
    paddingVertical: 12,
    alignItems: 'center',
  },
  skipButtonText: {
    color: '#9CA3AF',
    fontSize: 12,
    textDecorationLine: 'underline',
  },
});

