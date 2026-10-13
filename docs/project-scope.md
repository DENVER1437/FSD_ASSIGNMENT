# NestMatch — Project Scope Document

## 1. Project Title
**NestMatch – Smart Roommate Compatibility Finder**

---

## 2. Problem Statement
Finding a compatible roommate is one of the most critical yet stressful challenges faced by college students moving into shared housing or hostels. Random or informal roommate selection frequently leads to severe lifestyle friction, including:
- Incompatible sleep and wake schedules (night owls vs. early birds).
- Conflicting hygiene, cleanliness, and chore sharing standards.
- Disparities in budget allocations for rent, utilities, and grocery sharing.
- Opposing study environment needs (silent study vs. collaborative/social).
- Dietary restrictions and smoking/guest policies.

These conflicts harm student mental well-being, interpersonal relationships, and academic performance. Existing rental classifieds focus solely on property listings rather than roommate lifestyle harmony.

---

## 3. Main Objective
NestMatch provides an intelligent, lifestyle-based roommate matching platform tailored for university students. The platform:
1. Enables students to register and create verified academic profiles.
2. Captures nuanced lifestyle habits and room-sharing preferences across key domestic dimensions.
3. Calculates an **explainable compatibility score** between student candidates using a transparent, weighted algorithm.
4. Allows students to explore potential matches, inspect compatibility breakdowns, send roommate requests, and connect upon mutual consent.

---

## 4. Scope Freeze & Feature Categorization

### 4.1 Core Features (Mandatory Scope)
All core features must be completely built, verified, and integrated into the primary user flow:
1. **Landing Page**: Value proposition, feature highlights, call-to-action buttons.
2. **Student Registration**: Secure student account creation with academic credentials.
3. **Student Login**: JWT-based session management and authentication.
4. **Student Profile**: Personal details, academic course, bio, college name, city.
5. **Lifestyle Preferences**: Data entry for budget, sleep, cleanliness, noise, study habits, etc.
6. **Compatibility Questionnaire**: Interactive multi-step lifestyle survey.
7. **Compatibility Calculation**: Algorithmic scoring evaluating mutual preference alignment.
8. **Find Matches**: Feed of prospective roommates ranked by compatibility score.
9. **Match Details**: Deep view of a candidate's profile and matching traits.
10. **Compatibility Explanation**: Transparent breakdown of shared preferences vs. divergent habits.
11. **Roommate Requests**: Direct request workflow (send, view incoming/outgoing requests).
12. **Accept/Reject Requests**: Mutual handshake mechanics transitioning request states.
13. **Responsive Design**: Flawless layout adaptability across mobile, tablet, and desktop viewports.
14. **MongoDB Database**: Document-oriented data persistence with Mongoose schemas.
15. **REST API**: Structured, decoupled Express.js API contracts.
16. **Version Control**: Git workflow with structured conventional commits.
17. **Production Deployment**: Cloud deployment across Vercel, Render, and MongoDB Atlas.

### 4.2 Secondary Features (Post-Core Stabilization)
To be implemented strictly after all core features are stabilized:
1. **Student Dashboard**: Aggregated overview of match scores, pending requests, and activity.
2. **Match Filters**: Advanced filter controls (budget slider, sleep schedule, college, city).
3. **Admin Dashboard**: System health metrics, user counters, and operational statistics.
4. **Admin User Management**: Listing, activation, deactivation, and moderation of accounts.
5. **User Reports & Moderation**: Student flag submission and administrative review workflow.
6. **Analytics Charts**: Visual distribution of student compatibility factors.

### 4.3 Deferred / Out-of-Scope (Prohibited During Early Phases)
The following items are deferred until future releases to protect milestone delivery:
- Socket.IO real-time instant messaging (simple polling/REST messaging planned first).
- NestBot / AI Chatbots.
- Push notification microservices.
- Cloudinary media CDN integration (initially using URL/default avatars).
- Heavy Machine Learning / AI recommendation engines.
- Payment gateway integration.
- Google Maps Platform geocoding.
- Native mobile applications (React Native / Flutter).
- Distributed microservice infrastructure.

---

## 5. Technology Stack Lock

| Component | Selected Technology | Rationale |
|---|---|---|
| **Frontend Framework** | React.js (v19) + Vite | High-performance bundling, modular component tree, rapid HMR. |
| **CSS Framework** | Tailwind CSS (v3) | Utility-first, predictable styling, zero CSS bloat, responsive design. |
| **Client Routing** | React Router DOM (v7) | Declarative single-page routing with layout nesting. |
| **HTTP Client** | Axios | Robust request/response interceptors and standardized API calls. |
| **Runtime & Server** | Node.js + Express.js | Industry-standard JavaScript backend ecosystem. |
| **Database** | MongoDB + Mongoose | Schema-flexible document database ideally suited for nested survey data. |
| **Authentication** | JWT (JSON Web Tokens) + bcryptjs | Stateless authorization with salt-hashed password security. |
| **Frontend Host** | Vercel | Seamless CI/CD git integration for static frontend single-page apps. |
| **Backend Host** | Render | Managed web service runtime for Express Node.js servers. |
| **Database Host** | MongoDB Atlas | Managed cloud cluster with automated failover and backups. |
