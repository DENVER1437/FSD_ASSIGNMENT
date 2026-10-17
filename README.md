# NestMatch – Smart Roommate Compatibility Finder

[![Status](https://img.shields.io/badge/Phase-Phase%201%20Frontend%20UI%20Complete-success)](#development-roadmap)
[![Stack](https://img.shields.io/badge/Stack-MERN-blue)](#technology-stack)
[![License](https://img.shields.io/badge/License-MIT-green)](./LICENSE)

---

## 1. Project Description
**NestMatch** is a full-stack MERN application engineered specifically for university and college students to find compatible roommates through lifestyle preference analysis and an **explainable compatibility scoring engine**. 

Instead of relying on arbitrary classifieds or random room allocations, NestMatch empowers students to declare their lifestyle habits (sleep hours, cleanliness standards, budget ranges, noise preferences, and study habits), inspect matched compatibility breakdowns, send roommate requests, and connect upon mutual consent.

---

## 2. Problem Statement
Finding a compatible roommate is one of the most stressful experiences of university life. Mismatched habits lead to friction:
- Conflicting sleep and wake routines causing fatigue and stress.
- Divergent standards of room cleanliness and chore management.
- Budget mismatches on shared rent and utilities.
- Clashing study environments (silent study vs. loud music/socializing).

Standard rental platforms catalog rooms, not roommate personalities. NestMatch bridges this gap with structured compatibility intelligence.

---

## 3. Main Objective
To develop a robust, secure, and user-friendly web platform where students can:
1. Build academic and personal student profiles.
2. Complete a targeted multi-dimensional lifestyle questionnaire.
3. Review algorithmically ranked roommate matches with clear, explainable score breakdowns.
4. Manage peer roommate requests through a mutual accept/reject workflow.
5. Provide administrative oversight for user moderation and safety.

---

## 4. Core Features (Mandatory Scope)
1. **Landing Page**: Modern, responsive introduction with clear student onboarding.
2. **Student Registration & Login**: Secure account creation with JWT and bcrypt password hashing.
3. **Student Profile**: Editable academic and biographical information.
4. **Lifestyle Preferences**: Preferences capturing budget, sleep, cleanliness, and study habits.
5. **Compatibility Questionnaire**: Interactive multi-step survey.
6. **Compatibility Calculation**: Weighted mathematical scoring engine.
7. **Find Matches**: Feed of compatible student profiles ranked by score.
8. **Match Details & Explanation**: Detailed inspection of common traits vs. differences.
9. **Roommate Requests**: Peer connection request dispatching and tracking.
10. **Accept/Reject Workflow**: Mutual connection state transitions.
11. **Responsive Design**: Seamless viewing on mobile, tablet, and desktop viewports.
12. **MongoDB Database**: Document-oriented data persistence with Mongoose.
13. **Decoupled REST API**: Express.js backend with structured controllers and routes.
14. **GitHub & Deployment Ready**: Clean CI/CD pipelines to Vercel, Render, and MongoDB Atlas.

---

## 5. Technology Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Frontend** | React.js (v19) + Vite | Dynamic SPA frontend with rapid HMR |
| **Styling** | Tailwind CSS (v3) | Utility-first, responsive design system |
| **Routing** | React Router DOM (v7) | Client-side routing and route guarding |
| **HTTP Client** | Axios | Configured API client with interceptors |
| **Backend** | Node.js + Express.js | Scalable REST API backend |
| **Database** | MongoDB + Mongoose | Schema-driven document storage |
| **Authentication** | JWT + bcryptjs | Stateless token auth & secure password hashing |
| **Deployment** | Vercel, Render, MongoDB Atlas | Production cloud hosting |

---

## 6. Project Architecture

NestMatch follows a strictly decoupled **MERN architecture**:
- **Client**: Single-page application built with React and styled via Tailwind CSS, communicating with the backend over HTTPS REST calls.
- **Server**: Express.js REST API structured using a **Layered Architecture** (`routes` -> `middleware` -> `controllers` -> `services` -> `models`).
- **Database**: MongoDB cloud database managing 6 core collections: `User`, `Preference`, `Request`, `Message`, `Match`, and `Report`.

---

## 7. Folder Structure

```text
NestMatch/
├── client/                     # Frontend Application (React + Vite + Tailwind)
│   ├── public/                 # Static assets
│   ├── src/
│   │   ├── assets/             # Images and media
│   │   ├── components/         # Reusable UI components (Navbar, Button, Card)
│   │   ├── constants/          # Application constants (Roles, Routes)
│   │   ├── context/            # React context providers (AuthContext)
│   │   ├── hooks/              # Custom React hooks
│   │   ├── layouts/            # Page layouts
│   │   ├── pages/              # View pages (Home, Profile, Matches)
│   │   ├── routes/             # AppRoutes and route definitions
│   │   ├── services/           # Axios API instance and endpoints
│   │   ├── utils/              # Client utility and helper functions
│   │   ├── App.jsx             # Root application component
│   │   ├── index.css           # Tailwind CSS directives
│   │   └── main.jsx            # Application entrypoint
│   ├── .env.example            # Client environment variables template
│   ├── .gitignore              # Client ignore rules
│   ├── package.json            # Client dependencies
│   ├── postcss.config.js       # PostCSS config for Tailwind
│   ├── tailwind.config.js      # Tailwind CSS design configuration
│   └── vite.config.js          # Vite build config
│
├── server/                     # Backend API (Node.js + Express)
│   ├── config/                 # Database and service configurations
│   ├── controllers/            # Route request handlers
│   ├── middleware/             # Auth (JWT) and error middleware
│   ├── models/                 # Mongoose data models
│   ├── routes/                 # Express API routes
│   ├── services/               # Matching logic and domain services
│   ├── utils/                  # Server helper utilities
│   ├── validators/             # Request payload validators
│   ├── .env.example            # Server environment variables template
│   ├── .gitignore              # Server ignore rules
│   ├── package.json            # Server dependencies
│   └── server.js               # Express application entrypoint
│
├── docs/                       # Project Documentation
│   ├── api-plan.md             # REST API endpoints specification
│   ├── architecture.md         # Detailed MERN system architecture
│   ├── database-design.md      # MongoDB schemas and ER diagrams
│   ├── development-roadmap.md  # 14-phase roadmap & algorithm math
│   └── project-scope.md        # Feature scope freeze and constraints
│
├── .gitignore                  # Root Git ignore rules
├── LICENSE                     # MIT Open Source License
└── README.md                   # Master project documentation
```

---

## 8. Matching Algorithm Overview

The planned compatibility algorithm compares student lifestyle preferences using a weighted model:

$$\text{Compatibility} = \sum \left( \text{Weight}_i \times \text{MatchFactor}_i \right)$$

### Weight Distribution:
- **Sleep Schedule**: 20%
- **Budget Parity**: 20%
- **Cleanliness Standard**: 15%
- **Food & Dietary Habits**: 10%
- **Noise Preference**: 10%
- **Study Habits**: 10%
- **Social Extroversion**: 10%
- **Other Preferences**: 5%

Each match produces an explainable report displaying **Common Preferences** and **Key Differences**.

---

## 9. Development Roadmap

```text
PHASE 0: Project Foundation (COMPLETED)
   ↓
PHASE 1: Frontend UI
   ↓
PHASE 2: Responsive Design
   ↓
PHASE 3: Backend + Database
   ↓
PHASE 4: Authentication
   ↓
PHASE 5: Profile + Preferences
   ↓
PHASE 6: Questionnaire
   ↓
PHASE 7: Matching Algorithm
   ↓
PHASE 8: Find Matches
   ↓
PHASE 9: Requests Workflow
   ↓
PHASE 10: Chat / Messaging
   ↓
PHASE 11: Dashboard + Admin
   ↓
PHASE 12: Testing & QA
   ↓
PHASE 13: GitHub + Deployment
   ↓
FINAL DEMO + VIVA
```

---

## 10. Local Development Setup

### Prerequisites
- Node.js (v18.0.0 or higher)
- npm (v9.0.0 or higher)
- Git

### 1. Clone & Setup
```bash
git clone https://github.com/kotechameet485-droid/fsd-assigment.git
cd fsd-assigment
```

### 2. Frontend Setup
```bash
cd client
npm install
cp .env.example .env
npm run dev
```
*Frontend runs on http://localhost:5173*

### 3. Backend Setup
```bash
cd ../server
npm install
cp .env.example .env
npm run dev
```
*Backend runs on http://localhost:5000*
*Health check available at http://localhost:5000/api/health*

---

## 11. Authors & Team

- **Student / Author**: Meet Kotecha
- **Course**: Full Stack Development (FSD)
- **Academic Year**: 2026
