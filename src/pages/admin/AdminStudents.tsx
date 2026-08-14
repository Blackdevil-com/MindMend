import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useNotification } from '../../context/NotificationContext';
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
  const { showToast } = useNotification();
  const [students, setStudents] = useState<Student[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [search, setSearch] = useState('');
  const [selectedBatchFilter, setSelectedBatchFilter] = useState('');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);

  // Student Profile Drawer / Modal
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [studentDetails, setStudentDetails] = useState<any>(null);

  // Assign Batch Modal
  const [assignBatchModalOpen, setAssignBatchModalOpen] = useState(false);
  const [assignTargetStudent, setAssignTargetStudent] = useState<Student | null>(null);
  const [targetBatchId, setTargetBatchId] = useState('');

  // Assign Course Modal
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
      .catch(err => console.error('Failed to load students data', err))
      .finally(() => setLoading(false));
  };

  const fetchStudentDetails = async (id: number) => {
    try {
      const data = await api.get(`/students/${id}`);
      setStudentDetails(data);
      setDetailModalOpen(true);
    } catch (err) {
      showToast('Could not load student profile', 'error');
    }
  };

  const toggleStudentStatus = async (student: Student) => {
    const newStatus = student.account_status === 'active' ? 'inactive' : 'active';
    try {
      await api.patch(`/students/${student.id}/status`, { status: newStatus });
      showToast(`Student status updated to ${newStatus}`, 'success');
      loadData();
    } catch (err: any) {
      showToast(err.message || 'Failed to update status', 'error');
    }
  };

  const handleAssignBatch = async () => {
    if (!assignTargetStudent || !targetBatchId) return;
    try {
      await api.post('/students/assign-batch', {
        student_id: assignTargetStudent.id,
        batch_id: Number(targetBatchId),
      });
      showToast('Student assigned to batch successfully', 'success');
      setAssignBatchModalOpen(false);
      loadData();
    } catch (err: any) {
      showToast(err.message || 'Failed to assign batch', 'error');
    }
  };

  const handleAssignCourse = async () => {
    if (!assignTargetStudent || !targetCourseId) return;
    try {
      await api.post('/students/assign-course', {
        student_id: assignTargetStudent.id,
        course_id: Number(targetCourseId),
      });
      showToast('Student enrolled in course successfully', 'success');
      setAssignCourseModalOpen(false);
      loadData();
    } catch (err: any) {
      showToast(err.message || 'Failed to enroll course', 'error');
    }
  };

  const handleExportCSV = async () => {
    try {
      const csvText = await api.get('/students/export/csv');
      const blob = new Blob([csvText], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'mindmend_students.csv';
      a.click();
      showToast('Students directory exported to CSV', 'success');
    } catch (err) {
      showToast('Export failed', 'error');
    }
  };

  const filteredStudents = students.filter(st => {
    const matchSearch =
      st.full_name.toLowerCase().includes(search.toLowerCase()) ||
      st.student_id.toLowerCase().includes(search.toLowerCase()) ||
      st.email.toLowerCase().includes(search.toLowerCase()) ||
      st.college_name.toLowerCase().includes(search.toLowerCase());
    const matchBatch = !selectedBatchFilter || String(st.batch_id) === selectedBatchFilter;
    const matchStatus = !selectedStatusFilter || st.account_status === selectedStatusFilter;
    return matchSearch && matchBatch && matchStatus;
  });

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-black text-2xl sm:text-3xl text-white">
            Student Management Directory
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            View, activate/deactivate, assign batches, and inspect complete student profiles.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-700"
        >
          <Download className="w-4 h-4 text-brand-400" />
          <span>Export Students CSV</span>
        </button>
      </div>

      {/* Controls: Search & Filters */}
      <div className="p-4 rounded-2xl bg-[#0F172A] border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by ID, name, email, college..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <select
            value={selectedBatchFilter}
            onChange={e => setSelectedBatchFilter(e.target.value)}
            className="px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-brand-500 font-mono"
          >
            <option value="">All Batches</option>
            {batches.map(b => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>

          <select
            value={selectedStatusFilter}
            onChange={e => setSelectedStatusFilter(e.target.value)}
            className="px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-brand-500"
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Students Directory Table */}
      <div className="p-6 rounded-3xl bg-[#0F172A] border border-slate-800 space-y-4 shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/80 text-slate-400 uppercase font-semibold border-b border-slate-800">
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
            <tbody className="divide-y divide-slate-800">
              {filteredStudents.map(st => (
                <tr key={st.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="p-3.5 font-mono font-bold text-brand-300">{st.student_id}</td>
                  <td className="p-3.5">
                    <p className="font-semibold text-white">{st.full_name}</p>
                    <p className="text-[11px] text-slate-400">{st.email}</p>
                  </td>
                  <td className="p-3.5 text-slate-300">{st.college_name} ({st.department})</td>
                  <td className="p-3.5 font-mono text-cyan-300 font-bold">{st.batch_name || 'Unassigned'}</td>
                  <td className="p-3.5 font-bold text-white">{st.avg_score !== null ? `${st.avg_score}%` : '—'}</td>
                  <td className="p-3.5">
                    <button
                      onClick={() => toggleStudentStatus(st)}
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase transition-all ${
                        st.account_status === 'active'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30'
                          : 'bg-rose-950 text-rose-300 border border-rose-500/30'
                      }`}
                    >
                      {st.account_status}
                    </button>
                  </td>
                  <td className="p-3.5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => fetchStudentDetails(st.id)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
                        title="View Full Profile"
                      >
                        <Eye className="w-3.5 h-3.5 text-brand-400" />
                      </button>

                      <button
                        onClick={() => {
                          setAssignTargetStudent(st);
                          setTargetBatchId(st.batch_id ? String(st.batch_id) : (batches[0]?.id ? String(batches[0].id) : ''));
                          setAssignBatchModalOpen(true);
                        }}
                        className="px-2 py-1 rounded-lg bg-cyan-950/80 hover:bg-cyan-900/80 text-cyan-300 border border-cyan-500/30 text-[11px] font-semibold"
                      >
                        Assign Batch
                      </button>

                      <button
                        onClick={() => {
                          setAssignTargetStudent(st);
                          setTargetCourseId(courses[0]?.id ? String(courses[0].id) : '');
                          setAssignCourseModalOpen(true);
                        }}
                        className="px-2 py-1 rounded-lg bg-brand-950/80 hover:bg-brand-900/80 text-brand-300 border border-brand-500/30 text-[11px] font-semibold"
                      >
                        Enroll Course
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Assign Batch Modal */}
      <Modal
        isOpen={assignBatchModalOpen}
        onClose={() => setAssignBatchModalOpen(false)}
        title="Assign Student to Batch Cohort"
        subtitle={`Assign ${assignTargetStudent?.full_name} (${assignTargetStudent?.student_id})`}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Select Cohort Batch</label>
            <select
              value={targetBatchId}
              onChange={e => setTargetBatchId(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-brand-500 font-mono"
            >
              {batches.map(b => (
                <option key={b.id} value={b.id}>
                  {b.name} ({b.course_title})
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setAssignBatchModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              onClick={handleAssignBatch}
              className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold shadow-sm"
            >
              Confirm Assignment
            </button>
          </div>
        </div>
      </Modal>

      {/* Enroll Course Modal */}
      <Modal
        isOpen={assignCourseModalOpen}
        onClose={() => setAssignCourseModalOpen(false)}
        title="Enroll Student into Course"
        subtitle={`Student: ${assignTargetStudent?.full_name}`}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Select Course</label>
            <select
              value={targetCourseId}
              onChange={e => setTargetCourseId(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-brand-500"
            >
              {courses.map(c => (
                <option key={c.id} value={c.id}>
                  {c.title} ({c.duration})
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setAssignCourseModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              onClick={handleAssignCourse}
              className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold shadow-sm"
            >
              Enroll Student
            </button>
          </div>
        </div>
      </Modal>

      {/* Full Profile Modal */}
      <Modal
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        title="Comprehensive Student Record"
        subtitle={studentDetails?.student?.student_id}
        maxWidth="2xl"
      >
        {studentDetails && (
          <div className="space-y-4 text-xs max-h-[70vh] overflow-y-auto pr-1">
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
              <div className="flex justify-between items-center">
                <h4 className="font-bold text-sm text-white">{studentDetails.student.full_name}</h4>
                <span className="font-mono text-xs font-bold text-brand-300 px-2.5 py-0.5 rounded bg-brand-950 border border-brand-500/30">
                  {studentDetails.student.student_id}
                </span>
              </div>
              <p className="text-slate-300">{studentDetails.student.college_name} • {studentDetails.student.degree} ({studentDetails.student.department})</p>
              <p className="text-slate-400 font-mono">Email: {studentDetails.student.email} • Mobile: {studentDetails.student.mobile}</p>
            </div>

            {/* Attendance & Stats */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-brand-950/40 border border-brand-500/30">
                <span className="text-[10px] text-brand-300 uppercase font-bold block">Attendance</span>
                <span className="font-bold text-white text-sm">
                  {studentDetails.attendance?.percentage}% ({studentDetails.attendance?.present_days}/{studentDetails.attendance?.total_days} Days)
                </span>
              </div>
              <div className="p-3 rounded-xl bg-cyan-950/40 border border-cyan-500/30">
                <span className="text-[10px] text-cyan-300 uppercase font-bold block">Current Batch</span>
                <span className="font-mono font-bold text-white text-sm">
                  {studentDetails.student.batch_name || 'Unassigned'}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-purple-950/40 border border-purple-500/30">
                <span className="text-[10px] text-purple-300 uppercase font-bold block">Enrolled Courses</span>
                <span className="font-bold text-white text-sm">
                  {studentDetails.courses?.length || 0} Courses
                </span>
              </div>
            </div>

            {/* Test attempts */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <h5 className="font-bold text-white uppercase text-[10px] tracking-wider">Test Assessment History</h5>
              <div className="space-y-1.5">
                {studentDetails.test_attempts?.map((att: any) => (
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
