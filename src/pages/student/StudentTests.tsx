import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { Test } from '../../types/index';
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
      .then(res => setTests(res.active_tests || []))
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

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-black text-2xl sm:text-3xl text-white">
            Online Assessments & Quizzes
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Take scheduled placement quizzes with live timers and immediate auto-evaluation.
          </p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#0F172A] p-4 rounded-2xl border border-slate-800">
        <div className="flex items-center gap-2">
          {(['all', 'pending', 'completed'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveFilter(tab)}
              className={`px-4 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all ${
                activeFilter === tab
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'bg-slate-800/80 text-slate-400 hover:text-white'
              }`}
            >
              {tab} Tests
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search test name or subject..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
          />
        </div>
      </div>

      {/* Test List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredTests.length === 0 ? (
          <div className="col-span-2 p-12 rounded-3xl bg-[#0F172A] border border-slate-800 text-center space-y-3">
            <FileCheck2 className="w-8 h-8 text-slate-500 mx-auto" />
            <p className="text-sm font-semibold text-slate-300">No assessments found matching filter.</p>
          </div>
        ) : (
          filteredTests.map(test => {
            const isCompleted = test.attempt_status === 'submitted';
            return (
              <div
                key={test.id}
                className="p-6 rounded-3xl bg-[#0F172A] border border-slate-800 hover:border-brand-500/40 transition-all flex flex-col justify-between space-y-6"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-brand-950 text-brand-300 border border-brand-500/30">
                      {test.subject}
                    </span>
                    <span className="text-xs text-slate-400 flex items-center gap-1 font-medium">
                      <Clock className="w-3.5 h-3.5 text-brand-400" />
                      {test.duration_minutes} Mins
                    </span>
                  </div>

                  <div>
                    <h3 className="font-display font-bold text-xl text-white">
                      {test.title}
                    </h3>
                    <p className="text-xs text-slate-400 mt-2 leading-relaxed line-clamp-2">
                      {test.description || 'Comprehensive assessment designed to evaluate your practical knowledge.'}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Total Marks</span>
                      <span className="font-bold text-white">{test.total_marks} Marks</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Passing Marks</span>
                      <span className="font-bold text-emerald-400">{test.passing_marks} Marks</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                  {isCompleted ? (
                    <>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span className="text-xs font-bold text-emerald-300">
                          Score: {test.attempt_score}/{test.total_marks} ({test.attempt_percentage}%)
                        </span>
                      </div>

                      <Link
                        to={`/student/results/${test.attempt_id}`}
                        className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
                      >
                        View Breakdown
                      </Link>
                    </>
                  ) : (
                    <>
                      <span className="text-xs text-brand-300 font-medium flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-brand-400" />
                        Live Test Ready
                      </span>

                      <Link
                        to={`/student/tests/take/${test.id}`}
                        className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-500 hover:to-brand-600 text-white text-xs font-bold shadow-glow-sm flex items-center gap-1.5 transition-all"
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
