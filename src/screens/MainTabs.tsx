import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { HomeScreen } from './HomeScreen';
import { NewsScreen } from './NewsScreen';
import { theme } from '../theme';

const Tab = createBottomTabNavigator();

export function MainTabs() {
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[theme.colors.primary, theme.colors.accent]}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <View style={styles.logo}>
              <Ionicons name="ellipse" size={24} color={theme.colors.accent} />
            </View>
            <View style={{ marginLeft: 8 }}>
              <View style={styles.logoTextContainer}>
                <Text style={styles.headerTitle}>CueU</Text>
              </View>
              <Text style={styles.headerSubtitle}>UW Pool Club</Text>
            </View>
          </View>
        </View>
      </LinearGradient>

      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: theme.colors.primary,
          tabBarInactiveTintColor: theme.colors.textSecondary,
          tabBarStyle: {
            height: 80,
            paddingBottom: 16,
            paddingTop: 8,
            borderTopWidth: 1,
            borderTopColor: '#e0e0e0',
            backgroundColor: '#ffffff',
          },
          tabBarLabelStyle: {
            fontSize: 12,
            marginTop: 4,
          },
        }}
      >
        <Tab.Screen
          name="Home"
          component={HomeScreen}
          options={{
            tabBarIcon: ({ color }) => (
              <Ionicons name="home-outline" size={24} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="News"
          component={NewsScreen}
          options={{
            tabBarIcon: ({ color }) => (
              <Ionicons name="newspaper-outline" size={24} color={color} />
            ),
          }}
        />
      </Tab.Navigator>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    paddingTop: 50,
    paddingBottom: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.colors.white,
  },
  headerSubtitle: {
    fontSize: 16,
    fontWeight: 'normal',
    color: theme.colors.accent,
  },
});

