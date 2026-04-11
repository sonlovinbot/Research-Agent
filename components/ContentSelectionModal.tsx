import React, { useState } from 'react';
import { X, CheckCircle, FileText, Calendar } from 'lucide-react';
import { Message } from '../types';

interface ContentSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  messages: Message[];
  onConfirm: (messageId: string) => void;
  title: string;
}

export const ContentSelectionModal: React.FC<ContentSelectionModalProps> = ({
  isOpen,
  onClose,
  messages,
  onConfirm,
  title,
}) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Filter only agent messages that are done and have content
  const eligibleMessages = messages.filter(
    (m) => m.role === 'agent' && m.stage === 'done' && m.content
  );

  // Auto-select the last one if nothing selected initially
  React.useEffect(() => {
    if (isOpen && eligibleMessages.length > 0 && !selectedId) {
      setSelectedId(eligibleMessages[eligibleMessages.length - 1].id);
    }
  }, [isOpen, eligibleMessages, selectedId]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (selectedId) {
      onConfirm(selectedId);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white dark:bg-gray-800 w-full max-w-lg rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col max-h-[80vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-700">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Select the content to analyze</p>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50 dark:bg-gray-900/50">
          {eligibleMessages.length === 0 ? (
            <div className="text-center py-10 text-gray-500">
              No analysis content available yet.
            </div>
          ) : (
            eligibleMessages.map((msg) => {
              // Extract a title or preview
              const preview = msg.content.split('\n').find(l => l.startsWith('#'))?.replace('#', '').trim() 
                || msg.content.substring(0, 60) + '...';
              const date = new Date(msg.timestamp).toLocaleTimeString();
              const isSelected = selectedId === msg.id;

              return (
                <div 
                  key={msg.id}
                  onClick={() => setSelectedId(msg.id)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                    isSelected 
                      ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-500 ring-1 ring-emerald-500' 
                      : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-emerald-300 dark:hover:border-emerald-700'
                  }`}
                >
                  <div className={`mt-1 flex-shrink-0 w-5 h-5 rounded-full border flex items-center justify-center ${
                    isSelected ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-gray-300 dark:border-gray-600'
                  }`}>
                    {isSelected && <CheckCircle size={12} />}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-800 dark:text-gray-200 text-sm mb-1 line-clamp-2">
                      {preview}
                    </h4>
                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                      <Calendar size={12} />
                      <span>{date}</span>
                      <span className="mx-1">•</span>
                      <FileText size={12} />
                      <span>{msg.content.length} chars</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-b-2xl">
          <button
            onClick={handleConfirm}
            disabled={!selectedId}
            className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-emerald-600 text-white font-semibold py-3 px-6 rounded-xl transition-all shadow-lg shadow-emerald-500/20 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Generate
          </button>
        </div>
      </div>
    </div>
  );
};