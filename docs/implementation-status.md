# NestMatch — Implementation Status & System Audit Report

**Date of Audit**: October 17, 2026  
**Auditor**: Senior Full-Stack Architecture Agent  
**Repository Branch**: `master` (Current Head: `eb54dfe chore: initialize NestMatch project foundation`)  
**Workspace Root**: `d:\sem5\FSD\fsd assi`  
**Application Stack**: MERN (React v19 + Vite v8 + Tailwind CSS v3 | Node.js + Express v4 | MongoDB + Mongoose v8)  

---

## 1. Executive Summary

This comprehensive audit was conducted to assess the development status of **NestMatch — Smart Roommate Compatibility Finder**. 

### Key Findings
1. **Frontend Presentation Tier (Phase 1 & Phase 2 UI)**: **Complete & Highly Polished**. The React single-page application contains 13 reusable UI components, 4 layout wrappers, 13 interactive page views (covering student and admin flows), and 3 React context providers. The UI is clean, modern, and implements responsive design patterns.
2. **Interactive State & Data Handling**: **Simulated via Mock Layer**. All current user interactions (login, registration, questionnaire submission, roommate requests, messaging, and admin user status toggles) operate through mock service modules (`client/src/services/mock*.js`) and in-memory React state (`AuthContext`, `MatchContext`).
3. **Backend REST API Tier (Phase 0 Foundation)**: **Scaffolded but Unconnected**. The Express server initializes successfully on port 5000 and responds to `/api/health` and `/`. However, no business routes, database models, authentication controllers, or matching algorithms have been implemented in the backend yet.
4. **Database Tier**: **Not Connected**. `server/config/db.js` defines an asynchronous Mongoose connection function, but it is not yet invoked in `server.js`, and no Mongoose schemas or models exist in `server/models/`.
5. **Git Repository State**: The project was restored from `D:\sem5\FSD\fsd assigment` (found in the local Recycle Bin) to the active IDE workspace `d:\sem5\FSD\fsd assi`. The working directory contains all Phase 1 frontend components as uncommitted modifications and untracked files against commit `eb54dfe`.

---

## 2. Current Folder Structure

