# Quick Start: Run Database Migration

## Step 1: Install Dependencies

```bash
npm install --legacy-peer-deps
```

Or if you prefer, install just the migration dependencies:

```bash
npm install ts-node @types/node --save-dev --legacy-peer-deps
```

## Step 2: Run the Migration

```bash
npm run migrate
```

That's it! The migration will:
- Update all users' skill levels to APA range (2-7)
- Initialize season points for all users
- Backfill handicap data for completed matches
- Calculate and store points for historical matches

## What You'll See

The migration will show progress in your terminal:

```
========================================
APA Handicap System Migration
========================================

Starting user migration...
  User abc123: Updating skillLevelNum 1 -> 2
  User def456: Initializing seasonPoints
✓ Updated 15 users

Starting match migration...
  Match xyz789: Added handicap data (P1: 4->4 racks, P2: 2->2 racks)
✓ Updated 8 matches

========================================
Migration completed successfully!
========================================
```

## Troubleshooting

**If you get "ts-node not found":**
- Make sure you ran `npm install` first
- Try: `npx ts-node --project tsconfig.scripts.json firebase/scripts/runMigration.ts`

**If you get Firebase connection errors:**
- Check that your Firebase config in `firebase/config.ts` is correct
- Ensure you have proper Firestore permissions

**Safe to run multiple times:**
- The migration only updates records that need updating
- You can run it again if needed

