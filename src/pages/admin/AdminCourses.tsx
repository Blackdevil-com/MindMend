import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useNotification } from '../../context/NotificationContext';
import { Course, Staff } from '../../types/index';
import { Modal } from '../../components/common/Modal';
import {
  BookOpen,
  PlusCircle,
  Clock,
  UserCheck,
  Edit2,
  Trash2,
  CheckCircle2,
  Plus,
  Layers,
} from 'lucide-react';

export const AdminCourses: React.FC = () => {
  const { showToast } = useNotification();
  const [courses, setCourses] = useState<Course[]>([]);
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    category: 'Software Development',
    description: '',
    duration: '8 Weeks (60 Hours)',
    trainer_id: '',
    skills_gained: 'Java 17, OOPs, Collections, JDBC',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    Promise.all([api.get('/courses'), api.get('/staff')])
      .then(([courseData, staffData]) => {
        setCourses(courseData.courses || []);
        setStaffList(staffData.staff || []);
      })
      .catch(err => console.error('Failed to load courses', err))
      .finally(() => setLoading(false));
  };

  const openCreate = () => {
    setEditingCourse(null);
    setFormData({
      title: '',
      slug: '',
      category: 'Software Development',
      description: '',
      duration: '8 Weeks (60 Hours)',
      trainer_id: staffList[0]?.id ? String(staffList[0].id) : '',
      skills_gained: 'Java 17, OOPs, Collections, JDBC',
    });
    setModalOpen(true);
  };

  const openEdit = (c: Course) => {
    setEditingCourse(c);
    setFormData({
      title: c.title,
      slug: c.slug,
      category: c.category,
      description: c.description,
      duration: c.duration,
      trainer_id: c.trainer_id ? String(c.trainer_id) : '',
      skills_gained: Array.isArray(c.skills_gained) ? c.skills_gained.join(', ') : '',
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.description) {
      showToast('Title and description are required', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      const skillsArray = formData.skills_gained.split(',').map(s => s.trim()).filter(Boolean);

      if (editingCourse) {
        await api.put(`/courses/${editingCourse.id}`, {
          ...formData,
          trainer_id: formData.trainer_id ? Number(formData.trainer_id) : null,
          skills_gained: skillsArray,
        });
        showToast('Course updated successfully', 'success');
      } else {
        await api.post('/courses', {
          ...formData,
          trainer_id: formData.trainer_id ? Number(formData.trainer_id) : null,
          skills_gained: skillsArray,
        });
        showToast('New course created successfully', 'success');
      }
      setModalOpen(false);
      loadData();
    } catch (err: any) {
      showToast(err.message || 'Failed to save course', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this course?')) return;
    try {
      await api.delete(`/courses/${id}`);
      showToast('Course deleted', 'info');
      loadData();
    } catch (err: any) {
      showToast(err.message || 'Failed to delete course', 'error');
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-black text-2xl sm:text-3xl text-white">
            Course Curriculum Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Create and edit technical programs, syllabus modules, and lead instructors.
          </p>
        </div>

        <button
          onClick={openCreate}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-500 hover:to-brand-600 text-white text-xs font-bold shadow-glow-sm flex items-center gap-1.5 transition-all"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Add New Course</span>
        </button>
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map(course => (
          <div
            key={course.id}
            className="p-6 rounded-3xl bg-[#0F172A] border border-slate-800 hover:border-brand-500/40 transition-all flex flex-col justify-between space-y-5"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded bg-brand-950 text-brand-300 border border-brand-500/30">
                  {course.category}
                </span>
                <span className="text-xs text-slate-400 font-mono">{course.duration}</span>
              </div>

              <h3 className="font-display font-bold text-xl text-white">{course.title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed line-clamp-3">{course.description}</p>

              <div className="pt-2 flex items-center gap-2 text-xs text-slate-300">
                <UserCheck className="w-4 h-4 text-brand-400" />
                <span>Trainer: {course.trainer_name || 'Unassigned'}</span>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
              <span className="text-xs font-bold text-cyan-400 font-mono">
                {course.enrolled_students_count || 0} Students
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => openEdit(course)}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(course.id)}
                  className="p-2 rounded-xl bg-rose-950/40 hover:bg-rose-900/40 text-rose-400 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Form */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingCourse ? 'Edit Course Program' : 'Create New Training Program'}
        subtitle="Manage program duration, lead instructor, and curriculum skills"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Course Title *</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Full-Stack Java Development"
              className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-brand-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Category</label>
              <input
                type="text"
                value={formData.category}
                onChange={e => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Duration</label>
              <input
                type="text"
                value={formData.duration}
                onChange={e => setFormData({ ...formData, duration: e.target.value })}
                placeholder="8 Weeks (60 Hours)"
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Lead Trainer</label>
            <select
              value={formData.trainer_id}
              onChange={e => setFormData({ ...formData, trainer_id: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-brand-500"
            >
              <option value="">Select Trainer</option>
              {staffList.map(s => (
                <option key={s.id} value={s.id}>
                  {s.full_name} ({s.designation})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Description *</label>
            <textarea
              rows={3}
              required
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              placeholder="Brief course overview..."
              className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-brand-500 resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Skills Gained (Comma separated)</label>
            <input
              type="text"
              value={formData.skills_gained}
              onChange={e => setFormData({ ...formData, skills_gained: e.target.value })}
              placeholder="Java, OOPs, Spring, MySQL, Git"
              className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-brand-500"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold shadow-glow-sm"
            >
              {submitting ? 'Saving...' : 'Save Program'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
