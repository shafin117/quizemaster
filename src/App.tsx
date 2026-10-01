import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar.tsx';
import { QuizList } from './components/QuizList.tsx';
import { QuizActive } from './components/QuizActive.tsx';
import { QuizResult } from './components/QuizResult.tsx';
import { Leaderboard } from './components/Leaderboard.tsx';
import { CreateQuizModal } from './components/CreateQuizModal.tsx';
import { UserProfileModal } from './components/UserProfileModal.tsx';
import { 
  Quiz, 
  Question, 
  User, 
  LeaderboardEntry, 
  QuizResultResponse, 
  SubmitQuizPayload 
} from './types/quiz.ts';
import { soundManager } from './utils/sound.ts';

export default function App() {
  // Navigation & View state
  const [currentTab, setCurrentTab] = useState<'quizzes' | 'leaderboard'>('quizzes');
  const [activeQuiz, setActiveQuiz] = useState<(Quiz & { questions: Question[] }) | null>(null);
  const [quizResult, setQuizResult] = useState<QuizResultResponse | null>(null);

  // App data state
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User>({
    id: 'usr_current',
    username: 'Guest Quizzer',
    email: 'guest@quizmaster.dev',
    avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80',
    created_at: new Date().toISOString(),
  });

  // UI state
  const [loadingQuizzes, setLoadingQuizzes] = useState<boolean>(true);
  const [submittingQuiz, setSubmittingQuiz] = useState<boolean>(false);
  const [isCreateQuizOpen, setIsCreateQuizOpen] = useState<boolean>(false);
  const [isProfileOpen, setIsProfileOpen] = useState<boolean>(false);

  // Theme & Audio state
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('qm_theme');
      if (saved) return saved === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('qm_sound');
      return saved !== 'false';
    }
    return true;
  });

  // Apply dark mode class to root html element
  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
      localStorage.setItem('qm_theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('qm_theme', 'light');
    }
  }, [darkMode]);

  // Sync sound manager
  useEffect(() => {
    soundManager.enabled = soundEnabled;
    localStorage.setItem('qm_sound', String(soundEnabled));
  }, [soundEnabled]);

  // Initial data loading
  useEffect(() => {
    fetchQuizzes();
    fetchLeaderboard();
    fetchUsers();

    // Check cached user in localStorage
    const savedUser = localStorage.getItem('qm_user');
    if (savedUser) {
      try {
        setCurrentUser(JSON.parse(savedUser));
      } catch {}
    }
  }, []);

  const fetchQuizzes = async () => {
    try {
      setLoadingQuizzes(true);
      const res = await fetch('/api/quizzes');
      if (res.ok) {
        const data = await res.json();
        setQuizzes(data);
      }
    } catch (e) {
      console.error('Failed to load quizzes:', e);
    } finally {
      setLoadingQuizzes(false);
    }
  };

  const fetchLeaderboard = async (quizId?: string) => {
    try {
      const url = quizId ? `/api/leaderboard?quizId=${quizId}` : '/api/leaderboard';
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setLeaderboard(data);
      }
    } catch (e) {
      console.error('Failed to load leaderboard:', e);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/users');
      if (res.ok) {
        const data = await res.json();
        setAllUsers(data);
      }
    } catch (e) {
      console.error('Failed to load users:', e);
    }
  };

  // Start a Quiz
  const handleStartQuiz = async (quizId: string) => {
    try {
      const res = await fetch(`/api/quizzes/${quizId}`);
      if (res.ok) {
        const fullQuiz = await res.json();
        setQuizResult(null);
        setActiveQuiz(fullQuiz);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (e) {
      console.error('Failed to load quiz details:', e);
    }
  };

  // Submit Quiz Answers
  const handleSubmitQuiz = async (payload: SubmitQuizPayload) => {
    if (!activeQuiz) return;
    try {
      setSubmittingQuiz(true);
      const res = await fetch(`/api/quizzes/${activeQuiz.id}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...payload,
          user_id: currentUser.id,
          username: currentUser.username,
          email: currentUser.email,
        }),
      });

      if (res.ok) {
        const resultData: QuizResultResponse = await res.json();
        setActiveQuiz(null);
        setQuizResult(resultData);
        // Refresh leaderboard & quizzes in background
        fetchLeaderboard();
        fetchQuizzes();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        const err = await res.json();
        alert(err.error || 'Submission failed. Please try again.');
      }
    } catch (e) {
      console.error('Submission error:', e);
    } finally {
      setSubmittingQuiz(false);
    }
  };

  const handleRetakeQuiz = () => {
    if (quizResult) {
      const id = quizResult.quiz_id;
      setQuizResult(null);
      handleStartQuiz(id);
    }
  };

  const handleUserChanged = (newUser: User) => {
    setCurrentUser(newUser);
    localStorage.setItem('qm_user', JSON.stringify(newUser));
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      {/* Top Navbar */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={(tab) => {
          setActiveQuiz(null);
          setQuizResult(null);
          setCurrentTab(tab);
        }}
        currentUser={currentUser}
        onOpenProfile={() => setIsProfileOpen(true)}
        onOpenCreateQuiz={() => setIsCreateQuizOpen(true)}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        soundEnabled={soundEnabled}
        setSoundEnabled={setSoundEnabled}
        inQuizMode={!!activeQuiz}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeQuiz ? (
          /* Active MCQ Quiz Session */
          <QuizActive
            quiz={activeQuiz}
            userId={currentUser.id}
            username={currentUser.username}
            onExit={() => setActiveQuiz(null)}
            onSubmit={handleSubmitQuiz}
            submitting={submittingQuiz}
          />
        ) : quizResult ? (
          /* Quiz Results & Detailed Answer Review */
          <QuizResult
            result={quizResult}
            onRetake={handleRetakeQuiz}
            onBackToQuizzes={() => {
              setQuizResult(null);
              setCurrentTab('quizzes');
            }}
            onGoToLeaderboard={() => {
              setQuizResult(null);
              setCurrentTab('leaderboard');
            }}
          />
        ) : currentTab === 'leaderboard' ? (
          /* Leaderboard Standings */
          <Leaderboard
            entries={leaderboard}
            quizzes={quizzes}
            currentUser={currentUser}
            onSelectQuiz={(quizId) => handleStartQuiz(quizId)}
          />
        ) : (
          /* Quiz Catalog Browser */
          <QuizList
            quizzes={quizzes}
            loading={loadingQuizzes}
            onSelectQuiz={handleStartQuiz}
            onOpenCreateQuiz={() => setIsCreateQuizOpen(true)}
            onOpenLeaderboard={() => setCurrentTab('leaderboard')}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800/80 py-6 text-center text-xs text-slate-400 bg-white/50 dark:bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>QuizMaster Pro &copy; 2026. Real-time MCQ assessment and scoring engine.</span>
          <span className="flex items-center gap-1.5 font-semibold text-slate-500 dark:text-slate-400">
            Powered by Node.js + Express API & PostgreSQL Schema
          </span>
        </div>
      </footer>

      {/* Create Custom Quiz Modal */}
      <CreateQuizModal
        isOpen={isCreateQuizOpen}
        onClose={() => setIsCreateQuizOpen(false)}
        onQuizCreated={(newQuiz) => {
          fetchQuizzes();
          handleStartQuiz(newQuiz.id);
        }}
      />

      {/* User Profile / Switch Profile Modal */}
      <UserProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        currentUser={currentUser}
        onUserChanged={handleUserChanged}
        allUsers={allUsers}
      />
    </div>
  );
}
