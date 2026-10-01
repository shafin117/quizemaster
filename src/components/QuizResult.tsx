import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { 
  Trophy, 
  Award, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  RotateCcw, 
  ArrowLeft, 
  ChevronDown, 
  ChevronUp, 
  Check, 
  X, 
  Share2, 
  BarChart2, 
  Sparkles,
  HelpCircle
} from 'lucide-react';
import { QuizResultResponse } from '../types/quiz.ts';
import { soundManager } from '../utils/sound.ts';

interface QuizResultProps {
  result: QuizResultResponse;
  onRetake: () => void;
  onBackToQuizzes: () => void;
  onGoToLeaderboard: () => void;
}

export const QuizResult: React.FC<QuizResultProps> = ({
  result,
  onRetake,
  onBackToQuizzes,
  onGoToLeaderboard,
}) => {
  const [filter, setFilter] = useState<'all' | 'correct' | 'incorrect'>('all');
  const [expandedQuestionId, setExpandedQuestionId] = useState<string | null>(null);

  // Trigger celebration confetti on mount
  useEffect(() => {
    soundManager.playComplete();

    // Confetti effect
    const count = 200;
    const defaults = {
      origin: { y: 0.7 },
      zIndex: 9999,
    };

    function fire(particleRatio: number, opts: confetti.Options) {
      confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * particleRatio),
      });
    }

    if (result.score >= 50) {
      fire(0.25, {
        spread: 26,
        startVelocity: 55,
      });
      fire(0.2, {
        spread: 60,
      });
      fire(0.35, {
        spread: 100,
        decay: 0.91,
        scalar: 0.8,
      });
      fire(0.1, {
        spread: 120,
        startVelocity: 25,
        decay: 0.92,
        scalar: 1.2,
      });
      fire(0.1, {
        spread: 120,
        startVelocity: 45,
      });
    }
  }, [result.attempt_id]);

  const formatSeconds = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins === 0) return `${secs} seconds`;
    return `${mins}m ${secs}s`;
  };

  const getGradeInfo = (score: number) => {
    if (score >= 90) {
      return {
        title: 'Mastery Level',
        desc: 'Exceptional performance! You demonstrated comprehensive subject mastery.',
        badge: 'bg-emerald-500 text-white',
        border: 'border-emerald-500/30',
        gradient: 'from-emerald-600 via-teal-600 to-indigo-700',
      };
    } else if (score >= 70) {
      return {
        title: 'Proficient',
        desc: 'Great job! Strong conceptual understanding with high accuracy.',
        badge: 'bg-indigo-600 text-white',
        border: 'border-indigo-500/30',
        gradient: 'from-indigo-600 via-indigo-500 to-violet-700',
      };
    } else if (score >= 50) {
      return {
        title: 'Passing Score',
        desc: 'Good effort. Review missed questions below to solidify your knowledge.',
        badge: 'bg-amber-500 text-white',
        border: 'border-amber-500/30',
        gradient: 'from-amber-600 via-orange-500 to-indigo-700',
      };
    } else {
      return {
        title: 'Needs Practice',
        desc: 'Keep going! Review the detailed answer explanations below to strengthen concepts.',
        badge: 'bg-rose-500 text-white',
        border: 'border-rose-500/30',
        gradient: 'from-rose-600 via-pink-600 to-indigo-900',
      };
    }
  };

  const grade = getGradeInfo(result.score);

  const filteredQuestions = result.breakdown.filter(item => {
    if (filter === 'correct') return item.is_correct;
    if (filter === 'incorrect') return !item.is_correct;
    return true;
  });

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-8 pb-20">
      {/* Hero Performance Card */}
      <div className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${grade.gradient} text-white p-6 sm:p-10 shadow-2xl border ${grade.border}`}>
        <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-3 text-center sm:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-bold uppercase tracking-wider text-white">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              Quiz Assessment Complete
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              {result.quiz_title}
            </h1>
            <p className="text-sm sm:text-base text-white/90 max-w-md">
              {grade.desc}
            </p>

            <div className="pt-2 flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <span className={`text-xs font-bold px-3 py-1 rounded-full ${grade.badge} shadow-xs`}>
                {grade.title}
              </span>
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-white/20 text-white backdrop-blur-xs flex items-center gap-1.5">
                <Trophy className="w-3.5 h-3.5 text-amber-300" />
                Rank #{result.rank_in_quiz} of {result.total_attempts} attempts
              </span>
            </div>
          </div>

          {/* Radial Score Circle */}
          <div className="relative shrink-0 flex flex-col items-center justify-center p-6 rounded-3xl bg-white/10 backdrop-blur-md border border-white/20 shadow-inner">
            <span className="text-5xl sm:text-6xl font-black tracking-tight text-white">
              {result.score}%
            </span>
            <span className="text-xs font-semibold text-white/80 uppercase tracking-widest mt-1">
              Final Score
            </span>
            <span className="text-[11px] font-bold text-white/90 mt-1 bg-white/20 px-2 py-0.5 rounded-full">
              {result.correct_answers} / {result.total_questions} Correct
            </span>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs text-center space-y-1">
          <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-2">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {result.correct_answers}
          </div>
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Correct Answers
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs text-center space-y-1">
          <div className="w-8 h-8 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto mb-2">
            <XCircle className="w-5 h-5" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {result.wrong_answers}
          </div>
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Incorrect / Missed
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs text-center space-y-1">
          <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto mb-2">
            <Clock className="w-5 h-5" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {formatSeconds(result.time_taken)}
          </div>
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Time Taken
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs text-center space-y-1">
          <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto mb-2">
            <Trophy className="w-5 h-5" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            #{result.rank_in_quiz}
          </div>
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Leaderboard Rank
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          onClick={() => {
            soundManager.playNav();
            onRetake();
          }}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 font-semibold text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition active:scale-95 shadow-xs"
        >
          <RotateCcw className="w-4 h-4 text-indigo-500" />
          <span>Retake Quiz</span>
        </button>

        <button
          onClick={() => {
            soundManager.playNav();
            onGoToLeaderboard();
          }}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-800 dark:hover:bg-slate-700 font-semibold text-sm transition active:scale-95 shadow-xs"
        >
          <BarChart2 className="w-4 h-4 text-amber-400" />
          <span>View Standings</span>
        </button>

        <button
          onClick={() => {
            soundManager.playNav();
            onBackToQuizzes();
          }}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm transition active:scale-95 shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>All Quizzes</span>
        </button>
      </div>

      {/* Question-by-Question Detailed Review Section */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
              Answer Review & Explanations
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Inspect your answers, see correct solutions, and read detailed rationales.
            </p>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 rounded-lg transition ${
                filter === 'all' 
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs' 
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              All ({result.total_questions})
            </button>
            <button
              onClick={() => setFilter('correct')}
              className={`px-3 py-1.5 rounded-lg transition ${
                filter === 'correct' 
                  ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-xs' 
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Correct ({result.correct_answers})
            </button>
            <button
              onClick={() => setFilter('incorrect')}
              className={`px-3 py-1.5 rounded-lg transition ${
                filter === 'incorrect' 
                  ? 'bg-white dark:bg-slate-700 text-rose-600 dark:text-rose-400 shadow-xs' 
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Incorrect ({result.wrong_answers})
            </button>
          </div>
        </div>

        {/* Breakdown List */}
        <div className="space-y-4">
          {filteredQuestions.map((item, index) => {
            const isCorrect = item.is_correct;
            const isExpanded = expandedQuestionId === item.question_id;

            return (
              <div
                key={item.question_id}
                className={`rounded-2xl border p-4 sm:p-5 transition ${
                  isCorrect
                    ? 'border-emerald-200/80 bg-emerald-50/20 dark:border-emerald-950/80 dark:bg-emerald-950/10'
                    : 'border-rose-200/80 bg-rose-50/20 dark:border-rose-950/80 dark:bg-rose-950/10'
                }`}
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <span className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 ${
                      isCorrect 
                        ? 'bg-emerald-500 text-white' 
                        : 'bg-rose-500 text-white'
                    }`}>
                      {isCorrect ? <Check className="w-4 h-4 stroke-[3]" /> : <X className="w-4 h-4 stroke-[3]" />}
                    </span>
                    <span className="font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Question #{index + 1}
                    </span>
                  </div>

                  <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                    isCorrect 
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' 
                      : 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                  }`}>
                    {isCorrect ? 'Correct (+1 pt)' : 'Incorrect'}
                  </span>
                </div>

                {/* Question Text */}
                <p className="font-bold text-sm sm:text-base text-slate-900 dark:text-slate-100 mt-3 whitespace-pre-line">
                  {item.question_text}
                </p>

                {/* Answer Summary Pills */}
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className={`p-2.5 rounded-xl border flex items-center justify-between ${
                    item.user_answer 
                      ? isCorrect 
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-300'
                        : 'bg-rose-50 border-rose-200 text-rose-800 dark:bg-rose-950/40 dark:border-rose-800 dark:text-rose-300'
                      : 'bg-slate-100 border-slate-200 text-slate-500 dark:bg-slate-800 dark:border-slate-700'
                  }`}>
                    <span className="font-semibold">Your Choice:</span>
                    <span className="font-extrabold uppercase">
                      {item.user_answer ? `Option ${item.user_answer}` : 'Not Answered'}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl border border-emerald-300 bg-emerald-50/80 dark:bg-emerald-950/40 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 flex items-center justify-between">
                    <span className="font-semibold">Correct Answer:</span>
                    <span className="font-extrabold uppercase">Option {item.correct_answer}</span>
                  </div>
                </div>

                {/* Detailed Explanation */}
                <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-slate-800 text-xs sm:text-sm text-slate-600 dark:text-slate-300 space-y-1">
                  <span className="font-bold text-indigo-600 dark:text-indigo-400 block uppercase text-[11px] tracking-wider">
                    Explanation & Key Takeaway:
                  </span>
                  <p className="leading-relaxed">
                    {item.explanation}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
