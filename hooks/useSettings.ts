import { useState, useEffect, useCallback } from 'react';
import { Settings } from '../types';
import { DEFAULT_SETTINGS } from '../constants';
import { useAuth } from '../lib/auth';

// All settings (including API keys) are stored in localStorage, scoped per user.
const settingsKey = (userId: string) => `research_agent_settings_${userId}`;

const loadSettings = (userId: string): Settings => {
  try {
    const raw = localStorage.getItem(settingsKey(userId));
    return raw ? { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
};

export const useSettings = () => {
  const { user } = useAuth();
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  // Tracks which user's settings are currently in `settings`. Derived loading
  // below stays true until the active user's settings are committed, so consumers
  // never see another user's (or default) settings during the transition.
  const [loadedFor, setLoadedFor] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setSettings(DEFAULT_SETTINGS);
      setLoadedFor(null);
      return;
    }
    setSettings(loadSettings(user.id));
    setLoadedFor(user.id);
  }, [user]);

  const loading = user ? loadedFor !== user.id : false;

  const saveSettings = useCallback(async (newSettings: Settings) => {
    setSettings(newSettings);
    if (!user) return;
    localStorage.setItem(settingsKey(user.id), JSON.stringify(newSettings));
  }, [user]);

  return { settings, saveSettings, loading };
};
