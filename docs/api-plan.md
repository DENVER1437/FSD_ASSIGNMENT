# NestMatch — REST API Contract Plan

## 1. Global API Standards

- **Base URL (Local)**: `http://localhost:5000/api`
- **Base URL (Production)**: `https://<render-backend-url>/api`
- **Data Format**: `application/json` for requests and responses
- **Authentication**: JWT Bearer Token in `Authorization` header:
  ```http
  Authorization: Bearer <token>
  ```

### Standard Error Response Structure
```json
{
  "status": "error",
  "message": "Human-readable error description",
  "errors": [] // Optional validation details
}
```

### Standard Success Response Structure
```json
{
  "status": "success",
  "data": {} // Payload object or array
}
```

---

## 2. API Endpoints Specification

### 2.1 System & Health

#### `GET /api/health`
- **Description**: Verifies backend server health and phase status.
- **Auth**: Public
- **Response `200 OK`**:
  ```json
  {
    "status": "success",
    "project": "NestMatch – Smart Roommate Compatibility Finder",
    "phase": "Phase 0 — Project Foundation",
    "timestamp": "2026-10-13T16:50:00.000Z"
  }
  ```

---

### 2.2 Authentication (`/api/auth`)

#### `POST /api/auth/register`
- **Description**: Registers a new student account.
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
    "status": "success",
    "token": "eyJhbGciOiJIUzI1NiIsIn...",
    "user": {
      "id": "64f1a2b3c4d5e6f7a8b9c0d1",
      "name": "Alex Johnson",
      "email": "alex@university.edu",
      "role": "student"
    }
  }
  ```

#### `POST /api/auth/login`
- **Description**: Authenticates existing student/admin and returns JWT.
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
    "status": "success",
    "token": "eyJhbGciOiJIUzI1NiIsIn...",
    "user": {
      "id": "64f1a2b3c4d5e6f7a8b9c0d1",
      "name": "Alex Johnson",
      "email": "alex@university.edu",
      "role": "student"
    }
  }
  ```

#### `GET /api/auth/me`
- **Description**: Fetches the currently authenticated session's user profile.
- **Auth**: Private (`student` or `admin`)
- **Response `200 OK`**:
  ```json
  {
    "status": "success",
    "user": {
      "id": "64f1a2b3c4d5e6f7a8b9c0d1",
      "name": "Alex Johnson",
      "email": "alex@university.edu",
      "role": "student"
    }
  }
  ```

---

### 2.3 User Profile (`/api/users`)

#### `GET /api/users/profile`
- **Description**: Retrieves full profile of the logged-in student.
- **Auth**: Private
- **Response `200 OK`**:
  ```json
  {
    "status": "success",
    "profile": {
      "name": "Alex Johnson",
      "email": "alex@university.edu",
      "college": "State Engineering University",
      "city": "Boston",
      "course": "B.Tech Computer Science",
      "bio": "Enjoys quiet study hours, coding, and playing badminton.",
      "profileImage": "https://..."
    }
  }
  ```

#### `PUT /api/users/profile`
- **Description**: Updates profile details (bio, college, city, course).
- **Auth**: Private
- **Request Body**:
  ```json
  {
    "bio": "Updated bio text",
    "city": "Cambridge"
  }
  ```
- **Response `200 OK`**:
  ```json
  {
    "status": "success",
    "message": "Profile updated successfully"
  }
  ```

---

### 2.4 Preferences & Questionnaire (`/api/preferences`)

#### `GET /api/preferences`
- **Description**: Retrieves saved questionnaire responses for the active user.
- **Auth**: Private
- **Response `200 OK`**: Returns current preference document.

