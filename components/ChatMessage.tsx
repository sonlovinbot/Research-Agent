import React from 'react';
import { Message } from '../types';
import { MarkdownRenderer } from './MarkdownRenderer';
import { SearchResultCard } from './SearchResultCard';
import { ImageGallery } from './ImageGallery';
import { VideoGallery } from './VideoGallery';
import { QuizComponent } from './QuizComponent';
import { MindmapRenderer } from './MindmapRenderer';
import { Loader2, Search, FileText, Sparkles, Image as ImageIcon, BrainCircuit, CheckSquare, Youtube } from 'lucide-react';

interface ChatMessageProps {
  message: Message;
  onGenerateQuiz?: (messageId: string) => void;
  onGenerateMindmap?: (messageId: string) => void;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message, onGenerateQuiz, onGenerateMindmap }) => {
  const isUser = message.role === 'user';
  const isAgent = message.role === 'agent';

  if (isUser) {
    return (
      <div className="flex justify-end mb-8 animate-fade-in-up">
        <div className="bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white px-5 py-3 rounded-2xl rounded-tr-sm max-w-[80%] md:max-w-[70%] font-medium text-lg shadow-sm">
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <div className="mb-12 animate-fade-in text-gray-900 dark:text-gray-100 max-w-4xl mx-auto">
      {/* Agent Header */}
      <div className="flex items-center gap-3 mb-4 text-emerald-600 dark:text-emerald-400">
        <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
           <Sparkles className="w-5 h-5" />
        </div>
        <span className="font-semibold text-sm tracking-wide uppercase">Research Agent</span>
      </div>

      <div className="pl-0 md:pl-12 space-y-8">
        
        {/* Stage 1: Search Results Display (Sources) */}
        {message.searchResults && message.searchResults.length > 0 && (
          <div className="space-y-3">
             <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm font-medium">
                <Search className="w-4 h-4" />
                <span>{message.searchResults.length} Sources Found</span>
             </div>
             {/* Horizontal Scroll Container for cards */}
             <div className="flex gap-3 overflow-x-auto pb-4 -mx-4 px-4 md:mx-0 md:px-0 scrollbar-hide snap-x">
               {message.searchResults.map((result, idx) => (
                 <SearchResultCard key={idx} result={result} index={idx} />
               ))}
             </div>
          </div>
        )}

        {/* Stage 1.5: Image Results Display */}
        {message.images && message.images.length > 0 && (
          <div className="space-y-3">
             <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm font-medium">
                <ImageIcon className="w-4 h-4" />
                <span>Images Found</span>
             </div>
             <ImageGallery images={message.images} />
          </div>
        )}

        {/* Stage 1.6: Video Results Display */}
        {message.videos && message.videos.length > 0 && (
          <div className="space-y-3">
             <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm font-medium">
                <Youtube className="w-4 h-4" />
                <span>Videos Found</span>
             </div>
             <VideoGallery videos={message.videos} />
          </div>
        )}

        {/* Stage 2: Synthesis / Loading States */}
        {message.stage === 'searching' && (
           <div className="flex items-center gap-3 text-gray-500 animate-pulse p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-100 dark:border-gray-800">
             <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
             <span className="font-medium">Searching the web for text, images, and videos...</span>
           </div>
        )}

        {message.stage === 'synthesizing' && (
           <div className="flex items-center gap-3 text-gray-500 animate-pulse p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-100 dark:border-gray-800">
             <Loader2 className="w-5 h-5 animate-spin text-purple-500" />
             <span className="font-medium">Reading sources and writing blog analysis...</span>
           </div>
        )}

        {/* Final Content */}
        {message.content && message.stage !== 'searching' && (
           <div className="relative pt-2">
              <div className="flex items-center justify-between mb-4">
                 <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm font-medium">
                    <FileText className="w-4 h-4" />
                    <span>Analysis</span>
                 </div>

                 {/* Action Buttons */}
                 {isAgent && message.stage === 'done' && (
                     <div className="flex gap-2">
                        <button 
                            onClick={() => onGenerateQuiz && onGenerateQuiz(message.id)}
                            disabled={!!message.quizData}
                            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${message.quizData ? 'opacity-50 cursor-not-allowed bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500' : 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/40'}`}
                        >
                            <CheckSquare className="w-3.5 h-3.5" />
                            Quiz
                        </button>
                         <button 
                            onClick={() => onGenerateMindmap && onGenerateMindmap(message.id)}
                            disabled={!!message.mindmapContent}
                             className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${message.mindmapContent ? 'opacity-50 cursor-not-allowed bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500' : 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-900/40'}`}
                        >
                            <BrainCircuit className="w-3.5 h-3.5" />
                            Mindmap
                        </button>
                     </div>
                 )}
              </div>

              <div className="bg-white dark:bg-gray-800/30 border border-transparent dark:border-gray-800 rounded-xl p-1 md:p-2">
                 <MarkdownRenderer content={message.content} sources={message.searchResults} />
              </div>

              {/* Quiz Rendering */}
              {message.quizData && message.quizData.questions && (
                 <div className="mt-8 border-t border-gray-100 dark:border-gray-800 pt-6 animate-fade-in">
                    <QuizComponent questions={message.quizData.questions} />
                 </div>
              )}

              {/* Mindmap Rendering */}
              {message.mindmapContent && (
                  <div className="mt-8 border-t border-gray-100 dark:border-gray-800 pt-6 animate-fade-in">
                    <h4 className="text-lg font-semibold mb-4 flex items-center gap-2 text-purple-600 dark:text-purple-400">
                        <BrainCircuit className="w-5 h-5" />
                        Concept Map
                    </h4>
                    <MindmapRenderer content={message.mindmapContent} />
                 </div>
              )}
           </div>
        )}
      </div>
    </div>
  );
};