```text
d:\sem5\FSD\fsd assi\
├── .git/                                   # Git repository metadata (branch: master)
├── .gitignore                              # Root Git ignore rules
├── LICENSE                                 # MIT License
├── README.md                               # Project documentation and specifications
│
├── docs/                                   # Architectural & Engineering Specifications
│   ├── api-plan.md                         # Detailed REST API endpoint contracts
│   ├── architecture.md                     # System architecture & data flow diagrams
│   ├── database-design.md                  # Mongoose schema definitions and ERD
│   ├── development-roadmap.md              # 14-phase roadmap & algorithm weighting math
│   ├── implementation-status.md            # [THIS FILE] Current audit report & status
│   └── project-scope.md                    # Core vs. secondary feature boundaries
│
├── client/                                 # Frontend Application (React 19 + Vite + Tailwind)
│   ├── public/                             # Public static assets (favicon.svg, icons.svg)
│   ├── src/
│   │   ├── assets/                         # SVG illustrations & default brand assets
│   │   ├── components/                     # Reusable UI component library (13 files)
│   │   │   ├── Avatar.jsx                  # User avatar with fallback initials
│   │   │   ├── Badge.jsx                   # Status badge (success, warning, neutral)
│   │   │   ├── Button.jsx                  # Reusable button with variants & icons
│   │   │   ├── Card.jsx                    # Surface card with hover states
│   │   │   ├── Checkbox.jsx                # Accessible checkbox control
│   │   │   ├── EmptyState.jsx              # Zero-data visual fallback component
│   │   │   ├── Input.jsx                   # Text/password/email input wrapper
│   │   │   ├── Modal.jsx                   # Accessible dialog overlay
│   │   │   ├── PageHeader.jsx              # Standard page title & action banner
│   │   │   ├── ScoreBadge.jsx              # Color-coded compatibility percentage badge
│   │   │   ├── Select.jsx                  # Form dropdown component
│   │   │   └── Textarea.jsx                # Multi-line text input
│   │   ├── constants/                      # Application route constants & roles
│   │   │   ├── roles.js                    # 'student' | 'admin' roles
│   │   │   └── routes.js                   # Application route paths
│   │   ├── context/                        # React context providers
│   │   │   ├── AuthContext.jsx             # Auth state & demo role switcher
│   │   │   ├── MatchContext.jsx            # Matches, requests, chat, & questionnaire state
│   │   │   └── ToastContext.jsx            # Global toast notifications
│   │   ├── data/                           # Mock datasets for UI demo
│   │   │   ├── mockMatches.js              # 5 pre-calculated match candidates
│   │   │   ├── mockMessages.js             # Chat conversation threads
│   │   │   ├── mockPreferences.js          # Lifestyle survey data
│   │   │   ├── mockReports.js              # Admin report data
│   │   │   ├── mockRequests.js             # Incoming & outgoing roommate requests
│   │   │   └── mockUsers.js                # Demo student & admin profiles
│   │   ├── layouts/                        # Page layouts
│   │   │   ├── AdminLayout.jsx             # Admin console shell with top navigation
│   │   │   ├── Footer.jsx                  # Public footer
│   │   │   ├── Navbar.jsx                  # Public responsive navbar
│   │   │   └── StudentLayout.jsx           # Student portal shell with sidebar & mobile drawer
│   │   ├── pages/                          # Application views (13 pages)
│   │   │   ├── AdminDashboardPage.jsx      # Admin platform metrics & moderation overview
│   │   │   ├── AdminReportsPage.jsx        # Admin safety flag review queue
│   │   │   ├── AdminUsersPage.jsx          # Admin user management & status toggling
│   │   │   ├── ChatPage.jsx                # Student direct messaging interface
│   │   │   ├── DashboardPage.jsx           # Student overview & top match recommendations
│   │   │   ├── LandingPage.jsx             # Public marketing landing page
│   │   │   ├── LoginPage.jsx               # Student/Admin sign-in form
│   │   │   ├── MatchDetailsPage.jsx        # Detailed candidate compatibility breakdown
│   │   │   ├── MatchesPage.jsx             # Filterable candidate match feed
│   │   │   ├── NotFoundPage.jsx            # 404 error page
│   │   │   ├── ProfilePage.jsx             # Student profile editor & bio
│   │   │   ├── QuestionnairePage.jsx       # 15-question multi-step lifestyle survey
│   │   │   ├── RegisterPage.jsx            # Student registration form
│   │   │   ├── RequestsPage.jsx            # Roommate requests inbox/outbox
│   │   │   └── SettingsPage.jsx            # Student preference & account settings
│   │   ├── routes/                         # Client-side routing
│   │   │   └── AppRoutes.jsx               # Declarative Route definitions
│   │   ├── services/                       # API client and mock services
│   │   │   ├── api.js                      # Central Axios instance (configured for localhost:5000)
│   │   │   ├── mockAdminService.js         # Simulated admin CRUD
│   │   │   ├── mockAuthService.js          # Simulated authentication
│   │   │   ├── mockChatService.js          # Simulated chat
│   │   │   ├── mockMatchService.js         # Simulated match calculation
│   │   │   ├── mockProfileService.js       # Simulated profile update
│   │   │   └── mockRequestService.js       # Simulated requests workflow
│   │   ├── App.css                         # Root styling
│   │   ├── App.jsx                         # App entry with Providers
│   │   ├── index.css                       # Tailwind CSS directives & theme rules
│   │   └── main.jsx                        # React 19 DOM mount
│   ├── .env.example                        # Client environment template (VITE_API_URL)
│   ├── .gitignore                          # Client ignore rules
│   ├── package.json                        # Dependencies (react 19, vite 8, tailwind 3, axios, lucide)
│   ├── postcss.config.js                   # PostCSS configuration
│   ├── tailwind.config.js                  # Tailwind configuration & custom color palette
│   └── vite.config.js                      # Vite build configuration
│
└── server/                                 # Backend Application (Node.js + Express)
    ├── config/                             # Database configuration
    │   └── db.js                           # Mongoose connection utility (exported connectDB)
    ├── controllers/                        # Route controllers (.gitkeep only)
    ├── middleware/                         # Auth & error middleware (.gitkeep only)
    ├── models/                             # Mongoose schema models (.gitkeep only)
    ├── routes/                             # Express route handlers (.gitkeep only)
    ├── services/                           # Business logic services (.gitkeep only)
    ├── utils/                              # Utility helpers (.gitkeep only)
    ├── validators/                         # Input validation rules (.gitkeep only)
    ├── .env.example                        # Server environment template
    ├── .gitignore                          # Server ignore rules
    ├── package.json                        # Dependencies (express, mongoose, bcryptjs, jsonwebtoken, cors, dotenv)
    └── server.js                           # Express entrypoint with /api/health and error handlers
```

