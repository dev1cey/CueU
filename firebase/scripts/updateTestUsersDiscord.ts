/**
 * Script to update test users (test-user-1 through test-user-7) with discord usernames
 * 
 * Run from terminal:
 *   npx ts-node -P tsconfig.scripts.json firebase/scripts/updateTestUsersDiscord.ts
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, updateDoc } from 'firebase/firestore';

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

async function updateTestUsersDiscord() {
  try {
    console.log('🔍 Fetching all users...');
    const usersRef = collection(db, 'users');
    const querySnapshot = await getDocs(usersRef);
    const allUsers = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    // Find test users (test-user-1 through test-user-7)
    const testUsers = [];
    for (let i = 1; i <= 7; i++) {
      const testUser = allUsers.find((user: any) => 
        user.name?.toLowerCase().includes(`test-user-${i}`) || 
        user.email?.toLowerCase().includes(`test${i}@`)
      );
      if (testUser) {
        testUsers.push({ user: testUser, number: i });
      }
    }
    
    if (testUsers.length === 0) {
      console.error('❌ No test users found!');
      console.log('Available users:');
      allUsers.forEach((user: any) => console.log(`  - ${user.name} (${user.email})`));
      return;
    }
    
    console.log(`✓ Found ${testUsers.length} test users:\n`);
    
    // Update each test user with a discord username
    for (const { user, number } of testUsers) {
      const discordUsername = `testuser${number}#${String(number).padStart(4, '0')}`;
      const userData = user as any;
      
      console.log(`Updating ${userData.name} (${userData.email})...`);
      console.log(`  Setting discord to: ${discordUsername}`);
      
      const userRef = doc(db, 'users', user.id);
      await updateDoc(userRef, {
        discord: discordUsername
      });
      
      console.log(`  ✓ Updated successfully!\n`);
    }
    
    console.log(`✅ Successfully updated ${testUsers.length} test users with discord usernames!`);
    
  } catch (error) {
    console.error('❌ Error updating test users:', error);
    if (error instanceof Error) {
      console.error('Error details:', error.message);
      console.error(error.stack);
    }
    throw error;
  }
}

// Run the script
console.log('🚀 Starting test user discord update...\n');
updateTestUsersDiscord()
  .then(() => {
    console.log('\n✓ Script completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n✗ Script failed:', error);
    process.exit(1);
  });

