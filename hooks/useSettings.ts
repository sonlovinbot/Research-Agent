import { useState, useEffect, useCallback } from 'react';
import { Settings } from '../types';
import { DEFAULT_SETTINGS } from '../constants';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/auth';

const API_KEYS_STORAGE = 'research_agent_api_keys';

const loadLocalKeys = (): { geminiKey: string; serperKey: string } => {
  try {
    const raw = localStorage.getItem(API_KEYS_STORAGE);
    return raw ? JSON.parse(raw) : { geminiKey: '', serperKey: '' };
  } catch {
    return { geminiKey: '', serperKey: '' };
  }
};

const saveLocalKeys = (geminiKey: string, serperKey: string) => {
  localStorage.setItem(API_KEYS_STORAGE, JSON.stringify({ geminiKey, serperKey }));
};

export const useSettings = () => {
  const { user } = useAuth();
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  // Load settings on auth
  useEffect(() => {
    if (!user) {
      setSettings(DEFAULT_SETTINGS);
      setLoading(false);
      return;
    }

    const load = async () => {
      const keys = loadLocalKeys();

      const { data } = await supabase
        .from('user_settings')
        .select('model, temperature, country, language')
        .eq('user_id', user.id)
        .single();

      if (data) {
        setSettings({
          geminiKey: keys.geminiKey,
          serperKey: keys.serperKey,
          model: data.model,
          temperature: Number(data.temperature),
          country: data.country,
          language: data.language,
        });
      } else {
        setSettings({ ...DEFAULT_SETTINGS, ...keys });
      }
      setLoading(false);
    };

    load();
  }, [user]);

  const saveSettings = useCallback(async (newSettings: Settings) => {
    setSettings(newSettings);

    // API keys stay local
    saveLocalKeys(newSettings.geminiKey, newSettings.serperKey);

    if (!user) return;

    // Non-secret settings go to Supabase
    await supabase
      .from('user_settings')
      .upsert({
        user_id: user.id,
        model: newSettings.model,
        temperature: newSettings.temperature,
        country: newSettings.country,
        language: newSettings.language,
      }, { onConflict: 'user_id' });
  }, [user]);

  return { settings, saveSettings, loading };
};