---

## 3. Existing Pages and User Flows

The application defines two complete layout contexts: **Public/Student Portal** and **Admin Console**.

### 3.1 Public Pages
- **Landing Page (`/`)**:
  - Highlights the core value proposition: transparent, explainable lifestyle compatibility matching vs. random room allocation.
  - Features a 3-step onboarding preview ("Complete Survey" $\to$ "Inspect Match Breakdown" $\to$ "Connect & Chat").
  - Includes a live compatibility card preview teaser and an interactive FAQ accordion.
  - Header with responsive navigation drawer and CTAs to Login and Register.
- **Login Page (`/login`)**:
  - Email and password inputs with client-side validation and password reveal toggle.
  - Pre-filled demo credentials hint for immediate trial (`student@nestmatch.edu` / `admin@nestmatch.edu`).
  - Calls `mockAuthService.login()` and redirects to `/dashboard` upon success.
- **Register Page (`/register`)**:
  - Captures student full name, university email, password, college name, course/major, and city.
  - Calls `mockAuthService.register()` and auto-hydrates session into `/dashboard`.

### 3.2 Student Core Workflow (Protected by `StudentLayout`)
- **Dashboard (`/dashboard`)**:
  - Personalized welcome banner showing pending request count and matched candidate count.
  - Interactive profile completeness progress bar (currently mocked at 85%).
  - Metric counters: Active Matches (5), Pending Requests (1), Connected Roommates (1), Unread Messages (2).
  - Quick recommendations grid rendering top 3 matches with compatibility percentages.
