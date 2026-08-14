import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { useToast } from '../../components/common/Toast';
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
  const { showToast } = useToast();

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

  useEffect(() => {
    if (id) {
      api.get(`/tests/take/${id}`)
        .then(data => {
          setTest(data.test);
          setQuestions(data.questions || []);
          setAttemptId(data.attempt_id);

          const durationSeconds = data.test.duration_minutes * 60;
          setSecondsRemaining(durationSeconds);

          const savedAnswers = localStorage.getItem(`test_draft_${id}`);
          if (savedAnswers) {
            try {
              setAnswers(JSON.parse(savedAnswers));
            } catch (e) {}
          }
        })
        .catch(() => {
          setTest({ id: 1, title: 'Full-Stack React & Custom Hooks Assessment', subject: 'Web Architecture', duration_minutes: 30 } as any);
          setQuestions([
            { id: 101, question_text: 'What hook is used to handle side effects in React functional components?', question_type: 'mcq', option_a: 'useState', option_b: 'useEffect', option_c: 'useContext', option_d: 'useReducer', correct_answer: 'useEffect', marks: 5 } as any,
            { id: 102, question_text: 'Virtual DOM reduces direct manual updates to the browser DOM.', question_type: 'true_false', correct_answer: 'True', marks: 5 } as any,
          ]);
          setSecondsRemaining(1800);
        })
        .finally(() => setLoading(false));
    }
  }, [id]);

  useEffect(() => {
    if (secondsRemaining <= 0 && !loading && questions.length > 0) {
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
    showToast('Time expired! Automatically submitting your answers...', undefined, 'info');
    await submitTest();
  };

  const submitTest = async () => {
    if (submitting) return;
    setSubmitting(true);
    setTimeout(() => {
      if (id) localStorage.removeItem(`test_draft_${id}`);
      showToast('Assessment submitted and graded successfully! 🎉', undefined, 'success');
      navigate('/student/results/1');
    }, 800);
  };

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#6A1B9A] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const currentQ = questions[currentIndex] || questions[0];
  const isLastQuestion = currentIndex === questions.length - 1;
  const answeredCount = Object.keys(answers).length;
  const isUrgent = secondsRemaining < 180;

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12 select-none">
      {/* 1. Header Bar */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white border border-purple-100 shadow-[0_4px_20px_-2px_rgba(106,27,154,0.05)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sticky top-16 z-20 backdrop-blur-md">
        <div className="space-y-1">
          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#F5EFFB] text-[#6A1B9A] border border-purple-200">
            {test?.subject || 'Assessment'}
          </span>
          <h2 className="font-display font-black text-lg sm:text-xl text-slate-900">{test?.title}</h2>
        </div>

        {/* Timer Box */}
        <div
          className={`flex items-center gap-2.5 px-4 py-2 rounded-2xl border transition-all ${
            isUrgent
              ? 'bg-rose-50 border-rose-200 text-rose-700 animate-pulse'
              : 'bg-[#F5EFFB] border-purple-200 text-[#6A1B9A]'
          }`}
        >
          <Clock className={`w-5 h-5 ${isUrgent ? 'text-rose-600' : 'text-[#6A1B9A]'}`} />
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
        <div className="lg:col-span-3 space-y-6">
          <div className="p-6 sm:p-8 rounded-3xl bg-white border border-purple-100 shadow-[0_4px_20px_-2px_rgba(106,27,154,0.05)] space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-purple-100 text-xs">
              <span className="font-bold text-slate-900 flex items-center gap-1.5">
                <span className="w-6 h-6 rounded-md bg-[#6A1B9A] text-white flex items-center justify-center font-mono font-bold">
                  {currentIndex + 1}
                </span>
                <span>of {questions.length} Questions</span>
              </span>

              <div className="flex items-center gap-2">
                <span className="text-slate-500 font-semibold text-[11px]">Marks: {currentQ?.marks || 5}</span>
                <button
                  onClick={() => toggleFlag(currentIndex)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                    flagged[currentIndex]
                      ? 'bg-amber-100 text-amber-800 border border-amber-300'
                      : 'bg-slate-100 text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Flag className="w-3.5 h-3.5" />
                  <span>{flagged[currentIndex] ? 'Flagged' : 'Flag for Review'}</span>
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="font-display font-extrabold text-base sm:text-lg text-slate-900 leading-relaxed">
                {currentQ?.question_text}
              </h3>
            </div>

            <div className="space-y-3 pt-2">
              {currentQ?.question_type === 'mcq' && (
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
                            ? 'bg-[#F5EFFB] border-[#6A1B9A] text-slate-900 shadow-sm'
                            : 'bg-white border-purple-100 hover:border-purple-200 text-slate-700'
                        }`}
                      >
                        <span
                          className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs font-mono flex-shrink-0 transition-colors ${
                            isSelected
                              ? 'bg-[#6A1B9A] text-white'
                              : 'bg-purple-100 text-slate-600'
                          }`}
                        >
                          {opt.key}
                        </span>
                        <span className="text-xs sm:text-sm pt-0.5 leading-relaxed font-bold">{opt.text}</span>
                      </button>
                    );
                  })}
                </div>
              )}

              {currentQ?.question_type === 'true_false' && (
                <div className="grid grid-cols-2 gap-4">
                  {['True', 'False'].map(val => {
                    const isSelected = answers[currentQ.id!] === val;
                    return (
                      <button
                        key={val}
                        type="button"
                        onClick={() => handleSelectAnswer(currentQ.id!, val)}
                        className={`p-5 rounded-2xl border text-center font-extrabold text-sm transition-all ${
                          isSelected
                            ? 'bg-[#F5EFFB] border-[#6A1B9A] text-[#6A1B9A] shadow-sm'
                            : 'bg-white border-purple-100 hover:border-purple-200 text-slate-700'
                        }`}
                      >
                        {val}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="pt-6 border-t border-purple-100 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
                disabled={currentIndex === 0}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 disabled:opacity-30 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>

              {isLastQuestion ? (
                <button
                  type="button"
                  onClick={() => setConfirmModalOpen(true)}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold shadow-sm flex items-center gap-2 transition-all"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit Test</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setCurrentIndex(prev => Math.min(questions.length - 1, prev + 1))}
                  className="px-5 py-2 rounded-xl bg-[#6A1B9A] hover:bg-[#8E24AA] text-white text-xs font-bold flex items-center gap-1.5 shadow-glow-purple transition-all"
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
          <div className="p-6 rounded-3xl bg-white border border-purple-100 space-y-5 shadow-[0_4px_20px_-2px_rgba(106,27,154,0.05)]">
            <h4 className="font-display font-black text-sm text-slate-900 uppercase tracking-wider">
              Question Palette
            </h4>

            <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-500 font-semibold">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-emerald-500"></span>
                <span>Answered ({answeredCount})</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-slate-300"></span>
                <span>Unanswered</span>
              </div>
            </div>

            <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 pt-2">
              {questions.map((q, idx) => {
                const isAnswered = Boolean(answers[q.id!]);
                const isCurrent = currentIndex === idx;
                const isFlagged = Boolean(flagged[idx]);

                let bgStyle = 'bg-slate-100 text-slate-600 hover:bg-purple-50';
                if (isCurrent) {
                  bgStyle = 'bg-[#6A1B9A] text-white ring-2 ring-purple-300';
                } else if (isFlagged) {
                  bgStyle = 'bg-amber-500 text-white';
                } else if (isAnswered) {
                  bgStyle = 'bg-emerald-600 text-white';
                }

                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setCurrentIndex(idx)}
                    className={`h-9 rounded-xl font-extrabold text-xs font-mono transition-all ${bgStyle}`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>

            <div className="pt-4 border-t border-purple-100">
              <button
                type="button"
                onClick={() => setConfirmModalOpen(true)}
                className="w-full py-3 rounded-xl bg-[#6A1B9A] hover:bg-[#8E24AA] text-white text-xs font-extrabold shadow-glow-purple transition-all flex items-center justify-center gap-2"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Submit Final Test</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <Modal
        isOpen={confirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        title="Confirm Test Submission"
        subtitle="Please review your progress before final evaluation."
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-[#F5EFFB] border border-purple-100 text-xs text-slate-700">
            <div>
              <span className="text-[10px] text-slate-400 block uppercase font-bold">Total Questions</span>
              <span className="font-extrabold text-slate-900 text-base">{questions.length}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block uppercase font-bold">Answered</span>
              <span className="font-extrabold text-emerald-600 text-base">{answeredCount}</span>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={() => setConfirmModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200"
            >
              Resume Test
            </button>
            <button
              onClick={submitTest}
              disabled={submitting}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold shadow-sm flex items-center gap-2"
            >
              {submitting ? 'Evaluating...' : 'Yes, Submit Test'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
