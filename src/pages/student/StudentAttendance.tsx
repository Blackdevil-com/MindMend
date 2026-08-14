import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  CalendarCheck,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
} from 'lucide-react';

export const StudentAttendance: React.FC = () => {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/attendance/student')
      .then(res => setData(res))
      .catch(err => console.error('Failed to load student attendance', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const summary = data?.summary || { total_days: 0, present_days: 0, absent_days: 0, leave_days: 0, percentage: 100 };
  const records = data?.records || [];

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      <div>
        <h1 className="font-display font-black text-2xl sm:text-3xl text-white">
          My Attendance Record
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Review your daily training session attendance logs and compliance percentage.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-[#0F172A] border border-slate-800 space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400">Attendance Rate</span>
          <div className="font-display font-black text-2xl text-brand-300">{summary.percentage}%</div>
        </div>

        <div className="p-5 rounded-2xl bg-[#0F172A] border border-slate-800 space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400">Present Sessions</span>
          <div className="font-display font-black text-2xl text-emerald-400">{summary.present_days}</div>
        </div>

        <div className="p-5 rounded-2xl bg-[#0F172A] border border-slate-800 space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400">Absent Sessions</span>
          <div className="font-display font-black text-2xl text-rose-400">{summary.absent_days}</div>
        </div>

        <div className="p-5 rounded-2xl bg-[#0F172A] border border-slate-800 space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400">Approved Leaves</span>
          <div className="font-display font-black text-2xl text-amber-400">{summary.leave_days}</div>
        </div>
      </div>

      {/* Detailed Attendance Roster */}
      <div className="p-6 rounded-3xl bg-[#0F172A] border border-slate-800 space-y-4">
        <h3 className="font-display font-bold text-lg text-white">Daily Attendance History</h3>
        {records.length === 0 ? (
          <p className="text-xs text-slate-400 py-4 text-center">No attendance sessions recorded yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/80 text-slate-400 uppercase font-semibold border-b border-slate-800">
                <tr>
                  <th className="p-3">Session Date</th>
                  <th className="p-3">Batch Name</th>
                  <th className="p-3">Course</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {records.map((rec: any) => (
                  <tr key={rec.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-3 font-semibold text-white">{rec.date}</td>
                    <td className="p-3 font-mono text-brand-300">{rec.batch_name}</td>
                    <td className="p-3 text-slate-300">{rec.course_title}</td>
                    <td className="p-3">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                        rec.status === 'present'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30'
                          : rec.status === 'absent'
                          ? 'bg-rose-950 text-rose-300 border border-rose-500/30'
                          : 'bg-amber-950 text-amber-300 border border-amber-500/30'
                      }`}>
                        {rec.status}
                      </span>
                    </td>
                    <td className="p-3 text-slate-400">{rec.remarks || '—'}</td>
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
