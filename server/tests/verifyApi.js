// server/tests/verifyApi.js
// Automated verification script for NestMatch REST API

const BASE_URL = 'http://localhost:5000/api';

async function runVerification() {
  console.log('==================================================');
  console.log('  NESTMATCH REST API VERIFICATION SUITE');
  console.log('==================================================\n');

  let passed = 0;
  let failed = 0;

  async function test(name, fn) {
    try {
      await fn();
      console.log(`[PASS] ${name}`);
      passed++;
    } catch (err) {
      console.error(`[FAIL] ${name}`);
      console.error(`       Error: ${err.message}`);
      failed++;
    }
  }

  // 1. Health check
  await test('GET /health returns 200 and healthy status', async () => {
    const res = await fetch(`${BASE_URL}/health`);
    const data = await res.json();
    if (!res.ok || data.status !== 'healthy') throw new Error(`Unexpected response: ${JSON.stringify(data)}`);
  });

  // 2. Readiness probe
  await test('GET /ready returns 200 with database connected', async () => {
    const res = await fetch(`${BASE_URL}/ready`);
    const data = await res.json();
    if (!res.ok || data.status !== 'ready' || !data.database.connected) {
      throw new Error(`Unexpected readiness response: ${JSON.stringify(data)}`);
    }
  });

  // 3. Register user validation
  await test('POST /auth/register rejects missing fields', async () => {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'incomplete@user.com' }),
    });
    const data = await res.json();
    if (res.status !== 400 || data.success !== false) {
      throw new Error(`Expected 400, got ${res.status}: ${JSON.stringify(data)}`);
    }
  });

  // 4. Register a new student
  const testStudentEmail = `test_student_${Date.now()}@university.edu`;
  let studentToken = '';
  await test('POST /auth/register successfully creates new student', async () => {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Automated Test User',
        email: testStudentEmail,
        password: 'Password123!',
        college: 'Test Tech University',
        city: 'Boston',
        course: 'B.Tech IT',
      }),
    });
    const data = await res.json();
    if (res.status !== 201 || !data.data?.token || data.data.user.role !== 'student') {
      throw new Error(`Registration failed: ${JSON.stringify(data)}`);
    }
    studentToken = data.data.token;
  });

  // 5. Login with seeded student Alex
  let alexToken = '';
  await test('POST /auth/login logs in seeded student Alex', async () => {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'alex@university.edu',
        password: 'Password123!',
      }),
    });
    const data = await res.json();
    if (!res.ok || !data.data?.token || data.data.user.email !== 'alex@university.edu') {
      throw new Error(`Login failed: ${JSON.stringify(data)}`);
    }
    alexToken = data.data.token;
  });

  // 6. Login rejects invalid password
  await test('POST /auth/login rejects incorrect password', async () => {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'alex@university.edu',
        password: 'WrongPassword999!',
      }),
    });
    const data = await res.json();
    if (res.status !== 401 || data.success !== false) {
      throw new Error(`Expected 401, got ${res.status}`);
    }
  });

  // 7. GET /auth/me returns current user
  await test('GET /auth/me returns authenticated user details', async () => {
    const res = await fetch(`${BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${alexToken}` },
    });
    const data = await res.json();
    if (!res.ok || data.data.user.email !== 'alex@university.edu') {
      throw new Error(`Auth me failed: ${JSON.stringify(data)}`);
    }
  });

  // 8. Reject unauthenticated access to protected route
  await test('Protected route rejects request without token (401)', async () => {
    const res = await fetch(`${BASE_URL}/auth/me`);
    const data = await res.json();
    if (res.status !== 401) throw new Error(`Expected 401, got ${res.status}`);
  });

  // 9. Update user profile
  await test('PUT /users/profile updates user bio and city', async () => {
    const res = await fetch(`${BASE_URL}/users/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${alexToken}`,
      },
      body: JSON.stringify({
        city: 'Cambridge',
        bio: 'Updated bio from automated test suite.',
      }),
    });
    const data = await res.json();
    if (!res.ok || data.data.user.city !== 'Cambridge') {
      throw new Error(`Profile update failed: ${JSON.stringify(data)}`);
    }
  });

  // 10. Preference CRUD
  await test('GET & PUT /preferences retrieves and updates user questionnaire', async () => {
    const getRes = await fetch(`${BASE_URL}/preferences`, {
      headers: { Authorization: `Bearer ${alexToken}` },
    });
    const getData = await getRes.json();
    if (!getRes.ok || !getData.data.preferences) throw new Error(`Failed to get preferences`);

    const putRes = await fetch(`${BASE_URL}/preferences`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${alexToken}`,
      },
      body: JSON.stringify({
        cleanliness: 'moderately_clean',
        budget: '5000-8000',
        sleepSchedule: 'night_owl',
        foodPreference: 'vegetarian',
        noiseTolerance: 'low',
        studyHabit: 'intense_study',
        socialHabit: 'introvert',
      }),
    });
    const putData = await putRes.json();
    if (!putRes.ok || putData.data.preferences.cleanliness !== 'moderately_clean') {
      throw new Error(`Failed to update preferences: ${JSON.stringify(putData)}`);
    }
  });

  // 11. Matching algorithm calculation
  await test('GET /matches calculates compatibility scores from real preferences', async () => {
    const res = await fetch(`${BASE_URL}/matches`, {
      headers: { Authorization: `Bearer ${alexToken}` },
    });
    const data = await res.json();
    if (!res.ok || !Array.isArray(data.data.matches) || data.data.matches.length === 0) {
      throw new Error(`Expected matches array, got: ${JSON.stringify(data)}`);
    }
    const topMatch = data.data.matches[0];
    if (typeof topMatch.compatibilityScore !== 'number' || topMatch.compatibilityScore < 0 || topMatch.compatibilityScore > 100) {
      throw new Error(`Invalid compatibility score: ${topMatch.compatibilityScore}`);
    }
    if (!topMatch.categoryBreakdown || !topMatch.commonPreferences) {
      throw new Error(`Match missing explainable score breakdown`);
    }
  });

  // 12. Requests CRUD & State Transitions
  await test('Roommate request workflow (sent, received, status)', async () => {
    const receivedRes = await fetch(`${BASE_URL}/requests/received`, {
      headers: { Authorization: `Bearer ${alexToken}` },
    });
    const receivedData = await receivedRes.json();
    if (!receivedRes.ok) throw new Error(`Failed to get received requests`);

    const sentRes = await fetch(`${BASE_URL}/requests/sent`, {
      headers: { Authorization: `Bearer ${alexToken}` },
    });
    const sentData = await sentRes.json();
    if (!sentRes.ok) throw new Error(`Failed to get sent requests`);
  });

  // 13. Messages / Chat
  await test('GET /messages/conversations retrieves user conversation list', async () => {
    const res = await fetch(`${BASE_URL}/messages/conversations`, {
      headers: { Authorization: `Bearer ${alexToken}` },
    });
    const data = await res.json();
    if (!res.ok || !Array.isArray(data.data.conversations)) {
      throw new Error(`Failed to fetch conversations: ${JSON.stringify(data)}`);
    }
  });

  // 14. Admin Authentication & Role Enforcement
  let adminToken = '';
  await test('Admin login and metrics retrieval', async () => {
    const loginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@nestmatch.edu',
        password: 'AdminSecret123!',
      }),
    });
    const loginData = await loginRes.json();
    if (!loginRes.ok || loginData.data.user.role !== 'admin') {
      throw new Error(`Admin login failed: ${JSON.stringify(loginData)}`);
    }
    adminToken = loginData.data.token;

    const metricsRes = await fetch(`${BASE_URL}/admin/metrics`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const metricsData = await metricsRes.json();
    if (!metricsRes.ok || typeof metricsData.data.totalUsers !== 'number') {
      throw new Error(`Admin metrics failed: ${JSON.stringify(metricsData)}`);
    }
  });

  // 15. Student Forbidden from Admin Endpoints
  await test('Student receives 403 Forbidden on admin endpoints', async () => {
    const res = await fetch(`${BASE_URL}/admin/metrics`, {
      headers: { Authorization: `Bearer ${alexToken}` },
    });
    const data = await res.json();
    if (res.status !== 403) {
      throw new Error(`Expected 403 Forbidden for student, got ${res.status}`);
    }
  });

  console.log('\n==================================================');
  console.log(`  VERIFICATION COMPLETED: ${passed} PASSED, ${failed} FAILED`);
  console.log('==================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runVerification().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
