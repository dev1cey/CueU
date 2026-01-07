# Migration Script: APA Handicap System

This migration script updates existing database records to support the new APA Handicap and scoring system.

## What It Does

1. **Updates Users:**
   - Converts `skillLevelNum` from old range (1-4) to new APA range (2-7)
   - Initializes `seasonPoints` field as empty object `{}` for all users

2. **Updates Matches:**
   - For completed matches, backfills handicap data:
     - `player1SkillLevel` and `player2SkillLevel` (from current user skill levels)
     - `player1RacksNeeded` and `player2RacksNeeded` (calculated from handicap chart)
     - `player1Points` and `player2Points` (calculated based on match results)

## How to Run

### Prerequisites

Make sure you have installed all dependencies:

```bash
npm install
```

This will install `ts-node` as a dev dependency.

### Running the Migration

**Option 1: Using npm script (Recommended)**

```bash
npm run migrate
```

**Option 2: Direct command**

```bash
npx ts-node --project tsconfig.scripts.json firebase/scripts/runMigration.ts
```

The migration will run in your terminal and show progress as it updates users and matches.

## Important Notes

- **Safe to run multiple times**: The script only updates records that need updating
- **Uses current skill levels**: For historical matches, it uses the players' current skill levels (since historical data isn't available)
- **Batch processing**: Handles large datasets by processing in batches of 500 (Firestore limit)
- **Non-destructive**: Only adds new fields, doesn't remove existing data

## Skill Level Mapping

The script maps old skill levels to new APA levels:
- `beginner` (1) → 2
- `intermediate` (2) → 3
- `advanced` (3) → 5
- `expert` (4) → 7

If a user already has a skill level in the 2-7 range, it's left unchanged.

## After Migration

After running the migration, the system is ready to use the APA Handicap system:
- ✅ New users will be created with skill levels 2-7
- ✅ New matches will automatically calculate handicap and points
- ✅ UI displays season points instead of win rate

