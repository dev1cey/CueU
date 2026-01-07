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
import { getFirestore } from 'firebase/firestore';
import { createMatch } from '../services/matchService';
import { getAllSeasons } from '../services/seasonService';
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

async function addCustomTestMatch(player1Query: string, player2Query: string) {
  try {
    console.log('🔍 Fetching all users...');
    const allUsers = await getAllUsers();
    
    // Find players by name or email (case-insensitive)
    const player1 = allUsers.find(user => 
      user.name.toLowerCase().includes(player1Query.toLowerCase()) || 
      user.email.toLowerCase().includes(player1Query.toLowerCase())
    );
    
    const player2 = allUsers.find(user => 
      user.name.toLowerCase().includes(player2Query.toLowerCase()) || 
      user.email.toLowerCase().includes(player2Query.toLowerCase())
    );
    
    if (!player1) {
      console.error(`❌ Player "${player1Query}" not found!`);
      console.log('\n📋 Available users:');
      allUsers.forEach(user => console.log(`  - ${user.name} (${user.email})`));
      return;
    }
    
    if (!player2) {
      console.error(`❌ Player "${player2Query}" not found!`);
      console.log('\n📋 Available users:');
      allUsers.forEach(user => console.log(`  - ${user.name} (${user.email})`));
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
    const testSeason = allSeasons.find(season => 
      season.name.toLowerCase().includes('test season 2025')
    );
    
    if (!testSeason) {
      console.error('❌ Test Season 2025 not found!');
      console.log('\n📋 Available seasons:');
      allSeasons.forEach(season => console.log(`  - ${season.name} (${season.status})`));
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
      weekNumber: testSeason.currentWeek || 1,
    });
    
    console.log(`✅ Successfully created test match with ID: ${matchId}`);
    console.log('\n📊 Match Details:');
    console.log(`  Player 1: ${player1.name} (Skill Level: ${player1.skillLevelNum})`);
    console.log(`  Player 2: ${player2.name} (Skill Level: ${player2.skillLevelNum})`);
    console.log(`  Season: ${testSeason.name}`);
    console.log(`  Week: ${testSeason.currentWeek || 1}`);
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

