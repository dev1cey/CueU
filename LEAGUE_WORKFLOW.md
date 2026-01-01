# League Workflow Documentation

## Complete Workflow

### 1. User Sign-Up Flow

**Step 1: Login**
- User signs in with Google (@uw.edu email)
- Email validation happens automatically

**Step 2: Profile Setup** (`profile-setup.tsx`)
- User fills out:
  - Name
  - Department/College
  - Skill Level (Beginner/Intermediate/Advanced/Expert)
  - Bio (optional)
- Data saved to Firebase:
  - `users` collection - user profile
  - `players` collection - player stats (wins: 0, losses: 0)
- User automatically joins league
- League player count increments

**Step 3: Access App**
- User lands on Home tab
- Can view league standings
- Profile is created and ready

### 2. Admin Matchup Management

**When in Admin Mode:**

#### Create Weekly Matchups
```typescript
// Admin creates matchups for the week
await createWeeklyMatchup(
  week: 7,           // Current week number
  player1Id: 'id1',  // Player 1 ID
  player2Id: 'id2',  // Player 2 ID
  date: '2025-01-15' // Match date
);
```

#### View Matches by Week
```typescript
// Get all matches for a specific week
const matches = await getMatchesByWeek(7);
```

#### Update Match Scores
```typescript
// Update scores as players report results
await updateMatchScore(matchId, player1Score: 10, player2Score: 8);
```

#### Complete Match
```typescript
// Mark match as complete and update player stats
await completeMatch(matchId);
// Automatically:
// - Updates winner's wins count
// - Updates loser's losses count
// - Recalculates win rates
// - Updates league match count
```

### 3. Data Structure

#### Users Collection
```typescript
{
  id: string,
  email: string,
  name: string,
  skillLevel: number,      // 1-7, set by admin initially
  department: string,
  bio?: string,
  isPlayer: boolean,       // true when joined league
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

#### Players Collection (for standings)
```typescript
{
  id: string,
  name: string,
  email: string,
  skillLevel: number,      // 1-7 APA style
  wins: number,
  losses: number,
  winRate: number,         // Percentage
  gamesPlayed: number,
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

#### Matches Collection
```typescript
{
  id: string,
  week: number,
  player1Id: string,
  player1Name: string,
  player1Score: number,
  player2Id: string,
  player2Name: string,
  player2Score: number,
  date: string,
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled',
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

#### League Stats Collection
```typescript
{
  players: number,         // Total players in league
  currentWeek: number,     // Current week (1-12)
  totalWeeks: number,      // Season length (12)
  matches: number          // Total completed matches
}
```

### 4. Admin Functions Available

#### User Management
- `getAllUsers()` - Get all registered users
- `getLeaguePlayers()` - Get only users who joined league
- `updatePlayerSkillLevel(playerId, skillLevel)` - Adjust skill level
- `updatePlayerRecord(playerId, wins, losses)` - Manual stat adjustment

#### Matchup Creation
- `createWeeklyMatchup(week, player1Id, player2Id, date)` - Create match
- `getMatchesByWeek(week)` - View week's matches
- `getAllMatches()` - View all matches

#### Match Management
- `updateMatchScore(matchId, p1Score, p2Score)` - Update scores
- `completeMatch(matchId)` - Finalize match (updates stats)
- `deleteMatch(matchId)` - Cancel match

#### League Management
- `getLeagueStats()` - Get current stats
- `updateLeagueStats({ currentWeek, ... })` - Update league info

### 5. Typical Admin Workflow

**Week 1: Setup**
1. Wait for players to sign up
2. Review player list: `getLeaguePlayers()`
3. Adjust skill levels if needed
4. Create matchups for Week 1

**During Week:**
```typescript
// Monday: Create all matchups
for (const pairing of pairings) {
  await createWeeklyMatchup(1, pairing.p1, pairing.p2, '2025-01-15');
}

// As matches complete:
await updateMatchScore(matchId, 10, 7);
await completeMatch(matchId);

// Standings automatically update
```

**End of Week:**
1. Verify all matches completed
2. Check standings accuracy
3. Update current week: `updateLeagueStats({ currentWeek: 2 })`
4. Create next week's matchups

### 6. Player Experience

**After Signup:**
- View standings
- See their rank
- Check their stats
- (Future: View their match schedule)
- (Future: Report match results)

### 7. Next Features to Build

**Admin UI (Priority)**
- [ ] Matchup creation interface
- [ ] Week-by-week match management
- [ ] Bulk matchup creation
- [ ] Match status dashboard

**Player Features**
- [ ] My Matches section
- [ ] Match history
- [ ] Opponent profiles
- [ ] Match result submission
- [ ] In-app messaging for scheduling

**Enhanced Features**
- [ ] Automatic matchmaking algorithm
- [ ] Handicap calculations
- [ ] Season playoffs
- [ ] Player statistics graphs
- [ ] Email notifications

### 8. Example: Creating Week 1 Matchups

```typescript
const players = await getLeaguePlayers();

// Simple pairing algorithm (can be enhanced)
const pairs = [];
for (let i = 0; i < players.length; i += 2) {
  if (i + 1 < players.length) {
    pairs.push({
      p1: players[i].id,
      p2: players[i + 1].id
    });
  }
}

// Create matchups
for (const pair of pairs) {
  await createWeeklyMatchup(
    1,                    // Week 1
    pair.p1,
    pair.p2,
    '2025-01-15'         // Friday
  );
}
```

## API Functions Summary

### User Management
- `createOrUpdateUser(userData, userId?)` - Create/update user profile
- `getUser(userId)` - Get user by ID
- `getAllUsers()` - Get all users (admin)
- `getLeaguePlayers()` - Get league players only
- `joinLeague(userId)` - Convert user to player

### Player Management
- `createPlayer(playerData)` - Create player entry
- `getAllPlayers()` - Get all players (sorted)
- `getPlayer(playerId)` - Get player by ID
- `updatePlayerSkillLevel(playerId, level)` - Admin: adjust skill
- `updatePlayerRecord(playerId, wins, losses)` - Admin: adjust record
- `updatePlayerStats(playerId, stats)` - Internal: update stats

### Match Management
- `createWeeklyMatchup(week, p1, p2, date)` - Admin: create match
- `getMatchesByWeek(week)` - Get week's matches
- `getAllMatches()` - Get all matches
- `updateMatchScore(matchId, p1Score, p2Score)` - Admin: update score
- `completeMatch(matchId)` - Admin: finalize match
- `deleteMatch(matchId)` - Admin: cancel match

### League Management
- `getLeagueStats()` - Get league statistics
- `updateLeagueStats(stats)` - Admin: update league info
- `createTestPlayers()` - Dev: create test data

## Firebase Collections

1. **users** - User profiles and info
2. **players** - Player stats for standings
3. **matches** - All match data
4. **leagueStats** - Current league info (single document: 'current')

