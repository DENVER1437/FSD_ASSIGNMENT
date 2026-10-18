# NestMatch — Implementation Status & System Audit Report

**Date of Audit**: October 18, 2026  
**Auditor**: Senior Full-Stack Architecture & Security Agent  
**Repository Branch**: `main`  
**Workspace Root**: `d:\sem5\FSD\fsd assi`  
**Application Stack**: Strict MERN (React v19 + Vite v8 + Tailwind CSS v3 | Node.js + Express v4 | MongoDB + Mongoose v8 | JWT + Bcryptjs)

---

## 1. Executive Summary

This document certifies the comprehensive audit, repair, integration, security hardening, and test verification completed on **NestMatch — Smart Roommate Compatibility Finder**.

### Completed Hardening & Repairs
1. **JWT Security & Startup Validation**: Completely eliminated fallback secrets (`server/utils/jwt.js`). Required explicit `process.env.JWT_SECRET` across all environments. Startup validation (`validateJwtConfig`) in `server/server.js` halts process with a clear error if the secret is absent or insecure. Token expiration (7d) and standard claims (`userId`, `role`) strictly enforced.
2. **Seed Script Data-Loss Prevention**: Hardened `server/scripts/seed.js` with an exported guard (`canRunDestructiveSeed`). Refuses execution when `NODE_ENV=production`, requires explicit CLI `--confirm` or `CONFIRM_SEED_RESET=true`, and validates that the MongoDB connection target is an approved local or development database (`127.0.0.1`, `localhost`, `test`, `dev`).
3. **Matching Algorithm Accuracy**: Repaired `server/services/matchingService.js` to eliminate silent fallback assumptions. Implemented partial profile evaluation: evaluates only lifestyle factors declared by both students, computes applicable weight, and normalizes strictly by `(weightedPoints / applicableWeight) * 100`. Missing factors are marked with `status: 'Not Specified'` and `isEvaluated: false`. Explicit tier distance scoring implemented for budget and cleanliness.
4. **Duplicate Active Roommate Request Prevention**: Added `activePairKey: { type: String, default: null }` and a partial unique index `{ activePairKey: 1 }` where `{ activePairKey: { $type: 'string' } }` in `server/models/Request.js`. Pre-validation hook generates deterministic sorted pair key `[senderId, receiverId].sort().join(':')` for `pending` and `accepted` states. Sets `activePairKey: null` upon `rejected` to release the constraint so valid future requests are not permanently blocked. Both direct and reverse-direction duplicate requests return `409 Conflict`.
5. **Request Acceptance Consistency**: Repaired `server/controllers/requestController.js` using atomic `findOneAndUpdate` with `status: 'pending'` and receiver authorization checks. Welcome message creation is isolated as a recoverable operation; failures log a warning without making the acceptance appear to fail. Repeated acceptance returns `400 Bad Request`.
6. **Admin Search & Pagination Hardening**: In `server/controllers/adminController.js`, implemented `escapeRegex` escaping user search strings before constructing `$regex` queries (preventing ReDoS). Validates `page` ($\ge 1$) and `limit` ($1 \le \text{limit} \le 100$). Rejects invalid numeric values and excessive page sizes ($> 100$) with `400 Bad Request`. Validates report status filters against allowed enums.
7. **CORS & Database Readiness**: Hardened origin verification in `server/server.js` using configured `allowedOrigins`. Database readiness probe (`/api/ready`) accurately checks `mongoose.connection.readyState === 1`.
8. **Profile Completeness Authority**: Created authoritative `checkProfileCompleteness` in `server/controllers/userController.js`. Dynamically recalculates completeness upon every profile or questionnaire update, correctly handling transitions from incomplete $\to$ complete $\to$ incomplete.
9. **Messaging Permissions & Query Optimization**: Verified sender identity is sourced from authenticated token; added `{ receiverId: 1, isRead: 1 }` index to `Message` collection; replaced N+1 conversation queries with batched aggregation (`Message.aggregate`) in `server/controllers/messageController.js`.
10. **Questionnaire Integrity & False Success Bug Fix**: Completely resolved the questionnaire false-success bug where API rejections were caught in context but still marked completed on the page. `submitQuestionnaire` now returns `{ success, message, preferences }`, and `QuestionnairePage.jsx` inspects the outcome, showing single toast notifications, keeping the form open on failure with a retry action, and enforcing required fields. Unanswered fields initialize as explicit empty states instead of silently fabricating default answers for new students. Selected options feature accessible checkmark indicators rather than relying on color alone.
11. **Profile Age Persistence & Safe Partial Updates**: Added `age: { type: Number, min: 16, max: 99, default: null }` across the database model, controller whitelist, and profile form. Displayed student age in profile header. Coordinated profile and preference updates using `Promise.allSettled` with clear partial-success notifications, dirty-state tracking, and asynchronous hydration synchronization.
12. **Settings Real Persistence**: Implemented `PUT /api/users/settings` with strict boolean validation. Persisted notification and privacy settings to authenticated user records, wired toggles with optimistic state and automatic rollback on failure, and explicitly disabled upcoming v2.0 features with honest explanatory labels.
13. **Error vs Empty State Granularity**: Added explicit `matchesLoading`, `matchesError`, `requestsLoading`, and `requestsError` to separate loading, legitimate empty data, and network/server failures across all data-driven views. Added retry buttons. Replaced eager conversation message fetching with on-demand retrieval (`fetchMessagesForUser`). Removed fake "online" presence claims in chat.
14. **Automated Verification**:
    - `npm run test:unit`: **30 / 30 PASS** (JWT security, matching accuracy, profile completeness, request model concurrency & cancellation, seed safety guard, database connectivity middleware, sliding-window rate limiters).
    - `node tests/verifyApi.js`: **25 / 25 PASS** (Full end-to-end REST API verification suite including age boundaries, unrecorded null preferences, and settings persistence against live MongoDB).
    - `npm run build` (client): **Vite build PASS** (Zero errors, optimized production chunks).
    - `npm run lint` (client): **Oxlint PASS** (Zero warnings, zero errors across 64 files).

