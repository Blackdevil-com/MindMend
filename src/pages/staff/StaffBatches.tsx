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
        const list = data.batches || [
          { id: 1, name: 'FS-2026-A', course_title: 'Full-Stack Web Architecture', student_count: 28 },
          { id: 2, name: 'UI-2026-B', course_title: 'Envato UI/UX Design Pro', student_count: 20 },
        ];
        setBatches(list);
        if (list.length > 0) {
          setSelectedBatch({
            batch: list[0],
            students: [
              { id: 101, student_id: 'STU-2026-01', full_name: 'Alex Rivera', email: 'alex@mindmend.edu', college_name: 'Tech Institute', department: 'CS', avg_score: 92, present_days: 28, total_attendance_days: 30 },
              { id: 102, student_id: 'STU-2026-02', full_name: 'Priya Sharma', email: 'priya@mindmend.edu', college_name: 'Tech Institute', department: 'IT', avg_score: 88, present_days: 29, total_attendance_days: 30 },
            ]
          });
        }
      })
      .catch(() => setBatches([
        { id: 1, name: 'FS-2026-A', course_title: 'Full-Stack Web Architecture', student_count: 28 },
        { id: 2, name: 'UI-2026-B', course_title: 'Envato UI/UX Design Pro', student_count: 20 },
      ]))
      .finally(() => setLoading(false));
  };

  const fetchBatchDetails = (batchId: number) => {
    const found = batches.find(b => b.id === batchId);
    setSelectedBatch({
      batch: found || batches[0],
      students: [
        { id: 101, student_id: 'STU-2026-01', full_name: 'Alex Rivera', email: 'alex@mindmend.edu', college_name: 'Tech Institute', department: 'CS', avg_score: 92, present_days: 28, total_attendance_days: 30 },
        { id: 102, student_id: 'STU-2026-02', full_name: 'Priya Sharma', email: 'priya@mindmend.edu', college_name: 'Tech Institute', department: 'IT', avg_score: 88, present_days: 29, total_attendance_days: 30 },
      ]
    });
  };

  const viewStudentDetails = (st: any) => {
    setSelectedStudent({
      student: st,
      attendance: { percentage: 94, present_days: 28, total_days: 30 },
      test_attempts: [
        { id: 1, test_title: 'Full-Stack React Quiz', subject: 'Web Architecture', score: 46, total_marks: 50, percentage: 92, passed: true }
      ]
    });
    setStudentModalOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#6A1B9A] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12 select-none">
      <div>
        <h1 className="font-display font-black text-2xl sm:text-3xl text-slate-900 flex items-center gap-3">
          <Layers className="w-7 h-7 text-[#8E24AA]" />
          <span>My Batches & Student Rosters</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 font-medium">
          View assigned cohort batches, student performance benchmarks, and profiles.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {batches.map(b => (
          <button
            key={b.id}
            onClick={() => fetchBatchDetails(b.id)}
            className={`px-4 py-2 rounded-2xl text-xs font-bold font-mono transition-all flex items-center gap-2 ${
              selectedBatch?.batch?.id === b.id
                ? 'bg-[#6A1B9A] text-white shadow-glow-purple ring-1 ring-[#8E24AA]'
                : 'bg-white text-slate-600 hover:text-[#6A1B9A] hover:bg-purple-50 border border-purple-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{b.name}</span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full ${
              selectedBatch?.batch?.id === b.id
                ? 'bg-purple-900 text-purple-100'
                : 'bg-[#F5EFFB] text-slate-655'
            }`}>
              {b.student_count || 24}
            </span>
          </button>
        ))}
      </div>

      {selectedBatch && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-white border border-purple-100 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs shadow-[0_4px_20px_-2px_rgba(106,27,154,0.05)]">
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-bold block">Course Track</span>
              <p className="font-bold text-slate-900 text-sm mt-0.5">{selectedBatch.batch.course_title}</p>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-bold block">Schedule Timing</span>
              <p className="text-slate-700 mt-0.5">{selectedBatch.batch.timing || '10:00 AM - 12:30 PM'}</p>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-bold block">Enrolled Roster</span>
              <p className="font-bold text-[#6A1B9A] text-sm mt-0.5">{selectedBatch.students?.length || 24} Students</p>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-purple-100 space-y-4 shadow-[0_4px_20px_-2px_rgba(106,27,154,0.05)]">
            <h3 className="font-display font-bold text-base text-slate-900">
              Student Roster & Performance Overview
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F5EFFB] text-[#6A1B9A] uppercase font-bold border-b border-purple-100">
                  <tr>
                    <th className="p-3.5">Student ID</th>
                    <th className="p-3.5">Name</th>
                    <th className="p-3.5">College & Dept</th>
                    <th className="p-3.5">Avg Score</th>
                    <th className="p-3.5">Attendance</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-purple-50">
                  {selectedBatch.students?.map((st: any) => {
                    return (
                      <tr key={st.id} className="hover:bg-purple-50/50 transition-colors">
                        <td className="p-3.5 font-mono font-bold text-[#6A1B9A]">{st.student_id}</td>
                        <td className="p-3.5">
                          <p className="font-semibold text-slate-800">{st.full_name}</p>
                          <p className="text-[11px] text-slate-500">{st.email}</p>
                        </td>
                        <td className="p-3.5 text-slate-650">{st.college_name} ({st.department})</td>
                        <td className="p-3.5 font-bold text-slate-800">
                          {st.avg_score}%
                        </td>
                        <td className="p-3.5">
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-850 border border-emerald-200">
                            94%
                          </span>
                        </td>
                        <td className="p-3.5 text-right">
                          <button
                            onClick={() => viewStudentDetails(st)}
                            className="px-3 py-1.5 rounded-xl bg-[#6A1B9A] hover:bg-[#8E24AA] text-white text-xs font-semibold inline-flex items-center gap-1 shadow-glow-sm"
                          >
                            <Eye className="w-3.5 h-3.5" />
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

      <Modal
        isOpen={studentModalOpen}
        onClose={() => setStudentModalOpen(false)}
        title="Student Academic Record"
        subtitle={selectedStudent?.student?.student_id}
        maxWidth="xl"
      >
        {selectedStudent && (
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-2xl bg-[#F5EFFB] border border-purple-200 space-y-2">
              <h4 className="font-bold text-sm text-[#6A1B9A]">{selectedStudent.student.full_name}</h4>
              <p className="text-slate-600">{selectedStudent.student.college_name} • {selectedStudent.student.department}</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-purple-50 border border-purple-100">
                <span className="text-[10px] text-[#6A1B9A] uppercase font-bold block">Attendance Compliance</span>
                <span className="font-display font-bold text-lg text-slate-800 mt-0.5">
                  94% (28/30 Days)
                </span>
              </div>
              <div className="p-3 rounded-xl bg-purple-50 border border-purple-100">
                <span className="text-[10px] text-[#6A1B9A] uppercase font-bold block">Test Performance</span>
                <span className="font-display font-bold text-lg text-slate-800 mt-0.5">
                  92% Average
                </span>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
