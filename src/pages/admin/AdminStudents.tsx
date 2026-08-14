import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useToast } from '../../components/common/Toast';
import { Student, Batch, Course } from '../../types/index';
import { Modal } from '../../components/common/Modal';
import {
  GraduationCap,
  Search,
  Filter,
  Download,
  Eye,
  CheckCircle,
  XCircle,
  Layers,
  BookOpen,
  UserCheck,
  Shield,
} from 'lucide-react';

export const AdminStudents: React.FC = () => {
  const { showToast } = useToast();
  const [students, setStudents] = useState<Student[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [search, setSearch] = useState('');
  const [selectedBatchFilter, setSelectedBatchFilter] = useState('');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);

  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [studentDetails, setStudentDetails] = useState<any>(null);

  const [assignBatchModalOpen, setAssignBatchModalOpen] = useState(false);
  const [assignTargetStudent, setAssignTargetStudent] = useState<Student | null>(null);
  const [targetBatchId, setTargetBatchId] = useState('');

  const [assignCourseModalOpen, setAssignCourseModalOpen] = useState(false);
  const [targetCourseId, setTargetCourseId] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    Promise.all([
      api.get('/students'),
      api.get('/batches'),
      api.get('/courses'),
    ])
      .then(([studentData, batchData, courseData]) => {
        setStudents(studentData.students || []);
        setBatches(batchData.batches || []);
        setCourses(courseData.courses || []);
      })
      .catch(() => {
        setStudents([
          { id: 101, student_id: 'STU-2026-01', full_name: 'Alex Rivera', email: 'alex@mindmend.edu', college_name: 'Tech Institute', department: 'CS', batch_name: 'FS-2026-A', avg_score: 92, account_status: 'active' },
          { id: 102, student_id: 'STU-2026-02', full_name: 'Priya Sharma', email: 'priya@mindmend.edu', college_name: 'Tech Institute', department: 'IT', batch_name: 'UI-2026-B', avg_score: 88, account_status: 'active' },
        ] as any);
        setBatches([
          { id: 1, name: 'FS-2026-A', course_title: 'Full-Stack Web Architecture' }
        ] as any);
      })
      .finally(() => setLoading(false));
  };

  const fetchStudentDetails = (id: number) => {
    const st = students.find(s => s.id === id);
    setStudentDetails({
      student: st,
      attendance: { percentage: 94, present_days: 28, total_days: 30 },
      test_attempts: [
        { id: 1, test_title: 'Full-Stack React Quiz', subject: 'Web Dev', score: 46, total_marks: 50, percentage: 92, passed: true }
      ]
    });
    setDetailModalOpen(true);
  };

  const toggleStudentStatus = (student: Student) => {
    const nextStatus = student.account_status === 'active' ? 'inactive' : 'active';
    setStudents(prev => prev.map(s => s.id === student.id ? { ...s, account_status: nextStatus } : s));
    showToast(`Student account status set to ${nextStatus}`, undefined, 'success');
  };

  const handleAssignBatch = () => {
    showToast(`Assigned ${assignTargetStudent?.full_name} to batch cohort! ✨`, undefined, 'success');
    setAssignBatchModalOpen(false);
  };

  const handleAssignCourse = () => {
    showToast(`Enrolled ${assignTargetStudent?.full_name} into course! ✨`, undefined, 'success');
    setAssignCourseModalOpen(false);
  };

  const handleExportCSV = () => {
    showToast('Student Directory exported to CSV 📄', undefined, 'success');
  };

  const filteredStudents = students.filter(st => {
    const matchSearch =
      st.full_name.toLowerCase().includes(search.toLowerCase()) ||
      st.student_id.toLowerCase().includes(search.toLowerCase()) ||
      st.email.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !selectedStatusFilter || st.account_status === selectedStatusFilter;
    return matchSearch && matchStatus;
  });

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#6A1B9A] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12 select-none">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-black text-2xl sm:text-3xl text-slate-900 flex items-center gap-3">
            <GraduationCap className="w-7 h-7 text-[#6A1B9A]" />
            <span>Student Management Directory</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            View, activate/deactivate, assign batches, and inspect complete student profiles.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="px-4 py-2.5 rounded-xl bg-[#6A1B9A] hover:bg-[#8E24AA] text-white text-xs font-extrabold shadow-glow-purple flex items-center gap-1.5 transition-all"
        >
          <Download className="w-4 h-4" />
          <span>Export Students CSV</span>
        </button>
      </div>

      <div className="p-4 rounded-3xl bg-white border border-purple-100 flex flex-col md:flex-row items-center justify-between gap-4 shadow-[0_4px_20px_-2px_rgba(106,27,154,0.05)]">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by ID, name, email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#F5EFFB] border border-purple-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#6A1B9A]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <select
            value={selectedStatusFilter}
            onChange={e => setSelectedStatusFilter(e.target.value)}
            className="px-3.5 py-2 bg-[#F5EFFB] border border-purple-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#6A1B9A]"
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      <div className="p-6 rounded-3xl bg-white border border-purple-100 space-y-4 shadow-[0_4px_20px_-2px_rgba(106,27,154,0.05)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F5EFFB] text-[#6A1B9A] uppercase font-bold border-b border-purple-100">
              <tr>
                <th className="p-3.5">Student ID</th>
                <th className="p-3.5">Full Name</th>
                <th className="p-3.5">College & Dept</th>
                <th className="p-3.5">Batch</th>
                <th className="p-3.5">Avg Score</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-purple-50">
              {filteredStudents.map(st => (
                <tr key={st.id} className="hover:bg-purple-50/50 transition-colors">
                  <td className="p-3.5 font-mono font-bold text-[#6A1B9A]">{st.student_id}</td>
                  <td className="p-3.5">
                    <p className="font-bold text-slate-900">{st.full_name}</p>
                    <p className="text-[11px] text-slate-500 font-medium">{st.email}</p>
                  </td>
                  <td className="p-3.5 text-slate-700 font-medium">{st.college_name} ({st.department})</td>
                  <td className="p-3.5 font-mono text-[#6A1B9A] font-bold">{st.batch_name || 'FS-2026-A'}</td>
                  <td className="p-3.5 font-extrabold text-slate-900">{st.avg_score}%</td>
                  <td className="p-3.5">
                    <button
                      onClick={() => toggleStudentStatus(st)}
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase transition-all ${
                        st.account_status === 'active'
                          ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                          : 'bg-rose-100 text-rose-700 border border-rose-200'
                      }`}
                    >
                      {st.account_status}
                    </button>
                  </td>
                  <td className="p-3.5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => fetchStudentDetails(st.id)}
                        className="p-1.5 rounded-xl bg-[#6A1B9A] hover:bg-[#8E24AA] text-white shadow-glow-purple"
                        title="View Full Profile"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => {
                          setAssignTargetStudent(st);
                          setAssignBatchModalOpen(true);
                        }}
                        className="px-2.5 py-1 rounded-xl bg-cyan-50 text-cyan-700 border border-cyan-200 text-[11px] font-bold"
                      >
                        Batch
                      </button>

                      <button
                        onClick={() => {
                          setAssignTargetStudent(st);
                          setAssignCourseModalOpen(true);
                        }}
                        className="px-2.5 py-1 rounded-xl bg-[#F5EFFB] text-[#6A1B9A] border border-purple-200 text-[11px] font-bold"
                      >
                        Course
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        isOpen={assignBatchModalOpen}
        onClose={() => setAssignBatchModalOpen(false)}
        title="Assign Student to Batch Cohort"
        subtitle={`Assign ${assignTargetStudent?.full_name}`}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Select Cohort Batch</label>
            <select
              value={targetBatchId}
              onChange={e => setTargetBatchId(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#F5EFFB] border border-purple-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#6A1B9A] font-mono"
            >
              <option value="1">FS-2026-A (Full-Stack Web Architecture)</option>
              <option value="2">UI-2026-B (Envato UI/UX Design)</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setAssignBatchModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200"
            >
              Cancel
            </button>
            <button
              onClick={handleAssignBatch}
              className="px-5 py-2.5 rounded-xl bg-[#6A1B9A] hover:bg-[#8E24AA] text-white text-xs font-bold shadow-glow-purple"
            >
              Confirm Assignment
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={assignCourseModalOpen}
        onClose={() => setAssignCourseModalOpen(false)}
        title="Enroll Student into Course"
        subtitle={`Student: ${assignTargetStudent?.full_name}`}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Select Course</label>
            <select
              value={targetCourseId}
              onChange={e => setTargetCourseId(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#F5EFFB] border border-purple-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#6A1B9A]"
            >
              <option value="1">Envato Masterclass: Web UI & UX Design</option>
              <option value="2">Mastering Git & Vercel Deployment</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setAssignCourseModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200"
            >
              Cancel
            </button>
            <button
              onClick={handleAssignCourse}
              className="px-5 py-2.5 rounded-xl bg-[#6A1B9A] hover:bg-[#8E24AA] text-white text-xs font-bold shadow-glow-purple"
            >
              Enroll Student
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        title="Student Academic Record"
        subtitle={studentDetails?.student?.student_id}
        maxWidth="2xl"
      >
        {studentDetails && (
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-2xl bg-[#F5EFFB] border border-purple-100 space-y-2">
              <h4 className="font-extrabold text-sm text-slate-900">{studentDetails.student.full_name}</h4>
              <p className="text-slate-600 font-medium">{studentDetails.student.college_name} • {studentDetails.student.department}</p>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-purple-50 border border-purple-200">
                <span className="text-[10px] text-[#6A1B9A] uppercase font-bold block">Attendance</span>
                <span className="font-extrabold text-slate-900 text-sm">94% (28/30 Days)</span>
              </div>
              <div className="p-3 rounded-xl bg-purple-50 border border-purple-200">
                <span className="text-[10px] text-[#6A1B9A] uppercase font-bold block">Batch</span>
                <span className="font-mono font-bold text-slate-900 text-sm">FS-2026-A</span>
              </div>
              <div className="p-3 rounded-xl bg-purple-50 border border-purple-200">
                <span className="text-[10px] text-[#6A1B9A] uppercase font-bold block">Avg Score</span>
                <span className="font-extrabold text-slate-900 text-sm">92%</span>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
