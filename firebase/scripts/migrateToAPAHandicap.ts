/**
 * Migration Script: Update existing data to support APA Handicap System
 * 
 * This script will:
 * 1. Update all Users: Convert skillLevelNum from 1-4 to 2-7 range and initialize seasonPoints
 * 2. Update all Matches: Backfill handicap fields for completed matches
 * 
 * Run this script once to migrate existing test data.
 */

import {
  collection,
  doc,
  getDocs,
  updateDoc,
  getDoc,
  writeBatch,
} from 'firebase/firestore';
import { db } from '../config';
import { User, Match } from '../types';
import { getRacksNeeded, calculateMatchPoints } from '../utils/handicapUtils';
import { getUserById } from '../services/userService';

const USERS_COLLECTION = 'users';
const MATCHES_COLLECTION = 'matches';

/**
 * Map old skill level (1-4) to new APA skill level (2-7)
 * Mapping: beginner=2, intermediate=3, advanced=5, expert=7
 * This distributes across the 2-7 range
 */
function mapOldSkillLevelToAPA(oldSkillLevel: number): number {
  const mapping: Record<number, number> = {
    1: 2, // beginner -> 2
    2: 3, // intermediate -> 3
    3: 5, // advanced -> 5
    4: 7, // expert -> 7
  };
  
  // If already in 2-7 range, return as is
  if (oldSkillLevel >= 2 && oldSkillLevel <= 7) {
    return oldSkillLevel;
  }
  
  return mapping[oldSkillLevel] || 2; // Default to 2 if unknown
}

/**
 * Migrate all users to new skill level system and initialize seasonPoints
 */
async function migrateUsers(): Promise<void> {
  console.log('Starting user migration...');
  
  try {
    const usersRef = collection(db, USERS_COLLECTION);
    const snapshot = await getDocs(usersRef);
    
    const updates: Array<{ userId: string; updates: Partial<User> }> = [];
    
    snapshot.forEach((userDoc) => {
      const userData = userDoc.data() as Omit<User, 'id'>;
      const userId = userDoc.id;
      
      const userUpdates: Partial<User> = {};
      let needsUpdate = false;
      
      // Update skillLevelNum if it's in old range (1-4)
      if (userData.skillLevelNum < 2 || userData.skillLevelNum > 7) {
        userUpdates.skillLevelNum = mapOldSkillLevelToAPA(userData.skillLevelNum);
        needsUpdate = true;
        console.log(`  User ${userId}: Updating skillLevelNum ${userData.skillLevelNum} -> ${userUpdates.skillLevelNum}`);
      }
      
      // Initialize seasonPoints if it doesn't exist
      if (!userData.seasonPoints) {
        userUpdates.seasonPoints = {};
        needsUpdate = true;
        console.log(`  User ${userId}: Initializing seasonPoints`);
      }
      
      if (needsUpdate) {
        updates.push({ userId, updates: userUpdates });
      }
    });
    
    // Process in batches of 500 (Firestore limit)
    const BATCH_SIZE = 500;
    let updateCount = 0;
    
    for (let i = 0; i < updates.length; i += BATCH_SIZE) {
      const batch = writeBatch(db);
      const batchUpdates = updates.slice(i, i + BATCH_SIZE);
      
      batchUpdates.forEach(({ userId, updates: userUpdates }) => {
        const userRef = doc(db, USERS_COLLECTION, userId);
        batch.update(userRef, userUpdates);
      });
      
      await batch.commit();
      updateCount += batchUpdates.length;
      console.log(`  Processed ${updateCount}/${updates.length} users...`);
    }
    
    if (updateCount > 0) {
      console.log(`✓ Updated ${updateCount} users`);
    } else {
      console.log('✓ No users needed updating');
    }
  } catch (error) {
    console.error('Error migrating users:', error);
    throw error;
  }
}

/**
 * Migrate all matches to include handicap fields
 */
