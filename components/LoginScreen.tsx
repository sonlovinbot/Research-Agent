import React, { useState } from 'react';
import { Eye, EyeOff, Lock, ArrowRight, Sparkles } from 'lucide-react';

interface LoginScreenProps {
  onLoginSuccess: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const [password, setPassword] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check password case-insensitive for 'coachio'
    if (password.trim().toLowerCase() === 'coachio') {
      onLoginSuccess();
    } else {
      setError('Incorrect password');
      // Shake animation trigger could go here
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 dark:bg-[#0f1117] relative overflow-hidden transition-colors duration-300">
      
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/10 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[100px]"></div>
      </div>

      <div className="w-full max-w-md p-6 relative z-10 animate-fade-in-up">
        <div className="bg-white dark:bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-gray-200 dark:border-gray-700 shadow-2xl overflow-hidden">
          
          {/* Header */}
          <div className="p-8 text-center border-b border-gray-100 dark:border-gray-700/50">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-emerald-400 to-blue-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-emerald-500/20">
              <Sparkles className="text-white w-8 h-8" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Welcome Back</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              Enter your access code to continue to Research Agent.
            </p>
          </div>

          {/* Form */}
          <div className="p-8">
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider ml-1">
                  Password
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-emerald-500 transition-colors">
                    <Lock size={18} />
                  </div>
                  <input
                    type={isVisible ? "text" : "password"}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setError('');
                    }}
                    className={`w-full pl-10 pr-12 py-3 bg-gray-50 dark:bg-gray-900 border ${error ? 'border-red-500' : 'border-gray-200 dark:border-gray-600'} rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent dark:text-white placeholder-gray-400 transition-all outline-none`}
                    placeholder="Enter password"
                  />
                  <button
                    type="button"
                    onClick={() => setIsVisible(!isVisible)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors cursor-pointer"
                  >
                    {isVisible ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {error && (
                  <p className="text-red-500 text-xs ml-1 animate-fade-in">
                    {error}
                  </p>
                )}
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold py-3.5 px-6 rounded-xl transition-all shadow-lg shadow-emerald-500/20 active:scale-[0.98] group"
              >
                <span>Access System</span>
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </form>
          </div>
          
        </div>
        <p className="text-center text-xs text-gray-400 dark:text-gray-600 mt-8">
          Protected System • Research Agent Pro
        </p>
      </div>
    </div>
  );
};