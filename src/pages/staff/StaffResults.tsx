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
        const list = data.tests || [];
        setTests(list);
        if (list.length > 0) {
          setSelectedTestId(String(list[0].id));
        }
      })
      .catch(() => setTests([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (selectedTestId) {
      api.get(`/tests/${selectedTestId}/submissions`)
        .then(data => setSubmissionData(data))
        .catch(() => setSubmissionData(null));
    }
  }, [selectedTestId]);

  const toggleMarksVisibility = () => {
    if (!selectedTestId) return;
    api.patch(`/tests/${selectedTestId}/toggle-marks`, {})
      .then(res => {
        showToast(res.message || 'Marks visibility updated', undefined, 'success');
        setSubmissionData((prev: any) => {
          if (!prev || !prev.test) return prev;
          return {
            ...prev,
            test: {
              ...prev.test,
              marks_released: res.marks_released,
            }
          };
        });
      })
      .catch(err => {
        showToast(err.message || 'Failed to update marks visibility', undefined, 'error');
      });
  };

  const handleExportCSV = () => {
    if (selectedTestId) {
      window.open(`/api/tests/${selectedTestId}/export/csv`);
      showToast('Exporting results CSV... 📄', undefined, 'success');
    }
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#6A1B9A] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const submissions = submissionData?.submissions || [];
  const metrics = submissionData?.metrics || { total_submissions: 0, avg_percentage: 0, highest_score: 0, pass_rate: 0 };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12 select-none">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-black text-2xl sm:text-3xl text-slate-900 flex items-center gap-3">
            <Award className="w-7 h-7 text-[#8E24AA]" />
            <span>Student Assessment Results</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
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

      <div className="p-4 rounded-2xl bg-white border border-purple-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <label className="text-xs font-bold text-slate-600 uppercase">Select Assessment:</label>
          <select
            value={selectedTestId}
            onChange={e => setSelectedTestId(e.target.value)}
            className="px-4 py-2.5 bg-[#F5EFFB] border border-purple-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#6A1B9A]"
          >
            {tests.map(t => (
              <option key={t.id} value={t.id}>
                {t.title} ({t.subject})
              </option>
            ))}
          </select>
        </div>

        {submissionData?.test && (
          <button
            onClick={toggleMarksVisibility}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs shadow-sm transition-all flex items-center gap-2 border ${
              submissionData.test.marks_released === 1
                ? 'bg-amber-50 hover:bg-amber-100 text-amber-700 border-amber-200'
                : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200'
            }`}
          >
            {submissionData.test.marks_released === 1 ? (
              <>
                <span>🔒 Hide Marks from Students</span>
              </>
            ) : (
              <>
                <span>🔓 Release Marks to Students</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Average Pass Rate Header */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-purple-600 to-[#8E24AA] text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-md">
        <div>
          <h2 className="font-display font-black text-xl sm:text-2xl">Average Pass Rate of the Students</h2>
          <p className="text-xs text-purple-105 mt-1 opacity-90">Based on all submissions for this assessment</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="font-display font-black text-4xl">{metrics.pass_rate}%</span>
            <span className="text-[10px] text-purple-105 block font-bold uppercase tracking-wider mt-0.5">Passing Score Rate</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-white border border-purple-100 space-y-1 shadow-[0_4px_20px_-2px_rgba(106,27,154,0.05)]">
          <span className="text-[10px] uppercase font-bold text-slate-500">Total Submissions</span>
          <div className="font-display font-black text-2xl text-slate-900">{metrics.total_submissions}</div>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-purple-100 space-y-1 shadow-[0_4px_20px_-2px_rgba(106,27,154,0.05)]">
          <span className="text-[10px] uppercase font-bold text-slate-500">Average Score</span>
          <div className="font-display font-black text-2xl text-[#6A1B9A]">{metrics.avg_percentage}%</div>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-purple-100 space-y-1 shadow-[0_4px_20px_-2px_rgba(106,27,154,0.05)]">
          <span className="text-[10px] uppercase font-bold text-slate-500">Highest Score</span>
          <div className="font-display font-black text-2xl text-emerald-650">{metrics.highest_score}</div>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-purple-100 space-y-1 shadow-[0_4px_20px_-2px_rgba(106,27,154,0.05)]">
          <span className="text-[10px] uppercase font-bold text-slate-500">Pass Rate</span>
          <div className="font-display font-black text-2xl text-purple-700">{metrics.pass_rate}%</div>
        </div>
      </div>

      <div className="p-6 rounded-3xl bg-white border border-purple-100 space-y-4 shadow-[0_4px_20px_-2px_rgba(106,27,154,0.05)]">
        <h3 className="font-display font-bold text-base text-slate-900">Student Submissions Log</h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F5EFFB] text-[#6A1B9A] uppercase font-bold border-b border-purple-100">
              <tr>
                <th className="p-3.5">Student ID</th>
                <th className="p-3.5">Full Name</th>
                <th className="p-3.5">College & Dept</th>
                <th className="p-3.5">Score</th>
                <th className="p-3.5">Percentage</th>
                <th className="p-3.5">Result</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-purple-50">
              {submissions.map((sub: any) => (
                <tr key={sub.id} className="hover:bg-purple-50/50 transition-colors">
                  <td className="p-3.5 font-mono font-bold text-[#6A1B9A]">{sub.student_id}</td>
                  <td className="p-3.5 font-semibold text-slate-800">{sub.student_name}</td>
                  <td className="p-3.5 text-slate-600">{sub.college_name} ({sub.department})</td>
                  <td className="p-3.5 font-mono font-bold text-slate-700">{sub.score} / {sub.total_marks}</td>
                  <td className="p-3.5 font-bold text-slate-900">{sub.percentage}%</td>
                  <td className="p-3.5">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                      sub.passed
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : 'bg-rose-50 text-rose-800 border-rose-200'
                    }`}>
                      {sub.passed ? 'PASSED' : 'FAILED'}
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
