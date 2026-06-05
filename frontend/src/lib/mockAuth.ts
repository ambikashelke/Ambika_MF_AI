/**
 * mockAuth.ts
 * -----------
 * Lightweight local auth layer so signup/login works without
 * Supabase email confirmation or a live backend.
 *
 * - Demo account always available:  demo@mindforge.ai / MindForge123
 * - New signups are stored in localStorage under "mf_users"
 * - Active session stored under "mf_session"
 */

const USERS_KEY = "mf_users";
const SESSION_KEY = "mf_session";

// ---------- Types ----------

export interface MockUser {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

export interface MockSession {
  user: MockUser;
  token: string;
}

// ---------- Helpers ----------

function loadUsers(): Record<string, { passwordHash: string; user: MockUser }> {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) ?? "{}");
  } catch {
    return {};
  }
}

function saveUsers(users: Record<string, { passwordHash: string; user: MockUser }>) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

// Very simple hash — good enough for a local demo; NOT for production.
function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (Math.imul(31, hash) + str.charCodeAt(i)) | 0;
  }
  return hash.toString(16);
}

// ---------- Public API ----------

/** Sign up a new user. Returns the new session or throws a readable error. */
export function mockSignUp(
  email: string,
  password: string,
  name: string
): MockSession {
  const users = loadUsers();
  const key = email.toLowerCase().trim();

  // Block the demo account from being re-registered
  if (key === "demo@mindforge.ai") {
    throw new Error("This email belongs to the demo account. Please log in directly.");
  }

  if (users[key]) {
    throw new Error("An account with this email already exists. Please log in.");
  }

  if (password.length < 6) {
    throw new Error("Password must be at least 6 characters.");
  }

  const newUser: MockUser = {
    id: `user_${Date.now()}`,
    email: key,
    name: name.trim() || key.split("@")[0],
    createdAt: new Date().toISOString(),
  };

  users[key] = { passwordHash: simpleHash(password), user: newUser };
  saveUsers(users);

  const session: MockSession = { user: newUser, token: `tok_${newUser.id}` };
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return session;
}

/** Sign in. Returns session or throws a readable error. */
export function mockSignIn(email: string, password: string): MockSession {
  const key = email.toLowerCase().trim();

  // Always-available demo account
  if (key === "demo@mindforge.ai") {
    if (password !== "MindForge123") {
      throw new Error("Incorrect password for demo account.");
    }
    const demoUser: MockUser = {
      id: "demo_user",
      email: "demo@mindforge.ai",
      name: "Demo User",
      createdAt: "2024-01-01T00:00:00.000Z",
    };
    const session: MockSession = { user: demoUser, token: "tok_demo" };
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    return session;
  }

  const users = loadUsers();
  const record = users[key];

  if (!record) {
    throw new Error("No account found for this email. Please sign up first.");
  }

  if (record.passwordHash !== simpleHash(password)) {
    throw new Error("Incorrect password. Please try again.");
  }

  const session: MockSession = { user: record.user, token: `tok_${record.user.id}` };
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return session;
}

/** Sign out the current session. */
export function mockSignOut(): void {
  localStorage.removeItem(SESSION_KEY);
}

/** Get the current session (or null if not logged in). */
export function getMockSession(): MockSession | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as MockSession) : null;
  } catch {
    return null;
  }
}
