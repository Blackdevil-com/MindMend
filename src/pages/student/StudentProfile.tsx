import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import {
  User,
  Mail,
  Phone,
  Building,
  GraduationCap,
  Calendar,
  Save,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

export const StudentProfile: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const { showToast } = useNotification();

  const [formData, setFormData] = useState({
    full_name: '',
    mobile: '',
    college_name: '',
    bio: '',
  });

  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    if (user?.student_internal_id || user?.id) {
      api.get(`/students/${user.student_internal_id || user.id}`)
        .then(data => {
          setProfile(data.student);
          setFormData({
            full_name: data.student?.full_name || '',
            mobile: data.student?.mobile || '',
            college_name: data.student?.college_name || '',
            bio: data.student?.bio || '',
          });
        })
        .catch(err => console.error('Failed to load profile', err));
    }
  }, [user]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.put('/auth/profile', formData);
      await refreshUser();
      showToast('Profile information updated successfully!', 'success', 'Profile Saved');
    } catch (err: any) {
      showToast(err.message || 'Failed to update profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-12">
      <div>
        <h1 className="font-display font-black text-2xl sm:text-3xl text-white">
          Student Profile & Identity
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Manage your verified academic profile, contact details, and student portfolio.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left 1 Col: Student Identity Badge */}
        <div className="p-6 rounded-3xl bg-[#0F172A] border border-slate-800 space-y-6 text-center shadow-xl">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-br from-brand-600 to-brand-900 border border-brand-500/40 flex items-center justify-center text-white font-black text-3xl shadow-glow-sm">
            {profile?.full_name?.charAt(0) || 'S'}
          </div>

          <div className="space-y-1">
            <h3 className="font-display font-bold text-xl text-white">
              {profile?.full_name || user?.full_name}
            </h3>
            <div className="font-mono text-xs font-bold text-brand-300 px-3 py-1 rounded-full bg-brand-950/80 border border-brand-500/40 inline-block">
              {profile?.student_id || user?.student_id}
            </div>
            <p className="text-[11px] text-slate-400 pt-1">
              Verified MindMend Student
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 text-left text-xs space-y-2">
            <div>
              <span className="text-[10px] text-slate-500 uppercase block">College</span>
              <p className="font-semibold text-slate-200">{profile?.college_name}</p>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase block">Department</span>
              <p className="font-semibold text-slate-200">{profile?.degree} - {profile?.department}</p>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase block">Year</span>
              <p className="font-semibold text-slate-200">{profile?.year_of_study}</p>
            </div>
          </div>
        </div>

        {/* Right 2 Cols: Profile Edit Form */}
        <div className="md:col-span-2 p-8 rounded-3xl bg-[#0F172A] border border-slate-800 space-y-6 shadow-xl">
          <h3 className="font-display font-bold text-lg text-white">Personal Information</h3>

          <form onSubmit={handleUpdate} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={formData.full_name}
                onChange={e => setFormData({ ...formData, full_name: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-brand-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address (Read-only)</label>
                <input
                  type="email"
                  disabled
                  value={profile?.email || user?.email || ''}
                  className="w-full px-3.5 py-2.5 bg-slate-900/40 border border-slate-800 rounded-xl text-xs text-slate-500 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Mobile Number</label>
                <input
                  type="tel"
                  required
                  value={formData.mobile}
                  onChange={e => setFormData({ ...formData, mobile: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-brand-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">College Name</label>
              <input
                type="text"
                value={formData.college_name}
                onChange={e => setFormData({ ...formData, college_name: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Short Bio & Career Interests</label>
              <textarea
                rows={3}
                value={formData.bio}
                onChange={e => setFormData({ ...formData, bio: e.target.value })}
                placeholder="Tell instructors about your tech aspirations (e.g. Aspiring Full-Stack Java Developer)..."
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 resize-none"
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold shadow-glow-sm flex items-center gap-2 transition-all"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{loading ? 'Saving...' : 'Save Profile Changes'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
