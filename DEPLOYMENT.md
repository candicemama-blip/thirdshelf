# Third Shelf — Deployment Guide

## What You Have
A complete React + TypeScript app with:
- Firebase Auth (email/password login)
- Firestore database (books, vocab, users)
- Google Books API search
- Claude AI features (summarise, themes, suggest)
- Dark/light mode
- Mobile-responsive with bottom nav
- Ready for Capacitor (iOS + Android)

---

## STEP 1 — Set Up Your Computer (one time)

Install Node.js from https://nodejs.org (choose LTS version)
Verify: open Terminal, type `node --version` — should show v18+

---

## STEP 2 — Get a Claude API Key

1. Go to https://console.anthropic.com
2. Sign up / log in
3. Click "API Keys" → "Create Key"
4. Copy the key (starts with sk-ant-...)

---

## STEP 3 — Set Up The Project Locally

1. Unzip the thirdshelf folder somewhere convenient (e.g. Desktop)
2. Open Terminal
3. Navigate to the folder:
   ```
   cd ~/Desktop/thirdshelf
   ```
4. Install dependencies:
   ```
   npm install
   ```
5. Open the `.env` file and replace `your_claude_api_key_here` with your real Claude API key
6. Test it runs:
   ```
   npm run dev
   ```
7. Open http://localhost:3000 — you should see Third Shelf!

---

## STEP 4 — Firebase Setup

### Enable Email/Password Auth
1. Go to https://console.firebase.google.com
2. Open project thirdshelf-7595c
3. Go to Authentication → Sign-in method
4. Enable "Email/Password"
5. Save

### Set Firestore Security Rules
1. Go to Firestore Database → Rules
2. Replace with:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /books/{bookId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.created_by;
      allow create: if request.auth != null && 
        request.auth.uid == request.resource.data.created_by;
    }
    match /vocab/{vocabId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.created_by;
      allow create: if request.auth != null && 
        request.auth.uid == request.resource.data.created_by;
    }
  }
}
```

3. Click Publish

### Create Firestore Indexes (if needed)
If you see index errors in the browser console, Firebase will show a link to auto-create them. Just click the link.

---

## STEP 5 — Deploy to Web (Vercel)

### Push to GitHub
1. Go to https://github.com and create a free account
2. Create a new repository called "third-shelf" (set to Private)
3. In Terminal (in your thirdshelf folder):
   ```
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/YOURUSERNAME/third-shelf.git
   git push -u origin main
   ```

### Deploy on Vercel
1. Go to https://vercel.com and sign up with GitHub
2. Click "Add New Project"
3. Import your third-shelf repository
4. Under "Environment Variables", add ALL of these:

   | Name | Value |
   |------|-------|
   | VITE_FIREBASE_API_KEY | AIzaSyCHg8E7v-2ncGwFOytQRXmTOohHJngEXFY |
   | VITE_FIREBASE_AUTH_DOMAIN | thirdshelf-7595c.firebaseapp.com |
   | VITE_FIREBASE_PROJECT_ID | thirdshelf-7595c |
   | VITE_FIREBASE_STORAGE_BUCKET | thirdshelf-7595c.firebasestorage.app |
   | VITE_FIREBASE_MESSAGING_SENDER_ID | 714989470649 |
   | VITE_FIREBASE_APP_ID | 1:714989470649:web:a420fef0b4b4e66b45ec68 |
   | VITE_FIREBASE_MEASUREMENT_ID | G-44QXNVCG7Z |
   | VITE_CLAUDE_API_KEY | your-sk-ant-key-here |

5. Click Deploy
6. Your app is live at something like https://third-shelf.vercel.app

---

## STEP 6 — Make It a Mobile App (Capacitor)

### Install Capacitor
In Terminal (in your thirdshelf folder):
```
npm install @capacitor/core @capacitor/cli @capacitor/ios @capacitor/android
```

### Add Platforms
```
npx cap add ios
npx cap add android
```

### Build and Sync
Every time you make changes, run:
```
npm run build
npx cap sync
```

---

## STEP 7 — iOS App Store

### Requirements
- Mac with Xcode installed (free from App Store)
- Apple Developer account ($99/year) from https://developer.apple.com

### Add Firebase to iOS
1. In Firebase Console → Project Settings → ThirdShelf iOS
2. Download `GoogleService-Info.plist`
3. Drag it into Xcode under the App folder (check "Copy if needed")

### Open in Xcode
```
npx cap open ios
```

### In Xcode:
1. Select your project in the left sidebar
2. Under "Signing & Capabilities" → select your Apple Developer Team
3. Change Bundle Identifier to `com.thirdshelf.app`
4. Product → Archive
5. In the Organizer window → Distribute App → App Store Connect
6. Follow the prompts to upload

### App Store Connect
1. Go to https://appstoreconnect.apple.com
2. Create a new app
3. Fill in description, screenshots, privacy policy URL
4. Submit for review (usually 1-3 days)

---

## STEP 8 — Google Play Store

### Requirements
- Google Play Console account ($25 one-time) from https://play.google.com/console

### Add Firebase to Android
1. In Firebase Console → Project Settings → ThirdShelf Android  
2. Download `google-services.json`
3. Place it in `android/app/google-services.json`

### Open in Android Studio
```
npx cap open android
```

### In Android Studio:
1. Build → Generate Signed Bundle/APK
2. Choose Android App Bundle
3. Create a keystore (save this file somewhere safe — you need it forever)
4. Build the release bundle

### Upload to Play Console
1. Create a new app in Play Console
2. Upload the `.aab` file
3. Fill in store listing, screenshots
4. Submit for review

---

## Updating The App

When you make code changes:
```
npm run build       # rebuild the web app
npx cap sync        # sync to iOS and Android
```
Then re-open Xcode or Android Studio and re-build.

For web only changes, just push to GitHub — Vercel auto-deploys.

---

## Troubleshooting

**"Permission denied" errors in Firestore**
→ Check your security rules are published (Step 4)

**AI features not working**
→ Check your VITE_CLAUDE_API_KEY is set correctly in Vercel env vars

**Books not loading**
→ Firebase indexes may need to be created — check browser console for a link

**App crashes on phone**
→ Run `npx cap sync` after every `npm run build`

---

## File Structure
```
thirdshelf/
├── src/
│   ├── components/
│   │   ├── books/     (BookCard, AddBookModal)
│   │   ├── layout/    (Layout with sidebar + bottom nav)
│   │   └── ui/        (StarRating)
│   ├── contexts/      (AuthContext, ThemeContext)
│   ├── hooks/         (useBooks, useVocab)
│   ├── lib/           (firebase.ts, ai.ts)
│   ├── pages/         (all 6 pages)
│   └── types/         (TypeScript types)
├── public/
├── .env               (your secret keys — never commit this)
├── vercel.json
└── capacitor.config.ts
```
