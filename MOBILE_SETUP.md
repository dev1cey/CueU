# CueU Mobile App - Quick Setup Guide

This guide will help you get the iOS app running quickly.

## Quick Start (5 minutes)

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start the app**:
   ```bash
   npm start
   ```

3. **Run on iOS**:
   - Press `i` in the terminal to open iOS simulator
   - OR run: `npm run ios`

## What Changed?

Your web app has been converted to a React Native mobile app:

### ✅ Converted Components
- **Auth Screen** - Login with UW SSO
- **Profile Setup** - User onboarding
- **Home Tab** - Dashboard with stats and events
- **News Tab** - Club news and updates
- **League Tab** - Standings and league info
- **Settings Tab** - User preferences

### 🆕 Mobile Features
- Native iOS navigation with tab bar
- Touch-optimized UI components
- Mobile-friendly forms with native pickers
- Swipe gestures and animations
- SafeArea support for iOS notch

### 📱 Technology Stack
- **Expo** - Development and build platform
- **React Native** - Mobile framework
- **Expo Router** - File-based navigation
- **NativeWind** - Tailwind for mobile
- **Lucide Icons** - Icon library

## Testing

### Skip Login (Quick Test)
The app includes a "Skip Login" button for testing. This will take you directly to the dashboard with mock data.

### Navigation
- Bottom tabs for main screens
- Swipe gestures work throughout
- Native animations and transitions

## Next Steps

1. **Test on real device**: Download Expo Go and scan QR code
2. **Customize**: Edit files in `app/` directory
3. **Build**: Use `eas build` for production builds
4. **Deploy**: Submit to App Store with `eas submit`

## File Structure

```
app/
├── (tabs)/           # Main app screens
│   ├── index.tsx     # Home
│   ├── news.tsx      # News
│   ├── league.tsx    # League
│   └── settings.tsx  # Settings
├── index.tsx         # Login
└── profile-setup.tsx # Onboarding
```

## Troubleshooting

**Issue**: iOS Simulator won't open
**Fix**: Install Xcode from App Store

**Issue**: Metro bundler errors
**Fix**: `npm start -- --clear`

**Issue**: Module not found
**Fix**: `rm -rf node_modules && npm install`

## Support

For issues or questions, refer to:
- [Expo Documentation](https://docs.expo.dev)
- [React Native Docs](https://reactionnative.dev)
- Full README.md in project root

---

**Ready to go!** Run `npm start` and press `i` to launch the iOS simulator. 🎱

