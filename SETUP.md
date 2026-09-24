# Sékirité Lavenir — Setup Guide
## React Native CLI (No Expo) · Android · PostgreSQL

---

## 1. Prerequisites (one-time setup)

### Install Node.js 18+
```bash
node --version   # must be 18+
```

### Install React Native CLI
```bash
npm install -g react-native-cli @react-native-community/cli
```

### Android Studio requirements
- Open Android Studio → SDK Manager
- Install: Android SDK Platform 34 (API 34)
- Install: Android Emulator, Android SDK Build-Tools 34

### Set environment variables (add to ~/.bashrc or ~/.zshrc)
```bash
export ANDROID_HOME=$HOME/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/platform-tools
export PATH=$PATH:$ANDROID_HOME/tools

# Verify
adb --version
```

### Java 17 (required for Gradle)
```bash
java --version   # must be 17

# Ubuntu/Debian:
sudo apt install openjdk-17-jdk
```

---

## 2. Android Emulator Setup

1. Open Android Studio → Device Manager → Create Device
2. Choose: **Pixel 7** (or any phone with Play Store)
3. System Image: **API 34** (Tiramisu) — download if needed
4. Finish → click ▶ to start emulator

---

## 3. Backend (PostgreSQL + Prisma)

### Get a free PostgreSQL database (Supabase)
1. Go to https://supabase.com → New project
2. Settings → Database → Connection string → URI
3. Copy the URL

### Configure backend
```bash
cd sekirite-lavenir-rn/backend
cp .env.example .env

# Edit .env:
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres"

# Generate JWT secrets:
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
# Paste output into JWT_SECRET in .env
# Run again and paste into JWT_REFRESH_SECRET
```

### Install and seed
```bash
npm install
npx prisma generate        # generate Prisma client
npx prisma db push         # push schema to PostgreSQL
node prisma/seed.js        # seed demo data
npm run dev                # starts on :5000
```

You should see:
```
✅  Sékirité Lavenir API
📡  http://0.0.0.0:5000
```

---

## 4. Mobile App (React Native CLI)

```bash
cd sekirite-lavenir-rn/mobile
npm install
```

### Link native dependencies (auto-linked in RN 0.74+)
```bash
# react-native-vector-icons requires one extra step:
# Add to android/app/build.gradle (inside android {}):
#   apply from: "../../node_modules/react-native-vector-icons/fonts.gradle"
```

### Add the @react-native-community/slider package
```bash
npm install @react-native-community/slider
```

### Run on emulator
Make sure your emulator is running, then:
```bash
npx react-native run-android
```

First build takes ~3–5 minutes. After that, hot reload is instant.

---

## 5. Build a real APK (for testing on physical device)

```bash
cd android
./gradlew assembleDebug

# APK location:
# android/app/build/outputs/apk/debug/app-debug.apk
```

Transfer to your Android phone:
```bash
adb install android/app/build/outputs/apk/debug/app-debug.apk
```

---

## 6. Production AAB (for Play Store)

```bash
# Generate signing keystore (one-time):
keytool -genkey -v -keystore sl-release-key.keystore \
  -alias sl-key -keyalg RSA -keysize 2048 -validity 10000

# Add to android/gradle.properties:
MYAPP_UPLOAD_STORE_FILE=sl-release-key.keystore
MYAPP_UPLOAD_STORE_PASSWORD=your_password
MYAPP_UPLOAD_KEY_ALIAS=sl-key
MYAPP_UPLOAD_KEY_PASSWORD=your_password

# Build:
cd android && ./gradlew bundleRelease

# AAB location:
# android/app/build/outputs/bundle/release/app-release.aab
```

Upload to Google Play Console.

---

## 7. Demo accounts
| ID     | PIN  | Role   | Name                      |
|--------|------|--------|---------------------------|
| EMP001 | 1234 | Worker | Amara Osei (MT Ltd)       |
| EMP002 | 5678 | Worker | Kofi Mensah (MT Ltd)      |
| EMP003 | 2468 | Worker | Priya Ramkhelawon (SBM)   |
| HR001  | 9999 | HR     | Jean-Marie Duval (MT Ltd) |
| HR002  | 8888 | HR     | Anisha Gobin (SBM)        |

---

## 8. Deploy backend to production (Railway)

1. Push backend/ to a GitHub repo
2. Go to https://railway.app → New project → Deploy from GitHub
3. Add environment variables (copy from .env)
4. Railway gives you a URL like https://sl-api.up.railway.app

Update mobile/src/api/client.js:
```js
export const API_URL = __DEV__
  ? 'http://10.0.2.2:5000'
  : 'https://sl-api.up.railway.app';   // ← your Railway URL
```

---

## Token storage
Tokens are stored in **Android Keystore** via `react-native-keychain`.
This is hardware-backed secure storage — the same used by banking apps.
No Expo. No SecureStore. Real production security.
