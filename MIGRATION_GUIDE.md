# APA Handicap System Migration Guide

This guide explains how to run the database migration and what changes were made to support the APA Handicap and scoring system.

## What Changed

### 1. Data Structure Updates

**User Interface (`firebase/types.ts`):**
- Added `seasonPoints?: Record<string, number>` to track points per season
- Updated comments to reflect APA skill levels (2-7)

**Match Interface (`firebase/types.ts`):**
- Added `player1SkillLevel` and `player2SkillLevel` (skill levels at match time)
- Added `player1RacksNeeded` and `player2RacksNeeded` (from handicap chart)
- Added `player1Points` and `player2Points` (points earned from match)

### 2. Service Updates

**User Service (`firebase/services/userService.ts`):**
- Updated skill level mapping: beginner=2, intermediate=3, advanced=5, expert=7
- Added `updateUserSeasonPoints()` function
- Updated `getTopPlayersByIds()` to sort by season points instead of win rate

**Match Service (`firebase/services/matchService.ts`):**
- Updated `completeMatch()` to:
  - Calculate handicap-based rack requirements
  - Calculate and store points for each player
  - Update season points for both players

### 3. UI Updates

**League Tab (`app/(tabs)/league.tsx`):**
- Changed standings to show "Points" instead of "Win %"
- Rankings now sorted by season points

**Home Tab (`app/(tabs)/index.tsx`):**
- Changed "Win Rate" stat to "Season Points"
- Top rankings now show points instead of W-L record

### 4. New Utilities

**Handicap Utils (`firebase/utils/handicapUtils.ts`):**
- `getRacksNeeded()` - Calculates racks needed based on skill level matchup
- `calculateMatchPoints()` - Calculates points earned (winner gets 10, loser gets 10 * racks won / racks needed)

## How to Run the Migration

### Prerequisites

First, install the required dependencies:

```bash
npm install
```

This will install `ts-node` as a dev dependency, which is needed to run TypeScript files from the terminal.

### Running the Migration

**Option 1: Using npm script (Recommended)**

```bash
npm run migrate
```

**Option 2: Direct command**

```bash
npx ts-node --project tsconfig.scripts.json firebase/scripts/runMigration.ts
```

The migration will:
- Show progress in the terminal
- Update users and matches
- Display a summary when complete

## What the Migration Does

1. **Updates Users:**
   - Converts `skillLevelNum` from old range (1-4) to new APA range (2-7)
   - Initializes `seasonPoints: {}` for all users

2. **Updates Matches:**
   - For completed matches, backfills:
     - Skill levels at match time (uses current skill levels)
     - Racks needed based on handicap chart
     - Points earned from the match

## Important Notes

- **Safe to run multiple times**: Only updates records that need updating
- **Uses current skill levels**: For historical matches, uses players' current skill levels
- **Non-destructive**: Only adds new fields, doesn't remove existing data
- **Batch processing**: Handles large datasets efficiently (500 operations per batch)

## After Migration

After running the migration, your system will:

1. ✅ Use APA skill levels (2-7) for new users
2. ✅ Calculate handicap-based rack requirements for new matches
3. ✅ Calculate and store points for completed matches
4. ✅ Update season points automatically when matches are completed
5. ✅ Display season points in rankings instead of win rate

## Testing

To test the new system:

1. Run the migration
2. Complete a new match - it should automatically:
   - Calculate rack requirements based on skill levels
   - Calculate points for both players
   - Update season points
3. Check the League tab - standings should show points
4. Check the Home tab - stats should show season points

## Troubleshooting

**Migration fails:**
- Check Firebase connection
- Ensure you have proper permissions
- Check console logs for specific errors

**Points not showing:**
- Make sure you've run the migration
- Check that matches have been completed after the migration
- Verify season points are being updated in `completeMatch()`

**Rankings not updating:**
- Ensure `getTopPlayersByIds()` is called with the `seasonId` parameter
- Check that season points are being calculated correctly

