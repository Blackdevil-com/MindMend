import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useToast } from '../../components/common/Toast';
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
  const { showToast } = useToast();
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
      .catch(() => {
        setCourses([
          { id: 1, title: 'Envato Masterclass: Web UI & UX Design', category: 'Design', duration: '6 Weeks', description: 'Comprehensive guide to building production UI/UX using Figma and modern frontend design principles.', trainer_name: 'Dr. Sarah Jenkins', enrolled_students_count: 48 },
          { id: 2, title: 'Mastering Git & Vercel Deployment', category: 'DevOps', duration: '4 Weeks', description: 'Master Git version control, GitHub Actions CI/CD pipelines, and serverless hosting on Vercel.', trainer_name: 'Prof. Alex Rivera', enrolled_students_count: 32 },
        ] as any);
      })
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
      trainer_id: '',
      skills_gained: 'Java 17, OOPs, Collections, JDBC',
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.description) {
      showToast('Title and description are required', undefined, 'error');
      return;
    }

    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      showToast(editingCourse ? 'Course updated successfully! ✨' : 'New course added to catalog! ✨', undefined, 'success');
      setModalOpen(false);
      if (!editingCourse) {
        setCourses(prev => [
          {
            id: Date.now(),
            title: formData.title,
            category: formData.category,
            duration: formData.duration,
            description: formData.description,
            trainer_name: 'Staff Trainer',
            enrolled_students_count: 0,
          } as any,
          ...prev,
        ]);
      }
    }, 600);
  };

  const handleDelete = (id: number) => {
    setCourses(prev => prev.filter(c => c.id !== id));
    showToast('Course removed from directory', undefined, 'info');
  };

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
            <BookOpen className="w-7 h-7 text-[#8E24AA]" />
            <span>Course Curriculum Management</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-505 font-medium mt-1">
            Create technical programs, syllabus modules, and lead instructor assignments.
          </p>
        </div>

        <button
          onClick={openCreate}
          className="px-5 py-2.5 rounded-xl bg-[#6A1B9A] hover:bg-[#8E24AA] text-white text-xs font-bold shadow-glow-purple flex items-center gap-1.5 transition-all"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Add New Course</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map(course => (
          <div
            key={course.id}
            className="p-6 rounded-3xl bg-white border border-purple-100 hover:border-[#6A1B9A]/60 transition-all flex flex-col justify-between space-y-5 shadow-[0_4px_20px_-2px_rgba(106,27,154,0.05)]"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold px-3 py-1 rounded-full bg-[#F5EFFB] text-[#6A1B9A] border border-purple-200 uppercase tracking-wider">
                  {course.category}
                </span>
                <span className="text-xs text-slate-500 font-mono">{course.duration}</span>
              </div>

              <h3 className="font-display font-bold text-lg text-slate-900">{course.title}</h3>
              <p className="text-xs text-slate-650 leading-relaxed line-clamp-3 font-medium">{course.description}</p>

              <div className="pt-2 flex items-center gap-2 text-xs text-slate-500 font-semibold">
                <UserCheck className="w-4 h-4 text-[#8E24AA]" />
                <span>Trainer: {course.trainer_name || 'Dr. Sarah Jenkins'}</span>
              </div>
            </div>

            <div className="pt-4 border-t border-purple-100 flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-600 font-mono">
                {course.enrolled_students_count || 24} Enrolled Students
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDelete(course.id)}
                  className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-100 text-rose-600 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Create New Training Program"
        subtitle="Manage program duration, lead instructor, and curriculum skills"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Course Title *</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Full-Stack Java Microservices"
              className="w-full px-3.5 py-2.5 bg-[#F5EFFB] border border-purple-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#6A1B9A]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Description *</label>
            <textarea
              rows={3}
              required
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              placeholder="Brief course overview..."
              className="w-full px-3.5 py-2.5 bg-[#F5EFFB] border border-purple-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#6A1B9A] resize-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold hover:bg-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 rounded-xl bg-[#6A1B9A] hover:bg-[#8E24AA] text-white text-xs font-bold shadow-glow-purple"
            >
              {submitting ? 'Saving...' : 'Save Program'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
