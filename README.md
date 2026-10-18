# NestMatch – Smart Roommate Compatibility Finder

[![Status](https://img.shields.io/badge/Status-Fully%20Integrated%20%26%20Verified-success)](#development-roadmap)
[![Stack](https://img.shields.io/badge/Stack-MERN%20(React%20%2B%20Express%20%2B%20MongoDB)-blue)](#technology-stack)
[![Tests](https://img.shields.io/badge/Tests-55%2F55%20Passing-brightgreen)](#automated-testing--qa)
[![License](https://img.shields.io/badge/License-MIT-green)](./LICENSE)

---

## 1. Project Description
**NestMatch** is an end-to-end, full-stack MERN application engineered for university and college students to find compatible roommates through structured lifestyle preference analysis and an **explainable compatibility scoring engine**.

Instead of relying on random hostel allocations or unstructured classifieds, NestMatch empowers students to declare their lifestyle habits across 15 parameters (sleep hours, cleanliness standards, budget ranges, noise tolerance, food choices, and study habits), inspect matched compatibility breakdowns, dispatch roommate invitations, and communicate securely upon mutual consent.

---

## 2. Problem Statement & Academic Motivation
Finding a compatible roommate is a critical challenge in student life:
- **Sleep Schedule Friction**: Night owls clashing with early risers.
- **Cleanliness Discrepancies**: Meticulous domestic standards vs. relaxed clutter habits.
- **Budget Disparity**: Divergent expectations on monthly rent and utilities.
- **Study Environment Conflicts**: Undisturbed room quiet vs. active audio/socializing.

NestMatch solves this by providing:
1. Multi-dimensional lifestyle questionnaire (15 questions).
2. Transparent, explainable weighted scoring algorithm (0–100%).
3. Mutual invitation and request lifecycle (Pending, Accepted, Declined).
4. Restricted communication (direct messaging unlocked only upon mutual request acceptance).
5. Administrative moderation (user management, account suspension, and safety reports).

---

## 3. Technology Stack

| Layer | Technology | Version | Purpose |
|---|---|---|---|
| **Frontend** | React | ^19.0.0 | Component-based single-page user interface |
| **Tooling** | Vite | ^8.3.4 | Ultra-fast client bundler and dev server |
| **Styling** | Tailwind CSS | ^3.4.17 | Utility-first responsive design tokens |
| **Routing** | React Router DOM | ^7.1.3 | Declarative client routing and route guards |
| **HTTP Client** | Axios | ^1.7.9 | Centralized client with JWT request interceptors |
| **Backend** | Node.js + Express.js | ^4.21.2 | Scalable RESTful API service |
| **Database** | MongoDB + Mongoose | ^8.9.5 | Schema validation, indexes, and document persistence |
| **Security** | bcryptjs + jsonwebtoken | ^2.4.3 / ^9.0.2 | Password hashing (salt round 10) & stateless JWT auth |
| **Icons** | Lucide React | ^0.469.0 | Accessible iconography |

---

## 4. System Architecture

```text
┌─────────────────────────────────────────────────────────────┐
│                    REACT 19 FRONTEND                        │
│  (Tailwind CSS • React Router • Context API • Axios Client) │
└──────────────┬───────────────────────────────▲──────────────┘
               │ HTTP Requests (JSON + Bearer) │ HTTP Responses
               ▼                               │
┌─────────────────────────────────────────────────────────────┐
│                   EXPRESS.JS BACKEND                        │
│  ├── Middleware: CORS (Configured Origin)                   │
│  │               Rate Limiting & JSON Parser (10kb)         │
│  │               JWT Verification (authMiddleware.js)       │
│  │               Role Authorization (authorize('admin'))    │
│  │               Centralized Error Handler (errorMiddleware)│
│  ├── Controllers: Auth, Users, Preferences, Matches,        │
│  │                Requests, Messages, Admin                 │
│  └── Services:    Matching Compatibility Engine (8 Factors) │
└──────────────┬───────────────────────────────▲──────────────┘
               │ Mongoose Schemas & Queries    │ Document Data
               ▼                               │
┌─────────────────────────────────────────────────────────────┐
│                      MONGODB DATABASE                       │
│  Collections: Users • Preferences • Matches • Requests      │
│               Messages • Reports                            │
└─────────────────────────────────────────────────────────────┘
```

---

## 5. Algorithmic Compatibility Engine & Worked Example

The matching algorithm computes compatibility on the backend (`server/services/matchingService.js`) using persisted student preferences:

$$\text{Total Score} = \sum_{i=1}^{8} \left( \text{Factor Weight}_i \times \text{Factor Match Score}_i \right)$$

### 5.1 Weight Distribution
| Factor | Weight | Evaluation Method |
|---|---:|---|
| **Sleep Schedule** | 20% | Categorical agreement + wake-up time proximity |
| **Budget** | 20% | Step distance penalty across 4 budget tiers |
| **Cleanliness** | 15% | Ordinal distance penalty across cleanliness tiers |
| **Food Preferences** | 10% | Dietary harmony matrix (veg vs. non-veg compatibility) |
| **Noise Tolerance** | 10% | Sound level tolerance evaluation |
| **Study Habits** | 10% | Study location & ambient audio agreement |
| **Social Extroversion** | 10% | Social battery & guest policy alignment |
| **Other Lifestyle Factors** | 5% | Smoking/vaping domestic policy adherence |
| **Total** | **100%** | Normalized strictly to range **0 – 100%** |

### 5.2 Worked Calculation Example for FSD Viva
Consider two students:
- **Student A (Alex)**:
  - Sleep: `night_owl` | Budget: `5000-8000` | Cleanliness: `meticulous`
  - Food: `vegetarian` | Noise: `silent` | Study: `in_room_quiet`
  - Social: `ambivert` | Smoking: `strictly_non_smoker`
- **Student B (Jordan)**:
  - Sleep: `night_owl` (Identical $\to$ $1.0 \times 20 = 20.0\%$)
  - Budget: `5000-8000` (Exact match $\to$ $1.0 \times 20 = 20.0\%$)
  - Cleanliness: `moderate` (1 step away $\to$ $0.6 \times 15 = 9.0\%$)
  - Food: `vegetarian` (Exact match $\to$ $1.0 \times 10 = 10.0\%$)
  - Noise: `silent` (Exact match $\to$ $1.0 \times 10 = 10.0\%$)
  - Study: `in_room_quiet` (Exact match $\to$ $1.0 \times 10 = 10.0\%$)
  - Social: `ambivert` (Exact match $\to$ $1.0 \times 10 = 10.0\%$)
  - Smoking: `strictly_non_smoker` (Exact match $\to$ $1.0 \times 5 = 5.0\%$)

$$\text{Final Compatibility Score} = 20 + 20 + 9 + 10 + 10 + 10 + 10 + 5 = 94\%$$

The response also breaks down **Common Preferences** (`✓ Night Owl schedule`, `✓ Cleanliness standards`, etc.) and **Differences to Discuss** (`• Jordan is moderate while you are meticulous on room chores`).

---

## 6. REST API Endpoint Catalog

### System & Health Probes
- `GET /api/health` — Lightweight process health check (`200 OK`).
- `GET /api/ready` — Database readiness probe verifying active MongoDB connection (`200 OK`).

### Authentication (`/api/auth`)
- `POST /api/auth/register` — Create student account (bcrypt hash, returns JWT).
- `POST /api/auth/login` — Authenticate credentials (returns user & JWT).
- `GET /api/auth/me` — Retrieve active authenticated user session (`protect`).
- `POST /api/auth/logout` — Invalidate user session.

### Student Profile (`/api/users`)
- `GET /api/users/profile` — Fetch current student's personal & academic profile.
- `PUT /api/users/profile` — Update personal bio, college, course, city, and phone.

### Lifestyle Preferences (`/api/preferences`)
- `GET /api/preferences` — Get current user's 15 survey questionnaire answers.
- `PUT /api/preferences` — Save/update questionnaire answers (persists to MongoDB).

### Roommate Matches (`/api/matches`)
- `GET /api/matches` — Ranked list of compatible students with score breakdowns.
- `GET /api/matches/:id` — In-depth compatibility inspection for a specific student candidate.

### Roommate Requests (`/api/requests`)
- `POST /api/requests` — Dispatch roommate invitation with optional custom intro note.
- `GET /api/requests/received` — View incoming roommate invitations.
- `GET /api/requests/sent` — View outgoing roommate invitations.
- `PUT /api/requests/:id/accept` — Accept invitation (unlocks mutual chat channel).
- `PUT /api/requests/:id/reject` — Decline incoming invitation.
- `DELETE /api/requests/:id` — Cancel an outgoing pending invitation.

### Direct Messaging (`/api/messages`)
- `GET /api/messages/conversations` — List conversations with accepted roommate connections.
- `GET /api/messages/:userId` — Fetch chronological message history with a partner.
- `POST /api/messages` — Send a message to an accepted roommate.

### Administration (`/api/admin` — `authorize('admin')`)
- `GET /api/admin/metrics` — Platform-wide metrics (total users, active requests, reports).
- `GET /api/admin/users` — Paginated student user directory with status filters.
- `PUT /api/admin/users/:id/status` — Suspend or activate a student account.
- `GET /api/admin/reports` — Safety reports moderation queue.
- `PUT /api/admin/reports/:id/status` — Resolve or dismiss student moderation tickets.

---

## 7. Local Development Setup & Execution

### Prerequisites
- Node.js (v18.0.0 or higher)
- npm (v9.0.0 or higher)
- MongoDB (Local Community Server on `mongodb://127.0.0.1:27017` or MongoDB Atlas SRV URI)

### 1. Repository Setup
```bash
git clone https://github.com/kotechameet485-droid/fsd-assigment.git
cd fsd-assigment
```

### 2. Backend Environment & Startup
```bash
cd server
npm install
```
Create `server/.env`:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/nestmatch
JWT_SECRET=your_secure_development_jwt_secret_min_32_characters
CLIENT_URL=http://localhost:5173
```
Seed the database with verified students and admin:
```bash
npm run seed
```
Start the backend development server:
```bash
npm run dev
```
Verify the server:
- Health check: `http://localhost:5000/api/health`
- Database ready check: `http://localhost:5000/api/ready`

### 3. Frontend Environment & Startup
Open a separate terminal:
```bash
cd client
npm install
```
Create `client/.env`:
```env
VITE_API_URL=http://localhost:5000/api
```
Start the frontend dev server:
```bash
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## 8. Automated Testing & QA

Run the automated test suites directly from the `server/` directory:
```bash
cd server
npm run test:unit    # Executes all 30 standalone Node.js unit tests (no DB required)
node tests/verifyApi.js  # Executes all 25 end-to-end REST API integration tests (requires MongoDB)
```

### Test Suite Breakdown:
1. **Unit Test Suite** (`npm run test:unit` — **30 / 30 PASS**):
   - **JWT Security** (6 tests): missing secret error, valid token sign/verify, invalid signature rejection, expired token rejection, malformed token rejection, startup validation
   - **Matching Algorithm** (9 tests): identical preferences 100%, missing preferences handling, incomplete questionnaire partial evaluation, conflicting preferences, partial compatibility, budget distance penalties, self-match exclusion, score normalization [0, 100], dynamic preference updates
   - **Profile Completeness** (4 tests): empty profile incomplete, populated profile complete, transition on clearing field, short bio check
   - **Request Model Integrity** (4 tests): self-request hook rejection, deterministic activePairKey computation, nullification on rejection, nullification on cancellation
   - **Security Middleware** (3 tests): requireDB passes on connected DB, requireDB returns 503 on disconnected DB, sliding-window rate limiters permit normal and block excessive traffic
   - **Seed Safety Guard** (4 tests): rejection in production, rejection without confirmation, rejection on unapproved DBs, execution on dev DB with confirmation
2. **Integration Verification Suite** (`node tests/verifyApi.js` — **25 / 25 PASS**):
   - Health and Database readiness verification (`/api/health`, `/api/ready`)
   - Registration validation and successful account creation
   - Password hashing and authentication verification
   - Tokenless request 401 guard verification
   - Profile update and persistence verification (including age boundaries 16–99)
   - Preferences CRUD and questionnaire persistence without fabricated defaults
   - Algorithmic compatibility calculation
   - Roommate request workflow (sent, received, status)
   - Conversation listing and message permissions
   - Admin metrics and RBAC enforcement (student receives 403 Forbidden)
   - Admin search safe regex escaping (preventing ReDoS on special characters)
   - Admin pagination limits (rejects invalid page and excessive limit > 100)
   - Admin report status filter validation
   - Self-request prevention (400 Bad Request)
   - Duplicate active roommate request prevention (409 Conflict)
   - Request acceptance receiver authorization and idempotence
   - Profile completeness dynamic transitions (complete -> incomplete -> complete)
   - User settings boolean validation and persistence to MongoDB

### Frontend Build & Lint Verification
```bash
cd client
npm run build    # Validates Vite production bundle compilation
npm run lint     # Validates static analysis with Oxlint
```

---

## 9. Comprehensive Manual Testing Guide for Viva

### Scenario 1: New Student Registration & Questionnaire
1. Navigate to `http://localhost:5173/register`.
2. Fill in student details:
   - Full Name: `Maya Patel`
   - Email: `maya@university.edu`
   - College: `Apex Institute`
   - City: `Boston`
   - Password: `Password123!`
3. Click **Register & Continue**. You will be directed to the 15-question Compatibility Questionnaire.
4. Select your habits across the 5 steps (Sleep, Cleanliness, Study, Social, Budget).
5. Click **Save & Calculate Matches**.
6. The database stores your responses in `preferences` and re-ranks all potential roommates.

### Scenario 2: Exploring Matches & Inspecting Compatibility
1. Navigate to `/matches`.
2. Observe ranked match cards with compatibility percentages (e.g., 94%, 88%).
3. Click **View Details** on any student card.
4. Review the breakdown:
   - Harmonious lifestyle traits (green checkmarks).
   - Habits worth discussing upfront (amber badges).
   - Category compatibility index (Cleanliness, Sleep, Budget, Noise, etc.).

### Scenario 3: Request Lifecycle & Direct Chat
1. Click **Send Roommate Request** on Jordan Lee's profile.
2. Navigate to `/requests` $\to$ **Sent** tab. Observe the pending invitation.
3. Sign out via `/settings` $\to$ **Sign Out**.
4. Sign in as Jordan Lee (`jordan@university.edu` / `Password123!`).
5. Navigate to `/requests` $\to$ **Received** tab. Click **Accept Request**.
6. The request moves to **Connected**.
7. Click **Open Messages** or navigate to `/chat`. Send a message: *"Hi Maya, glad we matched! Want to tour 2BHK flats near campus?"*
8. The message is persisted in MongoDB and appears in real time in the conversation history.

### Scenario 4: Admin Security & Moderation
1. Sign out and sign in as the administrator (`admin@nestmatch.edu` / `AdminPass123!`).
2. Notice the navigation changes to the **Admin Console** (`/admin`).
3. View real-time platform metrics: Total Registered Users, Active Roommate Requests, and Pending Safety Reports.
4. Navigate to `/admin/users` to review the student directory and toggle user active/suspended state.
5. Navigate to `/admin/reports` to inspect safety flags and resolve moderation tickets.

---

## 10. FSD Viva & Academic Concept Guide

| Question / Concept | Explanation & Code References |
|---|---|
| **How does React communicate with Express?** | React uses Axios configured in `client/src/services/api.js`. An Axios interceptor automatically reads the JWT stored in `localStorage` (`nestmatch_token`) and injects it into the `Authorization: Bearer <token>` header of every outgoing request. |
| **How are passwords secured?** | We use `bcryptjs` in `server/models/User.js`. When a user registers or updates their password, a pre-save hook checks `isModified('password')` and hashes the plaintext password with 10 salt rounds. Plaintext is never saved. |
| **How does stateless JWT authentication work?** | Upon valid login, `server/utils/jwt.js` signs a JSON Web Token containing `userId` and `role` using HMAC-SHA256 with a secret key. The client includes this token in subsequent requests. `authMiddleware.js` extracts and verifies the token with `jwt.verify()`. |
| **How is Role-Based Access Control (RBAC) enforced?** | The backend middleware `authorize('admin')` in `server/middleware/authMiddleware.js` checks `req.user.role === 'admin'`. If a non-admin student attempts to call `/api/admin/metrics`, the server returns `403 Forbidden` regardless of client state. |
| **How does the matching formula handle incomplete data?** | `server/services/matchingService.js` performs partial profile evaluation: it evaluates only the factors declared by both students, aggregates their defined weights ($\sum W_i$), and normalizes the score strictly by the applicable weight ($(\text{weightedPoints} / \text{applicableWeight}) \times 100$). Unspecified categories are explicitly marked as `'Not Specified'` (`isEvaluated: false`) with an `isPartial: true` indicator, preventing artificial inflation of incomplete profiles while maintaining explainability. |
| **Why is messaging restricted to accepted connections?** | To ensure student domestic safety and prevent unsolicited spam, `server/controllers/messageController.js` queries the `Request` collection to confirm an `accepted` request exists between `senderId` and `recipientId` before permitting any message insertion. |

---

## 11. Deployment Guidelines

### Frontend Deployment (Vercel)
1. Link your GitHub repository in the Vercel dashboard.
2. Set Root Directory to `client`.
3. Set Framework Preset to `Vite`.
4. Add Environment Variable:
   - `VITE_API_URL`: Your deployed backend URL (e.g., `https://nestmatch-api.onrender.com/api`).
5. Deploy.

### Backend Deployment (Render / Railway)
1. Create a Web Service pointing to your repository.
2. Set Root Directory to `server`.
3. Build Command: `npm install`
4. Start Command: `npm start`
5. Configure Environment Variables:
   - `NODE_ENV`: `production`
   - `PORT`: `5000`
   - `MONGODB_URI`: Your MongoDB Atlas connection string (`mongodb+srv://...`)
   - `JWT_SECRET`: A high-entropy random string (e.g., 64 characters)
   - `CLIENT_URL`: Your deployed frontend URL (e.g., `https://nestmatch.vercel.app`)

---

## 12. Authors & Academic Credentials

- **Student / Author**: Meet Kotecha
- **Course**: Full Stack Development (FSD)
- **Degree**: B.Tech Computer Science & Engineering
- **Academic Year**: 2026
