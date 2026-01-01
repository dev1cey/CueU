# Admin Mode Guide

## Enabling Admin Mode

1. **Navigate to the League tab**
2. **Tap the shield icon** in the top-right header
3. **Confirm** to enable admin mode
4. The shield will turn **yellow** when admin mode is active

## Admin Features

### Edit Player Stats

When admin mode is enabled, you can:

1. **See a "Skill" column** in the standings table
2. **Tap any player row** or **click the pencil icon** to edit
3. A modal will appear with editable fields:
   - **Skill Level** (1-7 APA style)
   - **Wins**
   - **Losses**
4. Click **Save Changes** to update the player

### Automatic Calculations

When you edit a player:
- **Win Rate** is automatically calculated from wins and losses
- **Games Played** is automatically calculated (wins + losses)
- **Rankings** are automatically re-sorted

## Admin Functions (API)

From `lib/leagueData.ts`:

### Update Player Skill Level
```typescript
await updatePlayerSkillLevel(playerId, skillLevel);
```
- `playerId`: The player's unique ID
- `skillLevel`: Number between 1-7

### Update Player Record
```typescript
await updatePlayerRecord(playerId, wins, losses);
```
- Automatically calculates win rate and games played

### Create Match
```typescript
await createMatch({
  week: 1,
  player1Id: 'player_id_1',
  player1Name: 'Player 1',
  player1Score: 10,
  player2Id: 'player_id_2',
  player2Name: 'Player 2',
  player2Score: 8,
  date: '2025-01-15',
  completed: true,
});
```
- Automatically updates player stats when `completed: true`

## Match Management (Coming Soon)

Future admin features:
- Create and edit matches
- Adjust weekly scores
- Manage match schedules
- View match history
- Export standings to CSV

## Data Structure

### Player Object
```typescript
{
  id: string,
  name: string,
  email?: string,
  skillLevel: number,  // 1-7
  wins: number,
  losses: number,
  winRate: number,     // Auto-calculated percentage
  gamesPlayed: number, // Auto-calculated
  weeklyScores?: {     // Future feature
    week1: 10,
    week2: 8,
    ...
  }
}
```

### Match Object
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
  completed: boolean
}
```

## Security Considerations

**Important:** This admin mode currently uses client-side checks only.

For production, you should:
1. Add Firebase Authentication for admin users
2. Set up Firestore Security Rules to restrict writes
3. Create a separate admin user role
4. Add backend verification for admin actions

### Example Firestore Security Rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Only admins can write to players
    match /players/{playerId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
                      get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Only admins can write matches
    match /matches/{matchId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
                      get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
  }
}
```

## Tips

- **Double-check** skill levels before saving (1-7 range)
- **Verify** win/loss records match your external records
- **Refresh** the standings after bulk edits
- **Test** with test players before editing real data
- **Back up** your Firestore data regularly from Firebase Console

## Troubleshooting

### Skill Level Won't Update
- Ensure the value is between 1 and 7
- Check Firebase Console for permission errors

### Stats Not Calculating
- Verify wins and losses are valid positive numbers
- Check the browser/app console for errors

### Changes Not Saving
- Check your internet connection
- Verify Firebase is properly configured
- Check Firestore Security Rules allow writes

## Future Enhancements

Planned admin features:
- Bulk edit multiple players
- Import/export player data
- Match scheduling interface
- Weekly score entry form
- Player statistics dashboard
- Match history viewer
- Email notifications for match assignments


