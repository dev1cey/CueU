# APA Handicapping System

## Overview
CueU uses the **official APA (American Poolplayers Association) 8-Ball handicapping system** to ensure fair matches between players of different skill levels.

**Source**: [APA Equalizer System](https://poolplayers.com/equalizer/)

## Skill Levels
Players are assigned a skill level from 2-7 by the League Director:
- **2**: Beginner
- **3**: Advanced Beginner (new players start here)
- **4**: Intermediate
- **5**: Advanced Intermediate
- **6**: Advanced
- **7**: Expert/Master

## The Equalizer® System
The core principle: **The differential in games must equal the differential in skill levels.**

This means:
- A weaker player needs to win fewer games
- A stronger player needs to win more games
- The difference in "games to win" equals the difference in skill levels

## Official APA 8-Ball "Games Must Win" Chart

Based on the official APA chart, here are the race-to numbers for each matchup:

| Your SL / Opp SL | **2** | **3** | **4** | **5** | **6** | **7** |
|------------------|-------|-------|-------|-------|-------|-------|
| **2**            | 2/2   | 2/3   | 2/4   | 2/5   | 2/6   | 2/7   |
| **3**            | 3/2   | 2/2   | 2/3   | 2/4   | 2/5   | 2/6   |
| **4**            | 4/2   | 3/2   | 3/3   | 3/4   | 3/5   | 3/6   |
| **5**            | 5/2   | 4/2   | 4/3   | 4/4   | 4/5   | 4/6   |
| **6**            | 6/2   | 5/2   | 5/3   | 5/4   | 5/5   | 5/6   |
| **7**            | 7/2   | 6/2   | 6/3   | 6/4   | 6/5   | 6/6   |

*Format: Your Race-to / Opponent's Race-to*

### How to Read the Chart

1. Find **your skill level** in the left column
2. Find **opponent's skill level** in the top row
3. The cell shows **[your race-to] / [opponent's race-to]**

### Example Matchups

**Example 1: SL5 vs SL3** (from APA website)
- Player 1 (Skill 5): Race to **4**
- Player 2 (Skill 3): Race to **2**
- Differential: 4 - 2 = 2 (matches skill differential 5 - 3 = 2) ✓

**Example 2: SL6 vs SL3** (from APA website)
- Player 1 (Skill 6): Race to **5**
- Player 2 (Skill 3): Race to **2**
- Differential: 5 - 2 = 3 (matches skill differential 6 - 3 = 3) ✓

**Example 3: SL6 vs SL4** (circled example on website)
- Player 1 (Skill 6): Race to **5**
- Player 2 (Skill 4): Race to **3**
- Differential: 5 - 3 = 2 (matches skill differential 6 - 4 = 2) ✓

**Example 4: SL7 vs SL4**
- Player 1 (Skill 7): Race to **6**
- Player 2 (Skill 4): Race to **3**
- Differential: 6 - 3 = 3 (matches skill differential 7 - 4 = 3) ✓

**Example 5: SL5 vs SL5** (equal skills)
- Both players: Race to **4**
- No handicap needed when skill levels are equal

## How It Works in CueU

### Initial Setup (Director)
1. **New Players Start at SL3**: Following APA rules, all new players begin at skill level 3
2. **Director Assigns Accurate Skill Levels**: Based on observation and experience, adjust players to their true skill level (2-7)
3. **Week 1 Matchups**: The system creates completely randomized pairings for Week 1

### Match Creation
When a match is created:
1. System retrieves both players' skill levels
2. Uses the official APA "Games Must Win" chart to calculate race-to numbers
3. The weaker player automatically gets a lower race-to number (handicap)
4. The stronger player needs to win more games
5. The differential in games equals the differential in skill levels

### Example Workflow

```typescript
// New player signs up - automatically starts at SL3
await createPlayer({
  name: "John Doe",
  email: "john@uw.edu",
  skillLevel: 3, // Default for new players
  // ...
});

// Director observes John play and adjusts skill level
await updatePlayerSkillLevel('john_id', 5); // John is actually advanced

// System creates Week 1 matchups (randomized)
await createWeek1Matchups('2025-01-15');

// Example match created: SL5 (John) vs SL3 (Sarah)
// - John (Skill 5): Race to 4
// - Sarah (Skill 3): Race to 2
// Handicap automatically calculated using official APA chart
```

## Implementation Details

### `calculateAPARace(skill1: number, skill2: number)`
- Takes two skill levels (2-7) as input
- Returns `[player1RaceTo, player2RaceTo]`
- Uses official APA "Games Must Win" chart
- Ensures differentials match skill level differentials
- Handles edge cases (clamps to 2-7 range)

**Examples:**
```typescript
calculateAPARace(5, 3); // Returns [4, 2] - verified from APA site
calculateAPARace(6, 4); // Returns [5, 3] - verified from APA site
calculateAPARace(7, 7); // Returns [6, 6] - equal skills
calculateAPARace(2, 7); // Returns [2, 7] - maximum differential
```

### `createWeek1Matchups(date: string)`
- Fetches all active players from Firebase
- Randomizes player order using Fisher-Yates shuffle algorithm
- Pairs players sequentially (1 vs 2, 3 vs 4, etc.)
- Automatically calculates race-to numbers using APA system
- Handles odd number of players (one receives a bye week)
- Stores all match data in Firebase

### `createWeeklyMatchup(...)`
- Creates individual matchup between two players
- Calculates handicaps based on official APA skill levels
- Stores race-to numbers with match data for display
- Sets initial scores to 0
- Status starts as 'scheduled'

## Key Differences from Other Systems

**Why APA is Fair:**
- Unlike straight races where everyone plays the same number
- Unlike arbitrary handicaps that may not scale properly
- The mathematical relationship (differential = differential) ensures fairness
- Tested and proven system used by 250,000+ APA members worldwide

**Contrast Example:**
- ❌ Non-APA: SL7 and SL3 both race to 5 (unfair - expert has huge advantage)
- ✅ APA System: SL7 races to 6, SL3 races to 2 (fair - beginner needs only 2 wins)

## Skill Level Guidelines for Directors

Based on APA standards:

### Skill Level 2 (Beginner)
- Limited experience
- Inconsistent shot making
- Basic understanding of strategy

### Skill Level 3 (Advanced Beginner)
- **Default for new players**
- Developing consistency
- Can run 2-3 balls occasionally
- Basic position play

### Skill Level 4 (Intermediate)
- Consistent shot maker
- Can run 3-4 balls regularly
- Good position play
- Understands basic strategy

### Skill Level 5 (Advanced Intermediate)
- Strong player
- Can run 4-5+ balls
- Advanced position play
- Strategic thinking

### Skill Level 6 (Advanced)
- Very strong player
- Frequently runs racks
- Excellent position play
- Advanced strategy and safety play

### Skill Level 7 (Expert/Master)
- Top-tier player
- Runs out regularly
- Near-flawless position play
- Tournament-level skills

## Future Enhancements
- **Dynamic Skill Adjustments**: The APA system allows skill levels to change throughout the season based on performance
- **Performance Tracking**: Monitor win rates at each handicap to ensure fairness
- **Bye Week Rotation**: Systematically rotate which player gets a bye when odd numbers
- **Skill Level Recommendations**: Analyze match results to suggest skill level adjustments to the director
- **Historical Tracking**: Keep records of skill level changes over time


