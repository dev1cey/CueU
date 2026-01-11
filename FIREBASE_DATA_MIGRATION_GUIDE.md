# Firebase Data Migration Guide

> **Note**: This guide is for reference. The migration from the old Firebase project (`cueu-aff09`) to the new project (`cueu-f45c8`) has been completed. This guide is kept for historical reference and in case you need to migrate additional data.

## Overview

The migration process involves:
1. **Firestore Data** - Copying all collections and documents
2. **Authentication Users** - Exporting and importing user accounts
3. **Storage Files** - Copying uploaded files (if any)
4. **Verification** - Ensuring all data transferred correctly

## Prerequisites

- ✅ Both Firebase projects are accessible
- ✅ You have admin access to both projects
- ✅ Firestore rules in new project allow writes (currently set to allow all for testing)
- ✅ Node.js and npm installed

## Step 1: Prepare for Migration

### 1.1 Backup Old Project (Recommended)

Before migrating, it's good practice to export your old project data:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your **old project** (`cueu-aff09`)
3. Go to **Firestore Database** → **Settings** (gear icon)
4. Click **"Export"** or use Firebase CLI:
   ```bash
   gcloud firestore export gs://your-bucket-name/backup
   ```

### 1.2 Verify New Project Setup

1. Go to your **new project** (`cueu-f45c8`)
2. Verify Firestore is enabled
3. Check that Firestore rules allow writes (currently set to allow all for testing)
4. Make sure you have the correct Firebase configuration

## Step 2: Migrate Firestore Data

### Option A: Automated Script (Recommended)

Use the provided migration script to copy all collections:

```bash
npm run migrate:data
```

Or directly:
```bash
npx ts-node --project tsconfig.scripts.json firebase/scripts/migrateData.ts
```

**What it does:**
- Connects to both old and new Firebase projects
- Copies all collections: `users`, `matches`, `seasons`, `events`, `news`, `notifications`, `matchReports`, `admins`
- Preserves document IDs
- Processes in batches of 500 (Firestore limit)
- Shows progress for each collection
- Reports any errors

**Expected Output:**
```
========================================
Firebase Data Migration
========================================
From: cueu-aff09
To:   cueu-f45c8
========================================

📦 Migrating collection: users
  Found 15 documents
  ✅ Migrated 15/15 documents...
  ✅ Completed: 15 migrated, 0 errors

📦 Migrating collection: matches
  Found 42 documents
  ✅ Migrated 42/42 documents...
  ✅ Completed: 42 migrated, 0 errors

...

========================================
Migration Summary
========================================
users              :   15 documents, 0 errors
matches            :   42 documents, 0 errors
seasons            :    3 documents, 0 errors
events             :    8 documents, 0 errors
news               :   12 documents, 0 errors
notifications      :   25 documents, 0 errors
matchReports       :    2 documents, 0 errors
admins             :    3 documents, 0 errors
----------------------------------------
Total: 110 documents migrated, 0 errors
========================================

🎉 Migration completed successfully!
```

### Option B: Manual Export/Import (Alternative)

If you prefer using Firebase Console:

1. **Export from Old Project:**
   - Go to Firebase Console → Old Project
   - Firestore Database → Settings → Export
   - Choose a Cloud Storage bucket
   - Wait for export to complete

2. **Import to New Project:**
   - Go to Firebase Console → New Project
   - Firestore Database → Settings → Import
   - Select the exported backup
   - Wait for import to complete

**Note:** This method requires a Cloud Storage bucket and may take longer for large datasets.

## Step 3: Migrate Authentication Users

Firebase Authentication users need to be migrated separately. There are two approaches:

### Option A: Export/Import via Firebase CLI (Recommended)

1. **Install Firebase CLI** (if not already installed):
   ```bash
   npm install -g firebase-tools
   ```

2. **Login to Firebase:**
   ```bash
   firebase login
   ```

3. **Export users from old project:**
   ```bash
   firebase auth:export users_export.json --project cueu-aff09
   ```

4. **Import users to new project:**
   ```bash
   firebase auth:import users_export.json --project cueu-f45c8
   ```

### Option B: Manual Re-authentication (Alternative)

If you have few users, they can simply sign in again with Google in the new project. The app will create their Firestore user documents if they don't exist.

**Note:** This approach means users will need to sign in again, but their Firestore data will already be migrated.

## Step 4: Migrate Storage Files (if applicable)

If you have files in Firebase Storage:

1. **List files in old project:**
   - Go to Firebase Console → Old Project
   - Storage → Files
   - Note the file paths

