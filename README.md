# Second Chance

Mobile companion for people coming home from incarceration. Sequenced, adaptive life plan delivered daily — real local resources, real cultural reorientation, real check-ins. Built for the Kiro Hackathon.

## Stack

**Frontend**

- Expo SDK 54, Expo Router 6, React Native 0.81 (new architecture)
- TypeScript strict, NativeWind 4 (Tailwind), Reanimated 4, Skia
- Zustand + AsyncStorage for persisted state
- FlashList, Lucide icons, date-fns

**Backend**

- Node.js + Express + TypeScript
- Groq API (Llama 3.3 70B) for AI-generated content
- Serper.dev (Google Search API) for real-time web search grounding
- Zod for request validation

## Prerequisites

- Node.js 18+ and npm
- A [Groq](https://console.groq.com/) API key (free tier available)
- A [Serper.dev](https://serper.dev/) API key (2,500 free credits on signup)
- For iOS: Xcode with an iPhone Simulator
- For Android: Android Studio with an emulator
- For web: any modern browser

## Setup

### 1. Clone the repo

```bash
git clone https://github.com/yuwilson105/Kiro_Hackathon.git
cd Kiro_Hackathon
```

### 2. Install frontend dependencies

```bash
npm install
```

### 3. Install backend dependencies

```bash
cd backend
npm install
cd ..
```

### 4. Configure environment variables

Copy the example env file and fill in your keys:

```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env`:

```
GROQ_API_KEY=your_groq_api_key
PORT=3000
ALLOWED_ORIGIN=
NODE_ENV=development
SERPER_API_KEY=your_serper_api_key
```

**Getting the keys:**

- **Groq**: Sign up at [console.groq.com](https://console.groq.com/), create an API key from the dashboard.
- **Serper**: Sign up at [serper.dev](https://serper.dev/), copy the API key from the dashboard. No credit card needed.

## Running the app

### Option A: Run both frontend and backend together

```bash
npm run dev
```

This starts the backend on port 3000 and the Expo dev server simultaneously.

### Option B: Run them separately

**Terminal 1 — Backend:**

```bash
cd backend
npm run dev
```

**Terminal 2 — Frontend:**

```bash
# Web
npx expo start --web

# iOS Simulator
npx expo start --ios

# Android Emulator
npx expo start --android

# QR code for Expo Go on a physical device
npx expo start
```

The frontend defaults to `http://localhost:3000` for API calls. If your backend runs on a different port, set `EXPO_PUBLIC_API_URL` in a root `.env` file:

```
EXPO_PUBLIC_API_URL=http://localhost:3000
```

## How it works

### Catch-up feed (web search grounded)

When a user opens the Catch Up tab, the app sends their profile (interests and incarceration dates) to the backend. The backend:

1. Searches Serper.dev for real events matching each interest within the incarceration date range
2. Injects those search results into the LLM prompt as source material
3. The LLM (Llama 3.3 70B via Groq) generates plain-language catch-up cards grounded in real events
4. Cards are returned to the frontend and displayed in the feed

Supported interest categories for web search: politics, sports, tech, climate. Other categories fall back to LLM knowledge.

Results are cached in memory for 30 minutes to conserve API credits.

### Other AI features

- **Plan generation**: Personalized reentry plan based on user priorities
- **Companion chat**: AI companion with crisis detection (988 Lifeline integration)
- **Resource finder**: Location-aware resource recommendations
- **Job recommendations**: Based on work history and skills

## Project structure

```
app/                    Expo Router screens (splash, onboarding, tabs, modals)
components/             UI atoms, screen-specific components, Skia animations
lib/                    Theme, motion tokens, Zustand store, API client, utilities
lib/mock/               Fallback data (plan DAG, feed cards, resources, videos)
types/                  Shared TypeScript types
backend/
  src/
    routes/             Express route handlers (feed, plan, companion, resources, jobs)
    services/           Groq LLM client, web search (Serper), prompt builder
    types/              Backend type definitions
    middleware/          Error handler, request logger
    validation/         Zod schemas
leaders/                Design and engineering standards docs
```

## API endpoints

All endpoints accept POST requests with a JSON body.

| Endpoint                  | Description                                        |
| ------------------------- | -------------------------------------------------- |
| `POST /feed/generate`     | Generate catch-up feed cards (web search grounded) |
| `POST /plan/generate`     | Generate a personalized reentry plan               |
| `POST /companion/respond` | AI companion chat response                         |
| `POST /resources/find`    | Find local resources                               |
| `POST /jobs/recommend`    | Job recommendations                                |
| `GET /health`             | Health check                                       |
