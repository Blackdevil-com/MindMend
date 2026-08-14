import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import {
  FileCheck2,
  Clock,
  Award,
  CheckCircle2,
  ArrowRight,
  Filter,
  Search,
  Sparkles,
} from 'lucide-react';

export const StudentTests: React.FC = () => {
  const [tests, setTests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.get('/students/dashboard-stats')
      .then(res => setTests(res.active_tests || [
        { id: 1, title: 'Full-Stack React & Custom Hooks Assessment', subject: 'Web Architecture', duration_minutes: 30, total_marks: 50, passing_marks: 25, attempt_status: 'pending' },
        { id: 2, title: 'Database Normalization & SQL Queries', subject: 'Database Systems', duration_minutes: 45, total_marks: 100, passing_marks: 50, attempt_status: 'submitted', attempt_score: 46, attempt_percentage: 92, attempt_id: 101 },
      ]))
      .catch(err => console.error('Failed to load tests', err))
      .finally(() => setLoading(false));
  }, []);

  const filteredTests = tests.filter(t => {
    const isCompleted = t.attempt_status === 'submitted';
    if (activeFilter === 'pending' && isCompleted) return false;
    if (activeFilter === 'completed' && !isCompleted) return false;
    if (search && !t.title.toLowerCase().includes(search.toLowerCase()) && !t.subject.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#6A1B9A] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12 select-none">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-black text-2xl sm:text-3xl text-slate-900 flex items-center gap-3">
            <FileCheck2 className="w-7 h-7 text-[#6A1B9A]" />
            <span>Online Quizzes & Assessments</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Take timed evaluation tests with instant automated feedback and score tracking.
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-3xl border border-purple-100 shadow-[0_4px_20px_-2px_rgba(106,27,154,0.05)]">
        <div className="flex items-center gap-2">
          {(['all', 'pending', 'completed'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveFilter(tab)}
              className={`px-4 py-2 rounded-xl text-xs font-bold capitalize transition-all ${
                activeFilter === tab
                  ? 'bg-[#6A1B9A] text-white shadow-glow-purple'
                  : 'bg-[#F5EFFB] text-slate-600 hover:text-[#6A1B9A]'
              }`}
            >
              {tab} Tests
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search test or subject..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-[#F5EFFB] border border-purple-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#6A1B9A]"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredTests.length === 0 ? (
          <div className="col-span-2 p-12 rounded-3xl bg-white border border-purple-100 text-center space-y-3 shadow-sm">
            <FileCheck2 className="w-8 h-8 text-slate-400 mx-auto" />
            <p className="text-sm font-semibold text-slate-600">No assessments found matching filter.</p>
          </div>
        ) : (
          filteredTests.map(test => {
            const isCompleted = test.attempt_status === 'submitted';
            return (
              <div
                key={test.id}
                className="p-6 rounded-3xl bg-white border border-purple-100 hover:border-[#6A1B9A]/40 transition-all flex flex-col justify-between space-y-6 shadow-[0_4px_20px_-2px_rgba(106,27,154,0.05)]"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold px-3 py-1 rounded-full bg-[#F5EFFB] text-[#6A1B9A] border border-purple-200 uppercase tracking-wider">
                      {test.subject}
                    </span>
                    <span className="text-xs text-slate-500 flex items-center gap-1 font-medium">
                      <Clock className="w-3.5 h-3.5 text-[#6A1B9A]" />
                      {test.duration_minutes} Mins
                    </span>
                  </div>

                  <div>
                    <h3 className="font-extrabold text-lg text-slate-900">
                      {test.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed line-clamp-2">
                      {test.description || 'Comprehensive assessment designed to evaluate your practical knowledge.'}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 p-3 rounded-2xl bg-[#F5EFFB] border border-purple-100 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Total Marks</span>
                      <span className="font-extrabold text-slate-900">{test.total_marks} Marks</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Passing Threshold</span>
                      <span className="font-extrabold text-emerald-600">{test.passing_marks} Marks</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-purple-100 flex items-center justify-between">
                  {isCompleted ? (
                    <>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span className="text-xs font-bold text-emerald-700">
                          Score: {test.attempt_score}/{test.total_marks} ({test.attempt_percentage}%)
                        </span>
                      </div>

                      <Link
                        to={`/student/results/${test.attempt_id || 1}`}
                        className="px-4 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-[#6A1B9A] text-xs font-bold transition-colors"
                      >
                        View Breakdown
                      </Link>
                    </>
                  ) : (
                    <>
                      <span className="text-xs text-[#6A1B9A] font-bold flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-[#6A1B9A]" />
                        Ready to Start
                      </span>

                      <Link
                        to={`/student/tests/take/${test.id}`}
                        className="px-5 py-2.5 rounded-xl bg-[#6A1B9A] hover:bg-[#8E24AA] text-white text-xs font-bold shadow-glow-purple flex items-center gap-1.5 transition-all"
                      >
                        <span>Start Test</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