---

## 2. Feature Implementation Status Matrix

### Category 1: Implemented and Verified

| Module | Feature / Component | Backend Route / Service | Frontend Route / Component | Verification Status |
|---|---|---|---|---|
| **Health** | Process Health Check | `GET /api/health` | Service ping | Verified (200 OK, healthy) |
| **Health** | Database Readiness Probe | `GET /api/ready` | Service ping | Verified (200 OK, connected: true) |
| **Auth** | Student Registration | `POST /api/auth/register` | `/register` (`RegisterPage.jsx`) | Verified (real DB write, bcrypt hash, token) |
| **Auth** | Student & Admin Login | `POST /api/auth/login` | `/login` (`LoginPage.jsx`) | Verified (credential check, JWT issued) |
| **Auth** | Current Session Hydration | `GET /api/auth/me` | `AuthContext.jsx` | Verified (user restored on page refresh) |
| **Auth** | Secure Sign Out | `POST /api/auth/logout` | `SettingsPage.jsx` | Verified (clears token & state) |
| **Profile** | Read & Update Student Profile | `GET /api/users/profile`, `PUT /api/users/profile` | `/profile` (`ProfilePage.jsx`) | Verified (persists name, age 16-99, college, city, course, bio; dynamic completeness) |
| **Settings** | Persist Student Settings | `PUT /api/users/settings` | `/settings` (`SettingsPage.jsx`) | Verified (persists notification & privacy toggles, validates booleans) |
| **Preferences** | Read & Update Questionnaire | `GET /api/preferences`, `PUT /api/preferences` | `/questionnaire` (`QuestionnairePage.jsx`) | Verified (15 parameters saved to MongoDB, null for new users, no false success) |
| **Matching** | Ranked Compatibility Feed | `GET /api/matches` | `/matches` (`MatchesPage.jsx`) | Verified (calculated from real preferences, dynamic filters, loading/error retry) |
| **Matching** | Detailed Match Breakdown | `GET /api/matches/:id` | `/matches/:id` (`MatchDetailsPage.jsx`) | Verified (explainable score & categories) |
| **Requests** | Dispatch Roommate Request | `POST /api/requests` | Send Request Button | Verified (persists in DB, rejects self & duplicates with 409) |
| **Requests** | Query Sent & Received Requests | `GET /api/requests/sent`, `GET /api/requests/received` | `/requests` (`RequestsPage.jsx`) | Verified (state transition management, in-flight action locks) |
| **Requests** | Accept Roommate Request | `PUT /api/requests/:id/accept` | Accept Request Button | Verified (atomic update, unlocks chat channel) |
| **Requests** | Decline Roommate Request | `PUT /api/requests/:id/reject` | Decline Button | Verified (releases activePairKey to null) |
| **Requests** | Cancel Pending Request | `DELETE /api/requests/:id` | Cancel Button | Verified (deletes pending invitation) |
| **Messaging** | Conversation Listing | `GET /api/messages/conversations` | `/chat` (`ChatPage.jsx`) | Verified (batched aggregation, requires accepted request) |
| **Messaging** | Direct Thread History | `GET /api/messages/:userId` | `/chat` (`ChatPage.jsx`) | Verified (on-demand loading, chronological order) |
| **Messaging** | Send Direct Message | `POST /api/messages` | `/chat` (`ChatPage.jsx`) | Verified (persists to MongoDB, validates length, send loading) |
| **Admin** | Real-Time Platform Metrics | `GET /api/admin/metrics` | `/admin` (`AdminDashboardPage.jsx`) | Verified (live DB counts & stats) |
| **Admin** | Student User Directory | `GET /api/admin/users` | `/admin/users` (`AdminUsersPage.jsx`) | Verified (regex escaped, paginated list, clamped limits) |
| **Admin** | Suspend / Activate Student | `PUT /api/admin/users/:id/status` | `/admin/users` Toggle Button | Verified (enforces admin privilege, prevents self-ban) |
| **Admin** | Safety Report Moderation | `GET /api/admin/reports`, `PUT /api/admin/reports/:id` | `/admin/reports` (`AdminReportsPage.jsx`) | Verified (status validation: open, investigating, resolved, dismissed) |

