import { useState, useCallback, useRef } from 'react';
import { Message } from '../types';
import { useAuth } from '../lib/auth';
import { loadMessages, saveMessages } from './storage';

const newId = (): string =>
  (crypto?.randomUUID?.() ?? `id-${Date.now()}-${Math.floor(Math.random() * 1e6)}`);

export const useMessages = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  // Track the session whose messages are currently loaded, so updates persist correctly.
  const currentSessionId = useRef<string | null>(null);

  const fetchMessages = useCallback(async (sessionId: string) => {
    if (!user) return;
    setLoadingMessages(true);
    currentSessionId.current = sessionId;
    setMessages(loadMessages(sessionId));
    setLoadingMessages(false);
  }, [user]);

  const clearMessages = useCallback(() => {
    currentSessionId.current = null;
    setMessages([]);
  }, []);

  // Insert a new message into the session store and local state.
  const addMessage = useCallback(async (sessionId: string, message: Message, _sortOrder: number): Promise<string | null> => {
    if (!user) return null;
    currentSessionId.current = sessionId;
    const newMsg: Message = { ...message, id: newId() };
    setMessages(prev => {
      const next = [...prev, newMsg];
      saveMessages(sessionId, next);
      return next;
    });
    return newMsg.id;
  }, [user]);

  // Update an existing message (by id) in the currently loaded session.
  const updateMessage = useCallback(async (messageId: string, updates: Partial<Message>) => {
    setMessages(prev => {
      const next = prev.map(m => m.id === messageId ? { ...m, ...updates } : m);
      if (currentSessionId.current) saveMessages(currentSessionId.current, next);
      return next;
    });
  }, []);

  return { messages, setMessages, loadingMessages, fetchMessages, clearMessages, addMessage, updateMessage };
};
