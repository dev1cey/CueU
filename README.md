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

### For iOS Development

- **Xcode** (Mac only) - [Download from App Store](https://apps.apple.com/us/app/xcode/id497799835)
- **iOS Simulator** (comes with Xcode)
- **Apple Developer Account** (for building standalone apps)

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Start the Development Server

```bash
npm start
```

This will start the Expo development server. You'll see a QR code in your terminal.

### 3. Run on iOS

#### Option A: iOS Simulator (Mac only)

```bash
npm run ios
```

This will automatically open the iOS Simulator and launch the app.

#### Option B: Physical iPhone

1. Install **Expo Go** from the App Store on your iPhone
2. Scan the QR code from the terminal using your iPhone camera
3. The app will open in Expo Go

### 4. Run on Android (Optional)

```bash
npm run android
```

## Project Structure

```
CueU/
├── app/                      # App screens and navigation
│   ├── (tabs)/              # Bottom tab navigation
│   │   ├── index.tsx        # Home screen
│   │   ├── news.tsx         # News screen
│   │   ├── league.tsx       # League screen
│   │   └── settings.tsx     # Settings screen
│   ├── _layout.tsx          # Root layout
│   ├── index.tsx            # Auth/Login screen
│   └── profile-setup.tsx    # Profile setup screen
├── assets/                   # Images, fonts, and other assets
├── styles/                   # Global styles
│   └── global.css           # Tailwind CSS styles
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
- **NativeWind** - Tailwind CSS for React Native
- **Lucide React Native** - Icon library
- **React Native Reanimated** - Animations
- **React Native Gesture Handler** - Touch gestures

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

## Converting from Web to Mobile

This app was converted from a web application. The key changes include:

- Replaced HTML elements with React Native components (`View`, `Text`, `ScrollView`, etc.)
- Converted CSS to StyleSheet API
- Replaced web-specific libraries with React Native equivalents
- Implemented mobile-specific navigation with Expo Router
- Adapted UI/UX for mobile touch interactions

## Contributing

This is a student project for UW CSE452. For questions or contributions, please contact the development team.

## License

This project is created for educational purposes as part of the University of Washington Computer Science program.

## Original Design

The original project design is available at: https://www.figma.com/design/DpHzhs07uEwDqXdRzpnMMR/UW-Billiards-League-App

---

**Note**: This app is currently in development. Features and functionality may change as development progresses.
