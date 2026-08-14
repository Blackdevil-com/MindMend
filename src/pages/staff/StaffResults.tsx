import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useNotification } from '../../context/NotificationContext';
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
  const { showToast } = useNotification();
  const [tests, setTests] = useState<any[]>([]);
  const [selectedTestId, setSelectedTestId] = useState<string>('');
  const [submissionData, setSubmissionData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/tests')
      .then(data => {
        const list = data.tests || [];
        setTests(list);
        if (list.length > 0) {
          setSelectedTestId(String(list[0].id));
        }
      })
      .catch(err => console.error('Failed to load tests', err))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (selectedTestId) {
      api.get(`/tests/${selectedTestId}/submissions`)
        .then(data => setSubmissionData(data))
        .catch(err => console.error('Failed to load submissions', err));
    }
  }, [selectedTestId]);

  const handleExportCSV = async () => {
    if (!selectedTestId) return;
    try {
      const csvText = await api.get(`/tests/${selectedTestId}/export/csv`);
      const blob = new Blob([csvText], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `test_results_${selectedTestId}.csv`;
      a.click();
      showToast('Test results CSV exported successfully', 'success');
    } catch (err) {
      showToast('Export failed', 'error');
    }
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const submissions = submissionData?.submissions || [];
  const metrics = submissionData?.metrics || {};

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-black text-2xl sm:text-3xl text-white">
            Student Assessment Results
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Review test submissions, student marks, and comparative score statistics.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          disabled={submissions.length === 0}
          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-700"
        >
          <Download className="w-4 h-4 text-brand-400" />
          <span>Export Results CSV</span>
        </button>
      </div>

      {/* Test Selector */}
      <div className="p-4 rounded-2xl bg-[#0F172A] border border-slate-800 flex items-center gap-3">
        <label className="text-xs font-bold text-slate-400 uppercase">Select Assessment:</label>
        <select
          value={selectedTestId}
          onChange={e => setSelectedTestId(e.target.value)}
          className="px-4 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-brand-500"
        >
          {tests.map(t => (
            <option key={t.id} value={t.id}>
              {t.title} ({t.subject} - {t.total_marks} Marks)
            </option>
          ))}
        </select>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-[#0F172A] border border-slate-800 space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400">Total Submissions</span>
          <div className="font-display font-black text-2xl text-white">{metrics.total_submissions || 0}</div>
        </div>

        <div className="p-5 rounded-2xl bg-[#0F172A] border border-slate-800 space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400">Average Percentage</span>
          <div className="font-display font-black text-2xl text-brand-300">{metrics.avg_percentage || 0}%</div>
        </div>

        <div className="p-5 rounded-2xl bg-[#0F172A] border border-slate-800 space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400">Highest Score</span>
          <div className="font-display font-black text-2xl text-emerald-400">{metrics.highest_score || 0}</div>
        </div>

        <div className="p-5 rounded-2xl bg-[#0F172A] border border-slate-800 space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400">Passing Rate</span>
          <div className="font-display font-black text-2xl text-purple-300">{metrics.pass_rate || 0}%</div>
        </div>
      </div>

      {/* Submissions Table */}
      <div className="p-6 rounded-3xl bg-[#0F172A] border border-slate-800 space-y-4 shadow-xl">
        <h3 className="font-display font-bold text-base text-white">Student Submissions Log</h3>

        {submissions.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">
            No submissions recorded for this test yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/80 text-slate-400 uppercase font-semibold border-b border-slate-800">
                <tr>
                  <th className="p-3.5">Student ID</th>
                  <th className="p-3.5">Full Name</th>
                  <th className="p-3.5">College & Dept</th>
                  <th className="p-3.5">Score</th>
                  <th className="p-3.5">Percentage</th>
                  <th className="p-3.5">Result</th>
                  <th className="p-3.5">Submitted On</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {submissions.map((sub: any) => (
                  <tr key={sub.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-3.5 font-mono font-bold text-brand-300">{sub.student_id}</td>
                    <td className="p-3.5 font-semibold text-white">{sub.student_name}</td>
                    <td className="p-3.5 text-slate-300">{sub.college_name} ({sub.department})</td>
                    <td className="p-3.5 font-mono font-bold text-slate-200">{sub.score} / {sub.total_marks}</td>
                    <td className="p-3.5 font-bold text-white">{sub.percentage}%</td>
                    <td className="p-3.5">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        sub.passed ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30' : 'bg-rose-950 text-rose-300 border border-rose-500/30'
                      }`}>
                        {sub.passed ? 'PASSED' : 'FAILED'}
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-400">{new Date(sub.submitted_at).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
