import { Message } from '../types';

// Shared localStorage helpers for chat messages, keyed per session.
export const messagesKey = (sessionId: string) => `research_agent_messages_${sessionId}`;

export const loadMessages = (sessionId: string): Message[] => {
  try {
    const raw = localStorage.getItem(messagesKey(sessionId));
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const saveMessages = (sessionId: string, messages: Message[]) => {
  localStorage.setItem(messagesKey(sessionId), JSON.stringify(messages));
};
