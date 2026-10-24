import test from 'node:test';
import assert from 'node:assert/strict';
import { checkProfileCompleteness } from '../controllers/userController.js';

test('Profile Completeness - Empty or newly registered user is incomplete', () => {
  const newUser = {
    name: 'Maya Patel',
    email: 'maya@university.edu',
    college: '',
    course: '',
    city: '',
    bio: '',
  };

  assert.equal(checkProfileCompleteness(newUser), false);
  assert.equal(checkProfileCompleteness(null), false);
  assert.equal(checkProfileCompleteness({}), false);
});

test('Profile Completeness - Fully populated profile evaluates to true', () => {
  const completeUser = {
    name: 'Maya Patel',
    college: 'Nirma University',
    course: 'B.Tech Computer Science',
    city: 'Ahmedabad',
    bio: 'Junior studying computer science. Quiet study lover and night owl.',
  };

  assert.equal(checkProfileCompleteness(completeUser), true);
});

test('Profile Completeness - Transitions from complete to incomplete when required field is cleared', () => {
  const user = {
    name: 'Maya Patel',
    college: 'Nirma University',
    course: 'B.Tech Computer Science',
    city: 'Ahmedabad',
    bio: 'Junior studying computer science. Quiet study lover and night owl.',
  };

  // Initially complete
  assert.equal(checkProfileCompleteness(user), true);

  // User later deletes or empties bio
  user.bio = '   ';
  assert.equal(checkProfileCompleteness(user), false);

  // User restores bio but clears college
  user.bio = 'Junior studying computer science. Quiet study lover and night owl.';
  user.college = '';
  assert.equal(checkProfileCompleteness(user), false);

  // User restores college
  user.college = 'Nirma University';
  assert.equal(checkProfileCompleteness(user), true);
});

test('Profile Completeness - Short trivial bio (< 10 chars) remains incomplete', () => {
  const user = {
    name: 'Maya Patel',
    college: 'Nirma University',
    course: 'B.Tech',
    city: 'Ahmedabad',
    bio: 'Hello!', // 6 chars
  };

  assert.equal(checkProfileCompleteness(user), false);
});
