import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useNotification } from '../../context/NotificationContext';
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
  const { showToast } = useNotification();
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
      .catch(err => console.error('Failed to load staff list', err))
      .finally(() => setLoading(false));
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.full_name || !formData.email || !formData.phone || !formData.designation) {
      showToast('Please complete all required fields', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post('/staff', formData);
      showToast(`Staff account created! Generated ID: ${res.staff.staff_id}`, 'success', 'Staff Created');
      setCreateModalOpen(false);
      setFormData({
        full_name: '',
        email: '',
        phone: '',
        designation: '',
        password: 'Staff@123',
        can_create_tests: true,
      });
      loadStaff();
    } catch (err: any) {
      showToast(err.message || 'Failed to create staff', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStaff) return;

    setSubmitting(true);
    try {
      await api.put(`/staff/${editingStaff.id}`, {
        full_name: editingStaff.full_name,
        phone: editingStaff.phone,
        designation: editingStaff.designation,
        can_create_tests: editingStaff.can_create_tests,
      });
      showToast('Staff member updated successfully', 'success');
      setEditModalOpen(false);
      loadStaff();
    } catch (err: any) {
      showToast(err.message || 'Failed to update staff', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleStatus = async (st: Staff) => {
    const newStatus = st.account_status === 'active' ? 'inactive' : 'active';
    try {
      await api.put(`/staff/${st.id}`, { status: newStatus });
      showToast(`Staff member status changed to ${newStatus}`, 'success');
      loadStaff();
    } catch (err: any) {
      showToast(err.message || 'Failed to update status', 'error');
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
            Staff & Trainer Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Create instructor accounts with auto-generated Staff IDs, assign permissions, and track active cohorts.
          </p>
        </div>

        <button
          onClick={() => setCreateModalOpen(true)}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-500 hover:to-brand-600 text-white text-xs font-bold shadow-glow-sm flex items-center gap-1.5 transition-all"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Add New Staff / Trainer</span>
        </button>
      </div>

      {/* Staff Table */}
      <div className="p-6 rounded-3xl bg-[#0F172A] border border-slate-800 space-y-4 shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/80 text-slate-400 uppercase font-semibold border-b border-slate-800">
              <tr>
                <th className="p-3.5">Staff ID</th>
                <th className="p-3.5">Trainer Name</th>
                <th className="p-3.5">Designation</th>
                <th className="p-3.5">Assigned Batches</th>
                <th className="p-3.5">Test Permission</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {staffList.map(st => (
                <tr key={st.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="p-3.5 font-mono font-bold text-cyan-300">{st.staff_id}</td>
                  <td className="p-3.5">
                    <p className="font-semibold text-white">{st.full_name}</p>
                    <p className="text-[11px] text-slate-400 font-mono">{st.email} • {st.phone}</p>
                  </td>
                  <td className="p-3.5 font-medium text-slate-200">{st.designation}</td>
                  <td className="p-3.5">
                    <div className="flex flex-wrap gap-1">
                      {st.batches?.map(b => (
                        <span key={b.id} className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 font-mono text-[10px] text-brand-300">
                          {b.name}
                        </span>
                      )) || <span className="text-slate-500">None</span>}
                    </div>
                  </td>
                  <td className="p-3.5">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      st.can_create_tests ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30' : 'bg-slate-900 text-slate-400'
                    }`}>
                      {st.can_create_tests ? 'Allowed' : 'Disabled'}
                    </span>
                  </td>
                  <td className="p-3.5">
                    <button
                      onClick={() => toggleStatus(st)}
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
                    <button
                      onClick={() => {
                        setEditingStaff(st);
                        setEditModalOpen(true);
                      }}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
                      title="Edit Staff Info"
                    >
                      <Edit2 className="w-3.5 h-3.5 text-brand-400" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Staff Modal */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Create Staff Trainer Account"
        subtitle="Auto-generates STF2026XXXX ID and issues instructor login"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name *</label>
            <input
              type="text"
              required
              value={formData.full_name}
              onChange={e => setFormData({ ...formData, full_name: e.target.value })}
              placeholder="e.g. Rahul Sharma"
              className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-brand-500"
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
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Phone Number *</label>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+91 98765 43210"
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Designation *</label>
              <input
                type="text"
                required
                value={formData.designation}
                onChange={e => setFormData({ ...formData, designation: e.target.value })}
                placeholder="Lead Java Architect"
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Initial Password</label>
              <input
                type="text"
                required
                value={formData.password}
                onChange={e => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-brand-500 font-mono"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="can_create"
              checked={formData.can_create_tests}
              onChange={e => setFormData({ ...formData, can_create_tests: e.target.checked })}
              className="rounded bg-slate-900 border-slate-700 text-brand-600 focus:ring-brand-500"
            />
            <label htmlFor="can_create" className="text-xs text-slate-300 select-none cursor-pointer">
              Allow trainer to create online assessments & question banks
            </label>
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
              {submitting ? 'Generating Staff...' : 'Create Staff & Generate ID'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Staff Modal */}
      <Modal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title="Edit Staff Member"
        subtitle={editingStaff?.staff_id}
      >
        {editingStaff && (
          <form onSubmit={handleUpdate} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={editingStaff.full_name}
                onChange={e => setEditingStaff({ ...editingStaff, full_name: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-brand-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Phone</label>
                <input
                  type="text"
                  value={editingStaff.phone}
                  onChange={e => setEditingStaff({ ...editingStaff, phone: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Designation</label>
                <input
                  type="text"
                  value={editingStaff.designation}
                  onChange={e => setEditingStaff({ ...editingStaff, designation: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-brand-500"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="edit_can_create"
                checked={Boolean(editingStaff.can_create_tests)}
                onChange={e => setEditingStaff({ ...editingStaff, can_create_tests: e.target.checked })}
                className="rounded bg-slate-900 border-slate-700 text-brand-600 focus:ring-brand-500"
              />
              <label htmlFor="edit_can_create" className="text-xs text-slate-300 select-none cursor-pointer">
                Can create and conduct online tests
              </label>
            </div>

            <div className="flex justify-end gap-3 pt-3">
              <button
                type="button"
                onClick={() => setEditModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold shadow-sm"
              >
                Save Changes
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};
