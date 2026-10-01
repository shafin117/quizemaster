import React, { useState, useMemo } from 'react';
import { 
  Trophy, 
  Medal, 
  Crown, 
  Clock, 
  Target, 
  CheckCircle2, 
  Filter, 
  Flame, 
  Award,
  User as UserIcon,
  Search
} from 'lucide-react';
import { LeaderboardEntry, Quiz, User } from '../types/quiz.ts';
import { soundManager } from '../utils/sound.ts';

interface LeaderboardProps {
  entries: LeaderboardEntry[];
  quizzes: Quiz[];
  currentUser: User;
  onSelectQuiz: (quizId: string) => void;
}

export const Leaderboard: React.FC<LeaderboardProps> = ({
  entries,
  quizzes,
  currentUser,
  onSelectQuiz,
}) => {
  const [selectedQuizId, setSelectedQuizId] = useState<string>('all');
  const [searchUser, setSearchUser] = useState<string>('');

  const filteredEntries = useMemo(() => {
    return entries.filter(e => {
      const matchQuiz = selectedQuizId === 'all' || e.quiz_id === selectedQuizId;
      const matchUser = e.username.toLowerCase().includes(searchUser.toLowerCase());
      return matchQuiz && matchUser;
    });
  }, [entries, selectedQuizId, searchUser]);

  const topThree = filteredEntries.slice(0, 3);
  const remainingEntries = filteredEntries.slice(3);

  const formatSeconds = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    if (mins === 0) return `${remainder}s`;
    return `${mins}m ${remainder}s`;
  };

  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8 pb-20">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold text-xs uppercase tracking-wider mb-2">
            <Trophy className="w-3.5 h-3.5 text-amber-500" />
            Competitive Rankings
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            Hall of Fame Leaderboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Ranked by score percentage and completion speed.
          </p>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {/* Quiz selector */}
          <div className="relative flex-1 sm:w-64">
            <select
              value={selectedQuizId}
              onChange={(e) => {
                soundManager.playNav();
                setSelectedQuizId(e.target.value);
              }}
              className="w-full pl-3 pr-8 py-2 text-xs sm:text-sm font-semibold rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer shadow-xs"
            >
              <option value="all">🏆 All Quizzes (Overall)</option>
              {quizzes.map(q => (
                <option key={q.id} value={q.id}>
                  {q.title}
                </option>
              ))}
            </select>
          </div>

          {/* User Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search user..."
              value={searchUser}
              onChange={(e) => setSearchUser(e.target.value)}
              className="pl-8 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-xs"
            />
          </div>
        </div>
      </div>

      {/* Top 3 Podium (Shown if at least 1 entry exists) */}
      {topThree.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 items-end">
          {/* 2nd Place (Silver) */}
          {topThree[1] && (
            <div className="order-2 sm:order-1 rounded-3xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 p-5 shadow-sm text-center flex flex-col items-center space-y-3 relative hover:scale-[1.02] transition">
              <div className="w-9 h-9 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-extrabold text-sm flex items-center justify-center shadow-xs">
                2
              </div>
              <div className="relative">
                <img
                  src={topThree[1].avatar_url || 'https://api.dicebear.com/7.x/bottts/svg?seed=user'}
                  alt={topThree[1].username}
                  className="w-16 h-16 rounded-full object-cover ring-4 ring-slate-300 dark:ring-slate-700 shadow-sm"
                />
                <span className="absolute -bottom-1 -right-1 p-1 bg-slate-300 rounded-full shadow-xs text-xs">
                  🥈
                </span>
              </div>
              <div>
                <h4 className="font-extrabold text-slate-900 dark:text-white text-sm truncate max-w-[150px]">
                  {topThree[1].username}
                </h4>
                <p className="text-[11px] text-slate-400 truncate max-w-[150px]">
                  {topThree[1].quiz_title}
                </p>
              </div>
              <div className="w-full pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-around text-xs">
                <div>
                  <span className="font-bold text-slate-900 dark:text-white text-base block">{topThree[1].score}%</span>
                  <span className="text-[10px] text-slate-400">Score</span>
                </div>
                <div>
                  <span className="font-bold text-slate-900 dark:text-white text-base block">{formatSeconds(topThree[1].time_taken)}</span>
                  <span className="text-[10px] text-slate-400">Time</span>
                </div>
              </div>
            </div>
          )}

          {/* 1st Place (Gold / Champion) */}
          {topThree[0] && (
            <div className="order-1 sm:order-2 rounded-3xl bg-gradient-to-b from-amber-50 to-white dark:from-amber-950/20 dark:to-slate-900 border-2 border-amber-300 dark:border-amber-700 p-6 shadow-md text-center flex flex-col items-center space-y-3 relative hover:scale-[1.02] transition sm:-translate-y-2">
              <div className="w-10 h-10 rounded-full bg-amber-400 text-amber-950 font-black text-base flex items-center justify-center shadow-md">
                <Crown className="w-5 h-5 fill-amber-950" />
              </div>
              <div className="relative">
                <img
                  src={topThree[0].avatar_url || 'https://api.dicebear.com/7.x/bottts/svg?seed=gold'}
                  alt={topThree[0].username}
                  className="w-20 h-20 rounded-full object-cover ring-4 ring-amber-400 shadow-md"
                />
                <span className="absolute -bottom-1 -right-1 p-1 bg-amber-400 rounded-full shadow-sm text-sm">
                  🥇
                </span>
              </div>
              <div>
                <h4 className="font-black text-slate-900 dark:text-white text-base truncate max-w-[170px]">
                  {topThree[0].username}
                </h4>
                <p className="text-xs text-amber-600 dark:text-amber-400 font-semibold truncate max-w-[170px]">
                  {topThree[0].quiz_title}
                </p>
              </div>
              <div className="w-full pt-2 border-t border-amber-200/60 dark:border-amber-900/60 flex justify-around text-xs">
                <div>
                  <span className="font-extrabold text-amber-600 dark:text-amber-400 text-lg block">{topThree[0].score}%</span>
                  <span className="text-[10px] text-slate-400 font-semibold">Score</span>
                </div>
                <div>
                  <span className="font-extrabold text-slate-800 dark:text-slate-200 text-lg block">{formatSeconds(topThree[0].time_taken)}</span>
                  <span className="text-[10px] text-slate-400 font-semibold">Speed</span>
                </div>
              </div>
            </div>
          )}

          {/* 3rd Place (Bronze) */}
          {topThree[2] && (
            <div className="order-3 sm:order-3 rounded-3xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 p-5 shadow-sm text-center flex flex-col items-center space-y-3 relative hover:scale-[1.02] transition">
              <div className="w-9 h-9 rounded-full bg-amber-800/10 text-amber-800 dark:text-amber-400 font-extrabold text-sm flex items-center justify-center shadow-xs">
                3
              </div>
              <div className="relative">
                <img
                  src={topThree[2].avatar_url || 'https://api.dicebear.com/7.x/bottts/svg?seed=bronze'}
                  alt={topThree[2].username}
                  className="w-16 h-16 rounded-full object-cover ring-4 ring-amber-700/40 shadow-sm"
                />
                <span className="absolute -bottom-1 -right-1 p-1 bg-amber-700/60 rounded-full shadow-xs text-xs">
                  🥉
                </span>
              </div>
              <div>
                <h4 className="font-extrabold text-slate-900 dark:text-white text-sm truncate max-w-[150px]">
                  {topThree[2].username}
                </h4>
                <p className="text-[11px] text-slate-400 truncate max-w-[150px]">
                  {topThree[2].quiz_title}
                </p>
              </div>
              <div className="w-full pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-around text-xs">
                <div>
                  <span className="font-bold text-slate-900 dark:text-white text-base block">{topThree[2].score}%</span>
                  <span className="text-[10px] text-slate-400">Score</span>
                </div>
                <div>
                  <span className="font-bold text-slate-900 dark:text-white text-base block">{formatSeconds(topThree[2].time_taken)}</span>
                  <span className="text-[10px] text-slate-400">Time</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Full Leaderboard Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 text-xs uppercase font-bold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-5 py-3.5">Rank</th>
                <th className="px-5 py-3.5">Player</th>
                <th className="px-5 py-3.5">Assessment</th>
                <th className="px-5 py-3.5">Score</th>
                <th className="px-5 py-3.5">Accuracy</th>
                <th className="px-5 py-3.5">Time Taken</th>
                <th className="px-5 py-3.5">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredEntries.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-slate-400">
                    No leaderboard records found for this filter.
                  </td>
                </tr>
              ) : (
                filteredEntries.map((entry) => {
                  const isCurrent = entry.user_id === currentUser.id;

                  return (
                    <tr
                      key={entry.rank + '-' + entry.completed_at}
                      className={`hover:bg-slate-50 dark:hover:bg-slate-800/40 transition ${
                        isCurrent ? 'bg-indigo-50/60 dark:bg-indigo-950/30 font-semibold' : ''
                      }`}
                    >
                      {/* Rank */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center justify-center w-7 h-7 rounded-lg text-xs font-black ${
                          entry.rank === 1 ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' :
                          entry.rank === 2 ? 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300' :
                          entry.rank === 3 ? 'bg-amber-800/20 text-amber-800 dark:bg-amber-950/60 dark:text-amber-400' :
                          'text-slate-500'
                        }`}>
                          {entry.rank}
                        </span>
                      </td>

                      {/* User */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <img
                            src={entry.avatar_url || 'https://api.dicebear.com/7.x/bottts/svg?seed=user'}
                            alt={entry.username}
                            className="w-8 h-8 rounded-full object-cover ring-2 ring-slate-200 dark:ring-slate-700"
                          />
                          <div>
                            <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                              {entry.username}
                              {isCurrent && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded-sm bg-indigo-600 text-white font-bold">
                                  YOU
                                </span>
                              )}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Quiz Title */}
                      <td className="px-5 py-4 whitespace-nowrap text-slate-600 dark:text-slate-300 font-medium">
                        {entry.quiz_title}
                      </td>

                      {/* Score % */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-black ${
                          entry.score >= 90 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' :
                          entry.score >= 70 ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300' :
                          entry.score >= 50 ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300' :
                          'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                        }`}>
                          {entry.score}%
                        </span>
                      </td>

                      {/* Accuracy */}
                      <td className="px-5 py-4 whitespace-nowrap text-xs text-slate-500 dark:text-slate-400">
                        {entry.correct_answers} correct / {entry.wrong_answers} wrong
                      </td>

                      {/* Time taken */}
                      <td className="px-5 py-4 whitespace-nowrap text-xs text-slate-600 dark:text-slate-300 font-medium">
                        {formatSeconds(entry.time_taken)}
                      </td>

                      {/* Date */}
                      <td className="px-5 py-4 whitespace-nowrap text-xs text-slate-400">
                        {formatDate(entry.completed_at)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
