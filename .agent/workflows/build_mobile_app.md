---
description: Build the Mobile App (Android)
---

This workflow guides you through building and running the School Management Mobile App for Android.

## Prerequisites Check
1. Ensure Node.js is installed (v14+)
2. Ensure backend server is running on port 5000
3. Have an Android device or emulator ready

## Method 1: Using Expo Go (Fastest - Recommended for Development)

// turbo
1. **Install Expo Go on your Android device**
   - Download from Google Play Store
   - Open the app

2. **Start the mobile app development server**
   ```powershell
   cd e:\SchoolSoftware\mobile-app
   ```
   
// turbo
3. **Start Expo**
   ```powershell
   npm start
   ```

4. **Connect your device**
   - Scan the QR code in terminal with Expo Go app
   - App will load on your device
   - Changes will hot-reload automatically

## Method 2: Build Standalone APK (For Production)

1. **Install EAS CLI** (if not already installed)
   ```powershell
   npm install -g eas-cli
   ```

2. **Login to Expo**
   ```powershell
   cd e:\SchoolSoftware\mobile-app
   eas login
   ```

3. **Configure EAS Build** (first time only)
   ```powershell
   eas build:configure
   ```

4. **Build APK**
   ```powershell
   eas build --platform android --profile preview
   ```
   - This creates an APK you can install on any Android device
   - Download link will be provided after build completes

5. **Install APK on Device**
   - Download APK from the provided link
   - Transfer to your Android device
   - Enable "Install from Unknown Sources" in settings
   - Install the APK

## Method 3: Using Android Emulator

1. **Start Android Emulator**
   - Open Android Studio
   - Start AVD (Android Virtual Device)

2. **Run the app**
   ```powershell
   cd e:\SchoolSoftware\mobile-app
   npm run android
   ```

## Configuration

### Update API URL for Physical Device

If using a physical device, update the API URL:

1. Open `e:\SchoolSoftware\mobile-app\src\config\api.js`
2. Find your computer's IP address:
   ```powershell
   ipconfig
   ```
   Look for "IPv4 Address" (e.g., 192.168.1.100)
3. Change BASE_URL to:
   ```javascript
   BASE_URL: 'http://YOUR_IP_ADDRESS:5000/api'
   ```

## Testing

### Test Login
Use these credentials:
- **Student**: student@demo.com / 123456
- **Teacher**: teacher@demo.com / 123456
- **Staff**: staff@demo.com / 123456

### Verify Features
1. Login with test credentials
2. Check dashboard loads correctly
3. Navigate through different sections
4. Test API calls (attendance, fees, etc.)

## Troubleshooting

### Cannot connect to backend
- Ensure backend is running: `localhost:5000`
- Check device and computer are on same WiFi
- Verify BASE_URL in config/api.js
- Try using computer's IP instead of localhost

### Build fails
```powershell
# Clear Expo cache
npx expo start -c

# Reinstall dependencies
Remove-Item -Recurse -Force node_modules
npm install
```

### App crashes on startup
- Check console logs in terminal
- Verify all dependencies are installed
- Ensure backend API is accessible

## Quick Commands

```powershell
# Start app (development mode with Expo Go)
npm start

# Build APK for testing
eas build --platform android --profile preview

# Build for Google Play Store
eas build --platform android --profile production

# Clear cache
npx expo start -c
```

## Notes

- Development builds using Expo Go are fastest for testing
- Standalone APKs are needed for production or devices without Expo Go
- Ensure backend server is always running when using the app
- Hot reload works in development mode - changes appear instantly
