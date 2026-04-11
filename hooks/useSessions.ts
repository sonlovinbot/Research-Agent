import { useState, useEffect, useCallback } from 'react';
import { ChatSession } from '../types';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/auth';

export const useSessions = () => {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [loading, setLoading] = useState(true);

  // Load session list (no messages)
  const fetchSessions = useCallback(async () => {
    if (!user) {
      setSessions([]);
      setLoading(false);
      return;
    }

    const { data } = await supabase
      .from('chat_sessions')
      .select('id, title, created_at, updated_at')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false });

    if (data) {
      setSessions(data.map(s => ({
        id: s.id,
        title: s.title,
        messages: [], // not loaded here
        createdAt: new Date(s.created_at).getTime(),
        updatedAt: new Date(s.updated_at).getTime(),
      })));
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  const createSession = useCallback(async (title: string): Promise<string | null> => {
    if (!user) return null;

    const { data, error } = await supabase
      .from('chat_sessions')
      .insert({ user_id: user.id, title })
      .select('id')
      .single();

    if (error || !data) return null;

    setSessions(prev => [{
      id: data.id,
      title,
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }, ...prev]);

    return data.id;
  }, [user]);

  const renameSession = useCallback(async (id: string, newTitle: string) => {
    await supabase
      .from('chat_sessions')
      .update({ title: newTitle })
      .eq('id', id);

    setSessions(prev => prev.map(s =>
      s.id === id ? { ...s, title: newTitle, updatedAt: Date.now() } : s
    ));
  }, []);

  const deleteSession = useCallback(async (id: string) => {
    await supabase
      .from('chat_sessions')
      .delete()
      .eq('id', id);

    setSessions(prev => prev.filter(s => s.id !== id));
  }, []);

  const touchSession = useCallback(async (id: string) => {
    await supabase
      .from('chat_sessions')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', id);

    setSessions(prev => prev.map(s =>
      s.id === id ? { ...s, updatedAt: Date.now() } : s
    ));
  }, []);

  return { sessions, loading, createSession, renameSession, deleteSession, touchSession, refetch: fetchSessions };
};
