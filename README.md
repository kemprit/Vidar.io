we had to cle# Sékirité Lavenir — Earned Wage Access App

## ⚠️ Important Notes for the Team

### Why the APK is not in this repository
The compiled APK file (app-debug.apk) is 128MB which exceeds GitHub's 100MB file size limit. We removed it from the repository using git filter-branch. The APK is available for download on Google Drive — contact the development team for the link.

### Why node_modules is not included
node_modules folders are excluded from this repository as is standard practice. Run npm install in both backend and mobile folders before starting.

---

## How to Open and Run This Project

### What you need installed
- Node.js v18 or higher
- Android Studio with Android SDK API 34
- Java 17
- PostgreSQL (local) or a Supabase account

### Step 1 — Clone the repository
```bash
git clone https://github.com/kemprit/Vidar.io.git
cd Vidar.io
```

### Step 2 — Set up the backend
```bash
cd backend

DATABASE_URL="your postgresql connection string"
JWT_SECRET="any long random string"
JWT_REFRESH_SECRET="another long random string"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"
PORT=5000
NODE_ENV=development




Then run:
```bash
npx prisma generate
npx prisma db push
node prisma/seed.js
npm run dev
```
Backend starts on http://localhost:5000

### Step 3 — Set up the mobile app
```bash
cd mobile
npm install
npm install @react-native-community/slider
```
Start Android emulator in Android Studio, then:
```bash
npx react-native run-android
```

### Step 4 — Demo accounts
| ID | PIN | Role |
|----|-----|------|
| EMP001 | 1234 | Worker |
| EMP002 | 5678 | Worker |
| EMP003 | 2468 | Worker |
| HR001 | 9999 | HR Admin |
| HR002 | 8888 | HR Admin |

---

## Live Production
- Backend: https://sekirite-lavenir-backend.onrender.com
- Database: Supabase PostgreSQL

---

## Common Problems & Solutions

### gradlew.bat not found
The Android build files were generated from a React Native template. If gradlew.bat is missing run:
```bash
cd mobile
npx @react-native-community/cli init SekiriteLavenir --version 0.74.1 --directory C:\Temp\RNTemp
xcopy C:\Temp\RNTemp\android mobile\android /E /I /Y
```

### Gradle version error
React Native 0.74 requires Gradle 8.6 exactly. Do not use Gradle 9.x. Check mobile/android/gradle/wrapper/gradle-wrapper.properties and make sure it says:



### Cannot connect to database
If using Supabase and connection times out, use the Session Pooler URL from Supabase dashboard with port 5432 and add ?sslmode=require at the end.

### Render cold start
The free Render tier sleeps after 15 minutes of inactivity. The first login after a quiet period may show Cannot reach the server. Wait 30 seconds and try again.
npm install
```
Create a .env file in the backend folder with:ar the previ
