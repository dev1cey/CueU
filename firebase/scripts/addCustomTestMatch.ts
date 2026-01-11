/**
 * Script to add a test match between any two players
 * 
 * Usage:
 *   npx ts-node -P tsconfig.scripts.json firebase/scripts/addCustomTestMatch.ts "Player1 Name" "Player2 Name"
 * 
 * Example:
 *   npx ts-node -P tsconfig.scripts.json firebase/scripts/addCustomTestMatch.ts "John Doe" "Jane Smith"
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, addDoc, Timestamp } from 'firebase/firestore';
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

async function getAllUsers() {
  const usersRef = collection(db, 'users');
  const querySnapshot = await getDocs(usersRef);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as any[];
}

async function getAllSeasons() {
  const seasonsRef = collection(db, 'seasons');
  const querySnapshot = await getDocs(seasonsRef);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as any[];
}

async function createMatch(matchData: any) {
  const matchesRef = collection(db, 'matches');
  const now = Timestamp.now();

  const newMatch: any = {
    ...matchData,
    status: 'planned',
    createdAt: now,
    updatedAt: now,
  };

  const docRef = await addDoc(matchesRef, newMatch);
  return docRef.id;
}

async function addCustomTestMatch(player1Query: string, player2Query: string) {
  try {
    console.log('🔍 Fetching all users...');
    const allUsers = await getAllUsers();
    
    // Find players by name or email (case-insensitive)
    const player1 = allUsers.find((user: any) => 
      user.name.toLowerCase().includes(player1Query.toLowerCase()) || 
      user.email.toLowerCase().includes(player1Query.toLowerCase())
    );
    
    const player2 = allUsers.find((user: any) => 
      user.name.toLowerCase().includes(player2Query.toLowerCase()) || 
      user.email.toLowerCase().includes(player2Query.toLowerCase())
    );
    
    if (!player1) {
      console.error(`❌ Player "${player1Query}" not found!`);
      console.log('\n📋 Available users:');
      allUsers.forEach((user: any) => console.log(`  - ${user.name} (${user.email})`));
      return;
    }
    
    if (!player2) {
      console.error(`❌ Player "${player2Query}" not found!`);
      console.log('\n📋 Available users:');
      allUsers.forEach((user: any) => console.log(`  - ${user.name} (${user.email})`));
      return;
    }
    
    if (player1.id === player2.id) {
      console.error('❌ Cannot create a match between the same player!');
      return;
    }
    
    console.log(`✓ Found Player 1: ${player1.name} (${player1.email})`);
    console.log(`✓ Found Player 2: ${player2.name} (${player2.email})`);
    
    // Find "Test Season 2025"
    console.log('\n🔍 Fetching Test Season 2025...');
    const allSeasons = await getAllSeasons();
    const testSeason = allSeasons.find((season: any) => 
      season.name.toLowerCase().includes('test season 2025')
    );
    
    if (!testSeason) {
      console.error('❌ Test Season 2025 not found!');
      console.log('\n📋 Available seasons:');
      allSeasons.forEach((season: any) => console.log(`  - ${season.name} (${season.status})`));
      return;
    }
    
    console.log(`✓ Found season: ${testSeason.name} (status: ${testSeason.status})`);
    
    // Create the match
    console.log('\n🎱 Creating test match...');
    const matchId = await createMatch({
      player1Id: player1.id,
      player2Id: player2.id,
      player1Name: player1.name,
      player2Name: player2.name,
      seasonId: testSeason.id,
      weekNumber: (() => {
        const { currentWeek } = getSeasonWeekInfo(testSeason);
        return currentWeek || 1;
      })(),
    });
    
    console.log(`✅ Successfully created test match with ID: ${matchId}`);
    console.log('\n📊 Match Details:');
    console.log(`  Player 1: ${player1.name} (Skill Level: ${player1.skillLevelNum})`);
    console.log(`  Player 2: ${player2.name} (Skill Level: ${player2.skillLevelNum})`);
    console.log(`  Season: ${testSeason.name}`);
    console.log(`  Week: ${(() => {
      const { currentWeek } = getSeasonWeekInfo(testSeason);
      return currentWeek || 1;
    })()}`);
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

// Get command line arguments
const args = process.argv.slice(2);

if (args.length < 2) {
  console.error('❌ Usage: npx ts-node -P tsconfig.scripts.json firebase/scripts/addCustomTestMatch.ts "Player1 Name" "Player2 Name"');
  console.error('\nExample: npx ts-node -P tsconfig.scripts.json firebase/scripts/addCustomTestMatch.ts "John Doe" "Jane Smith"');
  process.exit(1);
}

const [player1Query, player2Query] = args;

// Run the script
console.log('🚀 Starting test match creation...\n');
console.log(`Looking for: "${player1Query}" vs "${player2Query}"\n`);

addCustomTestMatch(player1Query, player2Query)
  .then(() => {
    console.log('\n✓ Script completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n✗ Script failed:', error);
    process.exit(1);
  });
