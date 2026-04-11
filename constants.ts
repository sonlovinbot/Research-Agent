import { Settings } from './types';

export const DEFAULT_SETTINGS: Settings = {
  openAiKey: '',
  serperKey: '',
  model: 'gpt-4.1-mini', // As requested
  temperature: 0.7,
  country: 'vn',
  language: 'vi',
};

export const AVAILABLE_MODELS = [
  'gpt-4.1-mini',
  'gpt-4o-mini',
  'gpt-4o',
  'gpt-4-turbo',
  'gpt-3.5-turbo',
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