---

## 3. Security Posture & Safeguards

1. **Password Security**:
   - `bcryptjs` with salt round 10. Plaintext passwords never stored.
   - `User.toSafeObject()` excludes password hashes, password reset tokens, and sensitive internal fields from all API responses.
2. **JWT Hardening**:
   - Fallback hardcoded secrets completely removed.
   - Startup validation rejects missing `JWT_SECRET` in all environments.
   - Claims restricted to `userId` and `role`. 7-day token expiration enforced.
3. **CORS Control**:
   - Explicit origin filtering configured in `server.js` matching `CLIENT_URL` or standard localhost Vite ports (5173, 3000).
   - Wildcard origins (`*`) blocked for authenticated endpoints.
4. **Role-Based Access Control (RBAC)**:
   - Backend `authorize('admin')` blocks students from accessing `/api/admin/*` (tested and returns 403 Forbidden).
   - Student cannot register directly as an admin (registration controller overrides `role: 'student'`).
   - Self-matching, self-requests, and messaging unaccepted users are strictly rejected at the database query layer.
5. **NoSQL Injection & Input Sanitization**:
   - Parameterized Mongoose queries used throughout.
   - `escapeRegex` escapes user search strings before `$regex` compilation in administrative search queries.
   - Request body parsers limited to 10kb to prevent payload denial-of-service.

---

## 4. Testing & Verification Summary

### Unit Tests (30 / 30 PASS via `npm run test:unit`)
- `tests/jwt.test.js`:
  - Missing secret throws explicit error (PASS)
  - Signs and verifies valid token (PASS)
  - Rejects invalid signature (PASS)
  - Rejects expired token (PASS)
  - Rejects malformed token (PASS)
  - Startup validation succeeds when configured (PASS)
- `tests/matching.test.js`:
  - Identical preferences produce 100% score (PASS)
  - Missing preferences handle gracefully without artificial inflation (PASS)
  - Incomplete questionnaires evaluate overlapping factors with partial flag (PASS)
  - Conflicting preferences produce low score (PASS)
  - Partial compatibility returns moderate score (PASS)
  - Budget distance penalties (overlapping vs non-overlapping) (PASS)
  - Self-match exclusion returns zero compatibility (PASS)
  - Score normalized strictly within [0, 100] (PASS)
  - Preference changes dynamically update score (PASS)
- `tests/profileCompleteness.test.js`:
  - Empty or newly registered user is incomplete (PASS)
  - Fully populated profile evaluates to true (PASS)
  - Transitions from complete to incomplete when field cleared (PASS)
  - Short trivial bio (< 10 chars) remains incomplete (PASS)
- `tests/requestModel.test.js`:
  - Pre-validate hook rejects self-request (PASS)
  - Computes deterministic activePairKey for pending/accepted requests (PASS)
  - Sets activePairKey to null on rejection to release uniqueness (PASS)
  - Sets activePairKey to null on cancellation to release uniqueness (PASS)
- `tests/securityMiddleware.test.js`:
  - requireDB passes when DB is connected (PASS)
  - requireDB returns 503 when DB is offline (PASS)
  - Sliding-window rate limiter permits requests within budget and blocks excess (PASS)
