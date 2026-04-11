import { useState, useCallback } from 'react';
import { Message } from '../types';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/auth';

export const useMessages = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);

  // Load messages for a session
  const fetchMessages = useCallback(async (sessionId: string) => {
    if (!user) return;
    setLoadingMessages(true);

    const { data } = await supabase
      .from('messages')
      .select('*')
      .eq('session_id', sessionId)
      .order('sort_order', { ascending: true });

    if (data) {
      setMessages(data.map(m => ({
        id: m.id,
        role: m.role as Message['role'],
        content: m.content,
        searchResults: m.search_results ?? undefined,
        images: m.images ?? undefined,
        videos: m.videos ?? undefined,
        stage: (m.stage as Message['stage']) ?? undefined,
        timestamp: new Date(m.created_at).getTime(),
        quizData: m.quiz_data ?? undefined,
        mindmapContent: m.mindmap_content ?? undefined,
      })));
    }
    setLoadingMessages(false);
  }, [user]);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  // Insert a new message into Supabase and local state
  const addMessage = useCallback(async (sessionId: string, message: Message, sortOrder: number): Promise<string | null> => {
    if (!user) return null;

    const { data, error } = await supabase
      .from('messages')
      .insert({
        session_id: sessionId,
        user_id: user.id,
        role: message.role,
        content: message.content,
        search_results: message.searchResults ?? null,
        images: message.images ?? null,
        videos: message.videos ?? null,
        stage: message.stage ?? null,
        quiz_data: message.quizData ?? null,
        mindmap_content: message.mindmapContent ?? null,
        sort_order: sortOrder,
      })
      .select('id')
      .single();

    if (error || !data) return null;

    const newMsg = { ...message, id: data.id };
    setMessages(prev => [...prev, newMsg]);
    return data.id;
  }, [user]);

  // Update an existing message (by DB id)
  const updateMessage = useCallback(async (messageId: string, updates: Partial<Message>) => {
    // Update local state immediately (optimistic)
    setMessages(prev => prev.map(m =>
      m.id === messageId ? { ...m, ...updates } : m
    ));

    // Sync to Supabase in background
    const dbUpdates: Record<string, any> = {};
    if (updates.content !== undefined) dbUpdates.content = updates.content;
    if (updates.searchResults !== undefined) dbUpdates.search_results = updates.searchResults;
    if (updates.images !== undefined) dbUpdates.images = updates.images;
    if (updates.videos !== undefined) dbUpdates.videos = updates.videos;
    if (updates.stage !== undefined) dbUpdates.stage = updates.stage;
    if (updates.quizData !== undefined) dbUpdates.quiz_data = updates.quizData;
    if (updates.mindmapContent !== undefined) dbUpdates.mindmap_content = updates.mindmapContent;

    if (Object.keys(dbUpdates).length > 0) {
      supabase
        .from('messages')
        .update(dbUpdates)
        .eq('id', messageId)
        .then(); // fire-and-forget for intermediate updates
    }
  }, []);

  return { messages, setMessages, loadingMessages, fetchMessages, clearMessages, addMessage, updateMessage };
};
