import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Modal } from '../../components/common/Modal';
import {
  Layers,
  Users,
  Clock,
  BookOpen,
  Calendar,
  Award,
  ChevronRight,
  Eye,
  CheckCircle2,
} from 'lucide-react';

export const StaffBatches: React.FC = () => {
  const { user } = useAuth();
  const [batches, setBatches] = useState<any[]>([]);
  const [selectedBatch, setSelectedBatch] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [studentModalOpen, setStudentModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);

  useEffect(() => {
    loadBatches();
  }, []);

  const loadBatches = () => {
    api.get('/batches')
      .then(data => {
        const list = data.batches || [];
        setBatches(list);
        if (list.length > 0) {
          fetchBatchDetails(list[0].id);
        }
      })
      .catch(err => console.error('Failed to load batches', err))
      .finally(() => setLoading(false));
  };

  const fetchBatchDetails = (batchId: number) => {
    api.get(`/batches/${batchId}`)
      .then(data => setSelectedBatch(data))
      .catch(err => console.error('Failed to load batch details', err));
  };

  const viewStudentDetails = (st: any) => {
    api.get(`/students/${st.id}`)
      .then(data => {
        setSelectedStudent(data);
        setStudentModalOpen(true);
      })
      .catch(err => console.error('Failed to fetch student details', err));
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      <div>
        <h1 className="font-display font-black text-2xl sm:text-3xl text-white">
          My Batches & Student Rosters
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          View assigned cohort batches, student performance benchmarks, and profiles.
        </p>
      </div>

      {/* Batches Selector Pills */}
      <div className="flex flex-wrap gap-2">
        {batches.map(b => (
          <button
            key={b.id}
            onClick={() => fetchBatchDetails(b.id)}
            className={`px-4 py-2 rounded-2xl text-xs font-bold font-mono transition-all flex items-center gap-2 ${
              selectedBatch?.batch?.id === b.id
                ? 'bg-brand-600 text-white shadow-glow-sm ring-1 ring-brand-400'
                : 'bg-[#0F172A] text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-brand-400" />
            <span>{b.name}</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-900 text-slate-300">
              {b.student_count || 0}
            </span>
          </button>
        ))}
      </div>

      {selectedBatch && (
        <div className="space-y-6">
          {/* Batch Meta Box */}
          <div className="p-6 rounded-3xl bg-[#0F172A] border border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Course Track</span>
              <p className="font-bold text-white text-sm mt-0.5">{selectedBatch.batch.course_title}</p>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Schedule Timing</span>
              <p className="text-slate-300 mt-0.5">{selectedBatch.batch.timing}</p>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Total Enrolled</span>
              <p className="font-bold text-brand-300 text-sm mt-0.5">{selectedBatch.students?.length || 0} Students</p>
            </div>
          </div>

          {/* Student Roster Table */}
          <div className="p-6 rounded-3xl bg-[#0F172A] border border-slate-800 space-y-4 shadow-xl">
            <h3 className="font-display font-bold text-base text-white">
              Student Roster & Performance Overview
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900/80 text-slate-400 uppercase font-semibold border-b border-slate-800">
                  <tr>
                    <th className="p-3.5">Student ID</th>
                    <th className="p-3.5">Name</th>
                    <th className="p-3.5">College & Dept</th>
                    <th className="p-3.5">Avg Score</th>
                    <th className="p-3.5">Attendance</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {selectedBatch.students?.map((st: any) => {
                    const attPercent = st.total_attendance_days > 0 
                      ? Math.round((st.present_days / st.total_attendance_days) * 100) 
                      : 100;
                    return (
                      <tr key={st.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="p-3.5 font-mono font-bold text-brand-300">{st.student_id}</td>
                        <td className="p-3.5">
                          <p className="font-semibold text-white">{st.full_name}</p>
                          <p className="text-[11px] text-slate-400">{st.email}</p>
                        </td>
                        <td className="p-3.5 text-slate-300">{st.college_name} ({st.department})</td>
                        <td className="p-3.5 font-bold text-white">
                          {st.avg_score !== null ? `${st.avg_score}%` : '—'}
                        </td>
                        <td className="p-3.5">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            attPercent >= 75 ? 'bg-emerald-950 text-emerald-300' : 'bg-rose-950 text-rose-300'
                          }`}>
                            {attPercent}%
                          </span>
                        </td>
                        <td className="p-3.5 text-right">
                          <button
                            onClick={() => viewStudentDetails(st)}
                            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold inline-flex items-center gap-1"
                          >
                            <Eye className="w-3.5 h-3.5 text-brand-400" />
                            <span>Profile</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Student Profile Drawer / Modal */}
      <Modal
        isOpen={studentModalOpen}
        onClose={() => setStudentModalOpen(false)}
        title="Student Academic Record"
        subtitle={selectedStudent?.student?.student_id}
        maxWidth="xl"
      >
        {selectedStudent && (
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
              <h4 className="font-bold text-sm text-white">{selectedStudent.student.full_name}</h4>
              <p className="text-slate-300">{selectedStudent.student.college_name} • {selectedStudent.student.degree} ({selectedStudent.student.department})</p>
              <p className="text-slate-400 font-mono">Email: {selectedStudent.student.email} • Phone: {selectedStudent.student.mobile}</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-brand-950/40 border border-brand-500/30">
                <span className="text-[10px] text-brand-300 uppercase font-bold block">Attendance Compliance</span>
                <span className="font-display font-bold text-lg text-white mt-0.5">
                  {selectedStudent.attendance?.percentage || 0}% ({selectedStudent.attendance?.present_days} / {selectedStudent.attendance?.total_days} Days)
                </span>
              </div>
              <div className="p-3 rounded-xl bg-purple-950/40 border border-purple-500/30">
                <span className="text-[10px] text-purple-300 uppercase font-bold block">Completed Assessments</span>
                <span className="font-display font-bold text-lg text-white mt-0.5">
                  {selectedStudent.test_attempts?.length || 0} Tests
                </span>
              </div>
            </div>

            {/* Test attempts */}
            <div className="space-y-2 pt-2">
              <h5 className="font-bold text-white uppercase text-[10px] tracking-wider">Test Results</h5>
              <div className="space-y-1.5 max-h-40 overflow-y-auto">
                {selectedStudent.test_attempts?.map((att: any) => (
                  <div key={att.id} className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex justify-between items-center">
                    <div>
                      <span className="font-semibold text-white">{att.test_title}</span>
                      <span className="text-[10px] text-slate-400 block">{att.subject}</span>
                    </div>
                    <span className={`font-bold ${att.passed ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {att.score}/{att.total_marks} ({att.percentage}%)
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
