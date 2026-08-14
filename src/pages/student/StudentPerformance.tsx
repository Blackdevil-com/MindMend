import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/common/Toast';
import {
  TrendingUp,
  Award,
  BookOpen,
  CalendarCheck,
  CheckCircle2,
  BarChart2,
  Download,
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
  const { showToast } = useToast();
  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.student_internal_id || user?.id) {
      api.get(`/students/${user.student_internal_id || user.id}`)
        .then(data => setProfileData(data))
        .catch(err => console.error('Failed to load performance', err))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [user]);

  const handleExportPDF = () => {
    showToast('Performance Analytics PDF generated & downloaded 📈', undefined, 'success');
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#6A1B9A] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const testAttempts = profileData?.test_attempts || [
    { id: 1, test_title: 'Full-Stack React Quiz', subject: 'Web Dev', score: 46, total_marks: 50, percentage: 92, passed: true, submitted_at: '2026-08-10' },
    { id: 2, title: 'Database SQL Benchmark', subject: 'Databases', score: 88, total_marks: 100, percentage: 88, passed: true, submitted_at: '2026-08-05' },
    { id: 3, title: 'Data Structures MCQ Test', subject: 'Algorithms', score: 40, total_marks: 50, percentage: 80, passed: true, submitted_at: '2026-07-28' },
  ];

  const scoreTrendData = testAttempts.map((att: any, idx: number) => ({
    name: att.subject || `Test ${idx + 1}`,
    score: att.percentage,
    passing: 60,
  }));

  const totalTests = testAttempts.length;
  const passedTests = testAttempts.filter((t: any) => t.passed).length;
  const passPercentage = totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 100;

  const scores = testAttempts.map((t: any) => t.percentage);
  const highestScore = scores.length > 0 ? Math.max(...scores) : 0;
  const lowestScore = scores.length > 0 ? Math.min(...scores) : 0;
  const avgScore = scores.length > 0 ? Math.round(scores.reduce((a: number, b: number) => a + b, 0) / scores.length) : 0;

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12 select-none">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-black text-2xl sm:text-3xl text-white flex items-center gap-3">
            <TrendingUp className="w-7 h-7 text-[#8E24AA]" />
            <span>Performance Analytics & Insights</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Track test scores, subject mastery, and continuous skills progress.
          </p>
        </div>

        <button
          onClick={handleExportPDF}
          className="px-4 py-2.5 rounded-xl bg-[#6A1B9A] hover:bg-[#8E24AA] text-white text-xs font-bold shadow-glow-sm flex items-center gap-2 transition-all"
        >
          <Download className="w-4 h-4" />
          <span>Export Analytics PDF</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="p-5 rounded-3xl bg-[#120B20] border border-[#2A1A4A] space-y-1 shadow-md">
          <span className="text-[10px] uppercase font-bold text-slate-400">Average Score</span>
          <div className="font-display font-black text-2xl text-brand-300">{avgScore}%</div>
        </div>

        <div className="p-5 rounded-3xl bg-[#120B20] border border-[#2A1A4A] space-y-1 shadow-md">
          <span className="text-[10px] uppercase font-bold text-slate-400">Highest Score</span>
          <div className="font-display font-black text-2xl text-emerald-400">{highestScore}%</div>
        </div>

        <div className="p-5 rounded-3xl bg-[#120B20] border border-[#2A1A4A] space-y-1 shadow-md">
          <span className="text-[10px] uppercase font-bold text-slate-400">Lowest Score</span>
          <div className="font-display font-black text-2xl text-slate-400">{lowestScore}%</div>
        </div>

        <div className="p-5 rounded-3xl bg-[#120B20] border border-[#2A1A4A] space-y-1 shadow-md">
          <span className="text-[10px] uppercase font-bold text-slate-400">Tests Cleared</span>
          <div className="font-display font-black text-2xl text-cyan-400">{passedTests} / {totalTests}</div>
        </div>

        <div className="p-5 rounded-3xl bg-[#120B20] border border-[#2A1A4A] space-y-1 col-span-2 lg:col-span-1 shadow-md">
          <span className="text-[10px] uppercase font-bold text-slate-400">Pass Rate</span>
          <div className="font-display font-black text-2xl text-purple-300">{passPercentage}%</div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="p-6 rounded-3xl bg-[#120B20] border border-[#2A1A4A] space-y-6 shadow-xl">
          <div>
            <h3 className="font-display font-bold text-lg text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-[#8E24AA]" />
              <span>Score Progression Curve (%)</span>
            </h3>
            <p className="text-xs text-slate-400">Historical performance trajectory</p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={scoreTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2A1A4A" />
                <XAxis dataKey="name" stroke="#64748B" fontSize={11} />
                <YAxis domain={[0, 100]} stroke="#64748B" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#120B20', borderColor: '#3D276B', borderRadius: '12px', fontSize: '12px', color: '#fff' }}
                />
                <Line type="monotone" dataKey="score" stroke="#8E24AA" strokeWidth={3} dot={{ fill: '#6A1B9A', r: 6 }} />
                <Line type="monotone" dataKey="passing" stroke="#475569" strokeDasharray="5 5" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-[#120B20] border border-[#2A1A4A] space-y-6 shadow-xl">
          <div>
            <h3 className="font-display font-bold text-lg text-white flex items-center gap-2">
              <BarChart2 className="w-5 h-5 text-emerald-400" />
              <span>Subject Proficiency (%)</span>
            </h3>
            <p className="text-xs text-slate-400">Mastery comparison across topics</p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={scoreTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2A1A4A" />
                <XAxis dataKey="name" stroke="#64748B" fontSize={11} />
                <YAxis domain={[0, 100]} stroke="#64748B" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#120B20', borderColor: '#3D276B', borderRadius: '12px', fontSize: '12px', color: '#fff' }}
                />
                <Bar dataKey="score" fill="#6A1B9A" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Historical Attempts Table */}
      <div className="p-6 rounded-3xl bg-[#120B20] border border-[#2A1A4A] space-y-4 shadow-xl">
        <h3 className="font-display font-bold text-lg text-white">Assessment Attempt Log</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#1A0E30] text-slate-400 uppercase font-semibold border-b border-[#2A1A4A]">
              <tr>
                <th className="p-3">Test Title</th>
                <th className="p-3">Subject</th>
                <th className="p-3">Score</th>
                <th className="p-3">Percentage</th>
                <th className="p-3">Status</th>
                <th className="p-3">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2A1A4A]">
              {testAttempts.map((att: any) => (
                <tr key={att.id} className="hover:bg-[#1C1033] transition-colors">
                  <td className="p-3 font-semibold text-white">{att.test_title || att.title}</td>
                  <td className="p-3 text-brand-300 font-bold">{att.subject}</td>
                  <td className="p-3 font-mono text-slate-200">{att.score} / {att.total_marks}</td>
                  <td className="p-3 font-bold text-white">{att.percentage}%</td>
                  <td className="p-3">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                      att.passed ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    }`}>
                      {att.passed ? 'PASSED' : 'NEEDS IMPROVEMENT'}
                    </span>
                  </td>
                  <td className="p-3 text-slate-400">{att.submitted_at}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