#### `POST /api/preferences`
- **Description**: Submits the initial compatibility questionnaire responses.
- **Auth**: Private
- **Request Body**:
  ```json
  {
    "budget": "5000-8000",
    "sleepSchedule": "night_owl",
    "wakeUpSchedule": "7am_9am",
    "foodPreference": "vegetarian",
    "cleanliness": "meticulous",
    "noisePreference": "moderate",
    "studyHabit": "in_room_quiet",
    "socialLevel": "ambivert",
    "smokingPreference": "strictly_non_smoker",
    "guestPreference": "occasional_guests",
    "preferredLocation": "Downtown"
  }
  ```
- **Response `201 Created`**: Returns saved preference document.

#### `PUT /api/preferences`
- **Description**: Updates existing questionnaire answers.
- **Auth**: Private
- **Response `200 OK`**: Returns updated preferences.

---

### 2.5 Matches & Compatibility Engine (`/api/matches`)

#### `GET /api/matches`
- **Description**: Computes and returns candidate roommates ranked by compatibility score.
- **Auth**: Private (`student`)
- **Query Params**: `?minScore=60&budget=5000-8000`
- **Response `200 OK`**:
  ```json
  {
    "status": "success",
    "matches": [
      {
        "userId": "64f1b2c3d4e5f6a7b8c9d0e2",
        "name": "Jordan Lee",
        "college": "State Engineering University",
        "score": 92,
        "commonPreferences": ["Cleanliness: meticulous", "Sleep: night_owl", "Food: vegetarian"],
        "differences": ["Noise: moderate vs silent"]
      }
    ]
  }
  ```

#### `GET /api/matches/:id`
- **Description**: Detailed compatibility breakdown for a specific candidate match.
- **Auth**: Private (`student`)
- **Response `200 OK`**: Full comparative analysis with trait-by-trait alignment.

---

### 2.6 Roommate Requests (`/api/requests`)

#### `POST /api/requests`
- **Description**: Dispatches a roommate connection request to a candidate.
- **Auth**: Private (`student`)
- **Request Body**:
  ```json
  {
    "receiverId": "64f1b2c3d4e5f6a7b8c9d0e2"
  }
  ```
- **Response `201 Created`**:
  ```json
  {
    "status": "success",
    "message": "Roommate request sent"
  }
  ```

#### `GET /api/requests`
- **Description**: Retrieves list of sent and received connection requests.
- **Auth**: Private (`student`)
- **Response `200 OK`**: List of requests with sender/receiver details and statuses.

#### `PUT /api/requests/:id`
- **Description**: Responds to a received request by accepting or rejecting it.
- **Auth**: Private (`student`)
- **Request Body**:
  ```json
  {
    "status": "accepted" // or "rejected"
  }
  ```
- **Response `200 OK`**: Updated request state.

---

### 2.7 Messages (`/api/messages`)

#### `GET /api/messages/:userId`
- **Description**: Fetches message history between two mutually accepted roommates.
- **Auth**: Private (`student`)
- **Response `200 OK`**: Array of message logs sorted chronologically.

#### `POST /api/messages`
- **Description**: Posts a new direct message to an accepted roommate.
- **Auth**: Private (`student`)
- **Request Body**:
  ```json
  {
    "receiverId": "64f1b2c3d4e5f6a7b8c9d0e2",
    "message": "Hey! Would you like to check out the 2BHK apartment near campus?"
  }
  ```
- **Response `201 Created`**: Created message record.

---

### 2.8 Admin (`/api/admin`)

#### `GET /api/admin/users`
- **Description**: Paginated directory of registered students with profile summaries.
- **Auth**: Private (`admin` only)
- **Response `200 OK`**: Users list and total count.

#### `DELETE /api/admin/users/:id`
- **Description**: Deletes an abusive or violating user account.
- **Auth**: Private (`admin` only)
- **Response `200 OK`**: Deletion confirmation.

#### `PUT /api/admin/users/:id/status`
- **Description**: Toggles user account status (e.g., active, suspended).
- **Auth**: Private (`admin` only)
- **Request Body**:
  ```json
  {
    "status": "suspended"
  }
  ```
- **Response `200 OK`**: Status update confirmation.
