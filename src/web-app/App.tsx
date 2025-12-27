import { useState } from 'react';
import { AuthScreen } from './components/AuthScreen';
import { ProfileSetup, UserProfile } from './components/ProfileSetup';
import { MainDashboard } from './components/MainDashboard';
import { Toaster } from './components/ui/sonner';

type AppState = 'auth' | 'profile-setup' | 'dashboard';

export default function App() {
  const [appState, setAppState] = useState<AppState>('auth');
  const [userEmail, setUserEmail] = useState('');
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  const handleAuthenticate = (email: string) => {
    setUserEmail(email);
    setAppState('profile-setup');
  };

  const handleSkipAuth = () => {
    // Create a mock profile for testing
    const mockProfile: UserProfile = {
      name: 'Test User',
      email: 'testuser@uw.edu',
      skillLevel: 'Advanced',
      department: 'Computer Science & Engineering',
      availability: ['Monday', 'Wednesday', 'Friday']
    };
    setUserEmail(mockProfile.email);
    setUserProfile(mockProfile);
    setAppState('dashboard');
  };

  const handleProfileComplete = (profile: UserProfile) => {
    setUserProfile(profile);
    setAppState('dashboard');
  };

  const handleLogout = () => {
    setAppState('auth');
    setUserEmail('');
    setUserProfile(null);
  };

  return (
    <>
      {appState === 'auth' && (
        <AuthScreen onAuthenticate={handleAuthenticate} onSkipAuth={handleSkipAuth} />
      )}
      
      {appState === 'profile-setup' && (
        <ProfileSetup email={userEmail} onComplete={handleProfileComplete} />
      )}
      
      {appState === 'dashboard' && userProfile && (
        <MainDashboard profile={userProfile} onLogout={handleLogout} />
      )}
      
      <Toaster />
    </>
  );
}