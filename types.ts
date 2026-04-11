export interface SearchResult {
  title: string;
  link: string;
  snippet: string;
  date?: string;
  position?: number;
}

export interface ImageResult {
  title: string;
  imageUrl: string;
  thumbnailUrl: string;
  source: string;
  link: string; // context link
  width: number;
  height: number;
}

export interface VideoResult {
  title: string;
  link: string;
  snippet: string;
  imageUrl: string;
  date?: string;
  source?: string;
  duration?: string;
}

export interface Settings {
  openAiKey: string;
  serperKey: string;
  model: string;
  temperature: number;
  country: string; // 'gl' parameter
  language: string; // 'hl' parameter
}

export type MessageRole = 'user' | 'agent' | 'system';
export type ProcessStage = 'idle' | 'searching' | 'synthesizing' | 'done';

export interface QuizQuestion {
  question: string;
  options: string[];
  answer: number;
  explanation: string;
}

export interface Message {
  id: string;
  role: MessageRole;
  content: string; // Markdown content
  searchResults?: SearchResult[]; // Attached search results if applicable
  images?: ImageResult[]; // Attached image results
  videos?: VideoResult[]; // Attached video results
  stage?: ProcessStage; // Only for agent messages
  timestamp: number;
  quizData?: { questions: QuizQuestion[] };
  mindmapContent?: string;
}