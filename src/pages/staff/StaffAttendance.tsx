import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import {
  CalendarCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Save,
  Users,
  Calendar,
  Sparkles,
} from 'lucide-react';

export const StaffAttendance: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useNotification();
  const [searchParams] = useSearchParams();

  const [batches, setBatches] = useState<any[]>([]);
  const [selectedBatchId, setSelectedBatchId] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [students, setStudents] = useState<any[]>([]);
  const [attendanceMap, setAttendanceMap] = useState<Record<number, { status: 'present' | 'absent' | 'leave'; remarks: string }>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // 1. Load staff batches
  useEffect(() => {
    api.get('/batches')
      .then(data => {
        const batchList = data.batches || [];
        setBatches(batchList);
        const queryBatch = searchParams.get('batch_id');
        if (queryBatch) {
          setSelectedBatchId(queryBatch);
        } else if (batchList.length > 0) {
          setSelectedBatchId(String(batchList[0].id));
        }
      })
      .catch(err => console.error('Failed to load batches', err))
      .finally(() => setLoading(false));
  }, [searchParams]);

  // 2. Load attendance roster when batch or date changes
  useEffect(() => {
    if (selectedBatchId && selectedDate) {
      api.get(`/attendance/batch/${selectedBatchId}?date=${selectedDate}`)
        .then(data => {
          const studentList = data.students || [];
          setStudents(studentList);

          const initialMap: Record<number, { status: 'present' | 'absent' | 'leave'; remarks: string }> = {};
          studentList.forEach((st: any) => {
            initialMap[st.id] = {
              status: (st.status as any) || 'present',
              remarks: st.remarks || '',
            };
          });
          setAttendanceMap(initialMap);
        })
        .catch(err => console.error('Failed to load attendance roster', err));
    }
  }, [selectedBatchId, selectedDate]);

  const setStatusForStudent = (studentId: number, status: 'present' | 'absent' | 'leave') => {
    setAttendanceMap(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        status,
      },
    }));
  };

  const setRemarksForStudent = (studentId: number, remarks: string) => {
    setAttendanceMap(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        remarks,
      },
    }));
  };

  const markAll = (status: 'present' | 'absent' | 'leave') => {
    const updated: Record<number, { status: 'present' | 'absent' | 'leave'; remarks: string }> = {};
    students.forEach(st => {
      updated[st.id] = {
        status,
        remarks: attendanceMap[st.id]?.remarks || '',
      };
    });
    setAttendanceMap(updated);
    showToast(`Marked all students as ${status}`, 'info');
  };

  const handleSave = async () => {
    if (!selectedBatchId || !selectedDate) return;
    setSaving(true);
    try {
      const records = Object.entries(attendanceMap).map(([studentId, data]) => ({
        student_id: Number(studentId),
        status: data.status,
        remarks: data.remarks,
      }));

      await api.post('/attendance/mark', {
        batch_id: Number(selectedBatchId),
        date: selectedDate,
        records,
      });

      showToast(`Attendance saved successfully for ${selectedDate}!`, 'success', 'Saved');
    } catch (err: any) {
      showToast(err.message || 'Failed to save attendance', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-black text-2xl sm:text-3xl text-white">
            Daily Attendance Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Select a batch cohort and date to mark student daily presence or leave.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving || students.length === 0}
          className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-500 hover:to-brand-600 disabled:opacity-50 text-white text-xs font-bold shadow-glow-sm flex items-center gap-2 transition-all"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Saving...' : 'Save Attendance to Database'}</span>
        </button>
      </div>

      {/* Control Bar: Select Batch & Date */}
      <div className="p-6 rounded-3xl bg-[#0F172A] border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Select Batch</label>
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

          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Session Date</label>
            <input
              type="date"
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              className="px-4 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-brand-500"
            />
          </div>
        </div>

        {/* Quick Batch Actions */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          <button
            type="button"
            onClick={() => markAll('present')}
            className="px-3.5 py-2 rounded-xl bg-emerald-950/80 hover:bg-emerald-900/80 text-emerald-300 border border-emerald-500/30 text-xs font-semibold"
          >
            Mark All Present
          </button>
          <button
            type="button"
            onClick={() => markAll('absent')}
            className="px-3.5 py-2 rounded-xl bg-rose-950/80 hover:bg-rose-900/80 text-rose-300 border border-rose-500/30 text-xs font-semibold"
          >
            Mark All Absent
          </button>
        </div>
      </div>

      {/* Student Attendance Roster Table */}
      <div className="p-6 rounded-3xl bg-[#0F172A] border border-slate-800 space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <h3 className="font-display font-bold text-base text-white flex items-center gap-2">
            <Users className="w-4 h-4 text-brand-400" />
            <span>Enrolled Students ({students.length})</span>
          </h3>
          <span className="text-xs text-slate-400">Date: {selectedDate}</span>
        </div>

        {students.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">
            No students enrolled in this batch.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/80 text-slate-400 uppercase font-semibold border-b border-slate-800">
                <tr>
                  <th className="p-3.5">Student ID</th>
                  <th className="p-3.5">Full Name</th>
                  <th className="p-3.5 text-center">Status</th>
                  <th className="p-3.5">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {students.map((st: any) => {
                  const currentStatus = attendanceMap[st.id]?.status || 'present';
                  const currentRemarks = attendanceMap[st.id]?.remarks || '';

                  return (
                    <tr key={st.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="p-3.5 font-mono font-bold text-brand-300">{st.student_id}</td>
                      <td className="p-3.5">
                        <p className="font-semibold text-white">{st.full_name}</p>
                        <p className="text-[11px] text-slate-400">{st.email}</p>
                      </td>
                      <td className="p-3.5">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setStatusForStudent(st.id, 'present')}
                            className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all ${
                              currentStatus === 'present'
                                ? 'bg-emerald-600 text-white shadow-sm ring-1 ring-emerald-400'
                                : 'bg-slate-900 text-slate-400 hover:text-white'
                            }`}
                          >
                            Present
                          </button>
                          <button
                            type="button"
                            onClick={() => setStatusForStudent(st.id, 'absent')}
                            className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all ${
                              currentStatus === 'absent'
                                ? 'bg-rose-600 text-white shadow-sm ring-1 ring-rose-400'
                                : 'bg-slate-900 text-slate-400 hover:text-white'
                            }`}
                          >
                            Absent
                          </button>
                          <button
                            type="button"
                            onClick={() => setStatusForStudent(st.id, 'leave')}
                            className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all ${
                              currentStatus === 'leave'
                                ? 'bg-amber-600 text-white shadow-sm ring-1 ring-amber-400'
                                : 'bg-slate-900 text-slate-400 hover:text-white'
                            }`}
                          >
                            Leave
                          </button>
                        </div>
                      </td>
                      <td className="p-3.5">
                        <input
                          type="text"
                          value={currentRemarks}
                          onChange={e => setRemarksForStudent(st.id, e.target.value)}
                          placeholder="Optional notes (e.g. medical leave)..."
                          className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
                        />
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
