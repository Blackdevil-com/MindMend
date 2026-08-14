import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useNotification } from '../../context/NotificationContext';
import { Batch, Course, Staff, Student } from '../../types/index';
import { Modal } from '../../components/common/Modal';
import {
  Layers,
  PlusCircle,
  Users,
  Clock,
  Calendar,
  Trash2,
  Edit2,
  UserPlus,
  X,
  BookOpen,
} from 'lucide-react';

export const AdminBatches: React.FC = () => {
  const { showToast } = useNotification();
  const [batches, setBatches] = useState<Batch[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [allStudents, setAllStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [manageStudentsModalOpen, setManageStudentsModalOpen] = useState(false);
  const [selectedBatchData, setSelectedBatchData] = useState<any>(null);
  const [selectedStudentToAdd, setSelectedStudentToAdd] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    course_id: '',
    trainer_id: '',
    start_date: new Date().toISOString().split('T')[0],
    end_date: '2026-10-30',
    timing: 'Mon-Fri, 09:00 AM - 11:00 AM',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    Promise.all([
      api.get('/batches'),
      api.get('/courses'),
      api.get('/staff'),
      api.get('/students'),
    ])
      .then(([batchData, courseData, staffData, studentData]) => {
        setBatches(batchData.batches || []);
        setCourses(courseData.courses || []);
        setStaffList(staffData.staff || []);
        setAllStudents(studentData.students || []);
        if (courseData.courses?.length > 0) {
          setFormData(prev => ({
            ...prev,
            course_id: String(courseData.courses[0].id),
            trainer_id: staffData.staff?.length > 0 ? String(staffData.staff[0].id) : '',
          }));
        }
      })
      .catch(err => console.error('Failed to load batches data', err))
      .finally(() => setLoading(false));
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.course_id || !formData.timing) {
      showToast('Please fill out all required fields', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/batches', {
        ...formData,
        course_id: Number(formData.course_id),
        trainer_id: formData.trainer_id ? Number(formData.trainer_id) : null,
      });
      showToast(`Batch ${formData.name} created successfully!`, 'success');
      setCreateModalOpen(false);
      setFormData({
        name: '',
        course_id: courses[0]?.id ? String(courses[0].id) : '',
        trainer_id: staffList[0]?.id ? String(staffList[0].id) : '',
        start_date: new Date().toISOString().split('T')[0],
        end_date: '2026-10-30',
        timing: 'Mon-Fri, 09:00 AM - 11:00 AM',
      });
      loadData();
    } catch (err: any) {
      showToast(err.message || 'Failed to create batch', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const openManageStudents = async (batchId: number) => {
    try {
      const data = await api.get(`/batches/${batchId}`);
      setSelectedBatchData(data);
      setManageStudentsModalOpen(true);
    } catch (err) {
      showToast('Could not load batch details', 'error');
    }
  };

  const handleAddStudentToBatch = async () => {
    if (!selectedStudentToAdd || !selectedBatchData) return;
    try {
      await api.post(`/batches/${selectedBatchData.batch.id}/students`, {
        student_ids: [Number(selectedStudentToAdd)],
      });
      showToast('Student added to batch successfully', 'success');
      const data = await api.get(`/batches/${selectedBatchData.batch.id}`);
      setSelectedBatchData(data);
      setSelectedStudentToAdd('');
      loadData();
    } catch (err: any) {
      showToast(err.message || 'Failed to add student', 'error');
    }
  };

  const handleRemoveStudent = async (studentId: number) => {
    if (!selectedBatchData) return;
    try {
      await api.delete(`/batches/${selectedBatchData.batch.id}/students/${studentId}`);
      showToast('Student removed from batch', 'info');
      const data = await api.get(`/batches/${selectedBatchData.batch.id}`);
      setSelectedBatchData(data);
      loadData();
    } catch (err: any) {
      showToast(err.message || 'Failed to remove student', 'error');
    }
  };

  const handleDeleteBatch = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this batch?')) return;
    try {
      await api.delete(`/batches/${id}`);
      showToast('Batch deleted', 'info');
      loadData();
    } catch (err: any) {
      showToast(err.message || 'Failed to delete batch', 'error');
    }
  };

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
            Training Batch Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Create cohort batches (e.g. JAVA-2026-A), assign staff instructors, and manage student rosters.
          </p>
        </div>

        <button
          onClick={() => setCreateModalOpen(true)}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-500 hover:to-brand-600 text-white text-xs font-bold shadow-glow-sm flex items-center gap-1.5 transition-all"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Create New Batch</span>
        </button>
      </div>

      {/* Batches Table */}
      <div className="p-6 rounded-3xl bg-[#0F172A] border border-slate-800 space-y-4 shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/80 text-slate-400 uppercase font-semibold border-b border-slate-800">
              <tr>
                <th className="p-3.5">Batch Name</th>
                <th className="p-3.5">Course</th>
                <th className="p-3.5">Trainer</th>
                <th className="p-3.5">Schedule Timing</th>
                <th className="p-3.5">Enrolled</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {batches.map(b => (
                <tr key={b.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="p-3.5 font-mono font-bold text-cyan-300 text-sm">{b.name}</td>
                  <td className="p-3.5 font-semibold text-white">{b.course_title}</td>
                  <td className="p-3.5 text-slate-300">{b.trainer_name || 'Unassigned'}</td>
                  <td className="p-3.5 text-slate-400">{b.timing}</td>
                  <td className="p-3.5 font-bold text-brand-300 font-mono">{b.student_count || 0} Students</td>
                  <td className="p-3.5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openManageStudents(b.id)}
                        className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold inline-flex items-center gap-1"
                      >
                        <Users className="w-3.5 h-3.5 text-brand-400" />
                        <span>Manage Students</span>
                      </button>
                      <button
                        onClick={() => handleDeleteBatch(b.id)}
                        className="p-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900/40 text-rose-400"
                        title="Delete Batch"
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

      {/* Create Batch Modal */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Create Training Batch"
        subtitle="e.g. JAVA-2026-A, POWERBI-2026-B, APTITUDE-2026-A"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Batch Code Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value.toUpperCase() })}
              placeholder="e.g. JAVA-2026-B"
              className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-brand-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Course *</label>
              <select
                value={formData.course_id}
                onChange={e => setFormData({ ...formData, course_id: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-brand-500"
              >
                {courses.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Assigned Trainer</label>
              <select
                value={formData.trainer_id}
                onChange={e => setFormData({ ...formData, trainer_id: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-brand-500"
              >
                <option value="">Select Trainer</option>
                {staffList.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.full_name} ({s.staff_id})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Session Schedule / Timing *</label>
            <input
              type="text"
              required
              value={formData.timing}
              onChange={e => setFormData({ ...formData, timing: e.target.value })}
              placeholder="Mon-Fri, 09:00 AM - 11:00 AM"
              className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-brand-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Start Date</label>
              <input
                type="date"
                required
                value={formData.start_date}
                onChange={e => setFormData({ ...formData, start_date: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">End Date</label>
              <input
                type="date"
                required
                value={formData.end_date}
                onChange={e => setFormData({ ...formData, end_date: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={() => setCreateModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold shadow-glow-sm"
            >
              {submitting ? 'Creating...' : 'Create Batch'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Manage Students in Batch Modal */}
      <Modal
        isOpen={manageStudentsModalOpen}
        onClose={() => setManageStudentsModalOpen(false)}
        title={`Manage Batch: ${selectedBatchData?.batch?.name}`}
        subtitle={`${selectedBatchData?.batch?.course_title} (${selectedBatchData?.students?.length || 0} Students Enrolled)`}
        maxWidth="xl"
      >
        {selectedBatchData && (
          <div className="space-y-5 text-xs">
            {/* Add student picker */}
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
              <label className="block text-xs font-bold text-slate-300">Enroll Student into Batch</label>
              <div className="flex gap-2">
                <select
                  value={selectedStudentToAdd}
                  onChange={e => setSelectedStudentToAdd(e.target.value)}
                  className="flex-1 px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-brand-500"
                >
                  <option value="">Select a student...</option>
                  {allStudents
                    .filter(s => !selectedBatchData.students.some((bs: any) => bs.id === s.id))
                    .map(s => (
                      <option key={s.id} value={s.id}>
                        {s.full_name} ({s.student_id}) - {s.college_name}
                      </option>
                    ))}
                </select>
                <button
                  type="button"
                  onClick={handleAddStudentToBatch}
                  className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold rounded-xl flex items-center gap-1"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Add</span>
                </button>
              </div>
            </div>

            {/* Current Enrolled Roster */}
            <div className="space-y-2">
              <h5 className="font-bold text-slate-300 uppercase text-[10px] tracking-wider">
                Currently Enrolled Students
              </h5>
              <div className="max-h-60 overflow-y-auto divide-y divide-slate-800 rounded-xl border border-slate-800 bg-slate-900/40">
                {selectedBatchData.students?.length === 0 ? (
                  <p className="p-4 text-center text-slate-500">No students currently in this batch.</p>
                ) : (
                  selectedBatchData.students?.map((st: any) => (
                    <div key={st.id} className="p-3 flex items-center justify-between hover:bg-slate-800/40">
                      <div>
                        <span className="font-semibold text-white">{st.full_name}</span>
                        <span className="text-[11px] text-brand-300 font-mono block">
                          {st.student_id} • {st.college_name}
                        </span>
                      </div>
                      <button
                        onClick={() => handleRemoveStudent(st.id)}
                        className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-950/60 transition-colors"
                        title="Remove from batch"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
