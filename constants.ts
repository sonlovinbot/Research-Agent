import { Settings } from './types';

export const DEFAULT_SETTINGS: Settings = {
  geminiKey: '',
  serperKey: '',
  model: 'gemini-2.0-flash',
  temperature: 0.7,
  country: 'vn',
  language: 'vi',
};

export const AVAILABLE_MODELS = [
  'gemini-2.0-flash',
  'gemini-2.0-flash-lite',
  'gemini-1.5-flash',
  'gemini-1.5-pro',
];

export const COUNTRIES = [
  { code: 'vn', name: 'Vietnam' },
  { code: 'us', name: 'United States' },
  { code: 'uk', name: 'United Kingdom' },
  { code: 'ca', name: 'Canada' },
  { code: 'au', name: 'Australia' },
  { code: 'de', name: 'Germany' },
  { code: 'jp', name: 'Japan' },
  { code: 'fr', name: 'France' },
];

export const LANGUAGES = [
  { code: 'vi', name: 'Vietnamese' },
  { code: 'en', name: 'English' },
  { code: 'ja', name: 'Japanese' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'es', name: 'Spanish' },
];
