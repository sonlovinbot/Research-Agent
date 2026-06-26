import React, { createContext, useContext, useEffect, useState } from 'react';

// --- Local demo auth (no backend) ---
// Replaces Supabase auth. Credentials and the current session live in localStorage.

export interface User {
  id: string;
  email: string;
}

interface StoredUser {
  username: string;
  password: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const USERS_KEY = 'research_agent_users';
const SESSION_KEY = 'research_agent_session';

// Built-in demo account
export const DEMO_USERNAME = 'admin';
export const DEMO_PASSWORD = 'admin';

const loadUsers = (): StoredUser[] => {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    const list: StoredUser[] = raw ? JSON.parse(raw) : [];
    // Ensure the demo account always exists
    if (!list.some(u => u.username === DEMO_USERNAME)) {
      list.unshift({ username: DEMO_USERNAME, password: DEMO_PASSWORD });
      localStorage.setItem(USERS_KEY, JSON.stringify(list));
    }
    return list;
  } catch {
    return [{ username: DEMO_USERNAME, password: DEMO_PASSWORD }];
  }
};

const saveUsers = (users: StoredUser[]) => {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

const toUser = (username: string): User => ({ id: username, email: username });

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsers(); // seed demo account
    try {
      const stored = localStorage.getItem(SESSION_KEY);
      if (stored) setUser(JSON.parse(stored));
    } catch {
      // ignore corrupt session
    }
    setLoading(false);
  }, []);

  const signUp = async (email: string, password: string) => {
    const username = email.trim();
    const users = loadUsers();
    if (users.some(u => u.username === username)) {
      return { error: new Error('An account with this username already exists.') };
    }
    users.push({ username, password });
    saveUsers(users);
    return { error: null };
  };

  const signIn = async (email: string, password: string) => {
    const username = email.trim();
    const users = loadUsers();
    const match = users.find(u => u.username === username && u.password === password);
    if (!match) {
      return { error: new Error('Invalid username or password.') };
    }
    const nextUser = toUser(username);
    localStorage.setItem(SESSION_KEY, JSON.stringify(nextUser));
    setUser(nextUser);
    return { error: null };
  };

  const signOut = async () => {
    localStorage.removeItem(SESSION_KEY);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
