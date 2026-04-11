import React, { useState, useEffect } from 'react';
import { X, Save, Settings as SettingsIcon, Eye, EyeOff } from 'lucide-react';
import { Settings } from '../types';
import { AVAILABLE_MODELS, COUNTRIES, LANGUAGES } from '../constants';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSettings: Settings;
  onSave: (settings: Settings) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  currentSettings,
  onSave,
}) => {
  const [formData, setFormData] = useState<Settings>(currentSettings);
  const [showGeminiKey, setShowGeminiKey] = useState(false);
  const [showSerperKey, setShowSerperKey] = useState(false);

  useEffect(() => {
    setFormData(currentSettings);
  }, [currentSettings, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'temperature' ? parseFloat(value) : value,
    }));
  };

  const handleSave = () => {
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-gray-800 w-full max-w-lg rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-2 text-primary">
            <SettingsIcon className="w-5 h-5" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">API Configuration</h2>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* API Keys Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Credentials</h3>
            
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Serper API Key</label>
              <div className="relative">
                <input
                  type={showSerperKey ? "text" : "password"}
                  name="serperKey"
                  value={formData.serperKey}
                  onChange={handleChange}
                  placeholder="sk-..."
                  className="w-full p-3 pr-10 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-primary focus:outline-none dark:text-white transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowSerperKey(!showSerperKey)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                >
                  {showSerperKey ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <p className="text-xs text-gray-400">Required for Google Search results.</p>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Gemini API Key</label>
              <div className="relative">
                <input
                  type={showGeminiKey ? "text" : "password"}
                  name="geminiKey"
                  value={formData.geminiKey}
                  onChange={handleChange}
                  placeholder="AIza..."
                  className="w-full p-3 pr-10 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-primary focus:outline-none dark:text-white transition-all"
                />
                 <button
                  type="button"
                  onClick={() => setShowGeminiKey(!showGeminiKey)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                >
                  {showGeminiKey ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <p className="text-xs text-gray-400">Required for generating the analysis. Get one at ai.google.dev</p>
            </div>
          </div>

          <div className="border-t border-gray-100 dark:border-gray-700 my-4"></div>

          {/* Configuration Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Parameters</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Model</label>
                <select
                  name="model"
                  value={formData.model}
                  onChange={handleChange}
                  className="w-full p-3 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-primary focus:outline-none dark:text-white"
                >
                  {AVAILABLE_MODELS.map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Temperature</label>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    name="temperature"
                    min="0"
                    max="1"
                    step="0.1"
                    value={formData.temperature}
                    onChange={handleChange}
                    className="flex-1 accent-primary h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                  />
                  <span className="w-8 text-sm text-gray-600 dark:text-gray-400 text-right">{formData.temperature}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Country (GL)</label>
                <select
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  className="w-full p-3 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-primary focus:outline-none dark:text-white"
                >
                   {COUNTRIES.map(c => (
                    <option key={c.code} value={c.code}>{c.name}</option>
                  ))}
                </select>
              </div>

               <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Language (HL)</label>
                <select
                  name="language"
                  value={formData.language}
                  onChange={handleChange}
                  className="w-full p-3 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-primary focus:outline-none dark:text-white"
                >
                   {LANGUAGES.map(l => (
                    <option key={l.code} value={l.code}>{l.name}</option>
                  ))}
                </select>
              </div>
            </div>

          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 rounded-b-2xl">
          <button
            onClick={handleSave}
            className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-emerald-600 text-white font-semibold py-3 px-6 rounded-xl transition-all shadow-lg shadow-emerald-500/20 active:scale-[0.98]"
          >
            <Save className="w-5 h-5" />
            Save Configuration
          </button>
        </div>
      </div>
    </div>
  );
};
