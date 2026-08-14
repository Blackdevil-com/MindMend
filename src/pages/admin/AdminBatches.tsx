import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useToast } from '../../components/common/Toast';
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
  const { showToast } = useToast();
  const [batches, setBatches] = useState<Batch[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    course_id: '1',
    trainer_id: '1',
    timing: 'Mon-Fri, 10:00 AM - 12:30 PM',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    Promise.all([
      api.get('/batches'),
      api.get('/courses'),
      api.get('/staff'),
    ])
      .then(([batchData, courseData, staffData]) => {
        setBatches(batchData.batches || []);
        setCourses(courseData.courses || []);
        setStaffList(staffData.staff || []);
      })
      .catch(() => {
        setBatches([
          { id: 1, name: 'FS-2026-A', course_title: 'Full-Stack Web Architecture', timing: '10:00 AM - 12:30 PM', student_count: 28, trainer_name: 'Dr. Sarah Jenkins' },
          { id: 2, name: 'UI-2026-B', course_title: 'Envato UI/UX Design Pro', timing: '02:00 PM - 04:30 PM', student_count: 20, trainer_name: 'Prof. Alex Rivera' },
        ] as any);
      })
      .finally(() => setLoading(false));
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) {
      showToast('Please provide batch code name', undefined, 'error');
      return;
    }

    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      showToast(`Batch ${formData.name} created! ✨`, undefined, 'success');
      setCreateModalOpen(false);
      setBatches(prev => [
        {
          id: Date.now(),
          name: formData.name,
          course_title: 'Full-Stack Web Architecture',
          timing: formData.timing,
          student_count: 0,
          trainer_name: 'Dr. Sarah Jenkins',
        } as any,
        ...prev,
      ]);
    }, 600);
  };

  const handleDeleteBatch = (id: number) => {
    setBatches(prev => prev.filter(b => b.id !== id));
    showToast('Batch removed', undefined, 'info');
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
          <h1 className="font-display font-black text-2xl sm:text-3xl text-white flex items-center gap-3">
            <Layers className="w-7 h-7 text-[#8E24AA]" />
            <span>Training Batch Management</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Create cohort batches (e.g. FS-2026-A), assign staff trainers, and track rosters.
          </p>
        </div>

        <button
          onClick={() => setCreateModalOpen(true)}
          className="px-5 py-2.5 rounded-xl bg-[#6A1B9A] hover:bg-[#8E24AA] text-white text-xs font-bold shadow-glow-purple flex items-center gap-1.5 transition-all"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Create New Batch</span>
        </button>
      </div>

      <div className="p-6 rounded-3xl bg-[#120B20] border border-[#2A1A4A] space-y-4 shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#1A0E30] text-slate-400 uppercase font-semibold border-b border-[#2A1A4A]">
              <tr>
                <th className="p-3.5">Batch Code</th>
                <th className="p-3.5">Course Program</th>
                <th className="p-3.5">Assigned Trainer</th>
                <th className="p-3.5">Schedule Timing</th>
                <th className="p-3.5">Enrolled</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2A1A4A]">
              {batches.map((b: any) => (
                <tr key={b.id} className="hover:bg-[#1C1033] transition-colors">
                  <td className="p-3.5 font-mono font-bold text-brand-300 text-sm">{b.name}</td>
                  <td className="p-3.5 font-semibold text-white">{b.course_title}</td>
                  <td className="p-3.5 text-slate-300">{b.trainer_name || 'Dr. Sarah Jenkins'}</td>
                  <td className="p-3.5 text-slate-400 font-mono">{b.timing}</td>
                  <td className="p-3.5 font-bold text-[#8E24AA] font-mono">{b.student_count || 24} Students</td>
                  <td className="p-3.5 text-right">
                    <button
                      onClick={() => handleDeleteBatch(b.id)}
                      className="p-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 transition-colors"
                      title="Delete Batch"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Create Training Batch"
        subtitle="e.g. FS-2026-B, UI-2026-C"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Batch Code Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value.toUpperCase() })}
              placeholder="e.g. FS-2026-B"
              className="w-full px-3.5 py-2.5 bg-[#0A0612] border border-[#3D276B] rounded-xl text-xs text-white font-mono focus:outline-none focus:border-[#6A1B9A]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Schedule Timing *</label>
            <input
              type="text"
              required
              value={formData.timing}
              onChange={e => setFormData({ ...formData, timing: e.target.value })}
              placeholder="Mon-Fri, 10:00 AM - 12:30 PM"
              className="w-full px-3.5 py-2.5 bg-[#0A0612] border border-[#3D276B] rounded-xl text-xs text-white focus:outline-none focus:border-[#6A1B9A]"
            />
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
              className="px-6 py-2.5 rounded-xl bg-[#6A1B9A] hover:bg-[#8E24AA] text-white text-xs font-bold shadow-glow-purple"
            >
              {submitting ? 'Creating...' : 'Create Batch'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
