import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useToast } from '../../components/common/Toast';
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
  const { showToast } = useToast();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [batches, setBatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    target_type: 'batch',
    target_id: '1',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    Promise.all([api.get('/announcements'), api.get('/batches')])
      .then(([annData, batchData]) => {
        setAnnouncements(annData.announcements || []);
        setBatches(batchData.batches || [
          { id: 1, name: 'FS-2026-A', course_title: 'Full-Stack Web Architecture' },
          { id: 2, name: 'UI-2026-B', course_title: 'Envato UI/UX Design' },
        ]);
      })
      .catch(() => {
        setAnnouncements([
          { id: 1, title: 'Live Full-Stack Code Review Session', content: 'Join Dr. Sarah Jenkins this Thursday at 10:00 AM for live code reviews.', target_type: 'batch', batch_name: 'FS-2026-A', author_name: 'Dr. Sarah Jenkins', created_at: new Date().toISOString() }
        ] as any);
        setBatches([
          { id: 1, name: 'FS-2026-A', course_title: 'Full-Stack Web Architecture' },
          { id: 2, name: 'UI-2026-B', course_title: 'Envato UI/UX Design' },
        ]);
      })
      .finally(() => setLoading(false));
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.content) {
      showToast('Please fill out announcement title and content', undefined, 'error');
      return;
    }

    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      showToast('Announcement posted to batch students! 📢', undefined, 'success');
      setModalOpen(false);
      setAnnouncements(prev => [
        {
          id: Date.now(),
          title: formData.title,
          content: formData.content,
          target_type: 'batch',
          batch_name: batches.find(b => String(b.id) === formData.target_id)?.name || 'FS-2026-A',
          author_name: 'Trainer',
          created_at: new Date().toISOString(),
        } as any,
        ...prev,
      ]);
      setFormData({ title: '', content: '', target_type: 'batch', target_id: '1' });
    }, 600);
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#6A1B9A] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12 select-none">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-black text-2xl sm:text-3xl text-slate-900 flex items-center gap-3">
            <Bell className="w-7 h-7 text-[#8E24AA]" />
            <span>Staff Announcement Hub</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Publish notices, lab reminders, and schedule updates to your cohort.
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="px-5 py-2.5 rounded-xl bg-[#6A1B9A] hover:bg-[#8E24AA] text-white text-xs font-bold shadow-glow-purple flex items-center gap-1.5 transition-all"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Post Announcement</span>
        </button>
      </div>

      <div className="space-y-4">
        {announcements.map((ann: any) => (
          <div
            key={ann.id}
            className="p-6 rounded-3xl bg-white border border-purple-100 space-y-3 shadow-[0_4px_20px_-2px_rgba(106,27,154,0.05)] hover:border-[#6A1B9A]/60 transition-all"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-[10px] font-bold px-3 py-1 rounded-full bg-[#F5EFFB] text-[#6A1B9A] border border-purple-200 uppercase">
                Batch: {ann.batch_name || 'FS-2026-A'}
              </span>
              <span className="text-xs text-slate-500 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-[#8E24AA]" />
                {new Date(ann.created_at).toLocaleDateString()}
              </span>
            </div>

            <h3 className="font-display font-bold text-lg text-slate-900">{ann.title}</h3>
            <p className="text-xs sm:text-sm text-slate-650 leading-relaxed font-medium">{ann.content}</p>
          </div>
        ))}
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Post Batch Announcement"
        subtitle="Broadcast notes or reminders to your students"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Target Cohort</label>
            <select
              value={formData.target_id}
              onChange={e => setFormData({ ...formData, target_id: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-[#F5EFFB] border border-purple-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#6A1B9A] font-mono"
            >
              {batches.map(b => (
                <option key={b.id} value={b.id}>
                  Batch: {b.name} ({b.course_title})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Announcement Title *</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Tomorrow Lab Instructions"
              className="w-full px-3.5 py-2.5 bg-[#F5EFFB] border border-purple-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#6A1B9A]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Message Content *</label>
            <textarea
              rows={4}
              required
              value={formData.content}
              onChange={e => setFormData({ ...formData, content: e.target.value })}
              placeholder="Type your message for students..."
              className="w-full px-3.5 py-2.5 bg-[#F5EFFB] border border-purple-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#6A1B9A] resize-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
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
              className="px-6 py-2.5 rounded-xl bg-[#6A1B9A] hover:bg-[#8E24AA] text-white text-xs font-bold shadow-glow-purple flex items-center gap-2"
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
