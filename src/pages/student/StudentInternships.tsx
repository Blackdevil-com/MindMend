import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  Briefcase,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Sparkles,
  FileText,
} from 'lucide-react';

export const StudentInternships: React.FC = () => {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.student_internal_id || user?.id) {
      api.get(`/students/${user.student_internal_id || user.id}`)
        .then(data => setProfileData(data))
        .catch(err => console.error('Failed to load profile', err))
        .finally(() => setLoading(false));
    }
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const applications = profileData?.internship_applications || [];

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-black text-2xl sm:text-3xl text-white">
            My Internship Applications
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Track status updates, reviewer comments, and submit new domain applications.
          </p>
        </div>

        <Link
          to="/internship"
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-500 hover:to-brand-600 text-white font-bold text-xs shadow-glow-sm transition-all flex items-center gap-1.5"
        >
          <Briefcase className="w-4 h-4" />
          <span>Browse All Internship Tracks</span>
        </Link>
      </div>

      {/* Applications list */}
      <div className="space-y-4">
        {applications.length === 0 ? (
          <div className="p-12 rounded-3xl bg-[#0F172A] border border-slate-800 text-center space-y-4">
            <Briefcase className="w-10 h-10 text-slate-500 mx-auto" />
            <h3 className="font-bold text-base text-white">No Active Internship Applications</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Launch your career with our 3-month live project internship program in Java, Power BI, AI, or Web Development.
            </p>
            <Link
              to="/internship"
              className="inline-block px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold"
            >
              Apply Now
            </Link>
          </div>
        ) : (
          applications.map((app: any) => (
            <div
              key={app.id}
              className="p-6 rounded-3xl bg-[#0F172A] border border-slate-800 space-y-4 shadow-sm"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                <div>
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded bg-brand-950 text-brand-300 border border-brand-500/30">
                    Application #{app.id}
                  </span>
                  <h3 className="font-display font-bold text-lg text-white mt-1">
                    {app.domain} Internship Track
                  </h3>
                </div>

                <div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                    app.status === 'shortlisted' || app.status === 'accepted'
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                      : app.status === 'under_review'
                      ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/40'
                      : app.status === 'rejected'
                      ? 'bg-rose-950 text-rose-300 border border-rose-500/40'
                      : 'bg-brand-950 text-brand-300 border border-brand-500/40'
                  }`}>
                    {app.status.replace('_', ' ')}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-300">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block">College / Department</span>
                  <p className="font-semibold text-white mt-0.5">{app.college} - {app.department}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block">Applied On</span>
                  <p className="text-slate-300 mt-0.5">{new Date(app.applied_at).toLocaleDateString()}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block">Resume</span>
                  {app.resume_url ? (
                    <a
                      href={app.resume_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-brand-400 font-semibold hover:underline flex items-center gap-1 mt-0.5"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>View Attached File</span>
                    </a>
                  ) : (
                    <span className="text-slate-500">Not Uploaded</span>
                  )}
                </div>
              </div>

              {/* Admin Feedback Box */}
              {app.admin_feedback && (
                <div className="p-3.5 rounded-2xl bg-brand-950/40 border border-brand-500/30 text-xs space-y-1">
                  <span className="text-[10px] font-bold text-brand-300 uppercase tracking-wider flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    Reviewer Feedback:
                  </span>
                  <p className="text-slate-200 leading-relaxed">{app.admin_feedback}</p>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
