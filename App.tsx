import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AuthScreen } from './src/screens/AuthScreen';
import { MainTabs } from './src/screens/MainTabs';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleAuthenticate = (email: string) => {
    console.log('Authenticated with:', email);
    setIsAuthenticated(true);
  };

  const handleSkipAuth = () => {
    console.log('Skipping auth for testing');
    setIsAuthenticated(true);
  };

  if (isAuthenticated) {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <NavigationContainer>
          <StatusBar style="light" />
          <MainTabs />
        </NavigationContainer>
      </GestureHandlerRootView>
    );
  }

  return (
    <>
      <StatusBar style="light" />
      <AuthScreen onAuthenticate={handleAuthenticate} onSkipAuth={handleSkipAuth} />
    </>
  );
}
