import React, { useState, useEffect } from 'react';
import { 
  X, 
  User as UserIcon, 
  Trophy, 
  Clock, 
  BarChart3, 
  CheckCircle2, 
  UserCheck, 
  Plus, 
  History
} from 'lucide-react';
import { User, UserStats } from '../types/quiz.ts';
import { soundManager } from '../utils/sound.ts';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  onUserChanged: (user: User) => void;
  allUsers: User[];
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onUserChanged,
  allUsers,
}) => {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loadingStats, setLoadingStats] = useState<boolean>(false);
  const [isCreatingNew, setIsCreatingNew] = useState<boolean>(false);
  const [newUsername, setNewUsername] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && currentUser) {
      fetchUserStats(currentUser.id);
    }
  }, [isOpen, currentUser]);

  const fetchUserStats = async (userId: string) => {
    try {
      setLoadingStats(true);
      const res = await fetch(`/api/users/${userId}/stats`);
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (e) {
      console.error('Failed to fetch stats:', e);
    } finally {
      setLoadingStats(false);
    }
  };

  const handleSwitchUser = (user: User) => {
    soundManager.playNav();
    onUserChanged(user);
    fetchUserStats(user.id);
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!newUsername.trim() || !newEmail.trim()) {
      setErrorMsg('Please enter both username and email');
      return;
    }

    try {
      const res = await fetch('/api/users/login-or-register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: newUsername.trim(),
          email: newEmail.trim(),
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to create user account');
      }

      const user = await res.json();
      soundManager.playComplete();
      onUserChanged(user);
      setIsCreatingNew(false);
      setNewUsername('');
      setNewEmail('');
      fetchUserStats(user.id);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error creating user');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto my-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <img
              src={currentUser.avatar_url || 'https://api.dicebear.com/7.x/bottts/svg?seed=avatar'}
              alt={currentUser.username}
              className="w-12 h-12 rounded-full object-cover ring-2 ring-indigo-500 shadow-xs"
            />
            <div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white">
                {currentUser.username}
              </h2>
              <p className="text-xs text-slate-400">
                {currentUser.email}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Stats Snapshot */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="p-3 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-200/60 dark:border-indigo-800/60">
              <div className="text-xl font-black text-indigo-600 dark:text-indigo-400">
                {stats.total_attempts}
              </div>
              <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                Tests Taken
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/60">
              <div className="text-xl font-black text-emerald-600 dark:text-emerald-400">
                {stats.average_score}%
              </div>
              <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                Avg Score
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-amber-50/60 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-800/60">
              <div className="text-xl font-black text-amber-600 dark:text-amber-400">
                {stats.best_score}%
              </div>
              <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                Personal Best
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <div className="text-xl font-black text-slate-800 dark:text-slate-200">
                {Math.round(stats.total_time_spent / 60)}m
              </div>
              <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                Time Spent
              </div>
            </div>
          </div>
        )}

        {/* Switch Profile Section */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Switch Player Profile
            </span>
            <button
              onClick={() => setIsCreatingNew(!isCreatingNew)}
              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              {isCreatingNew ? 'View List' : 'New Player'}
            </button>
          </div>

          {isCreatingNew ? (
            <form onSubmit={handleCreateUser} className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 space-y-3">
              {errorMsg && (
                <div className="text-xs font-semibold text-rose-600">{errorMsg}</div>
              )}
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">
                  Player Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Jordan Hayes"
                  value={newUsername}
                  onChange={e => setNewUsername(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs sm:text-sm text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  placeholder="jordan@example.com"
                  value={newEmail}
                  onChange={e => setNewEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs sm:text-sm text-slate-900 dark:text-white"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-700 transition"
              >
                Create & Switch
              </button>
            </form>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto">
              {allUsers.map((u) => {
                const isActive = u.id === currentUser.id;
                return (
                  <button
                    key={u.id}
                    onClick={() => handleSwitchUser(u)}
                    className={`flex items-center gap-3 p-2.5 rounded-xl border text-left transition ${
                      isActive
                        ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <img
                      src={u.avatar_url || 'https://api.dicebear.com/7.x/bottts/svg?seed=user'}
                      alt={u.username}
                      className="w-7 h-7 rounded-full object-cover shrink-0"
                    />
                    <div className="truncate flex-1">
                      <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {u.username}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate">
                        {u.email}
                      </div>
                    </div>
                    {isActive && (
                      <span className="w-2 h-2 rounded-full bg-indigo-600 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Close Button */}
        <div className="pt-2">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs sm:text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
