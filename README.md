# NestMatch – Smart Roommate Compatibility Finder

[![Stack](https://img.shields.io/badge/Stack-MERN%20(React%2019%20%2B%20Express%20%2B%20MongoDB)-blue.svg)](#-tech-stack)
[![Tests](https://img.shields.io/badge/Tests-55%2F55%20Passing-brightgreen.svg)](#-testing)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](./LICENSE)

**NestMatch** is a full-stack MERN application designed for college and university students to find compatible roommates through a 15-question lifestyle questionnaire and a transparent, weighted compatibility scoring engine.

Instead of random room allocations, students can compare habits (sleep, cleanliness, budget, noise, study habits), send connection requests, and unlock direct messaging upon mutual agreement.

---

## ✨ Features

- 🎯 **Smart Compatibility Engine**: 8-factor weighted algorithm (0–100%) highlighting shared traits and differences.
- 📋 **15-Question Lifestyle Survey**: Covers sleep schedules, budget ranges, cleanliness, diet, noise, study habits, and guests.
- 🤝 **Mutual Request Lifecycle**: Direct messaging is safely locked until both students accept an invitation.
- 💬 **Private Direct Chat**: Real-time persisted conversation history between accepted roommates.
- 🛡️ **Role-Based Admin Console**: Moderate users, review safety reports, and monitor platform metrics.
- 🚀 **Cloud & Production Ready**: Seamless deployment with SPA client-side rewrites and automated security validations.

---

## 🛠 Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, Vite, Tailwind CSS, React Router DOM 7, Axios, Lucide React |
| **Backend** | Node.js, Express.js (REST API, Rate Limiting, CORS) |
| **Database** | MongoDB, Mongoose (ODM with strict schemas & indexes) |
| **Security** | JWT (JSON Web Tokens), bcryptjs password hashing (10 rounds) |
| **Deployment** | Vercel (Frontend SPA), Node.js (Backend REST API) |

---

## 🚀 Quick Start

### 1. Backend Setup
```bash
cd server
npm install
```

Create `server/.env`:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/nestmatch
JWT_SECRET=your_super_secret_jwt_key_at_least_32_chars_long
CLIENT_URL=http://localhost:5173
```

Seed the database & start:
```bash
npm run seed       # Seeds sample student profiles and admin
npm run dev        # Starts Express server on http://localhost:5000
```

#### 2. Frontend Setup
In a new terminal:
```bash
cd client
npm install
```

Create `client/.env`:
```env
VITE_API_URL=http://localhost:5000/api
```

Start the frontend:
```bash
npm run dev        # Starts Vite dev server on http://localhost:5173
```

---

## 👤 Demo Credentials

Run `npm run seed` in the `server` directory to populate demo users:

| Role | Email | Password | Details |
|---|---|---|---|
| **Student (Early Bird)** | `aarav.patel@nirmauni.ac.in` | `Password123!` | Complete profile, vegetarian, quiet study |
| **Student (Night Owl)** | `meet.kotecha@nirmauni.ac.in` | `Password123!` | Complete profile, developer, neat flatmate |
| **Administrator** | `admin@nestmatch.edu` | `AdminSecret123!` | Full access to `/admin` moderation console |

---

## 🧠 How the Matching Algorithm Works

The algorithm computes a normalized score (0–100%) across 8 weighted categories:

```text
Score = Σ (Weight_i × MatchScore_i)
```

| Factor | Weight | Evaluation Method |
|---|---:|---|
| **Sleep Schedule** | 20% | Categorical agreement + wake-up time proximity |
| **Budget** | 20% | Step-distance penalty across 4 budget tiers |
| **Cleanliness** | 15% | Ordinal distance penalty across cleanliness tiers |
| **Diet / Food** | 10% | Dietary harmony matrix (veg vs. non-veg) |
| **Noise Tolerance** | 10% | Sound level preference match |
| **Study Habits** | 10% | Room quietness & ambient audio preferences |
| **Social Extroversion** | 10% | Guest frequency and social battery alignment |
| **Smoking / Habits** | 5% | Strict domestic rule adherence |

*Incomplete surveys are dynamically normalized only over completed questions without fabricating false assumptions.*

---

## 🔌 Core API Endpoints

| Resource | Method | Endpoint | Description |
|---|---|---|---|
| **System** | `GET` | `/api/health`, `/api/ready` | Process liveness & DB readiness probes |
| **Auth** | `POST` | `/api/auth/register`, `/login` | Account registration & JWT login |
| **Profile** | `GET`, `PUT` | `/api/users/profile` | Student academic & personal profile |
| **Preferences** | `GET`, `PUT` | `/api/preferences` | 15-question lifestyle survey answers |
| **Matches** | `GET` | `/api/matches`, `/api/matches/:id` | Ranked match list & score breakdown |
| **Requests** | `POST`, `GET` | `/api/requests`, `/received`, `/sent` | Send, track, accept, or reject roommate invites |
| **Messages** | `GET`, `POST` | `/api/messages`, `/api/messages/:userId` | Private chat (unlocked upon mutual acceptance) |
| **Admin** | `GET`, `PUT` | `/api/admin/metrics`, `/users`, `/reports` | Moderation, user status toggles & metrics |

*For complete API schemas and request/response payloads, see [docs/api-plan.md](file:///d:/sem5/FSD/fsd%20assi/docs/api-plan.md).*

---

## 🧪 Testing

The project includes unit and integration tests:

```bash
cd server

# Run 30 standalone unit tests (JWT, matching algorithm, models)
npm run test:unit

# Run 25 end-to-end API integration tests (requires MongoDB)
node tests/verifyApi.js
```

Frontend validation:
```bash
cd client
npm run lint      # Code style & static analysis with Oxlint
npm run build     # Production bundle build with Vite
```

---

## 📁 Project Structure

```text
fsd-assignment/
├── client/                 # React 19 + Vite frontend
│   ├── src/
│   │   ├── components/     # UI components (Navbar, ProtectedRoute, MatchCard)
│   │   ├── context/        # Auth & App state providers
│   │   ├── pages/          # Landing, Dashboard, Matches, Chat, Admin
│   │   └── services/       # Axios API client & helpers
│   └── vercel.json         # SPA client-side routing rewrites
├── server/                 # Express.js REST API
│   ├── config/             # MongoDB connection & diagnostics
│   ├── controllers/        # Route handlers (Auth, Matches, Chat, Admin)
│   ├── middleware/         # Auth, RBAC, error handler, rate limiters
│   ├── models/             # Mongoose schemas (User, Preference, Request, etc.)
│   ├── services/           # Matching algorithm engine
│   └── tests/              # Automated unit & integration tests
└── docs/                   # Detailed technical documentation
```

---

## 📚 Detailed Documentation

For in-depth architectural and design documents, check the `docs/` folder:
- [Architecture Overview](file:///d:/sem5/FSD/fsd%20assi/docs/architecture.md)
- [API Specification & Plan](file:///d:/sem5/FSD/fsd%20assi/docs/api-plan.md)
- [Database Schema & Design](file:///d:/sem5/FSD/fsd%20assi/docs/database-design.md)
- [Project Scope & Motivation](file:///d:/sem5/FSD/fsd%20assi/docs/project-scope.md)

---

## 👨‍💻 Author

* **Meet Kotecha** – Full Stack Development (FSD) Assignment
* **License**: MIT

