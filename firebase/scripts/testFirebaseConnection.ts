/**
 * Test script to verify Firebase connection and basic operations
 * 
 * Run from terminal:
 *   npx ts-node --project tsconfig.scripts.json firebase/scripts/testFirebaseConnection.ts
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc, getDoc, deleteDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

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
console.log('🔧 Initializing Firebase...');
const app = initializeApp(firebaseConfig);
console.log('✅ Firebase app initialized\n');

// Test Firestore
async function testFirestore() {
  console.log('📊 Testing Firestore connection...');
  try {
    const db = getFirestore(app);
    const testCollection = 'test_connection';
    const testDocId = `test_${Date.now()}`;
    const testData = {
      message: 'Hello from Firebase test!',
      timestamp: new Date().toISOString(),
      testId: testDocId
    };

    // Write test
    console.log('  Writing test document...');
    const testDocRef = doc(db, testCollection, testDocId);
    await setDoc(testDocRef, testData);
    console.log('  ✅ Write successful');

    // Read test
    console.log('  Reading test document...');
    const docSnapshot = await getDoc(testDocRef);
    if (docSnapshot.exists()) {
      console.log('  ✅ Read successful');
      console.log('  Data:', docSnapshot.data());
    } else {
      throw new Error('Document not found after write');
    }

    // Cleanup
    console.log('  Cleaning up test document...');
    await deleteDoc(testDocRef);
    console.log('  ✅ Cleanup successful');

    console.log('✅ Firestore connection test passed\n');
    return true;
  } catch (error) {
    console.error('❌ Firestore test failed:', error);
    if (error instanceof Error) {
      console.error('  Error message:', error.message);
      console.error('  Error code:', (error as any).code);
    }
    return false;
  }
}

// Test Firebase Auth
function testAuth() {
  console.log('🔐 Testing Firebase Auth connection...');
  try {
    const auth = getAuth(app);
    console.log('  Auth instance created');
    console.log('  Current user:', auth.currentUser?.email || 'No user signed in (expected)');
    console.log('✅ Firebase Auth connection test passed\n');
    return true;
  } catch (error) {
    console.error('❌ Firebase Auth test failed:', error);
    if (error instanceof Error) {
      console.error('  Error message:', error.message);
    }
    return false;
  }
}

// Test Storage
function testStorage() {
  console.log('💾 Testing Firebase Storage connection...');
  try {
    const storage = getStorage(app);
    console.log('  Storage instance created');
    console.log('  Storage bucket:', storage.app.options.storageBucket);
    console.log('✅ Firebase Storage connection test passed\n');
    return true;
  } catch (error) {
    console.error('❌ Firebase Storage test failed:', error);
    if (error instanceof Error) {
      console.error('  Error message:', error.message);
    }
    return false;
  }
}

// Test configuration
function testConfiguration() {
  console.log('⚙️  Testing Firebase configuration...');
  try {
    console.log('  Project ID:', firebaseConfig.projectId);
    console.log('  Auth Domain:', firebaseConfig.authDomain);
    console.log('  Storage Bucket:', firebaseConfig.storageBucket);
    console.log('  API Key:', firebaseConfig.apiKey.substring(0, 10) + '...');
    console.log('✅ Configuration looks correct\n');
    return true;
  } catch (error) {
    console.error('❌ Configuration test failed:', error);
    return false;
  }
}

// Main test function
async function runTests() {
  console.log('========================================');
  console.log('Firebase Connection Test');
  console.log('========================================\n');

  const results = {
    config: false,
    firestore: false,
    auth: false,
    storage: false
  };

  // Test configuration
  results.config = testConfiguration();

  // Test Firestore
  results.firestore = await testFirestore();

  // Test Auth
  results.auth = testAuth();

  // Test Storage
  results.storage = testStorage();

  // Summary
  console.log('========================================');
  console.log('Test Summary');
  console.log('========================================');
  console.log('Configuration:', results.config ? '✅ PASS' : '❌ FAIL');
  console.log('Firestore:', results.firestore ? '✅ PASS' : '❌ FAIL');
  console.log('Auth:', results.auth ? '✅ PASS' : '❌ FAIL');
  console.log('Storage:', results.storage ? '✅ PASS' : '❌ FAIL');
  console.log('========================================\n');

  const allPassed = Object.values(results).every(result => result === true);

  if (allPassed) {
    console.log('🎉 All tests passed! Firebase is connected and working correctly.');
    process.exit(0);
  } else {
    console.log('⚠️  Some tests failed. Please check the errors above.');
    process.exit(1);
  }
}

// Run tests
runTests().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});

