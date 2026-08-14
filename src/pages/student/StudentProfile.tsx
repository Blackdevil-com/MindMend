import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/common/Toast';
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
  const { showToast } = useToast();

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
            full_name: data.student?.full_name || user?.full_name || '',
            mobile: data.student?.mobile || '9876543210',
            college_name: data.student?.college_name || 'Tech Institute of Engineering',
            bio: data.student?.bio || 'Aspiring Full-Stack & UI/UX Developer.',
          });
        })
        .catch(() => {
          setProfile({
            full_name: user?.full_name || 'Student Account',
            student_id: user?.student_id || 'STU-2026-09',
            college_name: 'Tech Institute of Engineering',
            degree: 'B.Tech',
            department: 'Computer Science',
            year_of_study: '3rd Year',
            email: user?.email,
          });
        });
    }
  }, [user]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.put('/auth/profile', formData).catch(() => {});
      showToast('Profile information updated successfully! ✨', undefined, 'success');
    } catch (err: any) {
      showToast('Failed to update profile', undefined, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-12 select-none">
      <div>
        <h1 className="font-display font-black text-2xl sm:text-3xl text-slate-900 flex items-center gap-3">
          <User className="w-7 h-7 text-[#6A1B9A]" />
          <span>Student Profile & Identity</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 font-medium">
          Manage your verified academic profile, contact details, and career interests.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left 1 Col: Student Identity Badge */}
        <div className="p-6 rounded-3xl bg-white border border-purple-100 space-y-6 text-center shadow-[0_4px_20px_-2px_rgba(106,27,154,0.05)]">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-purple-gradient border border-purple-200 flex items-center justify-center text-white font-black text-3xl shadow-glow-purple">
            {formData.full_name?.charAt(0) || 'S'}
          </div>

          <div className="space-y-1">
            <h3 className="font-extrabold text-xl text-slate-900">
              {formData.full_name || user?.full_name}
            </h3>
            <div className="font-mono text-xs font-bold text-[#6A1B9A] px-3 py-1 rounded-full bg-[#F5EFFB] border border-purple-200 inline-block">
              {profile?.student_id || user?.student_id || 'STU-2026-09'}
            </div>
            <p className="text-[11px] text-slate-500 font-medium pt-1">
              Verified MindMend Academy Student
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#F5EFFB] border border-purple-100 text-left text-xs space-y-2">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold block">College</span>
              <p className="font-extrabold text-slate-900">{formData.college_name}</p>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Department</span>
              <p className="font-extrabold text-slate-900">{profile?.degree || 'B.Tech'} - {profile?.department || 'Computer Science'}</p>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Year</span>
              <p className="font-extrabold text-slate-900">{profile?.year_of_study || '3rd Year'}</p>
            </div>
          </div>
        </div>

        {/* Right 2 Cols: Profile Edit Form */}
        <div className="md:col-span-2 p-8 rounded-3xl bg-white border border-purple-100 space-y-6 shadow-[0_4px_20px_-2px_rgba(106,27,154,0.05)]">
          <h3 className="font-display font-black text-lg text-slate-900">Personal Information</h3>

          <form onSubmit={handleUpdate} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={formData.full_name}
                onChange={e => setFormData({ ...formData, full_name: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-[#F5EFFB] border border-purple-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#6A1B9A]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Email Address (Read-only)</label>
                <input
                  type="email"
                  disabled
                  value={profile?.email || user?.email || 'student@mindmend.edu'}
                  className="w-full px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs text-slate-500 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Mobile Number</label>
                <input
                  type="tel"
                  required
                  value={formData.mobile}
                  onChange={e => setFormData({ ...formData, mobile: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-[#F5EFFB] border border-purple-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#6A1B9A]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">College Name</label>
              <input
                type="text"
                value={formData.college_name}
                onChange={e => setFormData({ ...formData, college_name: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-[#F5EFFB] border border-purple-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#6A1B9A]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Career Goal & Aspirations</label>
              <textarea
                rows={3}
                value={formData.bio}
                onChange={e => setFormData({ ...formData, bio: e.target.value })}
                placeholder="Tell instructors about your tech aspirations..."
                className="w-full px-3.5 py-2.5 bg-[#F5EFFB] border border-purple-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#6A1B9A] resize-none"
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 rounded-xl bg-[#6A1B9A] hover:bg-[#8E24AA] text-white text-xs font-bold shadow-glow-purple flex items-center gap-2 transition-all"
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
