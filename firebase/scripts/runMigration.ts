/**
 * Terminal runner script for the migration
 * 
 * Run from terminal:
 *   npm run migrate
 * 
 * Or directly:
 *   npx ts-node firebase/scripts/runMigration.ts
 */

import migrateToAPAHandicap from './migrateToAPAHandicap';

// Run the migration
console.log('Starting APA Handicap System Migration...\n');
migrateToAPAHandicap()
  .then(() => {
    console.log('\n✓ Migration completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n✗ Migration failed:', error);
    if (error instanceof Error) {
      console.error('Error details:', error.message);
      console.error(error.stack);
    }
    process.exit(1);
  });

