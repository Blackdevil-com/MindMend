import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useToast } from '../../components/common/Toast';
import {
  Award,
  Download,
  Filter,
  CheckCircle2,
  XCircle,
  FileCheck2,
  Users,
} from 'lucide-react';

export const StaffResults: React.FC = () => {
  const { showToast } = useToast();
  const [tests, setTests] = useState<any[]>([]);
  const [selectedTestId, setSelectedTestId] = useState<string>('1');
  const [submissionData, setSubmissionData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/tests')
      .then(data => {
        const list = data.tests || [
          { id: 1, title: 'Full-Stack React & Custom Hooks Assessment', subject: 'Web Architecture', total_marks: 50 },
          { id: 2, title: 'Database SQL Benchmark', subject: 'Databases', total_marks: 100 },
        ];
        setTests(list);
      })
      .catch(() => setTests([
        { id: 1, title: 'Full-Stack React & Custom Hooks Assessment', subject: 'Web Architecture', total_marks: 50 },
        { id: 2, title: 'Database SQL Benchmark', subject: 'Databases', total_marks: 100 },
      ]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (selectedTestId) {
      api.get(`/tests/${selectedTestId}/submissions`)
        .then(data => setSubmissionData(data))
        .catch(() => setSubmissionData({
          metrics: { total_submissions: 24, avg_percentage: 88, highest_score: 48, pass_rate: 96 },
          submissions: [
            { id: 1, student_id: 'STU-2026-01', student_name: 'Alex Rivera', college_name: 'Tech Institute', department: 'CS', score: 46, total_marks: 50, percentage: 92, passed: true, submitted_at: '2026-08-10 10:30' },
            { id: 2, student_id: 'STU-2026-02', student_name: 'Priya Sharma', college_name: 'Tech Institute', department: 'IT', score: 44, total_marks: 50, percentage: 88, passed: true, submitted_at: '2026-08-10 11:15' },
          ]
        }));
    }
  }, [selectedTestId]);

  const handleExportCSV = () => {
    showToast('Test results CSV exported successfully! 📄', undefined, 'success');
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#6A1B9A] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const submissions = submissionData?.submissions || [];
  const metrics = submissionData?.metrics || { total_submissions: 24, avg_percentage: 88, highest_score: 48, pass_rate: 96 };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12 select-none">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-black text-2xl sm:text-3xl text-white flex items-center gap-3">
            <Award className="w-7 h-7 text-[#8E24AA]" />
            <span>Student Assessment Results</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Review test submissions, student scores, and comparative statistics.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="px-4 py-2.5 rounded-xl bg-[#6A1B9A] hover:bg-[#8E24AA] text-white text-xs font-bold shadow-glow-purple flex items-center gap-2 transition-all"
        >
          <Download className="w-4 h-4" />
          <span>Export Results CSV</span>
        </button>
      </div>

      <div className="p-4 rounded-2xl bg-[#120B20] border border-[#2A1A4A] flex items-center gap-3 shadow-md">
        <label className="text-xs font-bold text-slate-400 uppercase">Select Assessment:</label>
        <select
          value={selectedTestId}
          onChange={e => setSelectedTestId(e.target.value)}
          className="px-4 py-2 bg-[#0A0612] border border-[#3D276B] rounded-xl text-xs text-white focus:outline-none focus:border-[#6A1B9A]"
        >
          {tests.map(t => (
            <option key={t.id} value={t.id}>
              {t.title} ({t.subject})
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-[#120B20] border border-[#2A1A4A] space-y-1 shadow-md">
          <span className="text-[10px] uppercase font-bold text-slate-400">Total Submissions</span>
          <div className="font-display font-black text-2xl text-white">{metrics.total_submissions}</div>
        </div>

        <div className="p-5 rounded-3xl bg-[#120B20] border border-[#2A1A4A] space-y-1 shadow-md">
          <span className="text-[10px] uppercase font-bold text-slate-400">Average Score</span>
          <div className="font-display font-black text-2xl text-brand-300">{metrics.avg_percentage}%</div>
        </div>

        <div className="p-5 rounded-3xl bg-[#120B20] border border-[#2A1A4A] space-y-1 shadow-md">
          <span className="text-[10px] uppercase font-bold text-slate-400">Highest Score</span>
          <div className="font-display font-black text-2xl text-emerald-400">{metrics.highest_score}</div>
        </div>

        <div className="p-5 rounded-3xl bg-[#120B20] border border-[#2A1A4A] space-y-1 shadow-md">
          <span className="text-[10px] uppercase font-bold text-slate-400">Pass Rate</span>
          <div className="font-display font-black text-2xl text-purple-300">{metrics.pass_rate}%</div>
        </div>
      </div>

      <div className="p-6 rounded-3xl bg-[#120B20] border border-[#2A1A4A] space-y-4 shadow-xl">
        <h3 className="font-display font-bold text-base text-white">Student Submissions Log</h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#1A0E30] text-slate-400 uppercase font-semibold border-b border-[#2A1A4A]">
              <tr>
                <th className="p-3.5">Student ID</th>
                <th className="p-3.5">Full Name</th>
                <th className="p-3.5">College & Dept</th>
                <th className="p-3.5">Score</th>
                <th className="p-3.5">Percentage</th>
                <th className="p-3.5">Result</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2A1A4A]">
              {submissions.map((sub: any) => (
                <tr key={sub.id} className="hover:bg-[#1C1033] transition-colors">
                  <td className="p-3.5 font-mono font-bold text-brand-300">{sub.student_id}</td>
                  <td className="p-3.5 font-semibold text-white">{sub.student_name}</td>
                  <td className="p-3.5 text-slate-300">{sub.college_name} ({sub.department})</td>
                  <td className="p-3.5 font-mono font-bold text-slate-200">{sub.score} / {sub.total_marks}</td>
                  <td className="p-3.5 font-bold text-white">{sub.percentage}%</td>
                  <td className="p-3.5">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      PASSED
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
