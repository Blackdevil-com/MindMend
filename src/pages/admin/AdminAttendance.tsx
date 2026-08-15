import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useToast } from '../../components/common/Toast';
import { Batch } from '../../types/index';
import {
  CalendarCheck,
  Download,
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  Filter,
  Loader2,
  RefreshCw,
} from 'lucide-react';

export const AdminAttendance: React.FC = () => {
  const { showToast } = useToast();
  const [batches, setBatches] = useState<Batch[]>([]);
  const [selectedBatchId, setSelectedBatchId] = useState<string>('');
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(false);

  useEffect(() => {
    loadBatches();
  }, []);

  const loadBatches = () => {
    setLoading(true);
    api.get('/batches')
      .then(data => {
        const list = data.batches || [];
        setBatches(list);
        if (list.length > 0) {
          setSelectedBatchId(String(list[0].id));
        }
      })
      .catch(err => {
        console.error('Failed to load batches', err);
        showToast('Failed to load batches list', undefined, 'error');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (selectedBatchId) {
      setStatsLoading(true);
      api.get(`/attendance/stats?batch_id=${selectedBatchId}`)
        .then(data => setStats(data))
        .catch(err => {
          console.error('Failed to load attendance stats', err);
          showToast('Failed to load attendance compliance stats', undefined, 'error');
        })
        .finally(() => setStatsLoading(false));
    }
  }, [selectedBatchId]);

  const handleExportCSV = async () => {
    if (!selectedBatchId) return;
    try {
      showToast('Generating CSV report...', undefined, 'info');
      const csvText = await api.get(`/attendance/export/csv/${selectedBatchId}`);
      const blob = new Blob([csvText], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `attendance_batch_${selectedBatchId}.csv`;
      a.click();
      showToast('Attendance report exported successfully! 📄', undefined, 'success');
    } catch (err) {
      showToast('Failed to export CSV report', undefined, 'error');
    }
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#6A1B9A] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const batchStats = stats?.batch_stats || [];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 select-none px-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-purple-100 shadow-[0_4px_20px_-2px_rgba(106,27,154,0.03)]">
        <div>
          <h1 className="font-display font-black text-2xl sm:text-3xl text-slate-900 flex items-center gap-3">
            <CalendarCheck className="w-8 h-8 text-[#8E24AA]" />
            <span>Attendance & Session Compliance</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
            Monitor daily session attendance rates, student compliance metrics, and download audit logs.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          disabled={!selectedBatchId}
          className="px-5 py-2.5 rounded-xl bg-[#6A1B9A] hover:bg-[#8E24AA] text-white text-xs font-bold shadow-glow-purple flex items-center gap-2 transition-all"
        >
          <Download className="w-4 h-4" />
          <span>Export Batch Attendance CSV</span>
        </button>
      </div>

      {/* Batch Selector */}
      <div className="p-4 rounded-2xl bg-white border border-purple-100 flex items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center gap-3">
          <label className="text-xs font-bold text-slate-700 uppercase">Select Batch:</label>
          <select
            value={selectedBatchId}
            onChange={e => setSelectedBatchId(e.target.value)}
            className="px-4 py-2 bg-[#F5EFFB] border border-purple-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#6A1B9A] font-mono font-bold"
          >
            {batches.map(b => (
              <option key={b.id} value={b.id}>
                {b.name} ({b.course_title})
              </option>
            ))}
          </select>
        </div>

        <button 
          onClick={loadBatches}
          className="p-1.5 rounded-lg bg-white border border-purple-200 text-purple-700 hover:bg-purple-50"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Compliance Table */}
      <div className="p-6 rounded-3xl bg-white border border-purple-100 space-y-4 shadow-[0_4px_20px_-2px_rgba(106,27,154,0.04)]">
        <div className="flex items-center justify-between">
          <h3 className="font-display font-black text-lg text-slate-900">
            Student Attendance Compliance
          </h3>
          {statsLoading && <Loader2 className="w-4 h-4 text-[#6A1B9A] animate-spin" />}
        </div>

        {batchStats.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500 font-semibold bg-slate-50 border border-dashed rounded-2xl">
            No attendance records found for this batch. Instructors can record attendance from the trainer portal.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F5EFFB] text-[#6A1B9A] uppercase font-bold border-b border-purple-100">
                <tr>
                  <th className="p-3.5">Student ID</th>
                  <th className="p-3.5">Full Name</th>
                  <th className="p-3.5">Total Sessions</th>
                  <th className="p-3.5">Present</th>
                  <th className="p-3.5">Absent</th>
                  <th className="p-3.5">Leave</th>
                  <th className="p-3.5 text-right">Attendance Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-purple-50">
                {batchStats.map((st: any) => {
                  const percentage = st.total_days > 0 ? Math.round((st.present_days / st.total_days) * 100) : 100;
                  return (
                    <tr key={st.id} className="hover:bg-purple-50/30 transition-colors">
                      <td className="p-3.5 font-mono font-bold text-[#6A1B9A]">{st.student_id}</td>
                      <td className="p-3.5 font-semibold text-slate-800">{st.full_name}</td>
                      <td className="p-3.5 font-mono text-slate-505 font-medium">{st.total_days} Days</td>
                      <td className="p-3.5 font-bold text-emerald-600">{st.present_days}</td>
                      <td className="p-3.5 font-bold text-rose-600">{st.absent_days}</td>
                      <td className="p-3.5 font-bold text-amber-600">{st.leave_days}</td>
                      <td className="p-3.5 text-right">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                          percentage >= 75
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : 'bg-rose-50 text-rose-800 border-rose-200'
                        }`}>
                          {percentage}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
