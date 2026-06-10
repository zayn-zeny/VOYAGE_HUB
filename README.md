# 🌍 VoyageHub — AI-Powered Travel Itinerary Platform

> Your AI Travel Companion — Plan, Explore, and Navigate the world with intelligent itineraries powered by Google Gemini AI.

![MERN](https://img.shields.io/badge/Stack-MERN-green) ![Gemini](https://img.shields.io/badge/AI-Google%20Gemini-blue) ![Tailwind](https://img.shields.io/badge/CSS-Tailwind%20v3-38bdf8) ![License](https://img.shields.io/badge/License-MIT-yellow)

## ✨ Features

- **AI Itinerary Generation** — Multi-day trip plans with real place names, costs, and local tips
- **Interactive Maps** — Explore destinations with OpenStreetMap, route planning, and nearby POI discovery
- **Smart Dashboard** — Trip statistics, upcoming travels, and activity feed at a glance
- **Multi-Step Trip Planner** — Guided 4-step wizard with destination search, preferences, and AI generation
- **Real-Time Notifications** — Socket.IO-powered live updates
- **Dark/Light Theme** — Seamless theme switching with system preference detection
- **Responsive Design** — Mobile-first with sidebar (desktop) and bottom nav (mobile)

## 🛠 Tech Stack

### Frontend
- React 18 (Vite) · Tailwind CSS v3 · shadcn/ui
- Framer Motion · React Router v6 · TanStack Query v5
- React Hook Form + Zod · React Leaflet · Recharts
- Socket.IO Client · Lucide React · React Hot Toast

### Backend
- Node.js + Express.js · MongoDB + Mongoose
- JWT Dual-Token Auth · bcryptjs (14 rounds)
- Socket.IO · Winston Logger · Google Gemini AI SDK
- Helmet · CORS · Rate Limiting

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- Google Gemini API Key ([Get one free](https://aistudio.google.com/app/apikey))

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/voyagehub.git
cd voyagehub

# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### Environment Setup

Create `server/.env` from the example:

```bash
cp server/.env.example server/.env
```

Fill in your values (see Environment Variables section below).

### Running the App

```bash
# Terminal 1: Start the server
cd server
npm run dev

# Terminal 2: Start the client
cd client
npm run dev
```

- **Client**: http://localhost:5173
- **Server**: http://localhost:5000

## 🔐 Environment Variables

### server/.env

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `5000` |
| `NODE_ENV` | Environment | `development` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/voyagehub` |
| `JWT_ACCESS_SECRET` | Access token secret | — |
| `JWT_REFRESH_SECRET` | Refresh token secret | — |
| `JWT_ACCESS_EXPIRY` | Access token TTL | `15m` |
| `JWT_REFRESH_EXPIRY` | Refresh token TTL | `7d` |
| `GOOGLE_GEMINI_API_KEY` | Gemini AI API key | — |
| `CLIENT_URL` | Client origin for CORS | `http://localhost:5173` |
| `COOKIE_SECRET` | Cookie signing secret | — |

## 📁 Project Structure

```
voyagehub/
├── client/                     # Vite React App
│   ├── src/
│   │   ├── components/         # UI, auth, layout, maps, trip, dashboard
│   │   ├── contexts/           # Auth, Theme, Notification providers
│   │   ├── hooks/              # Custom React hooks
│   │   ├── lib/                # API client, utilities, validations
│   │   └── pages/              # Route-level page components
│   ├── tailwind.config.js
│   └── vite.config.js
│
├── server/
│   ├── controllers/            # Route handlers
│   ├── middleware/              # Auth, rate limiting, validation, logging
│   ├── models/                 # Mongoose schemas
│   ├── routes/                 # Express route definitions
│   ├── services/               # Gemini AI, Map service wrappers
│   └── utils/                  # Token helpers
│
└── README.md
```

## 📄 License

MIT © VoyageHub