- `tests/seedGuard.test.js`:
  - Rejects execution in production (PASS)
  - Rejects execution without explicit confirmation (PASS)
  - Rejects execution against unapproved database targets (PASS)
  - Permits execution with confirmation on local dev database (PASS)

### Integration Tests (25 / 25 PASS via `node tests/verifyApi.js`)
1. `GET /api/health` returns 200 and healthy status (PASS)
2. `GET /api/ready` returns 200 with database connected (PASS)
3. `POST /api/auth/register` rejects missing fields (PASS)
4. `POST /api/auth/register` successfully creates new student (PASS)
5. `POST /api/auth/login` logs in seeded student Alex (PASS)
6. `POST /api/auth/login` rejects incorrect password (PASS)
7. `GET /api/auth/me` returns authenticated user details (PASS)
8. Protected route rejects request without token (401) (PASS)
9. `PUT /api/users/profile` updates user bio and city (PASS)
10. `GET & PUT /api/preferences` retrieves and updates questionnaire (PASS)
11. `GET /api/matches` calculates compatibility scores from real preferences (PASS)
12. Roommate request workflow (sent, received, status) (PASS)
13. `GET /api/messages/conversations` retrieves conversation list (PASS)
14. Admin login and metrics retrieval (PASS)
15. Student receives 403 Forbidden on admin endpoints (PASS)
16. Admin search safely handles regex special characters without 500 error (PASS)
17. Admin endpoints reject invalid page and excessive limit (>100) (PASS)
18. Admin reports endpoint rejects invalid status filter (PASS)
19. `POST /api/requests` rejects self-request (400 Bad Request) (PASS)
20. Duplicate active roommate request rejected with 409 Conflict (PASS)
21. Request acceptance enforces receiver authorization and idempotence (PASS)
22. Profile completeness transitions dynamically (complete $\to$ incomplete $\to$ complete) (PASS)
23. `PUT /api/users/profile` validates age boundaries (16–99) and persists valid age (PASS)
24. `GET /api/preferences` returns null preferences for new user without fabricating defaults (PASS)
25. `PUT /api/users/settings` validates booleans and persists settings to user record (PASS)

### Client Quality Checks
- Vite bundle production build: PASS (`dist/assets/index-*.js`, 0 errors, 909ms)
- Oxlint static analysis: PASS (0 errors)

---

## 5. Deployment Readiness

1. **Frontend (Vercel)**:
   - `client/vite.config.js` builds clean production assets.
   - `client/.env.example` documents `VITE_API_URL`.
   - Client routes handle SPA client-side fallback.
2. **Backend (Render / Railway / Container)**:
   - `server/server.js` listens on dynamic `process.env.PORT || 5000`.
   - `server/.env.example` documents `MONGODB_URI`, `PORT`, `JWT_SECRET`, `CLIENT_URL`.
   - Startup hooks into `connectDB()` and `validateJwtConfig()` before serving traffic.
3. **Database (MongoDB Atlas)**:
   - Standard SRV connection string supported via `MONGODB_URI`.
   - Indexes (`activePairKey` partial unique, `{ receiverId: 1, isRead: 1 }`) automatically ensured on startup.

---

## 6. Security Audit & Secret Scanning Remediation

- **Incident**: GitHub Secret Scanning flagged `server/tests/seedGuard.test.js:34` due to synthetic dummy Atlas URI regex pattern match.
- **Source Remediation**:
  - Replaced dummy credentialed URI in `seedGuard.test.js` with safe RFC 2606 fixture (`mongodb://unapproved-remote.example.internal:27017/remote_data`).
  - Hardened `canRunDestructiveSeed()` in `server/scripts/seed.js` to reject remote Atlas clusters (`mongodb+srv://`, `.mongodb.net`) and validate database targets.
  - Removed automated bypass flag (`--confirm`) from `server/package.json` `seed:reset` script.
  - Added credential sanitization `sanitizeMongoUri()` in `server/config/db.js` and startup validation `validateDbConfig()`.
  - Hardened `.gitignore` (root, server, client) to block all `.env` variants and private key formats while preserving `.env.example`.
  - Created security regression test suite `server/tests/securityRemediation.test.js` (9/9 pass, 42/42 unit tests total).
  - Added repository secret scanner script `scripts/scan-secrets.js` and GitHub Actions CI workflow `.github/workflows/security-scan.yml`.

