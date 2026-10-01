import React from 'react';
import { 
  Trophy, 
  BookOpen, 
  PlusCircle, 
  Sun, 
  Moon, 
  Volume2, 
  VolumeX, 
  User as UserIcon,
  Sparkles
} from 'lucide-react';
import { User } from '../types/quiz.ts';
import { soundManager } from '../utils/sound.ts';

interface NavbarProps {
  currentTab: 'quizzes' | 'leaderboard';
  setCurrentTab: (tab: 'quizzes' | 'leaderboard') => void;
  currentUser: User;
  onOpenProfile: () => void;
  onOpenCreateQuiz: () => void;
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  soundEnabled: boolean;
  setSoundEnabled: (val: boolean) => void;
  inQuizMode?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  currentUser,
  onOpenProfile,
  onOpenCreateQuiz,
  darkMode,
  setDarkMode,
  soundEnabled,
  setSoundEnabled,
  inQuizMode = false,
}) => {
  const toggleSound = () => {
    const nextVal = !soundEnabled;
    soundManager.enabled = nextVal;
    setSoundEnabled(nextVal);
    if (nextVal) soundManager.playSelect();
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    if (soundEnabled) soundManager.playNav();
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo / Brand */}
        <div 
          onClick={() => {
            if (!inQuizMode) {
              setCurrentTab('quizzes');
              if (soundEnabled) soundManager.playNav();
            }
          }}
          className={`flex items-center gap-2.5 ${inQuizMode ? 'cursor-default' : 'cursor-pointer'} select-none`}
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="text-xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5">
              QuizMaster <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-900/60 dark:text-indigo-300 font-bold uppercase tracking-wider">Pro</span>
            </span>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium hidden sm:block">
              Interactive Assessment Platform
            </p>
          </div>
        </div>

        {/* Navigation Tabs (Hidden if in full active quiz mode to minimize distraction) */}
        {!inQuizMode && (
          <nav className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
            <button
              onClick={() => {
                setCurrentTab('quizzes');
                if (soundEnabled) soundManager.playNav();
              }}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                currentTab === 'quizzes'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Quizzes</span>
            </button>
            <button
              onClick={() => {
                setCurrentTab('leaderboard');
                if (soundEnabled) soundManager.playNav();
              }}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                currentTab === 'leaderboard'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Trophy className="w-4 h-4 text-amber-500" />
              <span>Leaderboard</span>
            </button>
          </nav>
        )}

        {/* Actions & User Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {!inQuizMode && (
            <button
              onClick={onOpenCreateQuiz}
              className="hidden md:flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition shadow-sm hover:shadow-indigo-500/25 active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Create Quiz</span>
            </button>
          )}

          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            title={soundEnabled ? 'Disable Audio Effects' : 'Enable Audio Effects'}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-indigo-500" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
          </button>

          {/* Dark Mode Toggle */}
          <button
            onClick={toggleDarkMode}
            title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>

          {/* User Profile Pill */}
          <button
            onClick={onOpenProfile}
            className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-600 bg-slate-50 dark:bg-slate-800/60 transition group"
          >
            {currentUser.avatar_url ? (
              <img
                src={currentUser.avatar_url}
                alt={currentUser.username}
                className="w-7 h-7 rounded-full object-cover ring-2 ring-indigo-500/20"
              />
            ) : (
              <div className="w-7 h-7 rounded-full bg-indigo-500/10 text-indigo-600 flex items-center justify-center font-bold text-xs">
                <UserIcon className="w-4 h-4" />
              </div>
            )}
            <span className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 max-w-[90px] sm:max-w-[130px] truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
              {currentUser.username}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};
