# Firestore Security Rules - Production Setup Guide

## Overview

Your Firestore database now has production-safe security rules that:
- Require authentication for all operations
- Allow users to read public data (users, matches, news, events, seasons)
- Restrict writes to only what users should be able to modify
- Prevent unauthorized access and data tampering

## Rules Summary

### Users Collection (`users`)
- **Read**: Any authenticated user can read any user (for rankings/leaderboards)
- **Create**: Users can only create their own profile (document ID must match auth UID, email must match)
- **Update**: Users can only update their own profile
- **Delete**: Not allowed (admin only via separate website)

### Matches Collection (`matches`)
- **Read**: Any authenticated user can read all matches (for league overview)
- **Create**: Not allowed (admin only via separate website)
- **Update**: Users can only update matches they're involved in (player1Id or player2Id)
  - Can complete matches, forfeit matches, accept bye matches
  - Cannot change critical fields (playerIds, seasonId, weekNumber, createdAt)
- **Delete**: Not allowed (admin only via separate website)

### News Collection (`news`)
- **Read**: Any authenticated user can read news
- **Create/Update/Delete**: Not allowed (admin only via separate website)

### Events Collection (`events`)
- **Read**: Any authenticated user can read events
- **Create**: Not allowed (admin only via separate website)
- **Update**: Users can only update the `attendees` array (for RSVP)
  - Cannot change other fields (title, description, time, location, etc.)
- **Delete**: Not allowed (admin only via separate website)

### Seasons Collection (`seasons`)
- **Read**: Any authenticated user can read seasons
- **Create**: Not allowed (admin only via separate website)
- **Update**: Users can only update player arrays (`playerIds`, `inactivePlayerIds`, `pendingPlayerIds`)
  - For registering, withdrawing, or re-entering seasons
  - Cannot change other fields (name, dates, status, etc.)
- **Delete**: Not allowed (admin only via separate website)

### Notifications Collection (`notifications`)
- **Read**: Users can only read their own notifications
- **Create**: Users can create notifications for any user (needed for ranking changes when completing matches)
  - Restricted to valid notification types: `match_scheduled`, `news_released`, `ranking_changed`
- **Update**: Users can only update their own notifications (mark as read)
- **Delete**: Users can only delete their own notifications

### Match Reports Collection (`matchReports`)
- **Read**: Users can only read their own reports
- **Create**: Users can create reports (must set `reportedBy` to their own UID)
- **Update/Delete**: Not allowed (admin only via separate website)

## How to Apply the Rules

1. **Copy the rules file**: The rules are in `firestore.rules` in your project root
2. **Go to Firebase Console**: 
   - Navigate to https://console.firebase.google.com
   - Select your project (`cueu-aff09`)
   - Go to Firestore Database → Rules tab
3. **Paste the rules**: Copy the entire contents of `firestore.rules` and paste into the Firebase Console
4. **Publish**: Click "Publish" to apply the rules

## Important Notes

### Admin Operations
All admin operations (creating matches, news, events, seasons, resolving reports) must be done through your separate admin website. The mobile app rules prevent these operations.

### Authentication Required
All operations require the user to be authenticated. Make sure your app properly handles authentication before attempting any Firestore operations.

### Notification Creation
Users can create notifications for any user, but only with specific types. This is necessary because when a user completes a match, ranking change notifications may need to be created for both players.

### Index Requirements
Some queries may require composite indexes. If you see index errors in the Firebase Console, create the required indexes as prompted.

## Testing

After applying the rules, test the following user operations:
1. ✅ Create user profile
2. ✅ Update own profile
3. ✅ View rankings/leaderboards (read all users)
4. ✅ View matches (read all matches)
5. ✅ Complete a match (update match)
6. ✅ Forfeit a match (update match)
7. ✅ Accept bye match (update match)
8. ✅ RSVP to event (update event attendees)
9. ✅ Register for season (update season pendingPlayerIds)
10. ✅ Withdraw from season (update season inactivePlayerIds)
11. ✅ View own notifications
12. ✅ Mark notification as read
13. ✅ Create match report

## Code Compatibility

✅ **No code changes needed** - The existing codebase is compatible with these rules. All Firestore operations go through the service layer, which already follows the patterns required by the rules.

## Security Considerations

- Users cannot create matches, news, events, or seasons (admin only)
- Users cannot modify other users' profiles
- Users cannot modify matches they're not involved in
- Users cannot modify critical season/event fields
- All operations require authentication
- Email verification ensures users create profiles with their authenticated email

