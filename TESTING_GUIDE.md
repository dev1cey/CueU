# Testing Guide - League Standings

## How to Add Test Players

1. **Open the app** and navigate to the **League** tab
2. You'll see a **Testing Mode** banner at the top
3. Click the **people icon button** (👥) to create 5 test players
4. The test players will be added to Firebase Firestore
5. The standings will automatically update to show the players

## Test Players Created

When you click the test player button, it creates these players:

1. **Friday Mufasa** - 13 wins, 1 loss (93% win rate)
2. **Oxygen** - 14 wins, 2 losses (88% win rate)
3. **Fluke Twofer** - 12 wins, 4 losses (75% win rate)
4. **Pocket Pro** - 10 wins, 5 losses (67% win rate)
5. **Cue Master** - 9 wins, 6 losses (60% win rate)

## Firebase Collections

### Players Collection (`players`)
```typescript
{
  id: string,
  name: string,
  email?: string,
  skillLevel: number,  // 1-7 APA style
  wins: number,
  losses: number,
  winRate: number,     // Percentage (0-100)
  gamesPlayed: number,
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

### League Stats Collection (`leagueStats`)
```typescript
{
  players: number,
  currentWeek: number,
  totalWeeks: number,
  matches: number
}
```

## Adding Custom Players

You can add your own players programmatically:

```typescript
import { createPlayer } from '../lib/leagueData';

await createPlayer({
  name: 'Your Name',
  skillLevel: 5,
  wins: 0,
  losses: 0,
  winRate: 0,
  gamesPlayed: 0,
});
```

## Viewing Data in Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to **Firestore Database**
4. You'll see collections:
   - `players` - All player data and stats
   - `leagueStats` - Current league statistics

## Next Steps

- Add match creation functionality
- Create player profiles
- Add match history
- Implement real-time match updates
- Add player search and filtering

## API Functions Available

From `lib/leagueData.ts`:

- `createPlayer(playerData)` - Create a new player
- `getAllPlayers()` - Get all players sorted by wins
- `getPlayer(playerId)` - Get a specific player
- `updatePlayerStats(playerId, stats)` - Update player wins/losses
- `getLeagueStats()` - Get current league statistics
- `updateLeagueStats(stats)` - Update league statistics
- `createTestPlayers()` - Create 5 test players

