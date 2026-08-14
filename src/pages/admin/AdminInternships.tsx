import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useNotification } from '../../context/NotificationContext';
import { InternshipApplication } from '../../types/index';
import { Modal } from '../../components/common/Modal';
import {
  Briefcase,
  Search,
  Filter,
  Download,
  FileText,
  CheckCircle2,
  XCircle,
  Clock,
  Send,
  Eye,
} from 'lucide-react';

export const AdminInternships: React.FC = () => {
  const { showToast } = useNotification();
  const [applications, setApplications] = useState<InternshipApplication[]>([]);
  const [search, setSearch] = useState('');
  const [selectedDomain, setSelectedDomain] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [loading, setLoading] = useState(true);

  // Status review modal
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedApp, setSelectedApp] = useState<InternshipApplication | null>(null);
  const [newStatus, setNewStatus] = useState<'applied' | 'under_review' | 'shortlisted' | 'accepted' | 'rejected'>('under_review');
  const [feedback, setFeedback] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    api.get('/internships/admin/applications')
      .then(data => setApplications(data.applications || []))
      .catch(err => console.error('Failed to load internship applications', err))
      .finally(() => setLoading(false));
  };

  const openReview = (app: InternshipApplication) => {
    setSelectedApp(app);
    setNewStatus(app.status as any);
    setFeedback(app.admin_feedback || '');
    setReviewModalOpen(true);
  };

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApp) return;

    setSubmitting(true);
    try {
      await api.patch(`/internships/admin/applications/${selectedApp.id}/status`, {
        status: newStatus,
        admin_feedback: feedback,
      });

      showToast(`Application status updated to ${newStatus}`, 'success');
      setReviewModalOpen(false);
      loadData();
    } catch (err: any) {
      showToast(err.message || 'Failed to update application', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleExportCSV = async () => {
    try {
      const csvText = await api.get('/internships/admin/export/csv');
      const blob = new Blob([csvText], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'internship_applications.csv';
      a.click();
      showToast('Internship applications exported to CSV', 'success');
    } catch (err) {
      showToast('Export failed', 'error');
    }
  };

  const filteredApps = applications.filter(app => {
    const matchSearch =
      app.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      app.email?.toLowerCase().includes(search.toLowerCase()) ||
      app.college?.toLowerCase().includes(search.toLowerCase()) ||
      app.domain?.toLowerCase().includes(search.toLowerCase());
    const matchDomain = !selectedDomain || app.domain === selectedDomain;
    const matchStatus = !selectedStatus || app.status === selectedStatus;
    return matchSearch && matchDomain && matchStatus;
  });

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
            Corporate Internship Applications
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Review candidate resumes, shortlisted talents, update status workflows, and send decision feedback.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-700"
        >
          <Download className="w-4 h-4 text-brand-400" />
          <span>Export Applications CSV</span>
        </button>
      </div>

      {/* Filters Bar */}
      <div className="p-4 rounded-2xl bg-[#0F172A] border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search candidate, email, college..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <select
            value={selectedDomain}
            onChange={e => setSelectedDomain(e.target.value)}
            className="px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-brand-500"
          >
            <option value="">All Domains</option>
            <option value="Java Full-Stack Development">Java Full-Stack</option>
            <option value="Power BI & Data Analytics">Power BI & Analytics</option>
            <option value="AI & Machine Learning">AI & ML</option>
            <option value="Web Technologies (React & Node)">Web Tech</option>
          </select>

          <select
            value={selectedStatus}
            onChange={e => setSelectedStatus(e.target.value)}
            className="px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-brand-500"
          >
            <option value="">All Statuses</option>
            <option value="applied">Applied</option>
            <option value="under_review">Under Review</option>
            <option value="shortlisted">Shortlisted</option>
            <option value="accepted">Accepted</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Applications Table */}
      <div className="p-6 rounded-3xl bg-[#0F172A] border border-slate-800 space-y-4 shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/80 text-slate-400 uppercase font-semibold border-b border-slate-800">
              <tr>
                <th className="p-3.5">Candidate</th>
                <th className="p-3.5">Domain Track</th>
                <th className="p-3.5">College & Dept</th>
                <th className="p-3.5">Resume</th>
                <th className="p-3.5">Applied Date</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Review</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredApps.map(app => (
                <tr key={app.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="p-3.5">
                    <p className="font-semibold text-white">{app.full_name}</p>
                    <p className="text-[11px] text-slate-400">{app.email} • {app.mobile}</p>
                  </td>
                  <td className="p-3.5 font-bold text-brand-300">{app.domain}</td>
                  <td className="p-3.5 text-slate-300">{app.college} ({app.department}, Yr {app.year_of_study})</td>
                  <td className="p-3.5">
                    {app.resume_url ? (
                      <a
                        href={app.resume_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-cyan-400 font-semibold hover:underline inline-flex items-center gap-1"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>PDF File</span>
                      </a>
                    ) : (
                      <span className="text-slate-500">Not Uploaded</span>
                    )}
                  </td>
                  <td className="p-3.5 text-slate-400">{new Date(app.applied_at).toLocaleDateString()}</td>
                  <td className="p-3.5">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      app.status === 'shortlisted' || app.status === 'accepted'
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30'
                        : app.status === 'under_review'
                        ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/30'
                        : app.status === 'rejected'
                        ? 'bg-rose-950 text-rose-300 border border-rose-500/30'
                        : 'bg-brand-950 text-brand-300 border border-brand-500/30'
                    }`}>
                      {app.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="p-3.5 text-right">
                    <button
                      onClick={() => openReview(app)}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs inline-flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5 text-brand-400" />
                      <span>Review</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Review & Status Update Modal */}
      <Modal
        isOpen={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        title="Review Internship Application"
        subtitle={`${selectedApp?.full_name} - ${selectedApp?.domain}`}
      >
        {selectedApp && (
          <form onSubmit={handleUpdateStatus} className="space-y-4">
            <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 text-xs space-y-1">
              <p className="text-slate-300"><strong>College:</strong> {selectedApp.college} ({selectedApp.department})</p>
              <p className="text-slate-300"><strong>Contact:</strong> {selectedApp.email} • {selectedApp.mobile}</p>
              {selectedApp.resume_url && (
                <a
                  href={selectedApp.resume_url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-cyan-400 font-semibold hover:underline inline-flex items-center gap-1 pt-1"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Open Attached Resume PDF in New Tab</span>
                </a>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Decision Status</label>
              <select
                value={newStatus}
                onChange={e => setNewStatus(e.target.value as any)}
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-brand-500"
              >
                <option value="applied">Applied</option>
                <option value="under_review">Under Review</option>
                <option value="shortlisted">Shortlisted</option>
                <option value="accepted">Accepted for Internship</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Reviewer Feedback to Candidate</label>
              <textarea
                rows={3}
                value={feedback}
                onChange={e => setFeedback(e.target.value)}
                placeholder="e.g. Great resume! Shortlisted for round 2 technical discussion..."
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 resize-none"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setReviewModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold shadow-glow-sm"
              >
                {submitting ? 'Saving...' : 'Update Application'}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};
