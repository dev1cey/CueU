/**
 * Quick script to migrate only the admins collection
 * 
 * Run from terminal:
 *   npx ts-node --project tsconfig.scripts.json firebase/scripts/migrateAdminsOnly.ts
 */

import { initializeApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore, collection, getDocs, doc, setDoc, writeBatch } from 'firebase/firestore';

// OLD Firebase project configuration
const oldFirebaseConfig = {
  apiKey: "AIzaSyB15z05100Mb6YBifBFMpd58cOVGQyWzww",
  authDomain: "cueu-aff09.firebaseapp.com",
  databaseURL: "https://cueu-aff09-default-rtdb.firebaseio.com",
  projectId: "cueu-aff09",
  storageBucket: "cueu-aff09.firebasestorage.app",
  messagingSenderId: "361114924548",
  appId: "1:361114924548:web:93b61872e5747d967c6751",
  measurementId: "G-2DHLSJL6D2"
};

// NEW Firebase project configuration
const newFirebaseConfig = {
  apiKey: "AIzaSyAJDyt_24Mz87uByZVxkHUOYdnxLGSaOJ0",
  authDomain: "cueu-f45c8.firebaseapp.com",
  databaseURL: "https://cueu-f45c8-default-rtdb.firebaseio.com",
  projectId: "cueu-f45c8",
  storageBucket: "cueu-f45c8.firebasestorage.app",
  messagingSenderId: "986847597138",
  appId: "1:986847597138:web:47be161543ae57ef38858b",
  measurementId: "G-D1BK1C339S"
};

// Initialize Firebase apps
console.log('🔧 Initializing Firebase connections...');
const oldApp: FirebaseApp = initializeApp(oldFirebaseConfig, 'old');
const newApp: FirebaseApp = initializeApp(newFirebaseConfig, 'new');

const oldDb: Firestore = getFirestore(oldApp);
const newDb: Firestore = getFirestore(newApp);

console.log('✅ Connected to both Firebase projects\n');

/**
 * Migrate admins collection
 */
async function migrateAdmins() {
  const collectionName = 'admins';
  console.log(`📦 Migrating collection: ${collectionName}`);
  
  try {
    // Get all documents from old database
    const oldCollectionRef = collection(oldDb, collectionName);
    const snapshot = await getDocs(oldCollectionRef);
    
    if (snapshot.empty) {
      console.log(`  ⚠️  No documents found in ${collectionName}, skipping...\n`);
      return { count: 0, errors: 0 };
    }
    
    console.log(`  Found ${snapshot.size} documents`);
    
    // Process in batches of 500 (Firestore limit)
    const BATCH_SIZE = 500;
    const docs = snapshot.docs;
    let totalMigrated = 0;
    let totalErrors = 0;
    
    for (let i = 0; i < docs.length; i += BATCH_SIZE) {
      const batch = writeBatch(newDb);
      const batchDocs = docs.slice(i, i + BATCH_SIZE);
      let batchCount = 0;
      
      batchDocs.forEach((docSnapshot) => {
        try {
          const data = docSnapshot.data();
          const newDocRef = doc(newDb, collectionName, docSnapshot.id);
          batch.set(newDocRef, data);
          batchCount++;
        } catch (error) {
          console.error(`  ❌ Error preparing document ${docSnapshot.id}:`, error);
          totalErrors++;
        }
      });
      
      if (batchCount > 0) {
        try {
          await batch.commit();
          totalMigrated += batchCount;
          console.log(`  ✅ Migrated ${totalMigrated}/${docs.length} documents...`);
        } catch (error) {
          console.error(`  ❌ Error committing batch:`, error);
          totalErrors += batchCount;
        }
      }
    }
    
    console.log(`  ✅ Completed: ${totalMigrated} migrated, ${totalErrors} errors\n`);
    return { count: totalMigrated, errors: totalErrors };
    
  } catch (error) {
    console.error(`  ❌ Error migrating collection ${collectionName}:`, error);
    if (error instanceof Error) {
      console.error(`  Error message: ${error.message}`);
      console.error(`  Error code: ${(error as any).code}`);
    }
    return { count: 0, errors: 1 };
  }
}

// Run migration
console.log('========================================');
console.log('Admins Collection Migration');
console.log('========================================');
console.log(`From: ${oldFirebaseConfig.projectId}`);
console.log(`To:   ${newFirebaseConfig.projectId}`);
console.log('========================================\n');

migrateAdmins()
  .then((result) => {
    console.log('========================================');
    console.log('Migration Summary');
    console.log('========================================');
    console.log(`admins: ${result.count} documents migrated, ${result.errors} errors`);
    console.log('========================================\n');
    
    if (result.errors === 0) {
      console.log('🎉 Migration completed successfully!');
      process.exit(0);
    } else {
      console.log('⚠️  Migration completed with some errors. Please review the output above.');
      process.exit(1);
    }
  })
  .catch((error) => {
    console.error('\n❌ Fatal error during migration:', error);
    if (error instanceof Error) {
      console.error('Error details:', error.message);
      console.error(error.stack);
    }
    process.exit(1);
  });

