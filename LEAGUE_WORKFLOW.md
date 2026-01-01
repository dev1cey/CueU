# League Workflow Documentation

## Complete Workflow

### 1. User Sign-Up Flow

**Step 1: Login**
- User signs in with Google (@uw.edu email) or Email/Password
- Email validation happens automatically
- Review mode available with code: `CUEU2025`

**Step 2: Profile Setup** (`profile-setup.tsx`)
- User fills out:
  - Name
  - Department/College
  - Skill Level (1-5 self-assessment - will be adjusted by director)
  - Bio (optional)
- Data saved to Firebase:
  - `players` collection - player profile and stats (wins: 0, losses: 0, winRate: 0)
- User automatically joins league
- League player count increments

**Step 3: Access App**
- User lands on Home tab
- Can view league standings
- Profile is created and ready

### 2. League Structure

**Season Details:**
- **Total Weeks**: 7
- **Current Week**: Tracked in `leagueStats` collection
- **Skill Levels**: 1-7 (APA system)
  - 1-2: Beginner
  - 3-4: Intermediate  
  - 5-6: Advanced
  - 7: Expert

**Director's Initial Setup:**
1. Review all signed-up players
2. **Manually assign accurate skill levels** (1-7) based on player ability
3. Skills replace the self-assessment from signup
4. Skills can be adjusted throughout the season

### 3. Week 1: Random Matchups with APA Handicapping

**How It Works:**
The league uses the **APA (American Poolplayers Association) 8-Ball handicapping system** to ensure fair matches.

**Process:**
1. All players are randomly shuffled
2. Players are paired sequentially
3. System calculates "race-to" numbers based on skill levels
4. Weaker players need to win fewer racks
5. Stronger players need to win more racks

**Example:**
- Player A (Skill 3) vs Player B (Skill 7)
  - Player A: Race to 3
  - Player B: Race to 6
- If Player A wins 3 racks first, they win the match
- If Player B wins 6 racks first, they win the match

**Creating Week 1 Matchups:**
```typescript
// Admin creates randomized Week 1 matchups
await createWeek1Matchups('2025-01-15');

// This automatically:
// - Fetches all active players
// - Randomizes player order
// - Creates matches with calculated handicaps
// - Stores race-to numbers for each player
// - Handles odd number of players (bye week)
```

**APA Race Chart:**
See `APA_HANDICAPPING.md` for the complete race chart showing how race-to numbers are calculated for all skill level combinations.

### 4. Admin Matchup Management

**When in Admin Mode:**

#### View & Create Matchups
```typescript
// View Week 1 matches
const matches = await getMatchupsByWeek(1);

// Create individual matchup (manual)
await createWeeklyMatchup(
  week: 1,
  player1Id: 'id1',
  player2Id: 'id2',
  date: '2025-01-15'
);
// Race-to numbers calculated automatically
```

#### Update Match Scores
```typescript
// Update scores as players report results
await updateMatchup(matchId, {
  player1Score: 3,
  player2Score: 6,
  status: 'completed'
});
```

#### Adjust Player Stats
```typescript
// Update skill level
await updatePlayerSkillLevel(playerId, 5);

// Manual record adjustment (if needed)
await updatePlayerRecord(playerId, 3, 2);
```

### 5. Data Structure

#### Players Collection
```typescript
{
  id: string,
  name: string,
  email: string,
  department: string,
  skillLevel: number,      // 1-7 (director assigned)
  bio?: string,
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
  player1SkillLevel: number,
  player1RaceTo: number,    // APA handicap
  player1Score: number,
  player2Id: string,
  player2Name: string,
  player2SkillLevel: number,
  player2RaceTo: number,    // APA handicap
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
  currentWeek: number,     // Current week (1-7)
  totalWeeks: number,      // Always 7
  matches: number          // Total completed matches
}
```

### 6. Admin Functions Available

#### Player Management
- `getAllPlayers()` - Get all players (sorted by wins/win rate)
- `getPlayer(playerId)` - Get single player
- `updatePlayerSkillLevel(playerId, skillLevel)` - Adjust skill level (1-7)
- `updatePlayerRecord(playerId, wins, losses)` - Manual stat adjustment
- `createTestPlayers()` - Create 5 test players for development

#### Matchup Creation & Management
- `createWeek1Matchups(date)` - Create randomized Week 1 matchups with handicaps
- `createWeeklyMatchup(week, p1Id, p2Id, date)` - Create individual match
- `getMatchupsByWeek(week)` - View week's matches
- `getAllMatchups()` - View all matches
- `updateMatchup(matchId, data)` - Update match scores/status

#### APA Handicapping
- `calculateAPARace(skill1, skill2)` - Get race-to numbers
  - Returns: `[player1RaceTo, player2RaceTo]`
  - Example: `calculateAPARace(3, 7)` → `[3, 6]`

