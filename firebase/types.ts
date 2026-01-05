import { Timestamp } from 'firebase/firestore';

// User types
export type SkillLevel = 1yt%;

export interface User {
  // Basic Info
  id: string;
  name: string;
  email: string;
  phone?: number;
  wechat?: string;
  department?: string;
  bio: string;
  profileImageUrl?: string;
  // Pool Info
  skillLevel: SkillLevel;
  skillLevelNum: number;
  wins: number;
  losses: number;
  matchesPlayed: number;
  matchHistory: string[]; // Array of Match IDs
  // System Notes
  createdAt: Timestamp;
}

export interface Match {
  id: string;
  player1Id: string;
  player2Id: string;
  player1Name: string;
  player2Name: string;
  winnerId?: string;
  seasonId: string;
  weekNumber: number;
  score?: {
    player1: number;
    player2: number;
  };
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
  totalPlayers: number;
  totalMatches: number;
  createdAt: Timestamp;
}

