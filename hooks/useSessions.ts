import { useState, useEffect, useCallback } from 'react';
import { ChatSession } from '../types';
import { useAuth } from '../lib/auth';
import { messagesKey } from './storage';

const newId = (): string =>
  (crypto?.randomUUID?.() ?? `id-${Date.now()}-${Math.floor(Math.random() * 1e6)}`);

const sessionsKey = (userId: string) => `research_agent_sessions_${userId}`;

const loadSessions = (userId: string): ChatSession[] => {
  try {
    const raw = localStorage.getItem(sessionsKey(userId));
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const useSessions = () => {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [loading, setLoading] = useState(true);

  const persist = useCallback((next: ChatSession[]) => {
    if (user) localStorage.setItem(sessionsKey(user.id), JSON.stringify(next));
  }, [user]);

  const fetchSessions = useCallback(async () => {
    if (!user) {
      setSessions([]);
      setLoading(false);
      return;
    }
    const list = loadSessions(user.id).sort((a, b) => b.updatedAt - a.updatedAt);
    setSessions(list);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  const createSession = useCallback(async (title: string): Promise<string | null> => {
    if (!user) return null;
    const now = Date.now();
    const session: ChatSession = { id: newId(), title, messages: [], createdAt: now, updatedAt: now };
    setSessions(prev => {
      const next = [session, ...prev];
      persist(next);
      return next;
    });
    return session.id;
  }, [user, persist]);

  const renameSession = useCallback(async (id: string, newTitle: string) => {
    setSessions(prev => {
      const next = prev.map(s => s.id === id ? { ...s, title: newTitle, updatedAt: Date.now() } : s);
      persist(next);
      return next;
    });
  }, [persist]);

  const deleteSession = useCallback(async (id: string) => {
    localStorage.removeItem(messagesKey(id));
    setSessions(prev => {
      const next = prev.filter(s => s.id !== id);
      persist(next);
      return next;
    });
  }, [persist]);

  const touchSession = useCallback(async (id: string) => {
    setSessions(prev => {
      const next = prev
        .map(s => s.id === id ? { ...s, updatedAt: Date.now() } : s)
        .sort((a, b) => b.updatedAt - a.updatedAt);
      persist(next);
      return next;
    });
  }, [persist]);

  return { sessions, loading, createSession, renameSession, deleteSession, touchSession, refetch: fetchSessions };
};
