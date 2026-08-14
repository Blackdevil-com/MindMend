import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../../services/api';
import confetti from 'canvas-confetti';
import {
  Award,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Clock,
  ArrowRight,
  TrendingUp,
  RotateCcw,
  Sparkles,
} from 'lucide-react';

export const TestResultPage: React.FC = () => {
  const { attemptId } = useParams<{ attemptId: string }>();
  const [attempt, setAttempt] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (attemptId) {
      api.get(`/tests/result/${attemptId}`)
        .then(data => {
          setAttempt(data.attempt);
          if (data.attempt?.passed) {
            confetti({
              particleCount: 100,
              spread: 70,
              origin: { y: 0.6 },
              colors: ['#8B5CF6', '#10B981', '#F59E0B'],
            });
          }
        })
        .catch(err => console.error('Failed to load result', err))
        .finally(() => setLoading(false));
    }
  }, [attemptId]);

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!attempt) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 rounded-3xl bg-[#0F172A] border border-slate-800 text-center space-y-4">
        <h3 className="text-lg font-bold text-white">Result Not Found</h3>
        <p className="text-xs text-slate-400">The requested test report could not be found.</p>
        <Link to="/student/tests" className="inline-block px-4 py-2 bg-brand-600 rounded-xl text-white text-xs font-semibold">
          Back to Tests
        </Link>
      </div>
    );
  }

  const breakdown = attempt.breakdown || [];
  const correctCount = breakdown.filter((b: any) => b.is_correct).length;
  const wrongCount = breakdown.filter((b: any) => !b.is_correct && b.selected_answer).length;
  const unansweredCount = breakdown.filter((b: any) => !b.selected_answer).length;

  return (
    <div className="max-w-5xl mx-auto space-y-10 pb-16">
      {/* 1. Scorecard Hero */}
      <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-br from-[#180E33] via-[#0F172A] to-[#121E2C] border border-brand-500/30 shadow-2xl space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-brand-950 text-brand-300 border border-brand-500/30">
              {attempt.subject} Performance Report
            </span>
            <h1 className="font-display font-black text-2xl sm:text-3xl text-white mt-2">
              {attempt.test_title}
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Candidate: <strong className="text-slate-200">{attempt.student_name}</strong> ({attempt.student_id}) • Evaluated on {new Date(attempt.submitted_at || attempt.start_time).toLocaleString()}
            </p>
          </div>

          <div>
            {attempt.passed ? (
              <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-emerald-950/90 text-emerald-300 border border-emerald-500/40 text-xs font-black uppercase tracking-wider shadow-sm">
                <CheckCircle2 className="w-4 h-4" />
                <span>PASSED & CERTIFIED</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-amber-950/90 text-amber-300 border border-amber-500/40 text-xs font-black uppercase tracking-wider">
                <HelpCircle className="w-4 h-4" />
                <span>NEEDS REVISION</span>
              </span>
            )}
          </div>
        </div>

        {/* Big Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-800/80">
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Score</span>
            <div className="font-display font-black text-2xl sm:text-3xl text-brand-300 mt-0.5">
              {attempt.score} <span className="text-sm font-normal text-slate-400">/ {attempt.total_marks}</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Percentage</span>
            <div className="font-display font-black text-2xl sm:text-3xl text-white mt-0.5">
              {attempt.percentage}%
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Correct Answers</span>
            <div className="font-display font-black text-2xl sm:text-3xl text-emerald-400 mt-0.5">
              {correctCount}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Wrong / Skipped</span>
            <div className="font-display font-black text-2xl sm:text-3xl text-rose-400 mt-0.5">
              {wrongCount} <span className="text-xs font-normal text-amber-400">({unansweredCount} skipped)</span>
            </div>
          </div>
        </div>

        {/* Action Shortcuts */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
          <Link
            to="/student/tests"
            className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
          >
            Back to Assessment List
          </Link>
          <Link
            to="/student/performance"
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-500 text-white text-xs font-bold shadow-sm flex items-center gap-1.5 transition-all"
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>View Performance Trends</span>
          </Link>
        </div>
      </div>

      {/* 2. Detailed Question Breakdown */}
      <div className="space-y-6">
        <div>
          <h2 className="font-display font-extrabold text-2xl text-white">
            Question-by-Question Review & Explanations
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Compare your selected options with standard answer keys and instructor explanations.
          </p>
        </div>

        <div className="space-y-4">
          {breakdown.map((item: any, idx: number) => {
            const isCorrect = item.is_correct;
            const isUnanswered = !item.selected_answer;

            return (
              <div
                key={idx}
                className={`p-6 rounded-3xl border transition-all ${
                  isCorrect
                    ? 'bg-[#0F172A] border-emerald-500/30'
                    : isUnanswered
                    ? 'bg-[#0F172A] border-slate-800'
                    : 'bg-[#0F172A] border-rose-500/30'
                }`}
              >
                <div className="flex items-start justify-between gap-4 pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-slate-900 text-slate-300 border border-slate-800">
                      Q{idx + 1}
                    </span>
                    <span className="text-xs text-slate-400 uppercase font-semibold">
                      {item.question_type}
                    </span>
                  </div>

                  <div>
                    {isCorrect ? (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-400">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>+{item.marks_awarded} Marks</span>
                      </span>
                    ) : isUnanswered ? (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-400">
                        <HelpCircle className="w-4 h-4" />
                        <span>0 Marks (Skipped)</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-400">
                        <XCircle className="w-4 h-4" />
                        <span>0 Marks (Incorrect)</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Question */}
                <h3 className="font-bold text-sm sm:text-base text-white pt-3 leading-relaxed">
                  {item.question_text}
                </h3>

                {/* Answers Compare */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 text-xs">
                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Your Answer</span>
                    <p className={`font-semibold mt-0.5 ${isCorrect ? 'text-emerald-300' : isUnanswered ? 'text-slate-500' : 'text-rose-300'}`}>
                      {item.selected_answer || 'Not Attempted'}
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-brand-950/60 border border-brand-500/30">
                    <span className="text-[10px] text-brand-300 uppercase font-bold block">Correct Answer</span>
                    <p className="font-semibold text-white mt-0.5">{item.correct_answer}</p>
                  </div>
                </div>

                {/* Explanation */}
                {item.explanation && (
                  <div className="mt-3 p-3.5 rounded-xl bg-slate-900/50 border border-slate-800 text-xs text-slate-300 space-y-1">
                    <strong className="text-brand-300 flex items-center gap-1 text-[11px]">
                      <Sparkles className="w-3 h-3" />
                      Explanation:
                    </strong>
                    <p className="leading-relaxed text-slate-400">{item.explanation}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
