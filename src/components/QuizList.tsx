import React, { useState, useMemo } from 'react';
import { 
  Clock, 
  HelpCircle, 
  Play, 
  Search, 
  BarChart3, 
  CheckCircle2, 
  Layers, 
  Flame, 
  PlusCircle, 
  Filter
} from 'lucide-react';
import { Quiz, Difficulty } from '../types/quiz.ts';
import { soundManager } from '../utils/sound.ts';

interface QuizListProps {
  quizzes: Quiz[];
  loading: boolean;
  onSelectQuiz: (quizId: string) => void;
  onOpenCreateQuiz: () => void;
  onOpenLeaderboard: () => void;
}

export const QuizList: React.FC<QuizListProps> = ({
  quizzes,
  loading,
  onSelectQuiz,
  onOpenCreateQuiz,
  onOpenLeaderboard,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('All');

  // Extract categories dynamically
  const categories = useMemo(() => {
    const set = new Set<string>();
    quizzes.forEach(q => set.add(q.category));
    return ['All', ...Array.from(set)];
  }, [quizzes]);

  // Filter quizzes
  const filteredQuizzes = useMemo(() => {
    return quizzes.filter(q => {
      const matchSearch = q.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          q.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchCategory = selectedCategory === 'All' || q.category === selectedCategory;
      const matchDifficulty = selectedDifficulty === 'All' || q.difficulty === selectedDifficulty;
      return matchSearch && matchCategory && matchDifficulty;
    });
  }, [quizzes, searchTerm, selectedCategory, selectedDifficulty]);

  const getDifficultyBadge = (difficulty: Difficulty) => {
    switch (difficulty) {
      case 'Easy':
        return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
      case 'Medium':
        return 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800';
      case 'Hard':
        return 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-800';
    }
  };

  const formatMinutes = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (secs === 0) return `${mins} mins`;
    return `${mins}m ${secs}s`;
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-900 via-indigo-800 to-slate-900 text-white p-6 sm:p-10 shadow-xl border border-indigo-700/30">
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-16 -bottom-16 w-64 h-64 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-semibold uppercase tracking-wider text-indigo-200">
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            Live Timed Assessments & Rankings
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Master Technical Skills Under Real Exam Pressure.
          </h1>
          <p className="text-sm sm:text-base text-indigo-100/90 leading-relaxed font-normal">
            Take timed MCQs, review questions with interactive answer palettes, track personal high scores, and climb to the top of the global leaderboards.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={() => {
                if (quizzes.length > 0) onSelectQuiz(quizzes[0].id);
              }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm bg-white text-indigo-900 hover:bg-indigo-50 shadow-md transition active:scale-95"
            >
              <Play className="w-4 h-4 fill-indigo-900 text-indigo-900" />
              Quick Start: {quizzes[0]?.title || 'Featured Quiz'}
            </button>
            <button
              onClick={onOpenLeaderboard}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm bg-indigo-800/80 hover:bg-indigo-700/80 border border-indigo-600/50 text-white transition active:scale-95"
            >
              <BarChart3 className="w-4 h-4 text-amber-400" />
              View Standings
            </button>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search quizzes by topic, technology, or keywords..."
              className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition shadow-xs"
            />
          </div>

          <div className="flex items-center gap-2.5">
            {/* Difficulty Filter */}
            <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
              <span className="text-xs font-semibold px-2 text-slate-400 flex items-center gap-1">
                <Filter className="w-3 h-3" />
                Diff:
              </span>
              {['All', 'Easy', 'Medium', 'Hard'].map((diff) => (
                <button
                  key={diff}
                  onClick={() => {
                    setSelectedDifficulty(diff);
                    soundManager.playNav();
                  }}
                  className={`text-xs font-semibold px-2.5 py-1.5 rounded-lg transition ${
                    selectedDifficulty === diff
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {diff}
                </button>
              ))}
            </div>

            {/* Mobile Create Button */}
            <button
              onClick={onOpenCreateQuiz}
              className="md:hidden flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 active:scale-95"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Create</span>
            </button>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setSelectedCategory(cat);
                soundManager.playNav();
              }}
              className={`whitespace-nowrap px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${
                selectedCategory === cat
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Quizzes Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map(n => (
            <div key={n} className="rounded-2xl border border-slate-200 dark:border-slate-800 p-6 bg-white dark:bg-slate-900 animate-pulse space-y-4">
              <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded-md w-3/4" />
              <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded-md w-full" />
              <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded-md w-2/3" />
              <div className="pt-4 flex justify-between">
                <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded-lg w-24" />
                <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded-lg w-24" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredQuizzes.length === 0 ? (
        <div className="text-center py-16 px-4 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900/50">
          <HelpCircle className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">No quizzes match your filters</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1 mb-5">
            Try adjusting your search criteria or category filter, or build a new custom quiz.
          </p>
          <button
            onClick={onOpenCreateQuiz}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white font-semibold text-sm hover:bg-indigo-700 shadow-sm"
          >
            <PlusCircle className="w-4 h-4" />
            Build New Quiz
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredQuizzes.map((quiz) => (
            <div
              key={quiz.id}
              className="flex flex-col justify-between rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 hover:shadow-lg hover:border-indigo-300 dark:hover:border-indigo-700 transition duration-200 group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                    {quiz.category}
                  </span>
                  <span className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${getDifficultyBadge(quiz.difficulty)}`}>
                    {quiz.difficulty}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2">
                  {quiz.title}
                </h3>

                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                  {quiz.description}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/80 space-y-4">
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                    <div className="flex items-center justify-center gap-1 text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                      <Clock className="w-3 h-3 text-indigo-500" />
                      Time
                    </div>
                    <div className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                      {formatMinutes(quiz.time_limit)}
                    </div>
                  </div>

                  <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                    <div className="flex items-center justify-center gap-1 text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                      <Layers className="w-3 h-3 text-indigo-500" />
                      Questions
                    </div>
                    <div className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                      {quiz.question_count || 0} MCQs
                    </div>
                  </div>

                  <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                    <div className="flex items-center justify-center gap-1 text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                      <BarChart3 className="w-3 h-3 text-amber-500" />
                      Avg Score
                    </div>
                    <div className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                      {quiz.average_score !== undefined ? `${quiz.average_score}%` : 'N/A'}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    soundManager.playNav();
                    onSelectQuiz(quiz.id);
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm bg-slate-900 hover:bg-indigo-600 text-white dark:bg-slate-800 dark:hover:bg-indigo-600 transition shadow-sm group-hover:bg-indigo-600 active:scale-[0.98]"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>Start Assessment</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
