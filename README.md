# 🌌 Zenith Quest — Your Personal Sky Guide

**Discover what is happening above you tonight.**

Zenith Quest is an immersive, hackathon-winning celestial exploration platform. Designed as a dark-mode-first, premium stargazing companion, it aggregates real-time data from 7+ astronomical APIs and synthesizes them into personalized, interactive sky guides. Using custom orbital calculations, Three.js celestial spheres, real-time maps, and gamified challenges, it answers the simple question: *"What's happening in my sky tonight?"*

---

## ✨ Website Functionality and Unique Features

Zenith Quest stands out by combining rich astronomical visualizations with context-aware gamification and real-time computation:

1. **Proprietary Sky Score Engine**
   - Calculates a composite **0–100 Sky Quality Score** dynamically optimized for your local coordinate inputs.
   - Evaluates 6 weighted factors:
     * **Cloud Cover** (30% weight) - Powered by Open-Meteo, lower is better.
     * **Light Pollution** (25% weight) - Evaluated using the Bortle Scale (1-9), lower is better.
     * **Visible Planets** (15% weight) - Real-time planetary azimuth & altitude visibility, more is better.
     * **Satellite Activity** (10% weight) - Current count of satellite passes above you.
     * **Moon Brightness** (10% weight) - Illumination level (critical for observing deep sky objects).
     * **Transparency/Visibility** (10% weight) - Atmospheric visibility in kilometers.
   - Outputs clear viewing recommendations (Excellent, Good, Average, Poor) and computes optimal hourly stargazing windows.

2. **AI Sky Narrator**
   - Synthesizes complex real-time weather and celestial positions into a friendly, natural-language narrative.
   - Leverages **OpenAI GPT-4o-mini** to generate concise daily sky summaries and viewing tips.
   - Features a smart, deterministic fallback generator that constructs logical narratives locally if API keys are not provided.

3. **Interactive 3D Sky Dome**
   - An immersive celestial dome rendered in real-time using **Three.js** and **React Three Fiber**.
   - Displays constellations, stars, planets, and the Moon mapped to your exact latitude, longitude, and current local time.
   - Offers full rotation, zoom, and interactive click states to inspect detailed astronomical coordinates (RA, Dec, Altitude, Azimuth).

4. **Real-Time Satellite Tracker**
   - Visualizes live satellite orbits on a beautiful **Leaflet** map.
   - Tracks objects like the International Space Station (ISS), Hubble Space Telescope (HST), weather satellites, and Starlink constellations.
   - Calculates visual pass schedules, maximum elevations, azimuth trajectories, and compass directions tailored to your location.

5. **Gamified Missions & XP**
   - Features 3 types of dynamic stargazing challenges: **Observation** (e.g., observing Venus), **Tracking** (e.g., tracking an ISS pass), and **Identification** (e.g., locating Orion).
   - Progression system with **XP rewards, 7 explorer ranks** (from *Stargazer* up to *Universe Sage*), and persistent observation history.
   - Custom badge reward system spanning **5 rarity tiers** across diverse observation achievements.

6. **NASA Integration**
   - Displays NASA's **Astronomy Picture of the Day (APOD)** with captions.
   - Tracks **Near-Earth Objects (NEOs)**, showing relative velocity, miss distance (in kilometers and lunar distances), and hazardous flags.
   - Monitors **Solar Activity** (flares, geomagnetic storms, solar wind speed, and Aurora visibility forecasts) utilizing NOAA and NASA DONKI data.

7. **Celestial Timeline**
   - Provides a detailed sunset-to-sunrise timeline showing planetary rise/set/transit times, twilight boundaries, and astronomical milestones.

---

## 🗂️ Project Dependencies

Zenith Quest is built on a modern, highly optimized JavaScript/TypeScript ecosystem:

### Core Framework & Build Tools
- **Next.js 16** (App Router, Turbopack, SSR, Route Handlers)
- **React 19** (Server Components, Suspense, Hooks)
- **TypeScript 5** (Strictly-typed schemas, service interfaces)
- **Tailwind CSS v4 & PostCSS** (Utility-first styling with modern CSS variables)
- **Framer Motion 12** (Premium page transitions and micro-animations)

