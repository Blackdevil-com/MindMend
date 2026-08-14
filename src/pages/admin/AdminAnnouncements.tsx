import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useNotification } from '../../context/NotificationContext';
import { Announcement, Batch, Course } from '../../types/index';
import { Modal } from '../../components/common/Modal';
import {
  Bell,
  PlusCircle,
  Calendar,
  Send,
  Trash2,
  Users,
  Layers,
  BookOpen,
} from 'lucide-react';

export const AdminAnnouncements: React.FC = () => {
  const { showToast } = useNotification();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    target_type: 'all',
    target_id: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    Promise.all([
      api.get('/announcements'),
      api.get('/batches'),
      api.get('/courses'),
    ])
      .then(([annData, batchData, courseData]) => {
        setAnnouncements(annData.announcements || []);
        setBatches(batchData.batches || []);
        setCourses(courseData.courses || []);
      })
      .catch(err => console.error('Failed to load announcements', err))
      .finally(() => setLoading(false));
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.content) {
      showToast('Title and content are required', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/announcements', {
        title: formData.title,
        content: formData.content,
        target_type: formData.target_type,
        target_id: formData.target_id ? Number(formData.target_id) : null,
      });

      showToast('Announcement broadcasted successfully!', 'success');
      setModalOpen(false);
      setFormData({ title: '', content: '', target_type: 'all', target_id: '' });
      loadData();
    } catch (err: any) {
      showToast(err.message || 'Failed to post announcement', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this announcement?')) return;
    try {
      await api.delete(`/announcements/${id}`);
      showToast('Announcement removed', 'info');
      loadData();
    } catch (err) {
      showToast('Failed to delete', 'error');
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
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-black text-2xl sm:text-3xl text-white">
            Institutional Broadcasts & Announcements
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Publish global alerts or targeted notices to specific cohorts or course programs.
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-500 hover:to-brand-600 text-white text-xs font-bold shadow-glow-sm flex items-center gap-1.5 transition-all"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Broadcast</span>
        </button>
      </div>

      {/* Announcements List */}
      <div className="space-y-4">
        {announcements.map(ann => (
          <div
            key={ann.id}
            className="p-6 rounded-3xl bg-[#0F172A] border border-slate-800 space-y-3 shadow-sm hover:border-brand-500/40 transition-all flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded bg-brand-950 text-brand-300 border border-brand-500/30 uppercase">
                  {ann.target_type === 'all'
                    ? 'Global Announcement'
                    : ann.target_type === 'batch'
                    ? `Batch: ${ann.batch_name || 'Selected'}`
                    : `Course: ${ann.course_title || 'Selected'}`}
                </span>
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-brand-400" />
                  {new Date(ann.created_at).toLocaleDateString()}
                </span>
              </div>

              <h3 className="font-display font-bold text-lg text-white">{ann.title}</h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">{ann.content}</p>
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
              <span>Author: {ann.author_name} ({ann.author_role})</span>
              <button
                onClick={() => handleDelete(ann.id)}
                className="text-rose-400 hover:underline flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Broadcast Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Broadcast New Announcement"
        subtitle="Publish notes to student dashboards and notifications"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Target Audience</label>
              <select
                value={formData.target_type}
                onChange={e => setFormData({ ...formData, target_type: e.target.value, target_id: '' })}
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-brand-500"
              >
                <option value="all">All Registered Students</option>
                <option value="batch">Specific Batch Cohort</option>
                <option value="course">Specific Course Program</option>
              </select>
            </div>

            {formData.target_type === 'batch' && (
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Select Batch</label>
                <select
                  value={formData.target_id}
                  onChange={e => setFormData({ ...formData, target_id: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-brand-500 font-mono"
                >
                  <option value="">Choose Batch...</option>
                  {batches.map(b => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({b.course_title})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {formData.target_type === 'course' && (
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Select Course</label>
                <select
                  value={formData.target_id}
                  onChange={e => setFormData({ ...formData, target_id: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-brand-500"
                >
                  <option value="">Choose Course...</option>
                  {courses.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Title *</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Placement Drive Schedule Announcement"
              className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-brand-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Broadcast Message *</label>
            <textarea
              rows={4}
              required
              value={formData.content}
              onChange={e => setFormData({ ...formData, content: e.target.value })}
              placeholder="Enter announcement details..."
              className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-brand-500 resize-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
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
              {submitting ? 'Publishing...' : 'Broadcast Announcement'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
