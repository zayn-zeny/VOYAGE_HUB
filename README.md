# 🌍 VoyageHub — Next-Gen AI Travel Companion

> Plan, explore, and navigate the world effortlessly. Let Google's Gemini 3.6 Flash AI build your dream itinerary in seconds!

![MERN](https://img.shields.io/badge/Stack-MERN-green) ![Gemini](https://img.shields.io/badge/AI-Google%20Gemini-blue) ![Tailwind](https://img.shields.io/badge/CSS-Tailwind%20v3-38bdf8) ![License](https://img.shields.io/badge/License-MIT-yellow)

## ✨ Standout Features

- **🧠 Smart AI Itinerary Generation:** Powered by Google's latest **Gemini 3.6 Flash** model. Instantly creates realistic, day-by-day travel plans customized to your destination, budget, and personal interests, complete with local tips and cost estimates.
- **🗺️ Interactive Global Exploration:** A robust mapping engine built with **Leaflet**, OpenStreetMap, and OSRM routing. Search for any city and discover nearby attractions, restaurants, and hotels on an interactive canvas.
- **🛡️ Bulletproof Custom API Architecture:** Built-in proxy fallback mirrors for geolocation and POI data to seamlessly bypass strict browser CORS policies and ad-blockers, ensuring 100% uptime for mapping features.
- **⚡ Real-Time Live Updates:** Utilizing **Socket.IO** to push live notifications to your device the moment your AI itinerary is ready.
- **📊 Smart Dashboard & Analytics:** Track your upcoming trips, view global travel statistics, and monitor your personal activity feed in one beautiful view.
- **🌗 Stunning Modern UI:** Built with React, Tailwind CSS v3, and Framer Motion. Fully responsive with smooth micro-animations, glassmorphism, and automatic dark/light theme switching.
- **🔒 Secure Authentication:** Complete JWT dual-token architecture (Access + Refresh tokens) to securely protect user profiles and saved itineraries on MongoDB Atlas.

## 🛠 Tech Stack

### Frontend
- React 18 (Vite) · Tailwind CSS v3 · shadcn/ui
- Framer Motion · React Router v6 · TanStack Query v5
- React Hook Form + Zod · React Leaflet · Recharts
- Socket.IO Client · Lucide React · React Hot Toast

### Backend
- Node.js + Express.js · MongoDB Atlas + Mongoose
- JWT Dual-Token Auth · bcryptjs (14 rounds)
- Socket.IO · Winston Logger · Google Generative AI SDK
- Custom API Proxy Mirrors · Helmet · CORS · Rate Limiting

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
│   ├── middleware/             # Auth, rate limiting, validation, logging
│   ├── models/                 # Mongoose schemas
│   ├── routes/                 # Express route definitions
│   ├── services/               # Gemini AI, Map service wrappers
│   └── utils/                  # Token helpers
│
└── README.md
```

## 📄 License

MIT © VoyageHub
