import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';

interface ThemeToggleProps {
  variant?: 'pill' | 'compact' | 'segmented';
  className?: string;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ variant = 'pill', className = '' }) => {
  const { theme, toggleTheme, setTheme } = useTheme();

  if (variant === 'segmented') {
    return (
      <div className={`p-1 bg-slate-200/80 dark:bg-slate-900/90 rounded-xl border border-slate-300/80 dark:border-slate-800 grid grid-cols-2 gap-1 ${className}`}>
        <button
          type="button"
          onClick={() => setTheme('light')}
          className={`flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-lg text-xs font-bold transition-all ${
            theme === 'light'
              ? 'bg-white text-amber-600 shadow-sm border border-amber-200/50'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <Sun className="w-3.5 h-3.5 text-amber-500" />
          <span>Light</span>
        </button>

        <button
          type="button"
          onClick={() => setTheme('dark')}
          className={`flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-lg text-xs font-bold transition-all ${
            theme === 'dark'
              ? 'bg-slate-800 text-sky-400 shadow-sm border border-slate-700'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <Moon className="w-3.5 h-3.5 text-sky-400" />
          <span>Dark</span>
        </button>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <button
        type="button"
        onClick={toggleTheme}
        className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all border ${
          theme === 'dark'
            ? 'bg-slate-800 border-slate-700 text-sky-300 hover:bg-slate-700/80 hover:text-sky-200'
            : 'bg-white border-slate-200 text-amber-600 hover:bg-slate-100 hover:text-amber-500 shadow-sm'
        } ${className}`}
        title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
        aria-label="Toggle Color Theme"
      >
        {theme === 'dark' ? (
          <Moon className="w-4 h-4 text-sky-400 transition-transform hover:scale-110" />
        ) : (
          <Sun className="w-4 h-4 text-amber-500 transition-transform hover:scale-110" />
        )}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`relative flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer select-none ${
        theme === 'dark'
          ? 'bg-slate-800/90 hover:bg-slate-700/90 border-slate-700 text-slate-200'
          : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-800 shadow-sm'
      } ${className}`}
      title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
    >
      <div className={`w-4 h-4 rounded-full flex items-center justify-center ${theme === 'dark' ? 'text-sky-400' : 'text-amber-500'}`}>
        {theme === 'dark' ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5" />}
      </div>
      <span>{theme === 'dark' ? 'Dark Mode' : 'Light Mode'}</span>
      <div
        className={`ml-1 w-7 h-4 rounded-full transition-colors flex items-center p-0.5 ${
          theme === 'dark' ? 'bg-indigo-600 justify-end' : 'bg-slate-300 justify-start'
        }`}
      >
        <div className="w-3 h-3 rounded-full bg-white shadow-sm" />
      </div>
    </button>
  );
};
