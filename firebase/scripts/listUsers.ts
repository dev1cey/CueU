/**
 * Script to list all users in the database
 * 
 * Run from terminal:
 *   npx ts-node -P tsconfig.scripts.json firebase/scripts/listUsers.ts
 */

import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAllUsers } from '../services/userService';
import { getAllSeasons } from '../services/seasonService';
import { getSeasonWeekInfo } from '../utils/seasonUtils';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAJDyt_24Mz87uByZVxkHUOYdnxLGSaOJ0",
  authDomain: "cueu-f45c8.firebaseapp.com",
  databaseURL: "https://cueu-f45c8-default-rtdb.firebaseio.com",
  projectId: "cueu-f45c8",
  storageBucket: "cueu-f45c8.firebasestorage.app",
  messagingSenderId: "986847597138",
  appId: "1:986847597138:web:47be161543ae57ef38858b",
  measurementId: "G-D1BK1C339S"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function listUsers() {
  try {
    console.log('🔍 Fetching all users...\n');
    const allUsers = await getAllUsers();
    
    if (allUsers.length === 0) {
      console.log('❌ No users found in the database!');
      return;
    }
    
    console.log(`✓ Found ${allUsers.length} users:\n`);
    console.log('━'.repeat(80));
    
    allUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Skill Level: ${user.skillLevelNum} (${user.skillLevel})`);
      console.log(`   Record: ${user.wins}W - ${user.losses}L (${user.matchesPlayed} matches)`);
      console.log('━'.repeat(80));
    });
    
    // Also list seasons
    console.log('\n🏆 Fetching all seasons...\n');
    const allSeasons = await getAllSeasons();
    
    if (allSeasons.length === 0) {
      console.log('❌ No seasons found in the database!');
      return;
    }
    
    console.log(`✓ Found ${allSeasons.length} seasons:\n`);
    console.log('━'.repeat(80));
    
    allSeasons.forEach((season, index) => {
      const { currentWeek, totalWeeks } = getSeasonWeekInfo(season);
      console.log(`${index + 1}. ${season.name}`);
      console.log(`   Status: ${season.status}`);
      console.log(`   Week: ${currentWeek} / ${totalWeeks}`);
      console.log(`   Players: ${season.playerIds.length}`);
      console.log('━'.repeat(80));
    });
    
  } catch (error) {
    console.error('❌ Error listing users:', error);
    if (error instanceof Error) {
      console.error('Error details:', error.message);
      console.error(error.stack);
    }
    throw error;
  }
}

// Run the script
console.log('🚀 Starting user list...\n');
listUsers()
  .then(() => {
    console.log('\n✓ Script completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n✗ Script failed:', error);
    process.exit(1);
  });


