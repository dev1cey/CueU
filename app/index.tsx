import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Alert, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../contexts/AuthContext';
import { signInWithPopup, GoogleAuthProvider, signInWithEmailAndPassword } from 'firebase/auth';
import { auth, GOOGLE_OAUTH_IOS_CLIENT_ID } from '../firebase/config';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';

WebBrowser.maybeCompleteAuthSession();

export default function AuthScreen() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { signInWithGoogle, checkUserExists, login, currentUser, loading } = useAuth();

  // Set up Google OAuth for mobile using expo-auth-session
  // Use the iOS Client ID with the native redirect URI format
  // This bypasses the Expo proxy and works directly with Google's iOS Client
  const redirectUri = 'com.googleusercontent.apps.361114924548-fmii3vq7m3jthnkea85ta6f55sfbuh6h:/oauth2redirect/google';
  
  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId: GOOGLE_OAUTH_IOS_CLIENT_ID,
    iosClientId: GOOGLE_OAUTH_IOS_CLIENT_ID,
    redirectUri: redirectUri,
  });

  // Redirect if user is already logged in
  useEffect(() => {
    if (!loading && currentUser) {
      router.replace('/(tabs)');
    }
  }, [loading, currentUser, router]);

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
    // Test Firebase Auth account (must be created in Firebase Console)
    // For development: create a test@uw.edu account with password "test123456"
    const TEST_EMAIL = 'test@uw.edu';
    const TEST_PASSWORD = 'test123456';
    
    try {
      setIsLoading(true);
      
      // Use test email (user must create this Firebase Auth user in console)
      // The test user in Firestore should have this email
      const userEmail = TEST_EMAIL;
      
      // Sign in with test email/password to satisfy Firestore rules
      try {
        await signInWithEmailAndPassword(auth, userEmail, TEST_PASSWORD);
      } catch (authError: any) {
        // If test account doesn't exist, show helpful error
        if (authError?.code === 'auth/user-not-found' || authError?.code === 'auth/wrong-password' || authError?.code === 'auth/invalid-email') {
          Alert.alert(
            'Test Account Setup Required',
            `To use Skip Login, please create a Firebase Auth user:\n\nEmail: ${userEmail}\nPassword: ${TEST_PASSWORD}\n\nGo to Firebase Console → Authentication → Add User\n\nAlternatively, enable Anonymous Authentication in Firebase Console.`,
            [{ text: 'OK' }]
          );
          return;
        }
        throw authError;
      }
      
      // Then login as the test user in our app
      await login(TEST_PLAYER_ID);
      router.push('/(tabs)');
    } catch (error) {
      console.error('Error logging in as test player:', error);
      Alert.alert(
        'Login Error',
        error instanceof Error ? error.message : 'Failed to log in as test-user-1. Please check if the user exists in the database.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading state while checking auth
  if (loading) {
    return (
      <LinearGradient
        colors={['#7C3AED', '#6D28D9', '#5B21B6']}
        style={styles.container}
      >
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="white" />
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

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
                <Text style={styles.cardTitle}>Welcome Back</Text>
                <Text style={styles.cardDescription}>
                  Sign in with your UW account to continue
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

                <Text style={styles.infoText}>
                  UW students and staff only (@uw.edu)
                </Text>
              </View>
            </View>

            {/* Skip Login for Testing */}
            <View style={styles.skipContainer}>
              <TouchableOpacity
                style={[styles.button, styles.outlineButton, isLoading && styles.buttonDisabled]}
                onPress={handleSkipAuth}
                disabled={isLoading}
              >
                <Text style={styles.outlineButtonText}>
                  {isLoading ? 'Logging in...' : 'Skip Login (Testing)'}
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
    padding: 24,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logoOuter: {
    width: 100,
    height: 100,
    backgroundColor: 'white',
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  logoMiddle: {
    width: 60,
    height: 60,
    backgroundColor: '#7C3AED',
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoInner: {
    width: 40,
    height: 40,
    backgroundColor: '#FCD34D',
    borderRadius: 20,
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
    marginHorizontal: 8,
  },
  cardHeader: {
    marginBottom: 32,
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  cardDescription: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
  },
  cardContent: {
    gap: 16,
  },
  button: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  googleButton: {
    backgroundColor: '#7C3AED',
    gap: 12,
  },
  googleIcon: {
    backgroundColor: 'white',
    color: '#7C3AED',
    fontWeight: 'bold',
    fontSize: 20,
    width: 36,
    height: 36,
    textAlign: 'center',
    lineHeight: 36,
    borderRadius: 6,
  },
  buttonText: {
    color: 'white',
    fontSize: 17,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  infoText: {
    fontSize: 13,
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 4,
  },
  skipContainer: {
    marginTop: 32,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
  },
  outlineButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    shadowOpacity: 0,
    elevation: 0,
  },
  outlineButtonText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '600',
  },
  skipText: {
    textAlign: 'center',
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    marginTop: 12,
    fontStyle: 'italic',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});