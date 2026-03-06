<div align="center">
<img width="1200" height="475" alt="Innerlytics Banner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

<div align="center">
  <h1>Innerlytics</h1>
  <p><em>Your soft digital diary + intelligent emotional dashboard.</em></p>
  
  <p>Track your mood, journal your thoughts, find peace through mindfulness exercises, and build better habits—all in one beautifully crafted, colorful workspace powered by AI.</p>
</div>

## ✨ Features

- **AI-Powered Journaling**: An interactive, conversational diary experience using Google Gemini. The AI provides emotional tags, reframes negative thoughts, and actively listens.
- **Advanced Insights & Analytics**: Visualize your emotional journey through gradient Area Charts, Radar charts for Life Balance, and an interactive "Year in Pixels" board.
- **Beautiful Theming Engine**: Switch between Light/Dark modes, and choose from curated pastel palettes like Lavender, Peach, Mint, Sky Blue, Rose Pink, Forest, and Astronomy.
- **Wellness Tools**: Integrated tools like a 5-4-3-2-1 Grounding Exercise, Guided Breathing animations, CBT thought reframing, and AI-generated positive affirmations.
- **Habit Tracking Control**: See how your deeply ingrained habits correlate directly to your mood scores with the Habit Impact Correlator.
- **Secure Authentication**: Built on top of Firebase Authentication for secure, persistent user storage.

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript
- **Styling**: Tailwind CSS v4 (with custom CSS variables for dynamic theming)
- **Animations**: Framer Motion
- **Data Visualization**: Recharts, FullCalendar
- **Backend/Platform**: Firebase (Auth & Firestore)
- **AI Integration**: Google Gemini API

## 🚀 Getting Started Locally

To run Innerlytics on your local machine, follow these steps:

### 1. Prerequisites
- Node.js (v18+)
- A Google Gemini API Key
- A Firebase Project (for Auth & Firestore)

### 2. Installation
Clone the repository and install dependencies:
```bash
git clone https://github.com/saeeekumbhar/Innerlytics.git
cd Innerlytics
npm install
```

### 3. Environment Setup
Copy the example environment file and add your keys:
```bash
cp .env.example .env.local
```

Inside `.env.local`, configure your Gemini API Key and your Firebase configuration variables (see `.env.example` for the required Firebase keys).

### 4. Run the Development Server
Start the Vite dev server:
```bash
npm run dev
```
Navigate to `http://localhost:3000` to view the app!

## 📂 Project Structure

Innerlytics follows a feature-based architecture for maintainability:

```text
src/
├── components/       # Shared UI components (Layouts, Buttons, Charts)
├── context/          # Global State (AuthContext, PreferencesContext)
├── features/         # Feature modules
│   ├── auth/         # Login & Onboarding
│   ├── habits/       # Habit tracking & streaks
│   ├── insights/     # AI Chat & Analytics dashboards
│   ├── journal/      # Diary, Memory Gallery
│   ├── life/         # Multi-dimensional life tracking
│   ├── mood/         # Dashboard, Check-in flows, Settings
│   ├── partner/      # Connect with a partner
│   ├── support/      # Professional support & safety resources
│   └── wellness/     # Breathing, Grounding, Affirmations
├── hooks/            # Custom React hooks
└── services/         # API wrappers (Firebase, Gemini)
```

## 🤝 Contributing
Contributions, issues and feature requests are welcome!

## 📝 License
This project is proprietary and built via Google AI Studio.
