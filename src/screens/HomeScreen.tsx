import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme';

export function HomeScreen() {
  const quickStats = [
    { label: 'Skill Level', value: '5', subtext: 'Intermediate' },
    { label: 'Win Rate', value: '67%', subtext: '8-4 record' },
    { label: 'Rank', value: '#7', subtext: 'of 45 players' },
    { label: 'Matches', value: '12', subtext: 'this season' },
  ];

  const topRankings = [
    { rank: 1, name: 'Friday Mufasa', wins: 13, losses: 1 },
    { rank: 2, name: 'Oxygen', wins: 14, losses: 2 },
    { rank: 3, name: 'Fluke Twofer', wins: 12, losses: 4 },
  ];

  const events = [
    {
      id: '1',
      title: 'Holiday Party',
      date: 'Dec 24',
      time: '6:00 pm',
      location: 'HUB Games Area',
      organizer: 'UW Pool Club',
    },
    {
      id: '2',
      title: 'Beginner Workshop',
      date: 'Dec 26',
      time: '2:00 pm',
      location: 'IMA Recreation Center',
      organizer: 'UW Pool Club',
    },
    {
      id: '3',
      title: 'Winter Tournament',
      date: 'Dec 28',
      time: '10:00 am',
      location: 'HUB Games Area',
      organizer: 'UW Pool Club',
    },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Dashboard</Text>
          <Text style={styles.headerSubtitle}>Welcome back!</Text>
        </View>
        <TouchableOpacity>
          <Ionicons name="notifications-outline" size={24} color={theme.colors.text} />
        </TouchableOpacity>
      </View>

      <View style={styles.matchCard}>
        <View style={styles.matchCardContent}>
          <Ionicons name="calendar-outline" size={48} color={theme.colors.primary} />
          <Text style={styles.matchCardTitle}>No Upcoming Matches</Text>
          <Text style={styles.matchCardText}>
            Your next league match will be scheduled soon
          </Text>
          <TouchableOpacity style={styles.matchCardButton}>
            <Text style={styles.matchCardButtonText}>View League Schedule</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>YOUR STATS</Text>
        <View style={styles.statsGrid}>
          {quickStats.map((stat, idx) => (
            <View key={idx} style={styles.statBox}>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
              {stat.subtext && <Text style={styles.statSubtext}>{stat.subtext}</Text>}
            </View>
          ))}
        </View>
      </View>

      <View style={styles.card}>
        <View style={styles.cardHeaderRow}>
          <Text style={styles.cardTitle}>TOP RANKINGS</Text>
          <TouchableOpacity>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.cardDescription}>Fall 2025 Leaders</Text>
        <View style={styles.rankingsList}>
          {topRankings.map((player) => (
            <View key={player.rank} style={styles.rankingItem}>
              <View style={styles.rankingBadge}>
                <Text style={styles.rankingEmoji}>
                  {player.rank === 1 ? '🥇' : player.rank === 2 ? '🥈' : '🥉'}
                </Text>
              </View>
              <View style={styles.rankingInfo}>
                <Text style={styles.rankingName}>{player.name}</Text>
                <Text style={styles.rankingRecord}>
                  <Text style={styles.winText}>{player.wins}</Text>
                  <Text> - </Text>
                  <Text style={styles.lossText}>{player.losses}</Text>
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
            </View>
          ))}
        </View>
      </View>

      <View style={styles.card}>
        <View style={styles.cardHeaderRow}>
          <Text style={styles.cardTitle}>EVENTS</Text>
          <TouchableOpacity>
            <Text style={styles.viewAllText}>See All Events</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.eventsList}>
          {events.map((event) => (
            <View key={event.id} style={styles.eventItem}>
              <View style={styles.eventIcon}>
                <Ionicons name="trophy-outline" size={24} color={theme.colors.primary} />
              </View>
              <View style={styles.eventInfo}>
                <Text style={styles.eventTitle}>{event.title}</Text>
                <View style={styles.eventDetails}>
                  <View style={styles.eventDetail}>
                    <Ionicons name="calendar-outline" size={14} color={theme.colors.textSecondary} />
                    <Text style={styles.eventDetailText}>
                      {event.date}, {event.time}
                    </Text>
                  </View>
                  <View style={styles.eventDetail}>
                    <Ionicons name="location-outline" size={14} color={theme.colors.textSecondary} />
                    <Text style={styles.eventDetailText}>{event.location}</Text>
                  </View>
                  <Text style={styles.eventOrganizer}>{event.organizer}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    padding: theme.spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  headerTitle: {
    ...theme.typography.h2,
    color: theme.colors.text,
  },
  headerSubtitle: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
  },
  matchCard: {
    backgroundColor: `${theme.colors.primary}15`,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: `${theme.colors.primary}30`,
  },
  matchCardContent: {
    alignItems: 'center',
  },
  matchCardTitle: {
    ...theme.typography.h4,
    color: theme.colors.text,
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.xs,
  },
  matchCardText: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
  },
  matchCardButton: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  matchCardButtonText: {
    ...theme.typography.body,
    color: theme.colors.text,
    fontWeight: '600',
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    ...theme.typography.h4,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  cardDescription: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  viewAllText: {
    ...theme.typography.body,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  statBox: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: `${theme.colors.primary}10`,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  statValue: {
    ...theme.typography.h1,
    color: theme.colors.primary,
    marginBottom: theme.spacing.xs,
  },
  statLabel: {
    ...theme.typography.small,
    color: theme.colors.text,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: theme.spacing.xs,
  },
  statSubtext: {
    ...theme.typography.small,
    color: theme.colors.textSecondary,
  },
  rankingsList: {
    gap: theme.spacing.sm,
    marginTop: theme.spacing.sm,
  },
  rankingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
  },
  rankingBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: `${theme.colors.primary}20`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankingEmoji: {
    fontSize: 20,
  },
  rankingInfo: {
    flex: 1,
  },
  rankingName: {
    ...theme.typography.body,
    color: theme.colors.text,
    fontWeight: '600',
    marginBottom: theme.spacing.xs,
  },
  rankingRecord: {
    ...theme.typography.small,
    color: theme.colors.textSecondary,
  },
  winText: {
    color: theme.colors.success,
    fontWeight: '600',
  },
  lossText: {
    color: theme.colors.error,
    fontWeight: '600',
  },
  eventsList: {
    gap: theme.spacing.sm,
    marginTop: theme.spacing.sm,
  },
  eventItem: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
  },
  eventIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${theme.colors.primary}20`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eventInfo: {
    flex: 1,
  },
  eventTitle: {
    ...theme.typography.body,
    color: theme.colors.text,
    fontWeight: '600',
    marginBottom: theme.spacing.xs,
  },
  eventDetails: {
    gap: theme.spacing.xs,
  },
  eventDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  eventDetailText: {
    ...theme.typography.small,
    color: theme.colors.textSecondary,
  },
  eventOrganizer: {
    ...theme.typography.small,
    color: theme.colors.textSecondary,
    opacity: 0.7,
  },
});

