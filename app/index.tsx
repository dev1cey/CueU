import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Alert, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../contexts/AuthContext';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth, GOOGLE_OAUTH_IOS_CLIENT_ID } from '../firebase/config';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';

WebBrowser.maybeCompleteAuthSession();

export default function AuthScreen() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { signInWithGoogle, checkUserExists, login } = useAuth();

  // Set up Google OAuth for mobile using expo-auth-session
  // Use the iOS Client ID with the native redirect URI format
  // This bypasses the Expo proxy and works directly with Google's iOS Client
  const redirectUri = 'com.googleusercontent.apps.361114924548-fmii3vq7m3jthnkea85ta6f55sfbuh6h:/oauth2redirect/google';
  
  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId: GOOGLE_OAUTH_IOS_CLIENT_ID,
    iosClientId: GOOGLE_OAUTH_IOS_CLIENT_ID,
    redirectUri: redirectUri,
  });

  // Handle OAuth response from expo-auth-session
  useEffect(() => {
    if (response?.type === 'success') {
      handleMobileGoogleSignIn(response.params.id_token);
    }
  }, [response]);

  const handleMobileGoogleSignIn = async (idToken: string) => {
    try {
      setIsLoading(true);
      const { isNewUser, email } = await signInWithGoogle(idToken);
      
      if (isNewUser) {
        router.push('/profile-setup');
      } else {
        const user = await checkUserExists(email);
        if (user) {
          await login(user.id);
          router.replace('/(tabs)');
        } else {
          router.push('/profile-setup');
        }
      }
    } catch (error: any) {
      console.error('Error signing in with Google:', error);
      Alert.alert(
        'Sign In Error',
        error.message || 'Failed to sign in with Google. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      
      // For web platforms, we can use Firebase's popup
      if (Platform.OS === 'web') {
        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, provider);
        const credential = GoogleAuthProvider.credentialFromResult(result);
        
        if (!credential?.idToken) {
          throw new Error('Failed to get Google credentials');
        }

        const { isNewUser, email } = await signInWithGoogle(credential.idToken);
        
        if (isNewUser) {
          // New user - go to profile setup
          router.push('/profile-setup');
        } else {
          // Existing user - check if profile is complete and log in
          const user = await checkUserExists(email);
          if (user) {
            await login(user.id);
            router.replace('/(tabs)');
          } else {
            router.push('/profile-setup');
          }
        }
      } else {
        setIsLoading(false);
        promptAsync();
      }
    } catch (error: any) {
      console.error('Error signing in with Google:', error);
      Alert.alert(
        'Sign In Error',
        error.message || 'Failed to sign in with Google. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoading(false);
    }
  };


  const handleSkipAuth = async () => {
    // Use test-user-1 from seeded data
    const TEST_PLAYER_ID = 'UUtPL20HxNTYVlSJhs1e'; // test-user-1
    
    try {
      setIsLoading(true);
      await login(TEST_PLAYER_ID);
      router.push('/(tabs)');
    } catch (error) {
      console.error('Error logging in as test player:', error);
      Alert.alert(
        'Login Error',
        'Failed to log in as test-user-1. Please check if the user exists in the database.',
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
                  Sign in with your UW Google account to join the pool club
                </Text>
              </View>

              <View style={styles.cardContent}>
                <TouchableOpacity
                  style={[styles.button, styles.googleButton, isLoading && styles.buttonDisabled]}
                  onPress={handleGoogleSignIn}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <>
                      <Text style={styles.googleIcon}>G</Text>
                      <Text style={styles.buttonText}>Sign in with Google</Text>
                    </>
                  )}
                </TouchableOpacity>

                <View style={styles.badge}>
                  <Text style={styles.badgeText}>✓ UW Students & Staff Only</Text>
                  <Text style={styles.badgeSubtext}>Must use @uw.edu email address</Text>
                </View>
              </View>
            </View>

            <Text style={styles.footer}>
              By signing in, you agree to the UW Pool Club terms and conditions
            </Text>

            {/* Skip Login for Testing */}
            <View style={styles.skipContainer}>
              <TouchableOpacity
                style={[styles.button, styles.outlineButton, isLoading && styles.buttonDisabled]}
                onPress={handleSkipAuth}
                disabled={isLoading}
              >
                <Text style={styles.outlineButtonText}>
                  {isLoading ? 'Logging in as test-user-1...' : 'Skip Login (Testing Only)'}
                </Text>
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
    flexDirection: 'row',
    justifyContent: 'center',
  },
  googleButton: {
    backgroundColor: '#4285F4',
    gap: 12,
  },
  googleIcon: {
    backgroundColor: 'white',
    color: '#4285F4',
    fontWeight: 'bold',
    fontSize: 18,
    width: 32,
    height: 32,
    textAlign: 'center',
    lineHeight: 32,
    borderRadius: 4,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.5,
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
    marginBottom: 4,
  },
  badgeSubtext: {
    fontSize: 12,
    color: '#6B7280',
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