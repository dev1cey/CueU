import { Timestamp } from 'firebase/firestore';

// User types
// APA skill levels range from 2-7
export type SkillLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';
// Note: skillLevelNum should be 2-7 for APA system (not 1-4)

export interface User {
  // Basic Info
  id: string;
  name: string;
  email: string;
  phone?: number;
  wechat?: string;
  discord?: string;
  department?: string;
  bio: string;
  profileImageUrl?: string;
  // Pool Info
  skillLevel: SkillLevel;
  skillLevelNum: number; // APA skill level: 2-7
  wins: number;
  losses: number;
  matchesPlayed: number;
  matchHistory: string[]; // Array of Match IDs
  // Season scoring (map of seasonId -> points earned in that season)
  seasonPoints?: Record<string, number>; // Points accumulated per season
  // System Notes
  createdAt: Timestamp;
}

export type MatchStatus = 'planned' | 'completed';

export interface Match {
  id: string;
  player1Id: string;
  player2Id: string;
  player1Name: string;
  player2Name: string;
  winnerId?: string;
  seasonId: string;
  weekNumber: number;
  // Match score (racks won by each player)
  score?: {
    player1: number;
    player2: number;
  };
  // APA Handicap system fields
  player1SkillLevel?: number; // Skill level at match time (2-7)
  player2SkillLevel?: number; // Skill level at match time (2-7)
  player1RacksNeeded?: number; // Racks needed to win based on handicap
  player2RacksNeeded?: number; // Racks needed to win based on handicap
  // Points earned from this match
  player1Points?: number; // Points earned by player1 (0-10)
  player2Points?: number; // Points earned by player2 (0-10)
  status: MatchStatus;
  createdAt: Timestamp;
}

// Event types
export type EventType = 'tournament' | 'workshop' | 'social' | 'practice';

export interface Event {
  id: string;
  title: string;
  description: string;
  time: Timestamp;
  location: string;
  organizer: string;
  attendees: string[]; // userId array
  maxAttendees?: number;
  type: EventType;
  createdAt: Timestamp;
}

// News types
export interface News {
  id: string;
  title: string;
  content: string;
  author: string;
  publishedDate: Timestamp;
  tags?: string[];
  createdAt: Timestamp;
}

// Season types
export type SeasonStatus = 'upcoming' | 'active' | 'completed';

export interface Season {
  id: string;
  name: string; // e.g., "Fall 2025"
  startDate: Timestamp;
  endDate: Timestamp;
  status: SeasonStatus;
  currentWeek: number;
  totalWeeks: number;
  totalMatches: number;
  playerIds: string[]; // Array of user IDs participating in the season
  pendingPlayerIds: string[]; // Array of user IDs pending admin approval
  createdAt: Timestamp;
}

// Match Report types
export type ReportStatus = 'pending' | 'resolved';

export interface MatchReport {
  id: string;
  matchId: string;
  reportedBy: string; // User ID of the person reporting
  reportedByName: string; // Name of the person reporting
  message: string; // User's description of the issue
  status: ReportStatus;
  resolvedBy?: string; // Admin user ID who resolved it
  resolvedAt?: Timestamp;
  createdAt: Timestamp;
}

// Notification types
export type NotificationType = 'match_scheduled' | 'news_released' | 'ranking_changed';

export interface Notification {
  id: string;
  userId: string; // User who should receive this notification
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  // Optional data for navigation or additional context
  matchId?: string; // For match_scheduled notifications
  newsId?: string; // For news_released notifications
  seasonId?: string; // For ranking_changed notifications
  oldRank?: number; // For ranking_changed notifications
  newRank?: number; // For ranking_changed notifications
  createdAt: Timestamp;
}
