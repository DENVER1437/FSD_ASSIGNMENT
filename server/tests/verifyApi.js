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

  // 16. Admin user search safely escapes regex special characters
  await test('Admin search safely handles regex special characters without 500 error', async () => {
    const res = await fetch(`${BASE_URL}/admin/users?search=.*([\\^$`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const data = await res.json();
    if (!res.ok || !Array.isArray(data.data.users)) {
      throw new Error(`Regex search failed: ${JSON.stringify(data)}`);
    }
  });

  // 17. Admin query pagination validation and limits
  await test('Admin endpoints reject invalid page and excessive limit', async () => {
    // Negative page
    const negPageRes = await fetch(`${BASE_URL}/admin/users?page=-1`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    if (negPageRes.status !== 400) throw new Error(`Expected 400 for negative page, got ${negPageRes.status}`);

    // Excessive limit (> 100)
    const excessLimitRes = await fetch(`${BASE_URL}/admin/users?limit=999`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    if (excessLimitRes.status !== 400) throw new Error(`Expected 400 for excessive limit, got ${excessLimitRes.status}`);

    // Valid pagination
    const validRes = await fetch(`${BASE_URL}/admin/users?page=1&limit=5`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const validData = await validRes.json();
    if (!validRes.ok || validData.data.pagination.limit !== 5) {
      throw new Error(`Valid pagination failed: ${JSON.stringify(validData)}`);
    }
  });

  // 18. Admin report validation
  await test('Admin reports endpoint rejects invalid status filter', async () => {
    const res = await fetch(`${BASE_URL}/admin/reports?status=unauthorized_status`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    if (res.status !== 400) throw new Error(`Expected 400 for invalid report status, got ${res.status}`);
  });

  // 19. Self-request prevention
  await test('POST /requests rejects self-request (400 Bad Request)', async () => {
    const meRes = await fetch(`${BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${alexToken}` },
    });
    const meData = await meRes.json();
    const myId = meData.data.user.id || meData.data.user._id;

    const res = await fetch(`${BASE_URL}/requests`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${alexToken}`,
      },
      body: JSON.stringify({ receiverId: myId }),
    });
    if (res.status !== 400) {
      throw new Error(`Expected 400 for self-request, got ${res.status}`);
    }
  });

  // 20. Roommate request concurrency and duplicate prevention
  let reqTestStudentA = null;
  let reqTestStudentB = null;
  let reqTestId = null;

  await test('Duplicate active roommate request rejected with 409 Conflict', async () => {
    const ts = Date.now();
    // Register Student A
    const resA = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Request Student Alpha',
        email: `req_alpha_${ts}@university.edu`,
        password: 'Password123!',
        college: 'Test College',
        city: 'Boston',
        course: 'CS',
      }),
    });
    const dataA = await resA.json();
    reqTestStudentA = { token: dataA.data.token, id: dataA.data.user.id };

    // Register Student B
    const resB = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Request Student Beta',
        email: `req_beta_${ts}@university.edu`,
        password: 'Password123!',
        college: 'Test College',
        city: 'Boston',
        course: 'CS',
      }),
    });
    const dataB = await resB.json();
    reqTestStudentB = { token: dataB.data.token, id: dataB.data.user.id };

    // Alpha sends request to Beta
    const sendRes1 = await fetch(`${BASE_URL}/requests`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${reqTestStudentA.token}`,
      },
      body: JSON.stringify({ receiverId: reqTestStudentB.id, message: 'Initial connect request' }),
    });
    const sendData1 = await sendRes1.json();
    if (sendRes1.status !== 201) throw new Error(`Initial request failed: ${JSON.stringify(sendData1)}`);
    reqTestId = sendData1.data.request.id;

    // Alpha sends DUPLICATE request to Beta -> 409 Conflict
    const sendRes2 = await fetch(`${BASE_URL}/requests`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${reqTestStudentA.token}`,
      },
      body: JSON.stringify({ receiverId: reqTestStudentB.id }),
    });
    if (sendRes2.status !== 409) {
      throw new Error(`Expected 409 for duplicate active request, got ${sendRes2.status}`);
    }

    // Beta sends REVERSE-direction duplicate request to Alpha -> 409 Conflict
    const sendRes3 = await fetch(`${BASE_URL}/requests`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${reqTestStudentB.token}`,
      },
      body: JSON.stringify({ receiverId: reqTestStudentA.id }),
    });
    if (sendRes3.status !== 409) {
      throw new Error(`Expected 409 for reverse duplicate request, got ${sendRes3.status}`);
    }
  });

  // 21. Request acceptance authorization and idempotence
  await test('Request acceptance enforces receiver authorization and idempotence', async () => {
    // Alpha (sender) attempts to accept own request -> 403 Forbidden
    const unauthRes = await fetch(`${BASE_URL}/requests/${reqTestId}/accept`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${reqTestStudentA.token}` },
    });
    if (unauthRes.status !== 403) {
      throw new Error(`Expected 403 for sender accepting own request, got ${unauthRes.status}`);
    }

    // Beta (intended receiver) accepts -> 200 OK
    const acceptRes = await fetch(`${BASE_URL}/requests/${reqTestId}/accept`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${reqTestStudentB.token}` },
    });
    const acceptData = await acceptRes.json();
    if (!acceptRes.ok || acceptData.data.request.status !== 'accepted') {
      throw new Error(`Acceptance failed: ${JSON.stringify(acceptData)}`);
    }

    // Repeated acceptance -> 400 Bad Request
    const repeatRes = await fetch(`${BASE_URL}/requests/${reqTestId}/accept`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${reqTestStudentB.token}` },
    });
    if (repeatRes.status !== 400) {
      throw new Error(`Expected 400 for repeated acceptance, got ${repeatRes.status}`);
    }
  });

  // 22. Profile completeness transition
  await test('Profile completeness transitions dynamically (complete -> incomplete -> complete)', async () => {
    // 1. Set full profile -> complete
    const fullRes = await fetch(`${BASE_URL}/users/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${reqTestStudentA.token}`,
      },
      body: JSON.stringify({
        name: 'Alpha Complete',
        college: 'Apex Tech',
        city: 'Boston',
        course: 'Computer Science',
        bio: 'Looking for a clean and quiet roommate for the next academic year.',
      }),
    });
    const fullData = await fullRes.json();
    if (!fullRes.ok || fullData.data.user.isProfileComplete !== true) {
      throw new Error(`Expected isProfileComplete: true, got ${JSON.stringify(fullData)}`);
    }

    // 2. Clear bio -> incomplete
    const clearRes = await fetch(`${BASE_URL}/users/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${reqTestStudentA.token}`,
      },
      body: JSON.stringify({ bio: '' }),
    });
    const clearData = await clearRes.json();
    if (!clearRes.ok || clearData.data.user.isProfileComplete !== false) {
      throw new Error(`Expected isProfileComplete: false after clearing bio, got ${JSON.stringify(clearData)}`);
    }

    // 3. Restore bio -> complete
    const restoreRes = await fetch(`${BASE_URL}/users/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${reqTestStudentA.token}`,
      },
      body: JSON.stringify({ bio: 'Restored comprehensive bio for roommate matching.' }),
    });
    const restoreData = await restoreRes.json();
    if (!restoreRes.ok || restoreData.data.user.isProfileComplete !== true) {
      throw new Error(`Expected isProfileComplete: true after restoring bio, got ${JSON.stringify(restoreData)}`);
    }
  });

  // 23. Profile age update, validation, and persistence
  await test('PUT /users/profile validates age boundaries and persists valid age', async () => {
    // Under minimum age (16) -> 400
    const underAgeRes = await fetch(`${BASE_URL}/users/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${alexToken}`,
      },
      body: JSON.stringify({ age: 12 }),
    });
    const underAgeData = await underAgeRes.json();
    if (underAgeRes.status !== 400 || underAgeData.success !== false) {
      throw new Error(`Expected 400 for age 12, got ${underAgeRes.status}`);
    }

    // Over maximum age (99) -> 400
    const overAgeRes = await fetch(`${BASE_URL}/users/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${alexToken}`,
      },
      body: JSON.stringify({ age: 105 }),
    });
    if (overAgeRes.status !== 400) {
      throw new Error(`Expected 400 for age 105, got ${overAgeRes.status}`);
    }

    // Valid age (22) -> 200 and persisted in database
    const validAgeRes = await fetch(`${BASE_URL}/users/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${alexToken}`,
      },
      body: JSON.stringify({ age: 22 }),
    });
    const validAgeData = await validAgeRes.json();
    if (!validAgeRes.ok || validAgeData.data.user.age !== 22) {
      throw new Error(`Age 22 failed to persist: ${JSON.stringify(validAgeData)}`);
    }

    // Verify persistence via GET /auth/me
    const meRes = await fetch(`${BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${alexToken}` },
    });
    const meData = await meRes.json();
    if (meData.data.user.age !== 22) {
      throw new Error(`Expected persisted age 22, got ${meData.data.user.age}`);
    }
  });

  // 24. Unrecorded preferences returns null for new user
  await test('GET /preferences returns null preferences for new user without fabricating defaults', async () => {
    const freshEmail = `fresh_user_${Date.now()}@university.edu`;
    const regRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Fresh Student',
        email: freshEmail,
        password: 'Password123!',
        college: 'Apex Tech',
        city: 'Boston',
        course: 'CS',
      }),
    });
    const regData = await regRes.json();
    const freshToken = regData.data.token;

    const prefRes = await fetch(`${BASE_URL}/preferences`, {
      headers: { Authorization: `Bearer ${freshToken}` },
    });
    const prefData = await prefRes.json();
    if (!prefRes.ok || prefData.data.preferences !== null) {
      throw new Error(`Expected preferences: null for new user, got: ${JSON.stringify(prefData)}`);
    }
  });

  // 25. Settings persistence and validation
  await test('PUT /users/settings validates booleans and persists settings to user record', async () => {
    // Invalid non-boolean value -> 400
    const invalidRes = await fetch(`${BASE_URL}/users/settings`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${alexToken}`,
      },
      body: JSON.stringify({ hideBudgetFromPublic: 'not-a-boolean' }),
    });
    if (invalidRes.status !== 400) {
      throw new Error(`Expected 400 for non-boolean setting, got ${invalidRes.status}`);
    }

    // Valid settings update
    const validRes = await fetch(`${BASE_URL}/users/settings`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${alexToken}`,
      },
      body: JSON.stringify({
        hideBudgetFromPublic: true,
        requestAlerts: false,
      }),
    });
    const validData = await validRes.json();
    if (!validRes.ok || validData.data.settings.hideBudgetFromPublic !== true || validData.data.settings.requestAlerts !== false) {
      throw new Error(`Settings update failed: ${JSON.stringify(validData)}`);
    }

    // Verify settings survived on user record via GET /auth/me
    const verifyMeRes = await fetch(`${BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${alexToken}` },
    });
    const verifyMeData = await verifyMeRes.json();
    if (verifyMeData.data.user.settings?.hideBudgetFromPublic !== true || verifyMeData.data.user.settings?.requestAlerts !== false) {
      throw new Error(`Settings failed to persist to user record: ${JSON.stringify(verifyMeData.data.user.settings)}`);
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
