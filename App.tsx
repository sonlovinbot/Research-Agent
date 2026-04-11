import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Settings as SettingsType, Message, ChatSession } from './types';
import { DEFAULT_SETTINGS } from './constants';
import { SettingsModal } from './components/SettingsModal';
import { ContentSelectionModal } from './components/ContentSelectionModal';
import { ChatMessage } from './components/ChatMessage';
import { ChatHistory } from './components/ChatHistory';
import { LoginScreen } from './components/LoginScreen';
import { searchGoogle, searchGoogleImages, searchGoogleVideos } from './services/serperService';
import { generateSynthesis, generateQuiz, generateMindmap } from './services/geminiService';
import { Settings, Moon, Sun, Send, PlusCircle, AlertCircle, Search, LogOut, History } from 'lucide-react';

const STORAGE_KEY = 'research_agent_sessions';

const loadSessions = (): ChatSession[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const saveSessions = (sessions: ChatSession[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
};

const App: React.FC = () => {
  // --- Auth State ---
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // --- App State ---
  const [settings, setSettings] = useState<SettingsType>(DEFAULT_SETTINGS);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // Selection Modal State
  const [selectionModal, setSelectionModal] = useState<{
    isOpen: boolean;
    type: 'quiz' | 'mindmap' | null;
  }>({ isOpen: false, type: null });

  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // --- History State ---
  const [sessions, setSessions] = useState<ChatSession[]>(loadSessions);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // --- Persist sessions to localStorage ---
  const persistSessions = useCallback((updated: ChatSession[]) => {
    setSessions(updated);
    saveSessions(updated);
  }, []);

  // --- Save current messages to the active session ---
  const saveCurrentSession = useCallback((msgs: Message[], sessionId: string | null) => {
    if (!sessionId || msgs.length === 0) return;
    setSessions(prev => {
      const updated = prev.map(s =>
        s.id === sessionId ? { ...s, messages: msgs, updatedAt: Date.now() } : s
      );
      saveSessions(updated);
      return updated;
    });
  }, []);

  // Auto-save messages when they change (only when a session is active and done processing)
  useEffect(() => {
    if (activeSessionId && messages.length > 0 && !isProcessing) {
      saveCurrentSession(messages, activeSessionId);
    }
  }, [messages, activeSessionId, isProcessing, saveCurrentSession]);

  // --- Effects ---

  // Check Auth Session
  useEffect(() => {
    const authSession = sessionStorage.getItem('research_agent_auth');
    if (authSession === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  // Load settings & theme from local storage
  useEffect(() => {
    const savedSettings = localStorage.getItem('research_agent_settings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    } else {
        if (isAuthenticated) setIsSettingsOpen(true);
    }

    const savedTheme = localStorage.getItem('research_agent_theme') as 'light' | 'dark';
    if (savedTheme) {
      setTheme(savedTheme);
    }
  }, [isAuthenticated]);

  // Apply Theme
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    localStorage.setItem('research_agent_theme', theme);
  }, [theme]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, messages[messages.length-1]?.content, messages[messages.length-1]?.stage]);

  // --- Handlers ---

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    sessionStorage.setItem('research_agent_auth', 'true');
    const savedSettings = localStorage.getItem('research_agent_settings');
    if (!savedSettings) {
      setIsSettingsOpen(true);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('research_agent_auth');
    setMessages([]);
    setActiveSessionId(null);
  };

  const handleSaveSettings = (newSettings: SettingsType) => {
    setSettings(newSettings);
    localStorage.setItem('research_agent_settings', JSON.stringify(newSettings));
  };

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const handleNewChat = () => {
    setMessages([]);
    setActiveSessionId(null);
    setError(null);
    setInput('');
  };

  // --- History Handlers ---

  const handleSelectSession = (id: string) => {
    const session = sessions.find(s => s.id === id);
    if (session) {
      setMessages(session.messages);
      setActiveSessionId(session.id);
      setError(null);
      setInput('');
    }
  };

  const handleDeleteSession = (id: string) => {
    const updated = sessions.filter(s => s.id !== id);
    persistSessions(updated);
    if (activeSessionId === id) {
      setMessages([]);
      setActiveSessionId(null);
    }
  };

  const handleRenameSession = (id: string, newTitle: string) => {
    const updated = sessions.map(s =>
      s.id === id ? { ...s, title: newTitle, updatedAt: Date.now() } : s
    );
    persistSessions(updated);
  };

  // --- Create or get active session when first message is sent ---
  const ensureSession = (query: string): string => {
    if (activeSessionId) return activeSessionId;
    const id = Date.now().toString();
    const title = query.length > 50 ? query.substring(0, 50) + '...' : query;
    const newSession: ChatSession = {
      id,
      title,
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    const updated = [newSession, ...sessions];
    persistSessions(updated);
    setActiveSessionId(id);
    return id;
  };

  // --- Modal & Action Handlers ---

  const openSelectionModal = (type: 'quiz' | 'mindmap') => {
      setSelectionModal({ isOpen: true, type });
  };

  const closeSelectionModal = () => {
      setSelectionModal({ isOpen: false, type: null });
  };

  const handleConfirmGeneration = async (messageId: string) => {
    const type = selectionModal.type;
    closeSelectionModal();
    if (!type || !messageId) return;

    const sourceMessage = messages.find(m => m.id === messageId);
    if (!sourceMessage || !sourceMessage.content) return;

    setIsProcessing(true);

    const agentMsgId = Date.now().toString();
    const initialAgentMsg: Message = {
        id: agentMsgId,
        role: 'agent',
        content: '',
        stage: 'synthesizing',
        timestamp: Date.now()
    };
    setMessages(prev => [...prev, initialAgentMsg]);

    try {
        if (type === 'quiz') {
            const quizData = await generateQuiz(sourceMessage.content, settings);
            setMessages(prev => prev.map(msg =>
                msg.id === agentMsgId
                ? { ...msg, content: `**Quiz generated based on:** "${sourceMessage.content.substring(0, 50)}..."`, quizData, stage: 'done' }
                : msg
            ));
        } else if (type === 'mindmap') {
            const mindmapContent = await generateMindmap(sourceMessage.content, settings);
            setMessages(prev => prev.map(msg =>
                msg.id === agentMsgId
                ? { ...msg, content: `**Mindmap generated based on:** "${sourceMessage.content.substring(0, 50)}..."`, mindmapContent, stage: 'done' }
                : msg
            ));
        }
    } catch (err) {
        console.error(err);
        setMessages(prev => prev.map(msg =>
            msg.id === agentMsgId
            ? { ...msg, content: `**Error generating ${type}.** Please try again.`, stage: 'done' }
            : msg
        ));
    } finally {
        setIsProcessing(false);
    }
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isProcessing) return;

    if (!settings.geminiKey || !settings.serperKey) {
        setError("Please configure your API keys in Settings first.");
        setIsSettingsOpen(true);
        return;
    }

    const query = input.trim();
    setInput('');
    setError(null);
    setIsProcessing(true);

    // Ensure a session exists
    ensureSession(query);

    // 1. Add User Message
    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: query,
      timestamp: Date.now()
    };

    // 2. Add Placeholder Agent Message
    const agentMsgId = (Date.now() + 1).toString();
    const initialAgentMsg: Message = {
      id: agentMsgId,
      role: 'agent',
      content: '',
      stage: 'searching',
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg, initialAgentMsg]);

    try {
        // --- Phase 1: Search (Parallel Text, Images, Videos) ---
        const [searchResults, imageResults, videoResults] = await Promise.all([
            searchGoogle(query, settings),
            searchGoogleImages(query, settings),
            searchGoogleVideos(query, settings)
        ]);

        // Update Agent message with search results
        setMessages(prev => prev.map(msg =>
            msg.id === agentMsgId
            ? { ...msg, searchResults, images: imageResults, videos: videoResults, stage: 'synthesizing' }
            : msg
        ));

        // --- Phase 2: Synthesis ---
        const synthesis = await generateSynthesis(query, searchResults, settings);

        // Update Agent message with final text
        setMessages(prev => prev.map(msg =>
            msg.id === agentMsgId
            ? { ...msg, content: synthesis, stage: 'done' }
            : msg
        ));

    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
        setError(errorMessage);
        setMessages(prev => prev.map(msg =>
            msg.id === agentMsgId
            ? { ...msg, content: `**Error:** ${errorMessage}`, stage: 'done' }
            : msg
        ));
    } finally {
        setIsProcessing(false);
    }
  };

  // --- Render Login Screen if not authenticated ---
  if (!isAuthenticated) {
    return <LoginScreen onLoginSuccess={handleLoginSuccess} />;
  }

  // --- Render Main App ---
  return (
    <div className="flex flex-col h-screen bg-background text-foreground transition-colors duration-300">

      {/* --- Navbar --- */}
      <header className="flex-none flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-white/50 dark:bg-gray-900/50 backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center gap-2">
            <button
              onClick={() => setIsHistoryOpen(true)}
              className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              title="Chat History"
            >
              <History size={20} />
            </button>
            <div className="bg-emerald-500 w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-lg">
                R
            </div>
            <h1 className="font-bold text-xl tracking-tight">Research Agent</h1>
        </div>

        <div className="flex items-center gap-3">
             <button
                onClick={handleNewChat}
                className="hidden md:flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
             >
                <PlusCircle size={18} />
                New Chat
             </button>
            <div className="h-6 w-[1px] bg-gray-200 dark:bg-gray-700 mx-1"></div>
            <button
                onClick={toggleTheme}
                className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                title="Toggle Theme"
            >
                {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </button>
            <button
                onClick={() => setIsSettingsOpen(true)}
                className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                title="Settings"
            >
                <Settings size={20} />
            </button>
            <button
                onClick={handleLogout}
                className="p-2 text-gray-500 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20 dark:hover:text-red-400 rounded-lg transition-colors ml-1"
                title="Logout"
            >
                <LogOut size={20} />
            </button>
        </div>
      </header>

      {/* --- Main Chat Area --- */}
      <main className="flex-1 overflow-y-auto px-4 py-8 scroll-smooth">
        <div className="max-w-4xl mx-auto min-h-full flex flex-col justify-start">

            {messages.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6 opacity-0 animate-fade-in-up" style={{animationFillMode: 'forwards'}}>
                    <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-blue-500 rounded-3xl shadow-xl flex items-center justify-center mb-4">
                        <Search className="text-white w-10 h-10" />
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-gray-100">
                        What do you want to know?
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400 max-w-md">
                        I can search the web for real-time information and synthesize a comprehensive answer for you.
                    </p>
                    {(!settings.geminiKey || !settings.serperKey) && (
                         <div className="flex items-center gap-2 text-amber-500 bg-amber-50 dark:bg-amber-900/20 px-4 py-2 rounded-lg border border-amber-200 dark:border-amber-900/50 mt-4">
                            <AlertCircle size={18} />
                            <span className="text-sm font-medium">Please configure API Keys in settings to start.</span>
                         </div>
                    )}
                </div>
            ) : (
                <div className="pb-32">
                    {messages.map((msg) => (
                        <ChatMessage
                            key={msg.id}
                            message={msg}
                            onGenerateQuiz={() => openSelectionModal('quiz')}
                            onGenerateMindmap={() => openSelectionModal('mindmap')}
                        />
                    ))}
                    {error && (
                        <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl border border-red-200 dark:border-red-900 flex items-center gap-2 animate-fade-in">
                            <AlertCircle size={20} />
                            {error}
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
            )}

        </div>
      </main>

      {/* --- Input Area --- */}
      <footer className="flex-none p-4 md:p-6 bg-white dark:bg-[#0f1117] relative">
          <div className="absolute top-0 left-0 right-0 h-12 -mt-12 bg-gradient-to-t from-white dark:from-[#0f1117] to-transparent pointer-events-none"></div>

          <div className="max-w-4xl mx-auto relative">
              <form onSubmit={handleSubmit} className="relative group">
                  <div className={`absolute -inset-0.5 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-500 ${isProcessing ? 'opacity-50 animate-pulse' : ''}`}></div>
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={isProcessing ? "Agent is working..." : "Ask anything..."}
                    disabled={isProcessing}
                    className="relative w-full bg-white dark:bg-[#1e293b] text-gray-900 dark:text-gray-100 placeholder-gray-400 rounded-2xl py-4 pl-6 pr-14 shadow-xl border-none focus:ring-0 focus:outline-none text-lg transition-all"
                  />
                  <button
                    type="submit"
                    disabled={!input.trim() || isProcessing}
                    className="absolute right-3 top-3 p-2 bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-300 dark:disabled:bg-gray-700 text-white rounded-xl transition-all shadow-lg active:scale-95 flex items-center justify-center"
                  >
                     {isProcessing ? <Settings className="animate-spin w-5 h-5" /> : <Send className="w-5 h-5 ml-0.5" />}
                  </button>
              </form>
              <div className="text-center mt-3">
                 <p className="text-xs text-gray-400 dark:text-gray-600">
                    Powered by Serper Dev & Gemini Flash • {settings.model}
                 </p>
              </div>
          </div>
      </footer>

      {/* --- Sidebars & Modals --- */}
      <ChatHistory
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        sessions={sessions}
        activeSessionId={activeSessionId}
        onSelectSession={handleSelectSession}
        onDeleteSession={handleDeleteSession}
        onRenameSession={handleRenameSession}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        currentSettings={settings}
        onSave={handleSaveSettings}
      />

      <ContentSelectionModal
        isOpen={selectionModal.isOpen}
        onClose={closeSelectionModal}
        messages={messages}
        onConfirm={handleConfirmGeneration}
        title={selectionModal.type === 'quiz' ? 'Generate Quiz' : 'Generate Mindmap'}
      />

    </div>
  );
};

export default App;
