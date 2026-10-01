import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Clock, 
  ChevronLeft, 
  ChevronRight, 
  Bookmark, 
  CheckCircle2, 
  AlertTriangle, 
  RotateCcw, 
  Send, 
  Menu, 
  X, 
  Volume2, 
  VolumeX,
  HelpCircle,
  Flag,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Quiz, Question, OptionKey, SubmitQuizPayload } from '../types/quiz.ts';
import { soundManager } from '../utils/sound.ts';

interface QuizActiveProps {
  quiz: Quiz & { questions: Question[] };
  userId: string;
  username: string;
  onExit: () => void;
  onSubmit: (payload: SubmitQuizPayload) => Promise<void>;
  submitting: boolean;
}

export const QuizActive: React.FC<QuizActiveProps> = ({
  quiz,
  userId,
  username,
  onExit,
  onSubmit,
  submitting,
}) => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<string, OptionKey>>({});
  const [markedForReview, setMarkedForReview] = useState<Record<string, boolean>>({});
  const [timeLeft, setTimeLeft] = useState<number>(quiz.time_limit);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState<boolean>(false);
  const [isMobilePaletteOpen, setIsMobilePaletteOpen] = useState<boolean>(false);
  const [isExitModalOpen, setIsExitModalOpen] = useState<boolean>(false);

  const startTimeRef = useRef<number>(Date.now());
  const timerIntervalRef = useRef<any>(null);

  const totalQuestions = quiz.questions.length;
  const currentQuestion = quiz.questions[currentIndex];

  // Timer countdown effect
  useEffect(() => {
    timerIntervalRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerIntervalRef.current);
          handleAutoSubmit();
          return 0;
        }

        // Sound alert during the final 10 seconds
        if (prev <= 10 && prev > 1) {
          soundManager.playTimerWarning();
        }

        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [quiz.id]);

  // Handle auto-submit on timeout
  const handleAutoSubmit = async () => {
    if (submitting) return;
    const timeTaken = Math.min(quiz.time_limit, Math.round((Date.now() - startTimeRef.current) / 1000));
    soundManager.playComplete();
    await onSubmit({
      user_id: userId,
      username,
      time_taken: timeTaken,
      answers,
    });
  };

  // Keyboard shortcut listener for options (1/2/3/4 or A/B/C/D) and arrows
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isSubmitModalOpen || isExitModalOpen) return;

      const key = e.key.toUpperCase();
      if (key === '1' || key === 'A') handleSelectOption('A');
      else if (key === '2' || key === 'B') handleSelectOption('B');
      else if (key === '3' || key === 'C') handleSelectOption('C');
      else if (key === '4' || key === 'D') handleSelectOption('D');
      else if (e.key === 'ArrowRight' && currentIndex < totalQuestions - 1) {
        goToNext();
      } else if (e.key === 'ArrowLeft' && currentIndex > 0) {
        goToPrev();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, isSubmitModalOpen, isExitModalOpen, currentQuestion?.id]);

  const handleSelectOption = (option: OptionKey) => {
    if (!currentQuestion) return;
    soundManager.playSelect();
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: option,
    }));
  };

  const handleClearAnswer = () => {
    if (!currentQuestion) return;
    soundManager.playNav();
    setAnswers(prev => {
      const copy = { ...prev };
      delete copy[currentQuestion.id];
      return copy;
    });
  };

  const toggleReviewMark = () => {
    if (!currentQuestion) return;
    soundManager.playNav();
    setMarkedForReview(prev => ({
      ...prev,
      [currentQuestion.id]: !prev[currentQuestion.id],
    }));
  };

  const goToNext = () => {
    if (currentIndex < totalQuestions - 1) {
      soundManager.playNav();
      setCurrentIndex(prev => prev + 1);
    }
  };

  const goToPrev = () => {
    if (currentIndex > 0) {
      soundManager.playNav();
      setCurrentIndex(prev => prev - 1);
    }
  };

  const jumpToQuestion = (index: number) => {
    soundManager.playNav();
    setCurrentIndex(index);
    setIsMobilePaletteOpen(false);
  };

  const confirmSubmit = async () => {
    setIsSubmitModalOpen(false);
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    const timeTaken = Math.min(quiz.time_limit, Math.round((Date.now() - startTimeRef.current) / 1000));
    soundManager.playComplete();
    await onSubmit({
      user_id: userId,
      username,
      time_taken: timeTaken,
      answers,
    });
  };

  // Metrics
  const answeredCount = useMemo(() => Object.keys(answers).length, [answers]);
  const reviewCount = useMemo(() => Object.values(markedForReview).filter(Boolean).length, [markedForReview]);
  const unansweredCount = totalQuestions - answeredCount;
  const progressPercent = Math.round((answeredCount / totalQuestions) * 100);

  // Format Timer mm:ss
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainder.toString().padStart(2, '0')}`;
  };

  const timerColor = useMemo(() => {
    const ratio = timeLeft / quiz.time_limit;
    if (ratio <= 0.15 || timeLeft <= 60) return 'text-rose-500 animate-pulse bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800';
    if (ratio <= 0.35) return 'text-amber-500 bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800';
    return 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800';
  }, [timeLeft, quiz.time_limit]);

  const selectedAnswer = currentQuestion ? answers[currentQuestion.id] : undefined;
  const isMarkedForReview = currentQuestion ? markedForReview[currentQuestion.id] : false;

  const optionsList: Array<{ key: OptionKey; text: string }> = currentQuestion ? [
    { key: 'A', text: currentQuestion.option_a },
    { key: 'B', text: currentQuestion.option_b },
    { key: 'C', text: currentQuestion.option_c },
    { key: 'D', text: currentQuestion.option_d },
  ] : [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-6">
      {/* Top Test Control Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
        {/* Quiz Info */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsExitModalOpen(true)}
            className="p-2 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition"
            title="Exit Assessment"
          >
            <X className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                {quiz.category}
              </span>
              <span className="text-slate-300 dark:text-slate-700">•</span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                {quiz.difficulty}
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white truncate max-w-xs sm:max-w-md">
              {quiz.title}
            </h2>
          </div>
        </div>

        {/* Live Timer Display & Action Bar */}
        <div className="flex items-center gap-3">
          {/* Countdown Clock */}
          <div className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl border text-sm font-black tracking-wider ${timerColor}`}>
            <Clock className="w-4 h-4" />
            <span>{formatTime(timeLeft)}</span>
          </div>

          {/* Mobile Palette Drawer Toggle */}
          <button
            onClick={() => setIsMobilePaletteOpen(!isMobilePaletteOpen)}
            className="lg:hidden p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            title="Question Palette"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Submit Quiz Button */}
          <button
            onClick={() => setIsSubmitModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs sm:text-sm bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm active:scale-95 transition"
          >
            <Send className="w-4 h-4" />
            <span>Submit Quiz</span>
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-200 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
        <div 
          className="bg-indigo-600 h-full rounded-full transition-all duration-300 ease-out"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Main Assessment Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left/Center: Main Question Card & MCQ Options */}
        <div className="lg:col-span-8 xl:col-span-9 space-y-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestion.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-8 shadow-xs space-y-6"
            >
              {/* Question Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800/80">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-extrabold text-sm">
                    Question {currentIndex + 1} of {totalQuestions}
                  </span>
                  {isMarkedForReview && (
                    <span className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                      <Bookmark className="w-3 h-3 fill-amber-500" />
                      Marked for Review
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={toggleReviewMark}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
                      isMarkedForReview 
                        ? 'border-amber-400 bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400' 
                        : 'border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Bookmark className={`w-3.5 h-3.5 ${isMarkedForReview ? 'fill-amber-500' : ''}`} />
                    <span className="hidden sm:inline">{isMarkedForReview ? 'Unmark' : 'Mark for Review'}</span>
                  </button>

                  {selectedAnswer && (
                    <button
                      onClick={handleClearAnswer}
                      className="px-2.5 py-1.5 text-xs font-semibold text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition"
                      title="Clear Selection"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              {/* Question Text */}
              <div className="space-y-3">
                <p className="text-base sm:text-xl font-bold text-slate-900 dark:text-white leading-relaxed whitespace-pre-line font-mono sm:font-sans">
                  {currentQuestion.question_text}
                </p>
                <p className="text-xs text-slate-400 dark:text-slate-500">
                  Select one option. You can also press keys 1-4 or A-D.
                </p>
              </div>

              {/* MCQ Options List */}
              <div className="space-y-3 pt-2">
                {optionsList.map((opt) => {
                  const isSelected = selectedAnswer === opt.key;
                  return (
                    <div
                      key={opt.key}
                      onClick={() => handleSelectOption(opt.key)}
                      className={`group relative flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all duration-150 select-none ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/40 shadow-xs'
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40'
                      }`}
                    >
                      {/* Key badge */}
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm shrink-0 transition ${
                          isSelected
                            ? 'bg-indigo-600 text-white shadow-xs'
                            : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 group-hover:border-indigo-400'
                        }`}
                      >
                        {opt.key}
                      </div>

                      {/* Option text */}
                      <span className={`text-sm sm:text-base font-medium flex-1 ${
                        isSelected 
                          ? 'text-indigo-950 dark:text-indigo-200 font-semibold' 
                          : 'text-slate-700 dark:text-slate-300'
                      }`}>
                        {opt.text}
                      </span>

                      {/* Radio indicator */}
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                        isSelected 
                          ? 'border-indigo-600 bg-indigo-600 text-white' 
                          : 'border-slate-300 dark:border-slate-600 bg-transparent'
                      }`}>
                        {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Navigation Actions Footer */}
              <div className="pt-6 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-3">
                <button
                  onClick={goToPrev}
                  disabled={currentIndex === 0}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>

                <div className="text-xs text-slate-400 font-medium hidden sm:block">
                  {answeredCount} of {totalQuestions} Answered
                </div>

                {currentIndex < totalQuestions - 1 ? (
                  <button
                    onClick={goToNext}
                    className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-indigo-600 text-white dark:bg-slate-800 dark:hover:bg-indigo-600 text-sm font-semibold transition shadow-xs active:scale-95"
                  >
                    <span>Next</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={() => setIsSubmitModalOpen(true)}
                    className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold shadow-md transition active:scale-95"
                  >
                    <span>Review & Submit</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Right Sidebar: Question Navigation Palette (Desktop) */}
        <div className="hidden lg:block lg:col-span-4 xl:col-span-3">
          <div className="sticky top-24 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-5">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Question Palette
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Click any number to jump directly
              </p>
            </div>

            {/* Matrix Legend */}
            <div className="grid grid-cols-2 gap-2 text-[11px] font-semibold">
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                <span className="w-3 h-3 rounded-md bg-emerald-500" />
                <span>Answered ({answeredCount})</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                <span className="w-3 h-3 rounded-md bg-amber-500" />
                <span>Review ({reviewCount})</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                <span className="w-3 h-3 rounded-md ring-2 ring-indigo-500 bg-indigo-50 dark:bg-slate-800" />
                <span>Current (#{currentIndex + 1})</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                <span className="w-3 h-3 rounded-md bg-slate-200 dark:bg-slate-800" />
                <span>Unattempted ({unansweredCount})</span>
              </div>
            </div>

            {/* Palette Buttons Grid */}
            <div className="grid grid-cols-5 gap-2 max-h-72 overflow-y-auto pr-1">
              {quiz.questions.map((q, idx) => {
                const isCurrent = idx === currentIndex;
                const isAnswered = !!answers[q.id];
                const isMarked = !!markedForReview[q.id];

                let btnStyle = 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200';
                if (isAnswered) {
                  btnStyle = 'bg-emerald-500 hover:bg-emerald-600 text-white font-bold shadow-xs';
                }
                if (isMarked) {
                  btnStyle = 'bg-amber-500 hover:bg-amber-600 text-white font-bold shadow-xs';
                }
                if (isCurrent) {
                  btnStyle += ' ring-2 ring-offset-2 ring-indigo-600 dark:ring-offset-slate-900';
                }

                return (
                  <button
                    key={q.id}
                    onClick={() => jumpToQuestion(idx)}
                    className={`h-10 rounded-xl text-xs font-semibold flex items-center justify-center transition-all duration-150 ${btnStyle}`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>

            {/* Submit Quick Button */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setIsSubmitModalOpen(true)}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-xs bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Submit Final Answers</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Drawer for Question Navigation */}
      {isMobilePaletteOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex justify-end bg-black/50 backdrop-blur-xs">
          <div className="w-80 max-w-full bg-white dark:bg-slate-900 h-full p-6 shadow-2xl flex flex-col justify-between overflow-y-auto">
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900 dark:text-white">
                  Question Palette
                </h3>
                <button
                  onClick={() => setIsMobilePaletteOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Grid of numbers */}
              <div className="grid grid-cols-4 gap-2">
                {quiz.questions.map((q, idx) => {
                  const isCurrent = idx === currentIndex;
                  const isAnswered = !!answers[q.id];
                  const isMarked = !!markedForReview[q.id];

                  let style = 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300';
                  if (isAnswered) style = 'bg-emerald-500 text-white font-bold';
                  if (isMarked) style = 'bg-amber-500 text-white font-bold';
                  if (isCurrent) style += ' ring-2 ring-indigo-600';

                  return (
                    <button
                      key={q.id}
                      onClick={() => jumpToQuestion(idx)}
                      className={`h-11 rounded-xl text-sm font-semibold flex items-center justify-center ${style}`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-6">
              <button
                onClick={() => {
                  setIsMobilePaletteOpen(false);
                  setIsSubmitModalOpen(true);
                }}
                className="w-full py-3 rounded-xl bg-indigo-600 text-white font-bold text-sm"
              >
                Proceed to Submit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Submit Modal */}
      {isSubmitModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl space-y-6">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
                Submit Assessment?
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                Please review your progress before finalizing. Once submitted, your score will be computed immediately.
              </p>
            </div>

            {/* Progress Breakdown Chips */}
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/60">
                <div className="text-lg font-black text-emerald-600 dark:text-emerald-400">
                  {answeredCount}
                </div>
                <div className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300">
                  Answered
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-800/60">
                <div className="text-lg font-black text-amber-600 dark:text-amber-400">
                  {reviewCount}
                </div>
                <div className="text-[11px] font-bold text-amber-700 dark:text-amber-300">
                  Marked
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200/60 dark:border-rose-800/60">
                <div className="text-lg font-black text-rose-600 dark:text-rose-400">
                  {unansweredCount}
                </div>
                <div className="text-[11px] font-bold text-rose-700 dark:text-rose-300">
                  Unanswered
                </div>
              </div>
            </div>

            {unansweredCount > 0 && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-xs text-amber-700 dark:text-amber-300 font-medium">
                <AlertTriangle className="w-4 h-4 shrink-0 text-amber-500" />
                <span>You still have {unansweredCount} unanswered questions!</span>
              </div>
            )}

            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsSubmitModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition"
              >
                Back to Questions
              </button>
              <button
                onClick={confirmSubmit}
                disabled={submitting}
                className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold shadow-md transition disabled:opacity-50"
              >
                {submitting ? 'Submitting...' : 'Confirm Submit'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Exit Early Warning Modal */}
      {isExitModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Quit Assessment?
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Your progress in this quiz session will not be recorded on the leaderboard.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsExitModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition"
              >
                Continue Quiz
              </button>
              <button
                onClick={onExit}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition"
              >
                Quit Assessment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
