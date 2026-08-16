import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useToast } from '../../components/common/Toast';
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
  const { showToast } = useToast();
  const [applications, setApplications] = useState<InternshipApplication[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedApp, setSelectedApp] = useState<InternshipApplication | null>(null);
  const [newStatus, setNewStatus] = useState<any>('shortlisted');
  const [feedback, setFeedback] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    api.get('/internships/applications')
      .then(data => setApplications(data.applications || []))
      .catch(err => {
        showToast(err.message || 'Failed to load internship applications', undefined, 'error');
        setApplications([]);
      })
      .finally(() => setLoading(false));
  };

  const openReview = (app: InternshipApplication) => {
    setSelectedApp(app);
    setNewStatus(app.status);
    setFeedback(app.admin_feedback || '');
    setReviewModalOpen(true);
  };

  const handleUpdateStatus = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApp) return;

    setSubmitting(true);
    api.patch(`/internships/applications/${selectedApp.id}/status`, {
      status: newStatus,
      admin_feedback: feedback
    })
      .then(() => {
        showToast(`Application status updated to ${newStatus}! ✨`, undefined, 'success');
        setReviewModalOpen(false);
        setApplications(prev => prev.map(a => a.id === selectedApp.id ? { ...a, status: newStatus, admin_feedback: feedback } : a));
      })
      .catch(err => {
        showToast(err.message || 'Failed to update application status', undefined, 'error');
      })
      .finally(() => {
        setSubmitting(false);
      });
  };

  const handleExportCSV = () => {
    api.get('/internships/export/csv')
      .then(csvText => {
        const blob = new Blob([csvText], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `internship_applications_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showToast('Internship Applications exported to CSV 📄', undefined, 'success');
      })
      .catch(err => {
        showToast(err.message || 'Failed to export CSV', undefined, 'error');
      });
  };

  const filteredApps = applications.filter(app =>
    app.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    app.email?.toLowerCase().includes(search.toLowerCase()) ||
    app.domain?.toLowerCase().includes(search.toLowerCase())
  );

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
            <Briefcase className="w-7 h-7 text-[#8E24AA]" />
            <span>Corporate Internship Applications</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-505 font-medium mt-1">
            Review candidate applications, shortlisted talents, and reviewer notes.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="px-4 py-2.5 rounded-xl bg-[#6A1B9A] hover:bg-[#8E24AA] text-white text-xs font-bold shadow-glow-purple flex items-center gap-1.5 transition-all"
        >
          <Download className="w-4 h-4" />
          <span>Export Applications CSV</span>
        </button>
      </div>

      <div className="p-4 rounded-3xl bg-white border border-purple-100 flex items-center justify-between shadow-sm">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search candidate, domain..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-[#F5EFFB] border border-purple-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#6A1B9A]"
          />
        </div>
      </div>

      <div className="p-6 rounded-3xl bg-white border border-purple-100 space-y-4 shadow-[0_4px_20px_-2px_rgba(106,27,154,0.05)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F5EFFB] text-[#6A1B9A] uppercase font-bold border-b border-purple-100">
              <tr>
                <th className="p-3.5">Candidate</th>
                <th className="p-3.5">Domain Track</th>
                <th className="p-3.5">College</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Review</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-purple-50">
              {filteredApps.map(app => (
                <tr key={app.id} className="hover:bg-purple-50/50 transition-colors">
                  <td className="p-3.5">
                    <p className="font-semibold text-slate-800">{app.full_name}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">{app.email}</p>
                  </td>
                  <td className="p-3.5 font-bold text-[#6A1B9A]">{app.domain}</td>
                  <td className="p-3.5 text-slate-650">{app.college}</td>
                  <td className="p-3.5">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-emerald-100 text-emerald-850 border border-emerald-200">
                      {app.status}
                    </span>
                  </td>
                  <td className="p-3.5 text-right">
                    <button
                      onClick={() => openReview(app)}
                      className="px-3 py-1.5 rounded-xl bg-[#6A1B9A] hover:bg-[#8E24AA] text-white text-xs font-semibold shadow-glow-sm inline-flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Review</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        isOpen={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        title="Review Internship Application"
        subtitle={`${selectedApp?.full_name} - ${selectedApp?.domain}`}
      >
        {selectedApp && (
          <form onSubmit={handleUpdateStatus} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Decision Status</label>
              <select
                value={newStatus}
                onChange={e => setNewStatus(e.target.value as any)}
                className="w-full px-3.5 py-2.5 bg-[#F5EFFB] border border-purple-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#6A1B9A]"
              >
                <option value="under_review">Under Review</option>
                <option value="shortlisted">Shortlisted</option>
                <option value="accepted">Accepted for Internship</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Reviewer Feedback Note</label>
              <textarea
                rows={3}
                value={feedback}
                onChange={e => setFeedback(e.target.value)}
                placeholder="Candidate feedback..."
                className="w-full px-3.5 py-2.5 bg-[#F5EFFB] border border-purple-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#6A1B9A] resize-none"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setReviewModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-105 text-slate-700 text-xs font-semibold hover:bg-slate-200 border border-slate-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2.5 rounded-xl bg-[#6A1B9A] hover:bg-[#8E24AA] text-white text-xs font-bold shadow-glow-purple"
              >
                {submitting ? 'Updating...' : 'Save Decision'}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};
