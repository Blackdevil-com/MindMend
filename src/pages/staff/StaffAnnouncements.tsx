import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useNotification } from '../../context/NotificationContext';
import { Announcement } from '../../types/index';
import { Modal } from '../../components/common/Modal';
import {
  Bell,
  PlusCircle,
  Calendar,
  Send,
  Trash2,
  Layers,
} from 'lucide-react';

export const StaffAnnouncements: React.FC = () => {
  const { showToast } = useNotification();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [batches, setBatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    target_type: 'batch',
    target_id: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    Promise.all([api.get('/announcements'), api.get('/batches')])
      .then(([annData, batchData]) => {
        setAnnouncements(annData.announcements || []);
        setBatches(batchData.batches || []);
        if (batchData.batches?.length > 0) {
          setFormData(prev => ({ ...prev, target_id: String(batchData.batches[0].id) }));
        }
      })
      .catch(err => console.error('Failed to load announcements', err))
      .finally(() => setLoading(false));
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.content) {
      showToast('Please provide a title and content', 'warning');
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

      showToast('Announcement posted to batch successfully!', 'success');
      setModalOpen(false);
      setFormData({ title: '', content: '', target_type: 'batch', target_id: batches[0]?.id || '' });
      loadData();
    } catch (err: any) {
      showToast(err.message || 'Failed to post announcement', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-black text-2xl sm:text-3xl text-white">
            Staff Announcement Hub
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Publish notices, session updates, and lab schedules for your assigned cohorts.
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-500 hover:to-brand-600 text-white text-xs font-bold shadow-glow-sm flex items-center gap-1.5 transition-all"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Post Announcement</span>
        </button>
      </div>

      {/* Announcements List */}
      <div className="space-y-4">
        {announcements.map(ann => (
          <div
            key={ann.id}
            className="p-6 rounded-3xl bg-[#0F172A] border border-slate-800 space-y-3 shadow-sm hover:border-brand-500/40 transition-all"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded bg-brand-950 text-brand-300 border border-brand-500/30 uppercase">
                {ann.target_type === 'all' ? 'All Students' : `Batch: ${ann.batch_name || 'Assigned Batch'}`}
              </span>
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-brand-400" />
                {new Date(ann.created_at).toLocaleDateString()}
              </span>
            </div>

            <h3 className="font-display font-bold text-lg text-white">{ann.title}</h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">{ann.content}</p>

            <div className="pt-2 text-[11px] text-slate-500">
              Author: {ann.author_name} ({ann.author_role})
            </div>
          </div>
        ))}
      </div>

      {/* Post Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Post Batch Announcement"
        subtitle="Broadcast notes or reminders to your students"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Target Audience</label>
            <select
              value={formData.target_id}
              onChange={e => setFormData({ ...formData, target_id: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-brand-500 font-mono"
            >
              {batches.map(b => (
                <option key={b.id} value={b.id}>
                  Batch: {b.name} ({b.course_title})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Announcement Title *</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Tomorrow Lab Instructions"
              className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-brand-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Message Content *</label>
            <textarea
              rows={4}
              required
              value={formData.content}
              onChange={e => setFormData({ ...formData, content: e.target.value })}
              placeholder="Type your message for students..."
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
              className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold shadow-glow-sm flex items-center gap-2"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{submitting ? 'Posting...' : 'Publish Announcement'}</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
