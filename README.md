<div align="center">
<img width="1200" height="475" alt="Innerlytics Banner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Innerlytics ✨
### Your Personal AI-Powered Digital Diary

Reflect. Understand. Evolve.

![Dashboard Preview](./screenshots/dashboard.png)

## 2. Problem Statement

Many journaling apps only store entries but fail to help users understand their emotions or patterns.

Innerlytics is an AI-powered digital diary that helps users track mood, habits, reflections, and patterns through interactive dashboards and AI insights.

## 3. Key Features

✨ AI-powered emotional insights  
📊 Mood analytics dashboard  
📅 Calendar-based journaling  
🤖 AI reflection chat  
🔥 Habit & streak tracking  
🎨 Pastel aesthetic + dark mode UI  
📷 Photo diary support  
📈 Mood stability & weekly reports  

## 4. Tech Stack

**Frontend:**
- React
- TypeScript
- Tailwind CSS
- Framer Motion

**Charts:**
- Recharts

**AI:**
- Google Gemini API

**Storage:**
- Local storage / Firebase

## 5. Installation

```bash
git clone https://github.com/saeeekumbhar/Innerlytics.git
cd Innerlytics
npm install
npm run dev
```

## 6. Environment Variables

```env
VITE_GEMINI_API_KEY=your_key_here
VITE_FIREBASE_API_KEY=your_firebase_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

## 7. Project Structure

```text
src
 ├ components
 │  ├ charts
 │  ├ layout
 │  ├ ui
 │
 ├ features
 │  ├ auth
 │  ├ habits
 │  ├ insights
 │  ├ journal
 │  ├ life
 │  ├ mood
 │  ├ partner
 │  ├ support
 │  ├ wellness
 │
 ├ services
 │  ├ geminiService.ts
 │  ├ firebase.ts
 │
 ├ hooks
 ├ context
```

## 8. Screenshots

- **Dashboard**
  ![Dashboard Preview](./screenshots/dashboard.png)
- **Journal Editor**
  ![Journal Editor Preview](./screenshots/journal.png)
- **Mood Tracker**
  ![Mood Tracker Preview](./screenshots/mood.png)
- **AI Insights**
  ![AI Insights Preview](./screenshots/insights.png)

*(Note: Ensure image files exist in the `/screenshots/` folder. Create them if missing.)*

## 9. Roadmap

**Future Improvements**

- AI pattern detection
- Emotion prediction
- Gamified avatar system
- Mobile PWA
- Voice journaling
