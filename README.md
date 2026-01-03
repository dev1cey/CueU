# CueU - UW Pool Club Mobile App

A React Native mobile application for the University of Washington Pool Club, built with Expo. This app helps students connect, compete, and engage with the pool community on campus.

## Features

- 🎱 **League Management**: View standings, track matches, and compete in the UW Pool League
- 📰 **News & Updates**: Stay informed about club events and announcements
- 👤 **User Profiles**: Create and manage your player profile with skill levels
- 🏆 **Rankings**: See top players and your position in the league
- 📅 **Events**: Browse and RSVP to upcoming pool events

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or later) - [Download](https://nodejs.org/)
- **npm** or **yarn**
- **Expo CLI** - Install with `npm install -g expo-cli`
- **iOS Simulator** (Mac only) or physical iOS device with Expo Go app
- **Firebase Account** - [Sign up free](https://firebase.google.com/)

### For iOS Development

- **Xcode** (Mac only) - [Download from App Store](https://apps.apple.com/us/app/xcode/id497799835)
- **iOS Simulator** (comes with Xcode)
- **Apple Developer Account** (for building standalone apps)

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Firebase Backend

This app uses Firebase for backend storage. Follow the setup guide:

📖 **[Firebase Setup Guide](./FIREBASE_SETUP.md)** - Complete step-by-step instructions

Quick steps:
1. Create a Firebase project at https://console.firebase.google.com/
2. Enable Firestore Database
3. Copy your Firebase config
4. Update `firebase/config.ts` with your credentials

See [FIREBASE_QUICKSTART.md](./FIREBASE_QUICKSTART.md) for a quick reference.

### 3. Start the Development Server

```bash
npm start
```

This will start the Expo development server. You'll see a QR code in your terminal.

### 4. Run on iOS

#### Option A: iOS Simulator (Mac only)

```bash
npm run ios
```

This will automatically open the iOS Simulator and launch the app.

#### Option B: Physical iPhone

1. Install **Expo Go** from the App Store on your iPhone
2. Scan the QR code from the terminal using your iPhone camera
3. The app will open in Expo Go

### 5. Run on Android (Optional)

```bash
npm run android
```

## Project Structure

```
CueU/
├── app/                      # App screens and navigation
│   ├── (tabs)/              # Bottom tab navigation
│   │   ├── _layout.tsx      # Tab navigation layout
│   │   ├── index.tsx        # Home screen (Firebase integrated)
│   │   ├── news.tsx         # News screen
│   │   ├── league.tsx       # League screen
│   │   └── settings.tsx     # Settings screen
│   ├── _layout.tsx          # Root layout
│   ├── index.tsx            # Auth/Login screen
│   └── profile-setup.tsx    # Profile setup screen
├── firebase/                 # Firebase backend
│   ├── config.ts            # Firebase configuration
│   ├── types.ts             # TypeScript type definitions
│   └── services/            # Firebase service modules
│       ├── userService.ts   # User operations
│       ├── matchService.ts  # Match operations
│       ├── eventService.ts  # Event operations
│       ├── newsService.ts   # News operations
│       └── seasonService.ts # Season operations
├── hooks/                    # Custom React hooks
│   ├── useUsers.ts          # User data hooks
│   ├── useEvents.ts         # Event data hooks
│   ├── useNews.ts           # News data hooks
│   ├── useMatches.ts        # Match data hooks
│   └── useSeasons.ts        # Season data hooks
├── assets/                   # Images, fonts, and other assets
├── FIREBASE_SETUP.md        # Detailed Firebase setup guide
├── FIREBASE_QUICKSTART.md   # Quick Firebase reference
├── FIREBASE_SUMMARY.md      # Complete Firebase documentation
├── app.json                 # Expo configuration
├── package.json             # Dependencies
└── README.md                # This file
```

## Building for Production

### iOS App Store Build

1. **Install EAS CLI**:
```bash
npm install -g eas-cli
```

2. **Login to Expo**:
```bash
eas login
```

3. **Configure the build**:
```bash
eas build:configure
```

4. **Build for iOS**:
```bash
npm run build:ios
```

5. **Submit to App Store** (after build completes):
```bash
eas submit -p ios
```

## Testing on iOS

### Using iOS Simulator

The iOS Simulator is the easiest way to test during development:

1. Make sure Xcode is installed
2. Run `npm run ios`
3. The app will automatically open in the simulator

### Using Physical iPhone

1. Download **Expo Go** from the App Store
2. Make sure your iPhone and computer are on the same WiFi network
3. Run `npm start`
4. Scan the QR code with your iPhone camera
5. The app will open in Expo Go

## Development Tips

### Hot Reloading

The app supports hot reloading. Any changes you make to the code will automatically reflect in the app without needing to restart.

### Debugging

- **iOS Simulator**: Press `Cmd + D` to open the debug menu
- **Physical Device**: Shake your device to open the debug menu
- **Chrome DevTools**: Press `j` in the terminal to open Chrome DevTools

### Common Commands

- `npm start` - Start the development server
- `npm run ios` - Run on iOS simulator
- `npm run android` - Run on Android emulator
- `npm run build:ios` - Build for iOS production

## Key Technologies

- **React Native** - Mobile framework
- **Expo** - Development platform
- **Expo Router** - File-based routing
- **Firebase** - Backend database and authentication
  - **Firestore** - NoSQL database
  - **Firebase Auth** - User authentication
- **TypeScript** - Type safety
- **Lucide React Native** - Icon library
- **React Native Reanimated** - Animations
- **React Native Gesture Handler** - Touch gestures
- **React Native StyleSheet** - Component styling

## Firebase Backend

This app uses Firebase for:
- 📊 **Data Storage** - User profiles, matches, events, news, and seasons
- 🔐 **Authentication** - User login and registration (optional)
- 📸 **Storage** - Profile pictures and images (future)
- 🔄 **Real-time Updates** - Live data synchronization (future)

### Firebase Collections

1. **users** - User profiles and statistics
2. **matches** - Pool match records and results
3. **events** - Club events and RSVPs
4. **news** - News articles and announcements
5. **seasons** - League season information

For complete documentation:
- **[Firebase Setup Guide](./FIREBASE_SETUP.md)** - Step-by-step Firebase Console setup
- **[Firebase Quick Start](./FIREBASE_QUICKSTART.md)** - Quick reference and examples
- **[Firebase Summary](./FIREBASE_SUMMARY.md)** - Complete API documentation

## Troubleshooting

### iOS Simulator Not Opening

If the iOS simulator doesn't open automatically:

1. Open Xcode
2. Go to Xcode > Open Developer Tool > Simulator
3. Then run `npm run ios` again

### Metro Bundler Issues

If you encounter bundler errors:

```bash
npm start -- --clear
```

### Native Module Errors

If you see errors about native modules:

```bash
rm -rf node_modules
npm install
npm start -- --clear
```

## Design & Architecture

This app is built with:

- **Component-based architecture** using React Native components (`View`, `Text`, `ScrollView`, etc.)
- **StyleSheet API** for component styling with consistent design tokens
- **File-based routing** with Expo Router for navigation
- **Mobile-first UI/UX** optimized for touch interactions
- **Type safety** with TypeScript interfaces
- **Firebase backend** with service layer architecture
- **Custom React hooks** for data fetching and state management
- **Error handling** and loading states throughout

## Usage Examples

### Fetching Data with Hooks

```typescript
import { useTopPlayers } from './hooks/useUsers';
import { useUpcomingEvents } from './hooks/useEvents';

function MyComponent() {
  const { players, loading } = useTopPlayers(10);
  const { events } = useUpcomingEvents();
  
  if (loading) return <ActivityIndicator />;
  
  return (
    <View>
      {players.map(player => (
        <Text key={player.id}>{player.name}</Text>
      ))}
    </View>
  );
}
```

### Creating Data with Services

```typescript
import { createUser, rsvpToEvent } from './firebase/services';

// Create user profile
await createUser('user-id', {
  email: 'student@uw.edu',
  name: 'John Husky',
  department: 'engineering',
  skillLevel: 'intermediate',
  bio: 'Love pool!'
});

// RSVP to event
await rsvpToEvent('event-id', 'user-id');
```

See [FIREBASE_QUICKSTART.md](./FIREBASE_QUICKSTART.md) for more examples.

## Contributing

This is a student project for UW CSE452. For questions or contributions, please contact the development team.

## License

This project is created for educational purposes as part of the University of Washington Computer Science program.

## Original Design

The original project design is available at: https://www.figma.com/design/DpHzhs07uEwDqXdRzpnMMR/UW-Billiards-League-App

---

**Note**: This app is currently in development. Features and functionality may change as development progresses.
