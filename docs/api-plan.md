# NestMatch — REST API Contract Plan

## 1. Global API Standards

- **Base URL (Local)**: `http://localhost:5000/api`
- **Base URL (Production)**: `https://<render-backend-url>/api`
- **Data Format**: `application/json` for requests and responses
- **Authentication**: JWT Bearer Token in `Authorization` header:
  ```http
  Authorization: Bearer <token>
  ```

### Standard Success Response Structure
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {}
}
```

### Standard Error Response Structure
```json
{
  "success": false,
  "message": "Human-readable error description",
  "errors": []
}
```

---

## 2. API Endpoints Specification

### 2.1 System & Health Probes

#### `GET /api/health`
- **Description**: Verifies backend server process health.
- **Auth**: Public
- **Response `200 OK`**:
  ```json
  {
    "status": "healthy",
    "project": "NestMatch – Smart Roommate Compatibility Finder",
    "timestamp": "2026-10-18T10:30:00.000Z"
  }
  ```

#### `GET /api/ready`
- **Description**: Database readiness probe verifying live MongoDB connectivity (`mongoose.connection.readyState === 1`).
- **Auth**: Public
- **Response `200 OK`**:
  ```json
  {
    "status": "ready",
    "database": {
      "status": "connected",
      "connected": true,
      "host": "127.0.0.1",
      "name": "nestmatch"
    }
  }
  ```
- **Response `503 Service Unavailable`** (When MongoDB disconnected):
  ```json
  {
    "status": "not_ready",
    "database": {
      "status": "disconnected",
      "connected": false
    }
  }
  ```

---

### 2.2 Authentication (`/api/auth`)

#### `POST /api/auth/register`
- **Description**: Registers a new student account, hashes password via bcryptjs, and returns safe user profile and JWT.
- **Auth**: Public
- **Request Body**:
  ```json
  {
    "name": "Alex Johnson",
    "email": "alex@university.edu",
    "password": "Password123!",
    "college": "State Engineering University",
    "city": "Boston",
    "course": "B.Tech Computer Science"
  }
  ```
- **Response `201 Created`**:
  ```json
  {
    "success": true,
    "message": "Student registration successful",
    "data": {
      "user": {
        "id": "67b3f1...",
        "name": "Alex Johnson",
        "email": "alex@university.edu",
        "role": "student",
        "college": "State Engineering University",
        "city": "Boston"
      },
      "token": "eyJhbGciOiJIUzI1NiIsIn..."
    }
  }
  ```

#### `POST /api/auth/login`
- **Description**: Authenticates existing credentials and returns JWT.
- **Auth**: Public
- **Request Body**:
  ```json
  {
    "email": "alex@university.edu",
    "password": "Password123!"
  }
  ```
- **Response `200 OK`**:
  ```json
  {
    "success": true,
    "message": "Login successful",
    "data": {
      "user": {
        "id": "67b3f1...",
        "name": "Alex Johnson",
        "email": "alex@university.edu",
        "role": "student"
      },
      "token": "eyJhbGciOiJIUzI1NiIsIn..."
    }
  }
  ```

#### `GET /api/auth/me`
- **Description**: Returns authenticated session user profile.
- **Auth**: Private (`protect`)
- **Response `200 OK`**:
  ```json
  {
    "success": true,
    "data": {
      "user": {
        "id": "67b3f1...",
        "name": "Alex Johnson",
        "email": "alex@university.edu",
        "role": "student"
      }
    }
  }
  ```

#### `POST /api/auth/logout`
- **Description**: Clears authentication state.
- **Auth**: Public / Private
- **Response `200 OK`**:
  ```json
  {
    "success": true,
    "message": "Logged out successfully"
  }
  ```

---

### 2.3 Student Profile (`/api/users`)

#### `GET /api/users/profile`
- **Description**: Retrieves current student's detailed profile.
- **Auth**: Private (`protect`)
- **Response `200 OK`**:
  ```json
  {
    "success": true,
    "data": {
      "user": {
        "id": "67b3f1...",
        "name": "Alex Johnson",
        "email": "alex@university.edu",
        "college": "State Engineering University",
        "city": "Boston",
        "course": "B.Tech Computer Science",
        "bio": "CS junior passionate about distributed systems and quiet study environments."
      }
    }
  }
  ```

#### `PUT /api/users/profile`
- **Description**: Updates student editable profile fields.
- **Auth**: Private (`protect`)
- **Request Body**:
  ```json
  {
    "name": "Alex Johnson",
    "college": "Apex Institute",
    "course": "Computer Engineering",
    "city": "Boston",
    "bio": "Updated bio text."
  }
  ```
- **Response `200 OK`**:
  ```json
  {
    "success": true,
    "message": "Profile updated successfully",
    "data": {
      "user": { "..." : "..." }
    }
  }
  ```

---

### 2.4 Lifestyle Preferences (`/api/preferences`)

#### `GET /api/preferences`
- **Description**: Retrieves current user's lifestyle survey answers.
- **Auth**: Private (`protect`)
- **Response `200 OK`**:
  ```json
  {
    "success": true,
    "data": {
      "preferences": {
        "sleepSchedule": "night_owl",
        "cleanliness": "meticulous",
        "budget": "5000-8000",
        "foodPreference": "vegetarian",
        "noisePreference": "silent",
        "studyHabit": "in_room_quiet",
        "socialLevel": "ambivert",
        "smokingPreference": "strictly_non_smoker"
      }
    }
  }
  ```

#### `PUT /api/preferences`
- **Description**: Saves or updates 15 questionnaire responses.
- **Auth**: Private (`protect`)
- **Request Body**: JSON object containing preference keys.
- **Response `200 OK`**:
  ```json
  {
    "success": true,
    "message": "Preferences updated successfully",
    "data": { "preferences": { "..." : "..." } }
  }
  ```

---

### 2.5 Roommate Matches (`/api/matches`)

#### `GET /api/matches`
- **Description**: Calculates and returns candidate students ranked by compatibility score.
- **Auth**: Private (`protect`)
- **Query Parameters**: `search`, `college`, `city`, `minScore`, `sortBy` (`compatibility` | `name`)
- **Response `200 OK`**:
  ```json
  {
    "success": true,
    "data": {
      "matches": [
        {
          "id": "match-67b3f2...",
          "userId": "67b3f2...",
          "user": { "name": "Jordan Lee", "college": "Apex Institute", "..." : "..." },
          "score": 94,
          "compatibilityLevel": "Excellent Match",
          "commonPreferences": ["Night Owl sleep routine", "Meticulous cleanliness"],
          "differences": ["Moderate noise tolerance vs. your silent focus preference"],
          "categoryBreakdown": [
            { "name": "Sleep Schedule", "score": 100, "status": "Harmonious" },
            { "name": "Budget Parity", "score": 100, "status": "Matched" }
          ]
        }
      ],
      "total": 5
    }
  }
  ```

#### `GET /api/matches/:id`
- **Description**: Detailed compatibility breakdown for a specific candidate.
- **Auth**: Private (`protect`)
- **Response `200 OK`**: Single match breakdown object.

---

### 2.6 Roommate Requests (`/api/requests`)

#### `POST /api/requests`
- **Description**: Sends a roommate request to a candidate student.
- **Auth**: Private (`protect`)
- **Request Body**:
  ```json
  {
    "receiverId": "67b3f2...",
    "message": "Hi Jordan! Loved your profile, let's explore a flat near campus."
  }
  ```
- **Response `201 Created`**:
  ```json
  {
    "success": true,
    "message": "Roommate request sent successfully",
    "data": {
      "request": {
        "id": "67b3f9...",
        "senderId": "67b3f1...",
        "receiverId": "67b3f2...",
        "status": "pending"
      }
    }
  }
  ```

#### `GET /api/requests/received`
- **Description**: Retrieves list of pending received requests.
- **Auth**: Private (`protect`)

#### `GET /api/requests/sent`
- **Description**: Retrieves list of pending sent requests.
- **Auth**: Private (`protect`)

#### `PUT /api/requests/:id/accept`
- **Description**: Accepts an incoming request; unlocks direct messaging between the two students.
- **Auth**: Private (`protect`)

#### `PUT /api/requests/:id/reject`
- **Description**: Declines an incoming request.
- **Auth**: Private (`protect`)

#### `DELETE /api/requests/:id`
- **Description**: Cancels an outgoing pending request.
- **Auth**: Private (`protect`)

---

### 2.7 Direct Messaging (`/api/messages`)

#### `GET /api/messages/conversations`
- **Description**: Lists active conversation threads (requires an accepted request).
- **Auth**: Private (`protect`)

#### `GET /api/messages/:userId`
- **Description**: Retrieves message history with a connected roommate.
- **Auth**: Private (`protect`)

#### `POST /api/messages`
- **Description**: Sends a message to an accepted connection.
- **Auth**: Private (`protect`)
- **Request Body**:
  ```json
  {
    "receiverId": "67b3f2...",
    "content": "Hey! Did you check out the 2BHK flat listing on Beacon St?"
  }
  ```

---

### 2.8 Administration (`/api/admin`)

*All administrative endpoints require `authorize('admin')` role check.*

#### `GET /api/admin/metrics`
- **Description**: Platform summary statistics.
- **Auth**: Admin Private
- **Response `200 OK`**:
  ```json
  {
    "success": true,
    "data": {
      "metrics": {
        "totalUsers": 6,
        "activeStudents": 5,
        "suspendedUsers": 0,
        "totalRequests": 3,
        "acceptedConnections": 1,
        "pendingReports": 2
      }
    }
  }
  ```

#### `GET /api/admin/users`
- **Description**: Paginated student user directory.
- **Auth**: Admin Private

#### `PUT /api/admin/users/:id/status`
- **Description**: Toggles student account status (`active` | `suspended`).
- **Auth**: Admin Private
- **Request Body**: `{ "status": "suspended" }`

#### `GET /api/admin/reports`
- **Description**: List student safety reports.
- **Auth**: Admin Private

#### `PUT /api/admin/reports/:id/status`
- **Description**: Updates report status (`investigating` | `resolved` | `dismissed`).
- **Auth**: Admin Private
