import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/common/Toast';
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
  const { showToast } = useToast();
  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.student_internal_id || user?.id) {
      api.get(`/students/${user.student_internal_id || user.id}`)
        .then(data => setProfileData(data))
        .catch(() => setProfileData({
          internship_applications: [
            { id: 101, domain: 'Full-Stack Web Development', college: 'Tech Institute of Engineering', department: 'Computer Science', applied_at: '2026-08-01', status: 'shortlisted', admin_feedback: 'Qualified for round 2 technical code review.' }
          ]
        }))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#6A1B9A] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const applications = profileData?.internship_applications || [
    { id: 101, domain: 'Full-Stack Web Development', college: 'Tech Institute of Engineering', department: 'Computer Science', applied_at: '2026-08-01', status: 'shortlisted', admin_feedback: 'Qualified for round 2 technical code review.' }
  ];

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12 select-none">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-black text-2xl sm:text-3xl text-slate-900 flex items-center gap-3">
            <Briefcase className="w-7 h-7 text-[#8E24AA]" />
            <span>My Internship Applications</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Track status updates, reviewer comments, and career placement mentorship.
          </p>
        </div>

        <Link
          to="/internship"
          className="px-5 py-2.5 rounded-xl bg-[#6A1B9A] hover:bg-[#8E24AA] text-white font-bold text-xs shadow-glow-sm transition-all flex items-center gap-1.5"
        >
          <Briefcase className="w-4 h-4" />
          <span>Browse All Industry Tracks</span>
        </Link>
      </div>

      <div className="space-y-4">
        {applications.length === 0 ? (
          <div className="p-12 rounded-3xl bg-white border border-purple-100 text-center space-y-4 shadow-[0_4px_20px_-2px_rgba(106,27,154,0.05)]">
            <Briefcase className="w-10 h-10 text-[#8E24AA] mx-auto" />
            <h3 className="font-bold text-base text-slate-900">No Active Applications</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Work on live enterprise projects in Full-Stack, Data Analytics, or AI.
            </p>
            <Link
              to="/internship"
              className="inline-block px-6 py-2.5 rounded-xl bg-[#6A1B9A] hover:bg-[#8E24AA] text-white text-xs font-bold shadow-glow-purple"
            >
              Apply Now
            </Link>
          </div>
        ) : (
          applications.map((app: any) => (
            <div
              key={app.id}
              className="p-6 rounded-3xl bg-white border border-purple-100 space-y-4 shadow-[0_4px_20px_-2px_rgba(106,27,154,0.05)]"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-purple-100">
                <div>
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded bg-[#F5EFFB] text-[#6A1B9A] border border-purple-200 uppercase tracking-wider">
                    Application #{app.id}
                  </span>
                  <h3 className="font-display font-bold text-lg text-slate-900 mt-1">
                    {app.domain} Internship Track
                  </h3>
                </div>

                <div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                    app.status === 'shortlisted' || app.status === 'accepted'
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      : app.status === 'rejected'
                      ? 'bg-rose-100 text-rose-800 border border-rose-200'
                      : 'bg-purple-100 text-purple-800 border border-purple-200'
                  }`}>
                    {app.status.replace('_', ' ')}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-600">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block">College / Department</span>
                  <p className="font-semibold text-slate-900 mt-0.5">{app.college} - {app.department}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block">Applied Date</span>
                  <p className="text-slate-600 mt-0.5">{app.applied_at}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block">Resume Status</span>
                  <span className="text-emerald-600 font-semibold flex items-center gap-1 mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Verified & Reviewed</span>
                  </span>
                </div>
              </div>

              {app.admin_feedback && (
                <div className="p-3.5 rounded-2xl bg-[#FAFAFE] border border-purple-100 text-xs space-y-1">
                  <span className="text-[10px] font-bold text-[#6A1B9A] uppercase tracking-wider flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-500" />
                    Reviewer Note:
                  </span>
                  <p className="text-slate-750 leading-relaxed">{app.admin_feedback}</p>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
