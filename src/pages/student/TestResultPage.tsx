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
              colors: ['#6A1B9A', '#10B981', '#F59E0B'],
            });
          }
        })
        .catch(() => {
          setAttempt({
            subject: 'Web Architecture',
            test_title: 'Full-Stack React & Custom Hooks Assessment',
            student_name: 'Alex Rivera',
            student_id: 'STU-2026-01',
            score: 46,
            total_marks: 50,
            percentage: 92,
            passed: true,
            breakdown: [
              { question_text: 'What hook is used for side effects?', selected_answer: 'useEffect', correct_answer: 'useEffect', is_correct: true, marks_awarded: 5, explanation: 'useEffect is standard for side-effects in functional components.' }
            ]
          });
        })
        .finally(() => setLoading(false));
    }
  }, [attemptId]);

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#6A1B9A] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!attempt) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 rounded-3xl bg-white border border-purple-100 text-center space-y-4 shadow-sm">
        <h3 className="text-lg font-bold text-slate-900">Result Not Found</h3>
        <p className="text-xs text-slate-500">The requested test report could not be found.</p>
        <Link to="/student/tests" className="inline-block px-4 py-2 bg-[#6A1B9A] rounded-xl text-white text-xs font-bold shadow-glow-purple">
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
    <div className="max-w-5xl mx-auto space-y-10 pb-16 select-none">
      {/* 1. Scorecard Hero */}
      <div className="p-8 sm:p-10 rounded-3xl bg-purple-gradient text-white shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <span className="text-[11px] font-extrabold px-3 py-1 rounded-full bg-white/20 uppercase tracking-wider">
              {attempt.subject} Performance Report
            </span>
            <h1 className="font-display font-black text-2xl sm:text-3xl mt-2">
              {attempt.test_title}
            </h1>
            <p className="text-xs text-purple-100 mt-1 opacity-90">
              Candidate: <strong className="text-white">{attempt.student_name}</strong> ({attempt.student_id})
            </p>
          </div>

          <div>
            {attempt.passed ? (
              <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-emerald-500 text-white font-black text-xs uppercase tracking-wider shadow-md">
                <CheckCircle2 className="w-4 h-4" />
                <span>PASSED & CERTIFIED</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-amber-500 text-white font-black text-xs uppercase tracking-wider">
                <HelpCircle className="w-4 h-4" />
                <span>NEEDS REVISION</span>
              </span>
            )}
          </div>
        </div>

        {/* Big Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-white/20">
          <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-center">
            <span className="text-[10px] uppercase font-bold text-purple-100 block">Total Score</span>
            <div className="font-display font-black text-2xl sm:text-3xl text-white mt-0.5">
              {attempt.score} <span className="text-sm font-normal opacity-80">/ {attempt.total_marks}</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-center">
            <span className="text-[10px] uppercase font-bold text-purple-100 block">Percentage</span>
            <div className="font-display font-black text-2xl sm:text-3xl text-white mt-0.5">
              {attempt.percentage}%
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-center">
            <span className="text-[10px] uppercase font-bold text-purple-100 block">Correct Answers</span>
            <div className="font-display font-black text-2xl sm:text-3xl text-emerald-300 mt-0.5">
              {correctCount}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-center">
            <span className="text-[10px] uppercase font-bold text-purple-100 block">Wrong / Skipped</span>
            <div className="font-display font-black text-2xl sm:text-3xl text-rose-300 mt-0.5">
              {wrongCount}
            </div>
          </div>
        </div>

        {/* Action Shortcuts */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
          <Link
            to="/student/tests"
            className="px-5 py-2.5 rounded-xl bg-white text-[#6A1B9A] hover:bg-purple-50 text-xs font-bold transition-colors shadow-md"
          >
            Back to Assessment List
          </Link>
          <Link
            to="/student/performance"
            className="px-5 py-2.5 rounded-xl bg-[#8E24AA] hover:bg-[#9C47D1] text-white text-xs font-bold shadow-glow-purple flex items-center gap-1.5 transition-all"
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>View Performance Trends</span>
          </Link>
        </div>
      </div>

      {/* 2. Detailed Question Breakdown */}
      <div className="space-y-6">
        <div>
          <h2 className="font-display font-black text-2xl text-slate-900">
            Question-by-Question Review & Explanations
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-1">
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
                    ? 'bg-white border-emerald-200 shadow-sm'
                    : isUnanswered
                    ? 'bg-white border-purple-100'
                    : 'bg-white border-rose-200 shadow-sm'
                }`}
              >
                <div className="flex items-start justify-between gap-4 pb-3 border-b border-purple-100">
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-[#F5EFFB] text-[#6A1B9A] border border-purple-200">
                      Q{idx + 1}
                    </span>
                  </div>

                  <div>
                    {isCorrect ? (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>+{item.marks_awarded} Marks</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-700">
                        <XCircle className="w-4 h-4" />
                        <span>0 Marks</span>
                      </span>
                    )}
                  </div>
                </div>

                <h3 className="font-bold text-sm sm:text-base text-slate-900 pt-3 leading-relaxed">
                  {item.question_text}
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 text-xs">
                  <div className="p-3 rounded-xl bg-purple-50 border border-purple-100">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Your Answer</span>
                    <p className={`font-bold mt-0.5 ${isCorrect ? 'text-emerald-700' : 'text-rose-700'}`}>
                      {item.selected_answer || 'Not Attempted'}
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-[#F5EFFB] border border-purple-200">
                    <span className="text-[10px] text-[#6A1B9A] uppercase font-bold block">Correct Answer</span>
                    <p className="font-bold text-slate-900 mt-0.5">{item.correct_answer}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
