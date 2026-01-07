/**
 * Script to add a test match between test user 1 and test user 2
 * 
 * Run from terminal:
 *   npx ts-node -P tsconfig.scripts.json firebase/scripts/addTestMatch.ts
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, where, limit } from 'firebase/firestore';
import { createMatch } from '../services/matchService';
import { getActiveSeason, getAllSeasons } from '../services/seasonService';
import { getAllUsers } from '../services/userService';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB15z05100Mb6YBifBFMpd58cOVGQyWzww",
  authDomain: "cueu-aff09.firebaseapp.com",
  databaseURL: "https://cueu-aff09-default-rtdb.firebaseio.com",
  projectId: "cueu-aff09",
  storageBucket: "cueu-aff09.firebasestorage.app",
  messagingSenderId: "361114924548",
  appId: "1:361114924548:web:93b61872e5747d967c6751",
  measurementId: "G-2DHLSJL6D2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function addTestMatch() {
  try {
    console.log('🔍 Fetching all users...');
    const allUsers = await getAllUsers();
    
    // Find test user 1 and test user 2
    const testUser1 = allUsers.find(user => 
      user.name.toLowerCase().includes('test-user-1') || 
      user.email.toLowerCase().includes('test1@')
    );
    
    const testUser2 = allUsers.find(user => 
      user.name.toLowerCase().includes('test-user-2') || 
      user.email.toLowerCase().includes('test2@')
    );
    
    if (!testUser1) {
      console.error('❌ Test User 1 not found!');
      console.log('Available users:');
      allUsers.forEach(user => console.log(`  - ${user.name} (${user.email})`));
      return;
    }
    
    if (!testUser2) {
      console.error('❌ Test User 2 not found!');
      console.log('Available users:');
      allUsers.forEach(user => console.log(`  - ${user.name} (${user.email})`));
      return;
    }
    
    console.log(`✓ Found Test User 1: ${testUser1.name} (${testUser1.email})`);
    console.log(`✓ Found Test User 2: ${testUser2.name} (${testUser2.email})`);
    
    // Get the current season
    console.log('\n🔍 Fetching current season...');
    let currentSeason = await getActiveSeason();
    
    if (!currentSeason) {
      console.log('No active season found, checking all seasons...');
      const allSeasons = await getAllSeasons();
      if (allSeasons.length > 0) {
        currentSeason = allSeasons[0]; // Get the most recent season
        console.log(`✓ Using most recent season: ${currentSeason.name} (status: ${currentSeason.status})`);
      } else {
        console.error('❌ No seasons found in the database!');
        return;
      }
    } else {
      console.log(`✓ Found active season: ${currentSeason.name}`);
    }
    
    // Create the match
    console.log('\n🎱 Creating test match...');
    const matchId = await createMatch({
      player1Id: testUser1.id,
      player2Id: testUser2.id,
      player1Name: testUser1.name,
      player2Name: testUser2.name,
      seasonId: currentSeason.id,
      weekNumber: currentSeason.currentWeek || 1,
    });
    
    console.log(`✅ Successfully created test match with ID: ${matchId}`);
    console.log('\nMatch Details:');
    console.log(`  Player 1: ${testUser1.name} (Skill Level: ${testUser1.skillLevelNum})`);
    console.log(`  Player 2: ${testUser2.name} (Skill Level: ${testUser2.skillLevelNum})`);
    console.log(`  Season: ${currentSeason.name}`);
    console.log(`  Week: ${currentSeason.currentWeek || 1}`);
    console.log(`  Status: planned`);
    
  } catch (error) {
    console.error('❌ Error adding test match:', error);
    if (error instanceof Error) {
      console.error('Error details:', error.message);
      console.error(error.stack);
    }
    throw error;
  }
}

// Run the script
console.log('Starting test match creation...\n');
addTestMatch()
  .then(() => {
    console.log('\n✓ Script completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n✗ Script failed:', error);
    process.exit(1);
  });