2. **Download and re-upload:**
   - Download files from old project
   - Upload to new project in the same paths
   - Or use `gsutil` for bulk operations:
     ```bash
     gsutil -m cp -r gs://cueu-aff09.appspot.com/* gs://cueu-f45c8.firebasestorage.app/
     ```

## Step 5: Verify Migration

### 5.1 Check Firestore Data

1. Go to Firebase Console → New Project
2. Navigate to **Firestore Database** → **Data** tab
3. Verify all collections exist:
   - ✅ `users` - Check user count matches
   - ✅ `matches` - Check match count matches
   - ✅ `seasons` - Check seasons exist
   - ✅ `events` - Check events exist
   - ✅ `news` - Check news articles exist
   - ✅ `notifications` - Check notifications exist
   - ✅ `matchReports` - Check reports exist
   - ✅ `admins` - Check admin users exist

4. **Spot check a few documents:**
   - Open a user document and verify fields
   - Open a match document and verify data
   - Check that relationships (user IDs, match IDs) are preserved

### 5.2 Check Authentication

1. Go to Firebase Console → New Project
2. Navigate to **Authentication** → **Users** tab
3. Verify user accounts exist (if you migrated auth users)

### 5.3 Test in App

1. **Start the app:**
   ```bash
   npm start
   ```

2. **Test sign-in:**
   - Sign in with Google
   - Verify your profile loads correctly
   - Check that your match history appears
   - Verify seasons and events are visible

3. **Test data operations:**
   - View league standings
   - Check match history
   - View news articles
   - Check events

## Step 6: Post-Migration Tasks

### 6.1 Update Firestore Rules

Once migration is complete and verified, restore production security rules:

1. Copy contents from `firestore.rules.production.backup`
2. Replace `firestore.rules` with production rules
3. Deploy to Firebase Console:
   - Go to Firestore Database → Rules
   - Paste the rules
   - Click "Publish"

### 6.2 Deploy Firestore Indexes

1. Go to Firebase Console → Firestore Database → Indexes
2. Create indexes from `firestore.indexes.json`
3. Or use Firebase CLI:
   ```bash
   firebase deploy --only firestore:indexes --project cueu-f45c8
   ```

### 6.3 Update Documentation

Update any documentation that references the old project ID:
- `FIRESTORE_RULES_GUIDE.md` - Update project name
- Any README files
- CI/CD configurations

## Troubleshooting

### Migration Script Errors

**Error: "Permission denied"**
- Check Firestore rules in new project allow writes
- Verify you have admin access to both projects
- Make sure both projects are active

**Error: "Collection not found"**
- Some collections might not exist in old project
- This is normal - the script will skip empty collections
- Check the migration summary for details

**Error: "Document already exists"**
- If re-running migration, documents might already exist
- The script will overwrite existing documents
- Consider clearing the collection first if you want a fresh start

### Data Verification Issues

**Missing documents:**
- Check migration summary for errors
- Re-run migration for specific collections if needed
- Verify both projects are accessible

**Incorrect data:**
- Check that document IDs are preserved
- Verify Timestamp fields are correct
- Check relationships between documents (user IDs, match IDs)

**Authentication issues:**
- If users can't sign in, verify auth users were migrated
- Check that OAuth Client IDs are correct
- Verify email domains match (@uw.edu requirement)

## Migration Checklist

- [ ] Backup old project data (optional but recommended)
- [ ] Run Firestore migration script
- [ ] Verify all collections migrated correctly
- [ ] Migrate authentication users (if needed)
- [ ] Migrate storage files (if any)
- [ ] Test app with migrated data
- [ ] Verify user profiles load correctly
- [ ] Check match history appears
- [ ] Verify seasons and events are visible
- [ ] Restore production Firestore rules
- [ ] Deploy Firestore indexes
- [ ] Update documentation

## Quick Reference

**Migration Script:**
```bash
npm run migrate:data
```

**Test Connection:**
```bash
npm run test:firebase
```

**List Users (verify migration):**
```bash
npx ts-node --project tsconfig.scripts.json firebase/scripts/listUsers.ts
```

**Firebase CLI Auth Export:**
```bash
firebase auth:export users.json --project cueu-aff09
firebase auth:import users.json --project cueu-f45c8
```

## Notes

- The migration script preserves all document IDs
- Timestamps are preserved as-is
- Relationships between documents (IDs) are maintained
- The script processes in batches to handle large datasets
- You can re-run the migration script - it will overwrite existing documents
- Authentication users must be migrated separately (they're not in Firestore)

## After Migration

Once migration is complete:
1. ✅ Test thoroughly in the app
2. ✅ Verify all data appears correctly
3. ✅ Restore production security rules
4. ✅ Deploy indexes
5. ✅ Update any external references to the old project
6. ✅ Consider archiving or deleting the old project (after verification period)