#### League Management
- `getLeagueStats()` - Get current league statistics
- `updateLeagueStats(data)` - Update league info (current week, etc.)

### 7. Typical Admin Workflow

**Before Season:**
1. Wait for players to sign up via app
2. Review all players: `await getAllPlayers()`
3. **Assign accurate skill levels (1-7)** for each player
4. Initialize league stats for 7-week season

**Week 1:**
```typescript
// 1. Create randomized matchups with handicaps
await createWeek1Matchups('2025-01-15');

// 2. Review generated matchups
const week1Matches = await getMatchupsByWeek(1);

// 3. As matches complete, update scores
await updateMatchup(matchId, {
  player1Score: 5,
  player2Score: 3,
  status: 'completed'
});

// 4. Standings automatically update
```

**Weeks 2-7:**
- TBD: Future matchmaking strategy
- Could use Swiss system (similar records face each other)
- Or round-robin
- Or skill-based brackets

**End of Season:**
- Review final standings
- Plan playoffs or finals
- Award season champion

### 8. Player Experience

**After Signup:**
- View league standings
- See their rank, record, win rate
- Check skill level
- View opponent profiles (future)
- See match schedule (future)
- Report match results (future)

### 9. Next Features to Build

**Admin UI (Priority)**
- [ ] Week 1 matchup generation button
- [ ] Week-by-week match dashboard
- [ ] Bulk match creation for Weeks 2-7
- [ ] Match status overview
- [ ] Player skill level adjustment interface

**Player Features**
- [ ] My Matches section
- [ ] Match history
- [ ] Opponent profiles with stats
- [ ] Match result submission
- [ ] In-app scheduling/messaging

**Enhanced Features**
- [ ] Week 2-7 Swiss system matchmaking
- [ ] Season playoff brackets
- [ ] Advanced player statistics
- [ ] Performance graphs
- [ ] Email/push notifications
- [ ] Dynamic skill level adjustments based on performance

### 10. Example: Week 1 Setup

```typescript
// Director assigns skill levels first
await updatePlayerSkillLevel('player1', 7); // Expert
await updatePlayerSkillLevel('player2', 5); // Advanced
await updatePlayerSkillLevel('player3', 3); // Intermediate
await updatePlayerSkillLevel('player4', 4); // Intermediate
await updatePlayerSkillLevel('player5', 6); // Advanced
await updatePlayerSkillLevel('player6', 2); // Beginner

// Create Week 1 matchups (randomized)
await createWeek1Matchups('2025-01-15');

// System might generate (random):
// Match 1: Player 3 (Skill 3, Race to 3) vs Player 1 (Skill 7, Race to 6)
// Match 2: Player 5 (Skill 6, Race to 6) vs Player 4 (Skill 4, Race to 4)  
// Match 3: Player 2 (Skill 5, Race to 5) vs Player 6 (Skill 2, Race to 2)
```

## API Functions Summary

### Player Management
- `createPlayer(playerData)` - Create new player (from profile setup)
- `getAllPlayers()` - Get all players (sorted by wins, then win rate)
- `getPlayer(playerId)` - Get single player
- `updatePlayerSkillLevel(playerId, level)` - Admin: set skill level (1-7)
- `updatePlayerRecord(playerId, wins, losses)` - Admin: adjust record
- `createTestPlayers()` - Dev: create 5 test players

### Match Management
- `createWeek1Matchups(date)` - Admin: generate random Week 1 matchups
- `createWeeklyMatchup(week, p1, p2, date)` - Admin: create individual match
- `getMatchupsByWeek(week)` - Get week's matches
- `getAllMatchups()` - Get all matches
- `updateMatchup(matchId, data)` - Admin: update scores/status

### APA Handicapping
- `calculateAPARace(skill1, skill2)` - Calculate race-to numbers
  - Input: Two skill levels (1-7)
  - Output: `[player1RaceTo, player2RaceTo]`

### League Management
- `getLeagueStats()` - Get league statistics
- `updateLeagueStats(stats)` - Admin: update league info
- `initializeLeagueStats()` - Initialize league (if needed)

## Firebase Collections

1. **players** - Player profiles, stats, and standings
2. **matches** - All match data with handicaps
3. **leagueStats** - Current league info (single document: 'current')

## Key Documentation Files

- **`APA_HANDICAPPING.md`** - Complete APA system explanation and race chart
- **`ADMIN_GUIDE.md`** - Admin mode features and usage
- **`GOOGLE_SIGNIN_SETUP.md`** - Google Sign-In configuration
- **`TESTING_GUIDE.md`** - Testing features (test players, bypass signup)
- **`LEAGUE_WORKFLOW.md`** - This file