### Astronomical & Visual Tools
- **Three.js** & **React Three Fiber (@react-three/fiber)** & **Drei (@react-three/drei)** (3D Sky Dome rendering and landing page Earth animations)
- **Leaflet & React-Leaflet** (Interactive mapping for live satellite coordinates and ground tracks)
- **Recharts** (Interactive dashboards tracking observation analytics and trends)

### Backend & Data Infrastructure
- **MongoDB & Mongoose** (NoSQL data storage for user profiles, streak records, badges, and observation logs)
- **Clerk (@clerk/nextjs)** (Secure OAuth sign-in flow for Google & GitHub accounts)
- **OpenAI Node SDK** (Interface for LLM-based narrative generation)
- **SWR & Zustand** (SWR for caching/revalidation of API fetchers; Zustand for client-side global store management of user context, active location, and mission states)
- **PDFKit** (Backend library used for generating custom proposal PDFs)

### External APIs
- **Open-Meteo API** (Cloud cover, visibility, humidity, wind, and hourly forecasts)
- **AstronomyAPI** (Real-time planetary coordinates, moon phase, and illumination data)
- **N2YO API** (Satellite visual passes, overhead arrays, and trajectory calculation)
- **NASA Web Services** (APOD, NeoWs, Solar Flare DONKI)
- **wheretheiss.at** (Keyless, free real-time ISS tracking)

---

## 🚀 Installation and Setup Instructions

Follow these steps to configure, install, and run Zenith Quest on your local development machine:

### 📋 Prerequisites
Ensure you have the following installed before proceeding:
- **Node.js** (v18.x or later recommended)
- **npm** or your preferred package manager
- **MongoDB** (A local running instance or a MongoDB Atlas URI)

---

### Step 1: Clone the Repository
Clone the codebase and navigate to the project root:
```bash
git clone <repository-url>
cd "Zenith Quest"
```

### Step 2: Install Dependencies
Install all required Node.js libraries:
```bash
npm install
```

### Step 3: Configure Environment Variables
Copy the environment template file to create your local configurations:
```bash
cp .env.example .env.local
```

Open `.env.local` in your text editor and fill out the following keys:

```ini
# --- CORE DATABASES & SECURITY ---
# Clerk Authentication (Get yours at https://clerk.com)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key

# MongoDB Connection String (Local fallback: mongodb://localhost:27017/zenith-quest)
MONGODB_URI=your_mongodb_connection_uri

# --- EXTERNAL SERVICES & APIs ---
# NASA API Key (Free tier available, defaults to DEMO_KEY if blank)
NASA_API_KEY=your_nasa_api_key

# AstronomyAPI (Get basic authorization credentials at https://astronomyapi.com)
ASTRONOMY_API_ID=your_astronomy_api_id
ASTRONOMY_API_SECRET=your_astronomy_api_secret

# N2YO Satellite Tracking (Get your key at https://www.n2yo.com)
N2YO_API_KEY=your_n2yo_api_key

# OpenAI API Key (For the AI Sky Narrator; optional)
OPENAI_API_KEY=your_openai_api_key

# --- PUBLIC ROUTING ---
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/
```

> [!NOTE]
> **Fully Functional Demo Mode**  
> If you do not have active keys for N2YO, AstronomyAPI, or OpenAI, the application is built with a comprehensive fallback system. It uses **built-in mathematical astronomy calculators** to approximate planet positions, query keyless ISS tracking endpoints, and leverage **local deterministic templates** for the AI Narrator.

---

### Step 4: Run MongoDB
If you are using a local MongoDB database, start the daemon:
```bash
mongod
```

### Step 5: Start the Development Server
Launch the local development environment using Next.js Turbopack:
```bash
npm run dev
```

Open your browser and navigate to `http://localhost:3000`.

---

## 🛠️ Verification & Development Commands

Use these scripts during development:
* **Start Dev Server**: `npm run dev` (runs Next.js with hot module replacement)
* **Build App**: `npm run build` (compiles production-ready bundle)
* **Start Production App**: `npm start` (runs built application)
* **Code Linting**: `npm run lint` (runs ESLint checks)
* **Generate Proposal PDF**: `node generate-proposal.js` (compiles the proposal PDF using PDFKit)

---

## 📄 License
This project is licensed under the MIT License.