async function migrateMatches(): Promise<void> {
  console.log('Starting match migration...');
  
  try {
    const matchesRef = collection(db, MATCHES_COLLECTION);
    const snapshot = await getDocs(matchesRef);
    
    const updates: Array<{ matchId: string; updates: Partial<Match> }> = [];
    
    // First pass: collect all updates
    for (const matchDoc of snapshot.docs) {
      const matchData = matchDoc.data() as Omit<Match, 'id'>;
      const matchId = matchDoc.id;
      
      // Only update completed matches that have scores
      if (matchData.status === 'completed' && matchData.score) {
        try {
          // Get current user data to determine skill levels
          // Note: We use current skill levels since we don't have historical data
          const player1 = await getUserById(matchData.player1Id);
          const player2 = await getUserById(matchData.player2Id);
          
          if (!player1 || !player2) {
            console.log(`  Match ${matchId}: Skipping - players not found`);
            continue;
          }
          
          const player1SkillLevel = player1.skillLevelNum;
          const player2SkillLevel = player2.skillLevelNum;
          
          // Ensure skill levels are in valid range
          if (player1SkillLevel < 2 || player1SkillLevel > 7 ||
              player2SkillLevel < 2 || player2SkillLevel > 7) {
            console.log(`  Match ${matchId}: Skipping - invalid skill levels (${player1SkillLevel}, ${player2SkillLevel})`);
            continue;
          }
          
          // Calculate racks needed
          const racksNeeded = getRacksNeeded(player1SkillLevel, player2SkillLevel);
          
          // Determine winner
          const player1Won = matchData.winnerId === matchData.player1Id;
          const player2Won = matchData.winnerId === matchData.player2Id;
          
          // Calculate points
          const player1Points = calculateMatchPoints(
            player1Won,
            matchData.score.player1,
            racksNeeded.player1
          );
          
          const player2Points = calculateMatchPoints(
            player2Won,
            matchData.score.player2,
            racksNeeded.player2
          );
          
          // Prepare updates
          const matchUpdates: Partial<Match> = {
            player1SkillLevel,
            player2SkillLevel,
            player1RacksNeeded: racksNeeded.player1,
            player2RacksNeeded: racksNeeded.player2,
            player1Points: Math.round(player1Points * 100) / 100, // Round to 2 decimals
            player2Points: Math.round(player2Points * 100) / 100,
          };
          
          updates.push({ matchId, updates: matchUpdates });
          
          console.log(`  Match ${matchId}: Added handicap data (P1: ${player1SkillLevel}->${racksNeeded.player1} racks, P2: ${player2SkillLevel}->${racksNeeded.player2} racks)`);
        } catch (error) {
          console.error(`  Match ${matchId}: Error processing -`, error);
        }
      }
    }
    
    // Second pass: commit in batches
    const BATCH_SIZE = 500;
    let updateCount = 0;
    
    for (let i = 0; i < updates.length; i += BATCH_SIZE) {
      const batch = writeBatch(db);
      const batchUpdates = updates.slice(i, i + BATCH_SIZE);
      
      batchUpdates.forEach(({ matchId, updates: matchUpdates }) => {
        const matchRef = doc(db, MATCHES_COLLECTION, matchId);
        batch.update(matchRef, matchUpdates);
      });
      
      await batch.commit();
      updateCount += batchUpdates.length;
      console.log(`  Processed ${updateCount}/${updates.length} matches...`);
    }
    
    if (updateCount > 0) {
      console.log(`✓ Updated ${updateCount} matches`);
    } else {
      console.log('✓ No matches needed updating');
    }
  } catch (error) {
    console.error('Error migrating matches:', error);
    throw error;
  }
}

/**
 * Main migration function
 */
export async function migrateToAPAHandicap(): Promise<void> {
  console.log('========================================');
  console.log('APA Handicap System Migration');
  console.log('========================================\n');
  
  try {
    await migrateUsers();
    console.log('');
    await migrateMatches();
    console.log('\n========================================');
    console.log('Migration completed successfully!');
    console.log('========================================');
  } catch (error) {
    console.error('\n========================================');
    console.error('Migration failed:', error);
    console.error('========================================');
    throw error;
  }
}

// Export for use in other scripts or manual execution
export default migrateToAPAHandicap;

