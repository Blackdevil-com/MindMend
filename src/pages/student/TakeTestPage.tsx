import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { useNotification } from '../../context/NotificationContext';
import { Question, Test } from '../../types/index';
import { Modal } from '../../components/common/Modal';
import {
  Clock,
  AlertTriangle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Flag,
  Send,
  HelpCircle,
  ShieldAlert,
} from 'lucide-react';

export const TakeTestPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useNotification();

  const [test, setTest] = useState<Test | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [attemptId, setAttemptId] = useState<number | null>(null);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [flagged, setFlagged] = useState<Record<number, boolean>>({});
  const [secondsRemaining, setSecondsRemaining] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // 1. Fetch test interface
  useEffect(() => {
    if (id) {
      api.get(`/tests/take/${id}`)
        .then(data => {
          setTest(data.test);
          setQuestions(data.questions || []);
          setAttemptId(data.attempt_id);

          // Calculate remaining seconds
          const durationSeconds = data.test.duration_minutes * 60;
          setSecondsRemaining(durationSeconds);

          // Restore any draft answers from localStorage
          const savedAnswers = localStorage.getItem(`test_draft_${id}`);
          if (savedAnswers) {
            try {
              setAnswers(JSON.parse(savedAnswers));
            } catch (e) {}
          }
        })
        .catch(err => {
          console.error('Failed to load test', err);
          showToast(err.message || 'Cannot start test', 'error');
          navigate('/student/tests');
        })
        .finally(() => setLoading(false));
    }
  }, [id]);

  // 2. Countdown Timer
  useEffect(() => {
    if (secondsRemaining <= 0 && !loading && questions.length > 0) {
      // Auto submit test on expiry!
      handleAutoSubmit();
      return;
    }

    timerRef.current = setInterval(() => {
      setSecondsRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [secondsRemaining, loading, questions.length]);

  // Auto-save answers in localStorage to prevent loss
  const handleSelectAnswer = (questionId: number, answerValue: string) => {
    const updated = { ...answers, [questionId]: answerValue };
    setAnswers(updated);
    if (id) {
      localStorage.setItem(`test_draft_${id}`, JSON.stringify(updated));
    }
  };

  const toggleFlag = (idx: number) => {
    setFlagged(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  const handleAutoSubmit = async () => {
    showToast('Time expired! Automatically submitting your answers...', 'warning', 'Time Over');
    await submitTest();
  };

  const submitTest = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      const formattedAnswers = Object.entries(answers).map(([qId, ans]) => ({
        question_id: Number(qId),
        selected_answer: ans,
      }));

      const res = await api.post(`/tests/submit/${id}`, {
        answers: formattedAnswers,
      });

      // Clear local storage draft
      if (id) localStorage.removeItem(`test_draft_${id}`);

      showToast('Assessment submitted and graded successfully!', 'success', 'Submitted');
      navigate(`/student/results/${res.attempt_id}`);
    } catch (err: any) {
      showToast(err.message || 'Failed to submit test', 'error');
      setSubmitting(false);
    }
  };

  // Format seconds to HH:MM:SS
  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!test || questions.length === 0) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 rounded-3xl bg-[#0F172A] border border-slate-800 text-center space-y-4">
        <h3 className="text-lg font-bold text-white">No Questions in this Assessment</h3>
        <p className="text-xs text-slate-400">Please check back later or contact your instructor.</p>
        <button
          onClick={() => navigate('/student/tests')}
          className="px-4 py-2 bg-brand-600 rounded-xl text-white text-xs font-semibold"
        >
          Back to Tests
        </button>
      </div>
    );
  }

  const currentQ = questions[currentIndex];
  const isLastQuestion = currentIndex === questions.length - 1;
  const answeredCount = Object.keys(answers).length;
  const isUrgent = secondsRemaining < 180; // under 3 minutes

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* 1. Header Bar with Live Countdown Timer */}
      <div className="p-5 sm:p-6 rounded-3xl bg-[#0F172A] border border-slate-800 shadow-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sticky top-16 z-20 backdrop-blur-md">
        <div className="space-y-1">
          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-brand-950 text-brand-300 border border-brand-500/30">
            {test.subject} Assessment
          </span>
          <h2 className="font-display font-extrabold text-lg sm:text-xl text-white">{test.title}</h2>
        </div>

        {/* Timer Box */}
        <div
          className={`flex items-center gap-2.5 px-4 py-2 rounded-2xl border transition-all ${
            isUrgent
              ? 'bg-rose-950/80 border-rose-500/60 text-rose-300 animate-pulse shadow-glow-sm'
              : 'bg-slate-900 border-slate-700 text-slate-200'
          }`}
        >
          <Clock className={`w-5 h-5 ${isUrgent ? 'text-rose-400' : 'text-brand-400'}`} />
          <div>
            <span className="text-[9px] uppercase tracking-wider block font-bold text-slate-400">
              Time Remaining
            </span>
            <span className="font-mono font-black text-lg tracking-wider">
              {formatTime(secondsRemaining)}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Main Question Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left 3 Cols: Active Question Card */}
        <div className="lg:col-span-3 space-y-6">
          <div className="p-6 sm:p-8 rounded-3xl bg-[#0F172A] border border-slate-800 shadow-2xl space-y-6">
            {/* Question Top metadata */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 text-xs">
              <span className="font-bold text-white flex items-center gap-1.5">
                <span className="w-6 h-6 rounded-md bg-brand-950 text-brand-300 border border-brand-500/30 flex items-center justify-center font-mono">
                  {currentIndex + 1}
                </span>
                <span>of {questions.length} Questions</span>
              </span>

              <div className="flex items-center gap-2">
                <span className="text-slate-400 text-[11px]">Marks: {currentQ.marks}</span>
                <button
                  onClick={() => toggleFlag(currentIndex)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                    flagged[currentIndex]
                      ? 'bg-amber-950/80 text-amber-300 border border-amber-500/40'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <Flag className="w-3.5 h-3.5" />
                  <span>{flagged[currentIndex] ? 'Flagged' : 'Flag for Review'}</span>
                </button>
              </div>
            </div>

            {/* Question Text */}
            <div className="space-y-3">
              <h3 className="font-display font-bold text-base sm:text-lg text-white leading-relaxed">
                {currentQ.question_text}
              </h3>
            </div>

            {/* Options Selection Area */}
            <div className="space-y-3 pt-2">
              {/* Multiple Choice Options */}
              {currentQ.question_type === 'mcq' && (
                <div className="grid grid-cols-1 gap-3">
                  {[
                    { key: 'A', text: currentQ.option_a },
                    { key: 'B', text: currentQ.option_b },
                    { key: 'C', text: currentQ.option_c },
                    { key: 'D', text: currentQ.option_d },
                  ].filter(opt => opt.text).map(opt => {
                    const isSelected = answers[currentQ.id!] === opt.text;
                    return (
                      <button
                        key={opt.key}
                        type="button"
                        onClick={() => handleSelectAnswer(currentQ.id!, opt.text!)}
                        className={`w-full p-4 rounded-2xl border text-left transition-all flex items-start gap-3.5 ${
                          isSelected
                            ? 'bg-brand-950/80 border-brand-500 text-white shadow-glow-sm'
                            : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white'
                        }`}
                      >
                        <span
                          className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs font-mono flex-shrink-0 transition-colors ${
                            isSelected
                              ? 'bg-brand-600 text-white'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {opt.key}
                        </span>
                        <span className="text-xs sm:text-sm pt-0.5 leading-relaxed">{opt.text}</span>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* True/False Options */}
              {currentQ.question_type === 'true_false' && (
                <div className="grid grid-cols-2 gap-4">
                  {['True', 'False'].map(val => {
                    const isSelected = answers[currentQ.id!] === val;
                    return (
                      <button
                        key={val}
                        type="button"
                        onClick={() => handleSelectAnswer(currentQ.id!, val)}
                        className={`p-5 rounded-2xl border text-center font-bold text-sm transition-all ${
                          isSelected
                            ? 'bg-brand-950/80 border-brand-500 text-white shadow-glow-sm'
                            : 'bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white'
                        }`}
                      >
                        {val}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Short Answer Input */}
              {currentQ.question_type === 'short_answer' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                    Type your concise answer below:
                  </label>
                  <input
                    type="text"
                    value={answers[currentQ.id!] || ''}
                    onChange={e => handleSelectAnswer(currentQ.id!, e.target.value)}
                    placeholder="Enter answer keyword..."
                    className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-2xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
                  />
                </div>
              )}
            </div>

            {/* Navigation Footer */}
            <div className="pt-6 border-t border-slate-800 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
                disabled={currentIndex === 0}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:hover:bg-slate-800 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>

              {isLastQuestion ? (
                <button
                  type="button"
                  onClick={() => setConfirmModalOpen(true)}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white text-xs font-bold shadow-sm flex items-center gap-2 transition-all"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit Test</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setCurrentIndex(prev => Math.min(questions.length - 1, prev + 1))}
                  className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
                >
                  <span>Next Question</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Question Navigation Palette */}
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-[#0F172A] border border-slate-800 space-y-5 shadow-2xl">
            <h4 className="font-display font-bold text-sm text-white uppercase tracking-wider">
              Question Palette
            </h4>

            {/* Status Legend */}
            <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-400">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-emerald-500"></span>
                <span>Answered ({answeredCount})</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-slate-700"></span>
                <span>Unanswered ({questions.length - answeredCount})</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-amber-500"></span>
                <span>Review</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-brand-600"></span>
                <span>Current</span>
              </div>
            </div>

            {/* Grid of numbers */}
            <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 pt-2">
              {questions.map((q, idx) => {
                const isAnswered = Boolean(answers[q.id!]);
                const isCurrent = currentIndex === idx;
                const isFlagged = Boolean(flagged[idx]);

                let bgStyle = 'bg-slate-800 text-slate-400 hover:bg-slate-700';
                if (isCurrent) {
                  bgStyle = 'bg-brand-600 text-white ring-2 ring-brand-400';
                } else if (isFlagged) {
                  bgStyle = 'bg-amber-600 text-white';
                } else if (isAnswered) {
                  bgStyle = 'bg-emerald-600 text-white';
                }

                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setCurrentIndex(idx)}
                    className={`h-9 rounded-xl font-bold text-xs font-mono transition-all ${bgStyle}`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>

            {/* Submit button on sidebar */}
            <div className="pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setConfirmModalOpen(true)}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-500 hover:to-brand-600 text-white text-xs font-bold shadow-glow-violet transition-all flex items-center justify-center gap-2"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Submit Final Test</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      <Modal
        isOpen={confirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        title="Confirm Test Submission"
        subtitle="Please review your progress before final evaluation."
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300">
            <div>
              <span className="text-[10px] text-slate-400 block uppercase">Total Questions</span>
              <span className="font-bold text-white text-base">{questions.length}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block uppercase">Answered</span>
              <span className="font-bold text-emerald-400 text-base">{answeredCount}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block uppercase">Unanswered</span>
              <span className="font-bold text-amber-400 text-base">{questions.length - answeredCount}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block uppercase">Time Left</span>
              <span className="font-bold text-brand-300 text-base font-mono">{formatTime(secondsRemaining)}</span>
            </div>
          </div>

          <p className="text-xs text-slate-400">
            Once submitted, your answers will be automatically evaluated and you will instantly receive your detailed score report and explanations.
          </p>

          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={() => setConfirmModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700"
            >
              Resume Test
            </button>
            <button
              onClick={submitTest}
              disabled={submitting}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 text-white text-xs font-bold shadow-sm flex items-center gap-2"
            >
              {submitting ? 'Evaluating...' : 'Yes, Submit Test'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
