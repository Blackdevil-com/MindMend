import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useToast } from '../../components/common/Toast';
import { Staff } from '../../types/index';
import { Modal } from '../../components/common/Modal';
import {
  UserCheck,
  PlusCircle,
  Phone,
  Mail,
  Shield,
  Layers,
  BookOpen,
  Edit2,
  CheckCircle2,
  XCircle,
} from 'lucide-react';

export const AdminStaff: React.FC = () => {
  const { showToast } = useToast();
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    designation: '',
    password: 'Staff@123',
    can_create_tests: true,
  });

  useEffect(() => {
    loadStaff();
  }, []);

  const loadStaff = () => {
    api.get('/staff')
      .then(data => setStaffList(data.staff || []))
      .catch(() => {
        setStaffList([
          { id: 1, staff_id: 'STF-2026-01', full_name: 'Dr. Sarah Jenkins', email: 'sarah@mindmend.edu', phone: '+91 98765 43210', designation: 'Lead Full-Stack Trainer', can_create_tests: true, account_status: 'active' },
          { id: 2, staff_id: 'STF-2026-02', full_name: 'Prof. Alex Rivera', email: 'alex.r@mindmend.edu', phone: '+91 98765 43211', designation: 'UI/UX Design Specialist', can_create_tests: true, account_status: 'active' },
        ] as any);
      })
      .finally(() => setLoading(false));
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.full_name || !formData.email) {
      showToast('Please provide full name and email', undefined, 'error');
      return;
    }

    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      showToast(`New staff member ${formData.full_name} created! ✨`, undefined, 'success');
      setCreateModalOpen(false);
      setStaffList(prev => [
        {
          id: Date.now(),
          staff_id: `STF-2026-${Math.floor(Math.random() * 90 + 10)}`,
          full_name: formData.full_name,
          email: formData.email,
          phone: formData.phone || '+91 98765 00000',
          designation: formData.designation || 'Trainer',
          can_create_tests: formData.can_create_tests,
          account_status: 'active',
        } as any,
        ...prev,
      ]);
    }, 600);
  };

  const toggleStatus = (st: Staff) => {
    const newStatus = st.account_status === 'active' ? 'inactive' : 'active';
    setStaffList(prev => prev.map(s => s.id === st.id ? { ...s, account_status: newStatus } : s));
    showToast(`Staff status updated to ${newStatus}`, undefined, 'success');
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
            <UserCheck className="w-7 h-7 text-[#8E24AA]" />
            <span>Staff & Trainer Management</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Create instructor accounts, issue Staff IDs, and assign test creation rights.
          </p>
        </div>

        <button
          onClick={() => setCreateModalOpen(true)}
          className="px-5 py-2.5 rounded-xl bg-[#6A1B9A] hover:bg-[#8E24AA] text-white text-xs font-bold shadow-glow-purple flex items-center gap-1.5 transition-all"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Add New Trainer</span>
        </button>
      </div>

      <div className="p-6 rounded-3xl bg-[#120B20] border border-[#2A1A4A] space-y-4 shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#1A0E30] text-slate-400 uppercase font-semibold border-b border-[#2A1A4A]">
              <tr>
                <th className="p-3.5">Staff ID</th>
                <th className="p-3.5">Trainer Name</th>
                <th className="p-3.5">Designation</th>
                <th className="p-3.5">Test Rights</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2A1A4A]">
              {staffList.map(st => (
                <tr key={st.id} className="hover:bg-[#1C1033] transition-colors">
                  <td className="p-3.5 font-mono font-bold text-brand-300">{st.staff_id}</td>
                  <td className="p-3.5">
                    <p className="font-semibold text-white">{st.full_name}</p>
                    <p className="text-[11px] text-slate-400 font-mono">{st.email}</p>
                  </td>
                  <td className="p-3.5 font-medium text-slate-200">{st.designation}</td>
                  <td className="p-3.5">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      Allowed
                    </span>
                  </td>
                  <td className="p-3.5">
                    <button
                      onClick={() => toggleStatus(st)}
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase transition-all ${
                        st.account_status === 'active'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      }`}
                    >
                      {st.account_status}
                    </button>
                  </td>
                  <td className="p-3.5 text-right">
                    <button
                      onClick={() => {
                        setEditingStaff(st);
                        setEditModalOpen(true);
                      }}
                      className="p-1.5 rounded-xl bg-[#6A1B9A] hover:bg-[#8E24AA] text-white shadow-glow-sm"
                      title="Edit Staff Info"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
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
        title="Create Staff Trainer Account"
        subtitle="Auto-generates Staff ID and issues instructor login"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name *</label>
            <input
              type="text"
              required
              value={formData.full_name}
              onChange={e => setFormData({ ...formData, full_name: e.target.value })}
              placeholder="e.g. Dr. Sarah Jenkins"
              className="w-full px-3.5 py-2.5 bg-[#0A0612] border border-[#3D276B] rounded-xl text-xs text-white focus:outline-none focus:border-[#6A1B9A]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address *</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                placeholder="trainer@mindmend.edu"
                className="w-full px-3.5 py-2.5 bg-[#0A0612] border border-[#3D276B] rounded-xl text-xs text-white focus:outline-none focus:border-[#6A1B9A]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Designation *</label>
              <input
                type="text"
                required
                value={formData.designation}
                onChange={e => setFormData({ ...formData, designation: e.target.value })}
                placeholder="Lead Trainer"
                className="w-full px-3.5 py-2.5 bg-[#0A0612] border border-[#3D276B] rounded-xl text-xs text-white focus:outline-none focus:border-[#6A1B9A]"
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
              className="px-6 py-2.5 rounded-xl bg-[#6A1B9A] hover:bg-[#8E24AA] text-white text-xs font-bold shadow-glow-purple"
            >
              {submitting ? 'Creating...' : 'Create Account'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
