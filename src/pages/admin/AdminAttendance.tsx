import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useNotification } from '../../context/NotificationContext';
import { Batch } from '../../types/index';
import {
  CalendarCheck,
  Download,
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  Filter,
} from 'lucide-react';

export const AdminAttendance: React.FC = () => {
  const { showToast } = useNotification();
  const [batches, setBatches] = useState<Batch[]>([]);
  const [selectedBatchId, setSelectedBatchId] = useState<string>('');
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/batches')
      .then(data => {
        const list = data.batches || [];
        setBatches(list);
        if (list.length > 0) {
          setSelectedBatchId(String(list[0].id));
        }
      })
      .catch(err => console.error('Failed to load batches', err))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (selectedBatchId) {
      api.get(`/attendance/stats?batch_id=${selectedBatchId}`)
        .then(data => setStats(data))
        .catch(err => console.error('Failed to load attendance stats', err));
    }
  }, [selectedBatchId]);

  const handleExportCSV = async () => {
    if (!selectedBatchId) return;
    try {
      const csvText = await api.get(`/attendance/export/csv?batch_id=${selectedBatchId}`);
      const blob = new Blob([csvText], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `attendance_batch_${selectedBatchId}.csv`;
      a.click();
      showToast('Attendance report exported to CSV', 'success');
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

  const batchStats = stats?.batch_stats || [];

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-black text-2xl sm:text-3xl text-white">
            Institution Attendance & Compliance
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Monitor daily session adherence, batch compliance metrics, and download audit logs.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-700"
        >
          <Download className="w-4 h-4 text-brand-400" />
          <span>Export Batch Attendance CSV</span>
        </button>
      </div>

      {/* Batch Selector */}
      <div className="p-4 rounded-2xl bg-[#0F172A] border border-slate-800 flex items-center gap-3">
        <label className="text-xs font-bold text-slate-400 uppercase">Select Batch:</label>
        <select
          value={selectedBatchId}
          onChange={e => setSelectedBatchId(e.target.value)}
          className="px-4 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-brand-500 font-mono"
        >
          {batches.map(b => (
            <option key={b.id} value={b.id}>
              {b.name} ({b.course_title})
            </option>
          ))}
        </select>
      </div>

      {/* Compliance Table */}
      <div className="p-6 rounded-3xl bg-[#0F172A] border border-slate-800 space-y-4 shadow-xl">
        <h3 className="font-display font-bold text-base text-white">
          Student Compliance Breakdown
        </h3>

        {batchStats.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">
            No attendance records found for this batch.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/80 text-slate-400 uppercase font-semibold border-b border-slate-800">
                <tr>
                  <th className="p-3.5">Student ID</th>
                  <th className="p-3.5">Full Name</th>
                  <th className="p-3.5">Total Sessions</th>
                  <th className="p-3.5">Present</th>
                  <th className="p-3.5">Absent</th>
                  <th className="p-3.5">Leave</th>
                  <th className="p-3.5">Attendance Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {batchStats.map((st: any) => {
                  const percentage = st.total_days > 0 ? Math.round((st.present_days / st.total_days) * 100) : 100;
                  return (
                    <tr key={st.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="p-3.5 font-mono font-bold text-brand-300">{st.student_id}</td>
                      <td className="p-3.5 font-semibold text-white">{st.full_name}</td>
                      <td className="p-3.5 font-mono text-slate-300">{st.total_days} Days</td>
                      <td className="p-3.5 font-bold text-emerald-400">{st.present_days}</td>
                      <td className="p-3.5 font-bold text-rose-400">{st.absent_days}</td>
                      <td className="p-3.5 font-bold text-amber-400">{st.leave_days}</td>
                      <td className="p-3.5">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          percentage >= 75
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30'
                            : 'bg-rose-950 text-rose-300 border border-rose-500/30'
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