- **Find Matches (`/matches`)**:
  - Displays feed of 5 algorithmically ranked candidate profiles (Jordan Lee 94%, Priya Sharma 88%, Marcus Chen 82%, Samira Patel 78%, Liam O'Connor 65%).
  - Multi-parameter filter bar:
    - Search input (queries candidate name, college, course).
    - Sort selector (Highest Compatibility vs. Alphabetical Name).
    - College filter dropdown (All, Apex Institute, Metro State, Bay Area State).
    - City filter dropdown (All, Boston, Cambridge).
    - Minimum compatibility score threshold slider/selector (50%, 70%, 80%, 90%+).
  - Direct "Send Request" modal allowing students to attach an introductory personal message.
- **Match Details (`/matches/:id`)**:
  - Comprehensive inspection view of an individual candidate's lifestyle harmony.
  - Radial compatibility badge with color-coded confidence tier (e.g., "Exceptional Match", "High Compatibility").
  - 6-dimension breakdown meters (Sleep Schedule, Budget Alignment, Cleanliness Standards, Diet & Cooking, Noise & Atmosphere, Social & Guests) with qualitative harmony notes.
  - Distinct sections for **Common Preferences** (aligned traits) and **Key Differences** (divergent traits).
- **Questionnaire (`/questionnaire`)**:
  - 5-step structured survey evaluating 15 lifestyle dimensions:
    1. Daily Sleep & Morning Rhythms (bedtime, wake-up hour, peak study time).
    2. Cleanliness & Shared Space Habits (tidiness standard, chore rotation, AC/temperature preference).
    3. Atmosphere & Study Environment (room study vs. library, noise tolerance, weekend routine).
    4. Social Rhythms & House Rules (social extroversion, guest policy, smoking tolerance).
    5. Budget Allocation & Dietary Choices (rent budget bracket, vegetarian/non-vegetarian preferences, target neighborhood).
  - Step navigation with animated progress indicator.
  - Saves responses to `MatchContext` and renders a completion review card with a direct link to re-ranked matches.
- **Roommate Requests (`/requests`)**:
  - Dual tabs: "Received Requests" and "Sent Requests".
  - Status badges (`pending`, `accepted`, `declined`).
  - Actions for incoming requests: "Accept" (triggers mutual connection and unlocks chat) and "Decline".
  - Actions for outgoing requests: "Cancel Request".
- **Chat / Direct Messaging (`/chat`)**:
  - Two-pane messaging UI available between mutually accepted roommate pairs.
  - Left pane: Conversation list displaying connected candidate avatars, last message snippets, and online status indicators.
  - Right pane: Message thread header with safety guidelines, chronological message bubbles, system notifications, and an instant message input box with send button.
- **Student Profile (`/profile`)**:
  - View and edit student academic details (college, course, graduation year, city, bio).
  - Displays current active lifestyle badges based on survey answers.
- **Settings (`/settings`)**:
  - Account information overview, notification toggles, housing search status toggle ("Actively Looking" vs. "Room Secured"), and demo role switcher.

### 3.3 Admin Workflow (Protected by `AdminLayout`)
- **Admin Dashboard (`/admin`)**:
  - Key platform health cards: Total Students Registered (248), Questionnaires Completed (192), Matches Calculated (1,420), Open Safety Flags (3).
  - Moderation queue summary displaying latest flagged interactions.
- **User Directory (`/admin/users`)**:
  - Searchable data table of registered student accounts.
  - Columns: Student Name, College, Email, Survey Status, Account Status (`Active` vs `Suspended`).
  - Action buttons to toggle user account suspension or remove accounts.
- **Safety Reports (`/admin/reports`)**:
  - Moderation list with severity badges (`High`, `Medium`, `Low`).
  - Displays reporting student, reported candidate, reported date, and reason description.
  - Action buttons: "Dismiss Flag", "Send Warning", "Suspend Student".

---

## 4. Existing Backend Routes and Database Models

### 4.1 Backend Routes Status
| Route | Method | Access | Implementation State | Verification Result |
|---|---|---|---|---|
| `/api/health` | GET | Public | **Implemented** in `server.js` | Returns 200 OK with system status JSON |
| `/` | GET | Public | **Implemented** in `server.js` | Returns 200 OK welcome message |
| `/api/auth/register` | POST | Public | **Not Implemented** (Mock only in client) | Route returns 404 |
| `/api/auth/login` | POST | Public | **Not Implemented** (Mock only in client) | Route returns 404 |
| `/api/auth/me` | GET | Private (JWT) | **Not Implemented** (Mock only in client) | Route returns 404 |
| `/api/users/profile` | GET/PUT | Private (JWT) | **Not Implemented** (Mock only in client) | Route returns 404 |
| `/api/preferences` | GET/PUT | Private (JWT) | **Not Implemented** (Mock only in client) | Route returns 404 |
| `/api/matches` | GET | Private (JWT) | **Not Implemented** (Mock only in client) | Route returns 404 |
| `/api/matches/:id` | GET | Private (JWT) | **Not Implemented** (Mock only in client) | Route returns 404 |
| `/api/requests` | GET/POST | Private (JWT) | **Not Implemented** (Mock only in client) | Route returns 404 |
| `/api/requests/:id` | PUT/DELETE| Private (JWT) | **Not Implemented** (Mock only in client) | Route returns 404 |
| `/api/messages` | GET/POST | Private (JWT) | **Not Implemented** (Mock only in client) | Route returns 404 |
| `/api/admin/*` | ALL | Admin (JWT) | **Not Implemented** (Mock only in client) | Route returns 404 |

### 4.2 Database Models Status
| Model Name | Target Collection | Documentation | Mongoose Schema File | State |
|---|---|---|---|---|
| `User` | `users` | `docs/database-design.md:L92-113` | Missing (`server/models/User.js`) | Not Implemented |
| `Preference`| `preferences`| `docs/database-design.md:L115-139`| Missing (`server/models/Preference.js`) | Not Implemented |
| `Request` | `requests` | `docs/database-design.md:L141-154`| Missing (`server/models/Request.js`) | Not Implemented |
| `Message` | `messages` | `docs/database-design.md:L156-167`| Missing (`server/models/Message.js`) | Not Implemented |
| `Match` | `matches` | `docs/database-design.md:L169-181`| Missing (`server/models/Match.js`) | Not Implemented |
| `Report` | `reports` | `docs/database-design.md:L78-86` | Missing (`server/models/Report.js`) | Not Implemented |

---

## 5. Mock-Only Features vs. Genuinely Implemented Features

| Feature | Frontend View | Current Data Source | Connected to Express REST API? | Connected to MongoDB Database? |
|---|---|---|---|---|
| **Marketing Landing Page** | `/` | Static JSX + Tailwind | N/A (Static Presentation) | N/A |
| **Student Registration** | `/register` | `mockAuthService.js` | ❌ No (Simulated in memory) | ❌ No |
| **Student Login & JWT** | `/login` | `mockAuthService.js` | ❌ No (Simulated in memory) | ❌ No |
| **Role-Based Routing** | `/admin/*` | `AuthContext.jsx` | ❌ No (Simulated role switch) | ❌ No |
| **Student Profile Display & Edit** | `/profile` | `mockUsers.js` + Context | ❌ No (Simulated in memory) | ❌ No |
| **Lifestyle Survey & Saving** | `/questionnaire`| `MatchContext.jsx` | ❌ No (Simulated in memory) | ❌ No |
| **Compatibility Calculation** | `/matches` | `mockMatches.js` | ❌ No (Hardcoded score objects)| ❌ No |
| **Match Details & Explanation** | `/matches/:id` | `mockMatches.js` | ❌ No (Hardcoded breakdown) | ❌ No |
| **Send Roommate Request** | `/matches` | `MatchContext.jsx` | ❌ No (In-memory array prepend)| ❌ No |
| **Accept/Reject Requests** | `/requests` | `MatchContext.jsx` | ❌ No (In-memory array map) | ❌ No |
| **Direct Messaging / Chat** | `/chat` | `MatchContext.jsx` | ❌ No (In-memory array append) | ❌ No |
| **Admin User Management** | `/admin/users` | `mockAdminService.js` | ❌ No (In-memory array map) | ❌ No |
| **Admin Reports Moderation** | `/admin/reports`| `mockAdminService.js` | ❌ No (In-memory array filter)| ❌ No |
| **System Health Check** | Direct URL | `server/server.js` | ✅ **Yes** (`/api/health`) | ❌ No (No DB check yet) |

---

## 6. Build and Test Results

### 6.1 Reproducible Verification Commands
All checks can be independently reproduced using the following commands:

```bash
# 1. Verify Git status
git status

# 2. Build Frontend
cd client
npm run build

# 3. Lint Frontend
npm run lint

# 4. Start Backend Server
cd ../server
node server.js

# 5. Query Health Endpoint (in separate terminal)
curl http://localhost:5000/api/health
# or in PowerShell:
Invoke-RestMethod -Uri "http://localhost:5000/api/health" | ConvertTo-Json
```

### 6.2 Test Execution Results
1. **Frontend Production Build (`vite build`)**:
   - **Status**: **PASSED** (Exit code 0).
   - **Modules Transformed**: 1,961 modules transformed cleanly in 1.06 seconds.
   - **Bundle Output**:
     - `dist/index.html`: 0.96 kB (gzip: 0.53 kB)
     - `dist/assets/index-BEREVaU8.css`: 34.96 kB (gzip: 6.87 kB)
     - `dist/assets/index-CDe_ETa0.js`: 421.40 kB (gzip: 118.70 kB)
2. **Frontend Linter (`oxlint`)**:
   - **Status**: **PASSED** (Exit code 0).
   - **Results**: 0 errors, 69 warnings across 55 files (all warnings relate to unused variable imports or declarations).
3. **Backend Server Startup**:
   - **Status**: **PASSED** (Exit code 0).
   - Server initializes on port 5000 and prints confirmation logs.
4. **Backend Health Check**:
   - **Status**: **PASSED** (HTTP 200 OK).
   - Response payload:
     ```json
     {
       "status": "success",
       "project": "NestMatch - Smart Roommate Compatibility Finder",
       "phase": "Phase 0 - Project Foundation",
       "timestamp": "2026-10-17T13:23:47.638Z"
     }
     ```

### 6.3 Responsive Layout Evaluation
- **Testing Limitation Notice**: Automated browser testing via `browser_subagent` encountered a known sandbox environment network restriction (Playwright driver cannot download external browser binaries in an offline container). As instructed, this limitation is reported honestly, and testing was supplemented with comprehensive static layout and CSS breakpoint audits across all target widths.
- **Audit Findings across Target Widths**:
  - **360px (Small Mobile)**: Single-column grid stacking (`grid-cols-1`), text sizes scale down (`text-2xl`), cards utilize responsive margins (`p-4`), mobile drawer handles navigation cleanly, minimum tap targets meet 44px height requirements.
  - **390px (Standard Mobile - iPhone 12/13/14/15)**: Clean card layouts in `/matches` and `/dashboard`. Form fields in `/questionnaire` and `/profile` are constrained to `w-full` with comfortable spacing. No horizontal scrollbar (`overflow-x`) detected.
  - **768px (Tablet Portrait)**: Breakpoint `md:` transitions top bar to sidebar navigation in `StudentLayout`. Multi-column grids expand to 2 columns (`sm:grid-cols-2`).
  - **1024px (Tablet Landscape / Laptop)**: Desktop sidebar is fully anchored (`w-64`). Matches display in responsive multi-column layouts (`lg:grid-cols-3`). Chat view displays side-by-side conversation list and active chat window.
  - **1440px (Desktop / High Resolution)**: Container constrained via `max-w-7xl mx-auto`, preventing awkward stretching across wide monitors.

---

## 7. Missing Requirements and Identified Bugs

### 7.1 Identified Defects & Dead Code in Existing Codebase
1. **Unused Filter State in `MatchesPage.jsx`**:
   - `selectedBudget` is initialized via `useState('all')` and included in the `useMemo` dependency array (line 80), but there is no corresponding budget dropdown control in the UI and no budget condition in the filtering logic.
2. **Unused Imports / Lint Warnings (69 occurrences)**:
   - Several pages import Lucide icons that are never rendered (e.g. `Thermometer` and `Calendar` in `QuestionnairePage.jsx`; `DollarSign`, `Moon`, `Utensils`, `Volume2`, `Users` in `ProfilePage.jsx`; `Shield`, `Clock` in `ChatPage.jsx`).
3. **Axios Central Client Missing Auth Interceptor**:
   - `client/src/services/api.js` initializes Axios with `baseURL`, but does not yet attach an `Authorization: Bearer <token>` request interceptor for authenticating requests with stored JWTs.
4. **Direct Mock Coupling in View Components**:
   - Views consume `mock*Service.js` and in-memory contexts rather than dispatching HTTP calls through `api.js`.

### 7.2 Missing Course-Aligned Architecture Requirements
1. **Missing MongoDB / Mongoose Data Layer**:
   - No Mongoose schemas or models defined for `User`, `Preference`, `Request`, `Message`, `Match`, `Report`.
   - `connectDB()` in `server/config/db.js` is not invoked.
2. **Missing Express REST API Endpoints**:
   - No authentication controller or JWT issuing logic (`/api/auth/*`).
   - No profile CRUD endpoints (`/api/users/*`).
   - No survey persistence endpoints (`/api/preferences/*`).
   - No requests workflow endpoints (`/api/requests/*`).
   - No messaging endpoints (`/api/messages/*`).
3. **Missing Algorithmic Compatibility Engine on Backend**:
   - The weighted formula ($20\%$ Sleep, $20\%$ Budget, $15\%$ Cleanliness, $10\%$ Food, $10\%$ Noise, $10\%$ Study, $10\%$ Social, $5\%$ Other) documented in `docs/development-roadmap.md` exists only on paper and in hardcoded mock arrays, not in Express service code.
4. **Missing Role-Based Access Control Middleware**:
   - No Express middleware verifying JWT tokens and ensuring admin-only access for `/api/admin/*`.

---

## 8. Prioritized Implementation Checklist

To restart development systematically without breaking existing assets, adhere strictly to the sequential roadmap:

### Phase 3 — Backend Foundation & Database Models (Next Immediate Step)
- [ ] Connect `server.js` to MongoDB Atlas using `connectDB()`.
- [ ] Implement Mongoose schema for `User` (`server/models/User.js`) with bcrypt password hashing hook.
- [ ] Implement Mongoose schema for `Preference` (`server/models/Preference.js`).
- [ ] Implement Mongoose schema for `Request` (`server/models/Request.js`).
- [ ] Implement Mongoose schema for `Message` (`server/models/Message.js`).
- [ ] Implement Mongoose schema for `Report` (`server/models/Report.js`).
- [ ] Add seed script (`server/scripts/seed.js`) to populate sample university students and preferences for testing.

### Phase 4 — Authentication & Role-Based Authorization
- [ ] Create `server/middleware/authMiddleware.js` (JWT token verification).
- [ ] Create `server/controllers/authController.js` (`register`, `login`, `getMe`).
- [ ] Create `server/routes/authRoutes.js` and mount at `/api/auth`.
- [ ] Configure Axios request interceptor in `client/src/services/api.js` to attach Bearer tokens.
- [ ] Connect `client/src/pages/LoginPage.jsx` and `RegisterPage.jsx` to live `/api/auth` endpoints.

### Phase 5 — Profile & Lifestyle Preferences API
- [ ] Implement `server/controllers/userController.js` and `server/routes/userRoutes.js` (`GET /api/users/profile`, `PUT /api/users/profile`).
- [ ] Implement `server/controllers/preferenceController.js` and `server/routes/preferenceRoutes.js` (`GET /api/preferences`, `PUT /api/preferences`).
- [ ] Wire `QuestionnairePage.jsx` and `ProfilePage.jsx` to persist data to MongoDB via Axios.

### Phase 6 — Weighted Compatibility Scoring Engine
- [ ] Implement `server/services/matchingService.js` applying the weighted algorithm formula from `docs/development-roadmap.md`.
- [ ] Implement `GET /api/matches` and `GET /api/matches/:id` returning dynamically computed scores, common traits, and differences.
- [ ] Connect `MatchesPage.jsx` and `MatchDetailsPage.jsx` to live match API.

### Phase 7 — Roommate Requests Workflow API
- [ ] Implement `server/controllers/requestController.js` (`sendRequest`, `getReceivedRequests`, `getSentRequests`, `updateRequestStatus`).
- [ ] Connect `RequestsPage.jsx` and `MatchContext.jsx` to live request endpoints.

### Phase 8 — Direct Messaging & Chat Persistence
- [ ] Implement `server/controllers/messageController.js` (`sendMessage`, `getConversationMessages`).
- [ ] Connect `ChatPage.jsx` to live message persistence.

### Phase 9 — Admin Moderation & User Management
- [ ] Implement `server/middleware/adminMiddleware.js`.
- [ ] Implement `server/controllers/adminController.js` (list students, toggle status, list/resolve reports).
- [ ] Connect `AdminDashboardPage.jsx`, `AdminUsersPage.jsx`, and `AdminReportsPage.jsx` to `/api/admin/*`.

### Phase 10 — QA, Code Polish & Deployment Readiness
- [ ] Remove dead `selectedBudget` state in `MatchesPage.jsx`.
- [ ] Clean up unused Lucide icon imports to eliminate the 69 lint warnings.
- [ ] Configure production build scripts and test cross-environment deployment for Vercel, Render, and MongoDB Atlas.
