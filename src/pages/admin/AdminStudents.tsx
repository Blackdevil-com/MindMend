import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
  KeyRound,
  Trash2,
  PlusCircle,
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

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createFormData, setCreateFormData] = useState({
    full_name: '',
    email: '',
    mobile: '',
    college_name: '',
    degree: 'B.Tech',
    department: 'Computer Science',
    year_of_study: '3rd Year',
    password: '',
  });
  const [submittingStudent, setSubmittingStudent] = useState(false);

  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (createFormData.password.length < 6) {
      showToast('Password must be at least 6 characters long', undefined, 'error');
      return;
    }

    setSubmittingStudent(true);
    api.post('/auth/register', createFormData)
      .then(() => {
        showToast(`Student ${createFormData.full_name} registered successfully! ✨`, undefined, 'success');
        setCreateModalOpen(false);
        setCreateFormData({
          full_name: '',
          email: '',
          mobile: '',
          college_name: '',
          degree: 'B.Tech',
          department: 'Computer Science',
          year_of_study: '3rd Year',
          password: '',
        });
        loadData(); // Reload students list
      })
      .catch((err: any) => {
        showToast(err.message || 'Registration failed', undefined, 'error');
      })
      .finally(() => setSubmittingStudent(false));
  };

  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [passwordTargetStudent, setPasswordTargetStudent] = useState<Student | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submittingPassword, setSubmittingPassword] = useState(false);

  const openChangePassword = (st: Student) => {
    setPasswordTargetStudent(st);
    setNewPassword('');
    setConfirmPassword('');
    setPasswordModalOpen(true);
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      showToast('Passwords do not match', undefined, 'error');
      return;
    }
    if (newPassword.length < 6) {
      showToast('Password must be at least 6 characters long', undefined, 'error');
      return;
    }

    setSubmittingPassword(true);
    api.post(`/students/${passwordTargetStudent?.id}/change-password`, { password: newPassword })
      .then(() => {
        showToast(`Password changed successfully for ${passwordTargetStudent?.full_name}! ✨`, undefined, 'success');
        setPasswordModalOpen(false);
      })
      .catch((err) => {
        showToast(err.message || 'Failed to change password', undefined, 'error');
      })
      .finally(() => setSubmittingPassword(false));
  };

  const handleDeleteStudent = (st: Student) => {
    if (window.confirm(`Are you absolutely sure you want to permanently delete the account for ${st.full_name} (${st.email})? This action cannot be undone.`)) {
      api.delete(`/students/${st.id}`)
        .then(() => {
          showToast(`Account for ${st.full_name} has been removed successfully.`, undefined, 'info');
          setStudents(prev => prev.filter(s => s.id !== st.id));
        })
        .catch((err) => {
          showToast(err.message || 'Failed to remove account', undefined, 'error');
        });
    }
  };

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
        setStudents([]);
        setBatches([]);
        setCourses([]);
      })
      .finally(() => setLoading(false));
  };

  const fetchStudentDetails = (id: number) => {
    api.get(`/students/${id}`)
      .then(data => {
        setStudentDetails(data);
        setDetailModalOpen(true);
      })
      .catch(err => {
        showToast(err.message || 'Failed to fetch student profile details', undefined, 'error');
      });
  };

  const toggleStudentStatus = (student: Student) => {
    const nextStatus = student.account_status === 'active' ? 'inactive' : 'active';
    api.patch(`/students/${student.id}/status`, { status: nextStatus })
      .then(() => {
        showToast(`Student account status set to ${nextStatus}`, undefined, 'success');
        loadData();
      })
      .catch(err => showToast(err.message || 'Failed to update student status', undefined, 'error'));
  };

  const handleAssignBatch = () => {
    if (!assignTargetStudent || !targetBatchId) return;
    api.post('/students/assign-batch', { student_id: assignTargetStudent.id, batch_id: Number(targetBatchId) })
      .then(() => {
        showToast(`Assigned ${assignTargetStudent.full_name} to batch cohort! ✨`, undefined, 'success');
        setAssignBatchModalOpen(false);
        loadData();
      })
      .catch(err => showToast(err.message || 'Failed to assign student to batch', undefined, 'error'));
  };

  const handleAssignCourse = () => {
    if (!assignTargetStudent || !targetCourseId) return;
    api.post('/students/assign-course', { student_id: assignTargetStudent.id, course_id: Number(targetCourseId) })
      .then(() => {
        showToast(`Enrolled ${assignTargetStudent.full_name} into course! ✨`, undefined, 'success');
        setAssignCourseModalOpen(false);
        loadData();
      })
      .catch(err => showToast(err.message || 'Failed to enroll student', undefined, 'error'));
  };

  const handleExportCSV = () => {
    api.get('/students/export/csv')
      .then(csvText => {
        const blob = new Blob([csvText], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'student_directory.csv';
        a.click();
        showToast('Student Directory exported to CSV 📄', undefined, 'success');
      })
      .catch(err => showToast(err.message || 'Failed to export CSV', undefined, 'error'));
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

        <div className="flex items-center gap-3">
          <button
            onClick={() => setCreateModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-emerald-650 hover:bg-emerald-700 text-white text-xs font-extrabold shadow-md flex items-center gap-1.5 transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Register Student</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="px-4 py-2.5 rounded-xl bg-[#6A1B9A] hover:bg-[#8E24AA] text-white text-xs font-extrabold shadow-glow-purple flex items-center gap-1.5 transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Export Students CSV</span>
          </button>
        </div>
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
                      <button
                        onClick={() => openChangePassword(st)}
                        className="p-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200"
                        title="Change Password"
                      >
                        <KeyRound className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleDeleteStudent(st)}
                        className="p-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200"
                        title="Delete Student Account"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
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
              
              {(studentDetails.student?.linkedin_url || studentDetails.student?.github_url) && (
                <div className="flex gap-2 pt-2 justify-start">
                  {studentDetails.student?.linkedin_url && (
                    <a
                      href={studentDetails.student.linkedin_url.startsWith('http') ? studentDetails.student.linkedin_url : `https://${studentDetails.student.linkedin_url}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1 rounded bg-[#F5EFFB] text-[#6A1B9A] hover:bg-purple-100 flex items-center gap-1 font-bold text-[10px]"
                    >
                      <span>LinkedIn Profile</span>
                    </a>
                  )}
                  {studentDetails.student?.github_url && (
                    <a
                      href={studentDetails.student.github_url.startsWith('http') ? studentDetails.student.github_url : `https://${studentDetails.student.github_url}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1 rounded bg-[#F5EFFB] text-[#6A1B9A] hover:bg-purple-100 flex items-center gap-1 font-bold text-[10px]"
                    >
                      <span>GitHub Link</span>
                    </a>
                  )}
                </div>
              )}
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-purple-50 border border-purple-200">
                <span className="text-[10px] text-[#6A1B9A] uppercase font-bold block">Attendance</span>
                <span className="font-extrabold text-slate-900 text-sm">
                  {studentDetails.attendance?.percentage || 0}% ({studentDetails.attendance?.present_days || 0}/{studentDetails.attendance?.total_days || 0} Days)
                </span>
              </div>
              <div className="p-3 rounded-xl bg-purple-50 border border-purple-200">
                <span className="text-[10px] text-[#6A1B9A] uppercase font-bold block">Batch</span>
                <span className="font-mono font-bold text-slate-900 text-sm">
                  {studentDetails.student?.batch_name || 'Unassigned'}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-purple-50 border border-purple-200">
                <span className="text-[10px] text-[#6A1B9A] uppercase font-bold block">Avg Score</span>
                <span className="font-extrabold text-slate-900 text-sm">
                  {studentDetails.student?.avg_score !== null && studentDetails.student?.avg_score !== undefined ? `${studentDetails.student.avg_score}%` : 'N/A'}
                </span>
              </div>
            </div>

            {studentDetails.test_attempts && studentDetails.test_attempts.length > 0 && (
              <div className="space-y-2 mt-4 text-left">
                <h5 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider text-[10px] text-[#6A1B9A]">Test Attempts & Performance</h5>
                <div className="max-h-40 overflow-y-auto space-y-1.5 border border-purple-100 rounded-xl p-2.5 bg-[#F5EFFB]/40">
                  {studentDetails.test_attempts.map((attempt: any) => (
                    <div key={attempt.id} className="flex justify-between items-center bg-white p-2 rounded-lg border border-purple-50 text-[10px]">
                      <div>
                        <span className="font-bold text-slate-800">{attempt.test_title}</span>
                        <span className="text-slate-400 block text-[9px] font-mono">{attempt.subject}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-extrabold text-slate-700">
                          {attempt.score !== null ? `${attempt.score}/${attempt.total_marks}` : 'Grading...'} 
                          {attempt.percentage !== null ? ` (${attempt.percentage}%)` : ''}
                        </span>
                        {attempt.percentage !== null && (
                          <span className={`block text-[8px] font-bold ${attempt.passed ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {attempt.passed ? 'PASSED' : 'FAILED'}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      <Modal
        isOpen={passwordModalOpen}
        onClose={() => setPasswordModalOpen(false)}
        title="Reset Account Password"
        subtitle={`User: ${passwordTargetStudent?.full_name} (${passwordTargetStudent?.email})`}
      >
        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">New Password</label>
            <input
              type="password"
              required
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              placeholder="At least 6 characters"
              className="w-full px-3.5 py-2.5 bg-[#F5EFFB] border border-purple-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#6A1B9A]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Confirm New Password</label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              className="w-full px-3.5 py-2.5 bg-[#F5EFFB] border border-purple-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#6A1B9A]"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setPasswordModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submittingPassword}
              className="px-5 py-2.5 rounded-xl bg-[#6A1B9A] hover:bg-[#8E24AA] text-white text-xs font-bold shadow-glow-purple"
            >
              {submittingPassword ? 'Saving...' : 'Update Password'}
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Register New Student"
      >
        <form onSubmit={handleCreateStudent} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Full Name *</label>
            <input
              type="text"
              required
              value={createFormData.full_name}
              onChange={e => setCreateFormData({ ...createFormData, full_name: e.target.value })}
              placeholder="e.g. Aakash Patel"
              className="w-full px-3.5 py-2.5 bg-[#F5EFFB] border border-purple-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#6A1B9A]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Email Address *</label>
            <input
              type="email"
              required
              value={createFormData.email}
              onChange={e => setCreateFormData({ ...createFormData, email: e.target.value })}
              placeholder="student@college.edu"
              className="w-full px-3.5 py-2.5 bg-[#F5EFFB] border border-purple-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#6A1B9A]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Mobile Number *</label>
              <input
                type="text"
                required
                value={createFormData.mobile}
                onChange={e => setCreateFormData({ ...createFormData, mobile: e.target.value })}
                placeholder="+91 98765 43210"
                className="w-full px-3.5 py-2.5 bg-[#F5EFFB] border border-purple-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#6A1B9A]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">College Name *</label>
              <input
                type="text"
                required
                value={createFormData.college_name}
                onChange={e => setCreateFormData({ ...createFormData, college_name: e.target.value })}
                placeholder="e.g. National Institute of Tech"
                className="w-full px-3.5 py-2.5 bg-[#F5EFFB] border border-purple-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#6A1B9A]"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Degree *</label>
              <select
                value={createFormData.degree}
                onChange={e => setCreateFormData({ ...createFormData, degree: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-[#F5EFFB] border border-purple-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#6A1B9A]"
              >
                <option value="B.Tech">B.Tech</option>
                <option value="B.E.">B.E.</option>
                <option value="BCA">BCA</option>
                <option value="MCA">MCA</option>
                <option value="B.Sc">B.Sc CS</option>
                <option value="M.Tech">M.Tech</option>
                <option value="MBA">MBA</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Department *</label>
              <input
                type="text"
                required
                value={createFormData.department}
                onChange={e => setCreateFormData({ ...createFormData, department: e.target.value })}
                placeholder="CSE, IT, ECE"
                className="w-full px-3.5 py-2.5 bg-[#F5EFFB] border border-purple-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#6A1B9A]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Year *</label>
              <select
                value={createFormData.year_of_study}
                onChange={e => setCreateFormData({ ...createFormData, year_of_study: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-[#F5EFFB] border border-purple-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#6A1B9A]"
              >
                <option value="1st Year">1st Year</option>
                <option value="2nd Year">2nd Year</option>
                <option value="3rd Year">3rd Year</option>
                <option value="4th Year">4th Year</option>
                <option value="Final Year">Final Year</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Password *</label>
            <input
              type="password"
              required
              value={createFormData.password}
              onChange={e => setCreateFormData({ ...createFormData, password: e.target.value })}
              placeholder="Minimum 6 characters"
              className="w-full px-3.5 py-2.5 bg-[#F5EFFB] border border-purple-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#6A1B9A]"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setCreateModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submittingStudent}
              className="px-5 py-2.5 rounded-xl bg-[#6A1B9A] hover:bg-[#8E24AA] text-white text-xs font-bold shadow-glow-purple"
            >
              {submittingStudent ? 'Registering...' : 'Register Student'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
