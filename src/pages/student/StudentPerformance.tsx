import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  TrendingUp,
  Award,
  BookOpen,
  CalendarCheck,
  CheckCircle2,
  BarChart2,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

export const StudentPerformance: React.FC = () => {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.student_internal_id || user?.id) {
      api.get(`/students/${user.student_internal_id || user.id}`)
        .then(data => setProfileData(data))
        .catch(err => console.error('Failed to load performance', err))
        .finally(() => setLoading(false));
    }
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const testAttempts = profileData?.test_attempts || [];
  const attendance = profileData?.attendance || {};

  // Build chart dataset
  const scoreTrendData = testAttempts.map((att: any, idx: number) => ({
    name: att.subject || `Test ${idx + 1}`,
    score: att.percentage,
    passing: 60,
  }));

  // Aggregated metrics
  const totalTests = testAttempts.length;
  const passedTests = testAttempts.filter((t: any) => t.passed).length;
  const passPercentage = totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 100;

  const scores = testAttempts.map((t: any) => t.percentage);
  const highestScore = scores.length > 0 ? Math.max(...scores) : 0;
  const lowestScore = scores.length > 0 ? Math.min(...scores) : 0;
  const avgScore = scores.length > 0 ? Math.round(scores.reduce((a: number, b: number) => a + b, 0) / scores.length) : 0;

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      <div>
        <h1 className="font-display font-black text-2xl sm:text-3xl text-white">
          Performance Analytics & Insights
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Track your test benchmarks, subject mastery, and continuous evaluation history.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="p-5 rounded-2xl bg-[#0F172A] border border-slate-800 space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400">Average Score</span>
          <div className="font-display font-black text-2xl text-brand-300">{avgScore}%</div>
        </div>

        <div className="p-5 rounded-2xl bg-[#0F172A] border border-slate-800 space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400">Highest Score</span>
          <div className="font-display font-black text-2xl text-emerald-400">{highestScore}%</div>
        </div>

        <div className="p-5 rounded-2xl bg-[#0F172A] border border-slate-800 space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400">Lowest Score</span>
          <div className="font-display font-black text-2xl text-slate-400">{lowestScore}%</div>
        </div>

        <div className="p-5 rounded-2xl bg-[#0F172A] border border-slate-800 space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400">Tests Cleared</span>
          <div className="font-display font-black text-2xl text-cyan-400">{passedTests} / {totalTests}</div>
        </div>

        <div className="p-5 rounded-2xl bg-[#0F172A] border border-slate-800 space-y-1 col-span-2 lg:col-span-1">
          <span className="text-[10px] uppercase font-bold text-slate-400">Pass Rate</span>
          <div className="font-display font-black text-2xl text-purple-300">{passPercentage}%</div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Score Progression Trend */}
        <div className="p-6 rounded-3xl bg-[#0F172A] border border-slate-800 space-y-6">
          <div>
            <h3 className="font-display font-bold text-lg text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-brand-400" />
              <span>Assessment Score Progression (%)</span>
            </h3>
            <p className="text-xs text-slate-400">Historical performance across evaluated assessments</p>
          </div>

          <div className="h-64 w-full">
            {scoreTrendData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-500">
                Complete assessments to view your performance progression.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={scoreTrendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                  <XAxis dataKey="name" stroke="#64748B" fontSize={11} />
                  <YAxis domain={[0, 100]} stroke="#64748B" fontSize={11} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                  />
                  <Line type="monotone" dataKey="score" stroke="#8B5CF6" strokeWidth={3} dot={{ fill: '#A78BFA', r: 5 }} />
                  <Line type="monotone" dataKey="passing" stroke="#475569" strokeDasharray="5 5" />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Subject Breakdown Bar Chart */}
        <div className="p-6 rounded-3xl bg-[#0F172A] border border-slate-800 space-y-6">
          <div>
            <h3 className="font-display font-bold text-lg text-white flex items-center gap-2">
              <BarChart2 className="w-5 h-5 text-emerald-400" />
              <span>Subject-Wise Percentage</span>
            </h3>
            <p className="text-xs text-slate-400">Comparing your skill mastery across subjects</p>
          </div>

          <div className="h-64 w-full">
            {scoreTrendData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-500">
                No test data available yet.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={scoreTrendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                  <XAxis dataKey="name" stroke="#64748B" fontSize={11} />
                  <YAxis domain={[0, 100]} stroke="#64748B" fontSize={11} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                  />
                  <Bar dataKey="score" fill="#7C3AED" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Historical Attempts Table */}
      <div className="p-6 rounded-3xl bg-[#0F172A] border border-slate-800 space-y-4">
        <h3 className="font-display font-bold text-lg text-white">Assessment Attempt Log</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/80 text-slate-400 uppercase font-semibold border-b border-slate-800">
              <tr>
                <th className="p-3">Test Title</th>
                <th className="p-3">Subject</th>
                <th className="p-3">Score</th>
                <th className="p-3">Percentage</th>
                <th className="p-3">Status</th>
                <th className="p-3">Attempted Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {testAttempts.map((att: any) => (
                <tr key={att.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="p-3 font-semibold text-white">{att.test_title}</td>
                  <td className="p-3 text-brand-300">{att.subject}</td>
                  <td className="p-3 font-mono">{att.score} / {att.total_marks}</td>
                  <td className="p-3 font-bold">{att.percentage}%</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      att.passed ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30' : 'bg-rose-950 text-rose-300 border border-rose-500/30'
                    }`}>
                      {att.passed ? 'PASSED' : 'NEEDS IMPROVEMENT'}
                    </span>
                  </td>
                  <td className="p-3 text-slate-400">{new Date(att.submitted_at || att.start_time).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
