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
  Save,
  CheckCircle2,
  Sparkles,
  KeyRound,
  Shield,
} from 'lucide-react';

const LinkedinIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

const GithubIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

export const StudentProfile: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    mobile: '',
    college_name: '',
    bio: '',
    designation: '',
    linkedin_url: '',
    github_url: '',
    password: '',
    confirm_password: '',
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      const p = user.profile || {};
      setFormData({
        full_name: p.full_name || user.full_name || '',
        email: user.email || '',
        phone: p.phone || '',
        mobile: p.mobile || '',
        college_name: p.college_name || '',
        bio: p.bio || '',
        designation: p.designation || '',
        linkedin_url: p.linkedin_url || '',
        github_url: p.github_url || '',
        password: '',
        confirm_password: '',
      });
    }
  }, [user]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password && formData.password !== formData.confirm_password) {
      showToast('Passwords do not match', undefined, 'error');
      return;
    }

    if (formData.password && formData.password.length < 6) {
      showToast('Password must be at least 6 characters long', undefined, 'error');
      return;
    }

    setLoading(true);
    
    // Build update payload
    const payload: any = {
      full_name: formData.full_name,
      email: formData.email,
    };

    if (formData.password) {
      payload.password = formData.password;
    }

    if (user?.role === 'student') {
      payload.mobile = formData.mobile;
      payload.college_name = formData.college_name;
      payload.bio = formData.bio;
      payload.linkedin_url = formData.linkedin_url;
      payload.github_url = formData.github_url;
    } else if (user?.role === 'staff') {
      payload.phone = formData.phone;
      payload.designation = formData.designation;
      payload.bio = formData.bio;
      payload.linkedin_url = formData.linkedin_url;
      payload.github_url = formData.github_url;
    }

    api.put('/auth/profile', payload)
      .then(() => {
        showToast('Profile & credentials updated successfully! ✨', undefined, 'success');
        // Clear password inputs
        setFormData(prev => ({
          ...prev,
          password: '',
          confirm_password: '',
        }));
        if (refreshUser) refreshUser();
      })
      .catch((err: any) => {
        showToast(err.message || 'Failed to update profile settings', undefined, 'error');
      })
      .finally(() => setLoading(false));
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12 select-none px-4">
      <div>
        <h1 className="font-display font-black text-2xl sm:text-3xl text-slate-900 flex items-center gap-3">
          <User className="w-8 h-8 text-[#6A1B9A]" />
          <span>Profile & Security Settings</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-505 font-medium mt-1">
          Manage your account identity, social professional links, and credentials security.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 1 Col: Identity Card */}
        <div className="p-6 rounded-3xl bg-white border border-purple-100 space-y-6 text-center shadow-[0_4px_20px_-2px_rgba(106,27,154,0.04)] h-fit">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-purple-gradient border border-purple-200 flex items-center justify-center text-white font-black text-3xl shadow-glow-purple">
            {formData.full_name?.charAt(0) || 'U'}
          </div>

          <div className="space-y-1">
            <h3 className="font-extrabold text-lg text-slate-900">
              {formData.full_name}
            </h3>
            <div className="font-mono text-xs font-bold text-[#6A1B9A] px-3 py-1 rounded-full bg-[#F5EFFB] border border-purple-200 inline-block">
              {user?.role === 'admin' 
                ? 'System Executive' 
                : user?.student_id || user?.staff_id || 'Account User'}
            </div>
            <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider pt-2">
              Role: <span className="text-[#6A1B9A] font-bold">{user?.role}</span>
            </p>
          </div>

          {user?.role !== 'admin' && (
            <div className="p-4 rounded-2xl bg-[#F5EFFB] border border-purple-100 text-left text-xs space-y-3">
              {user?.role === 'student' ? (
                <>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">College</span>
                    <p className="font-extrabold text-slate-900">{formData.college_name || 'Not specified'}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Specialization</span>
                    <p className="font-extrabold text-slate-900">
                      {user.profile?.degree || 'Degree'} • {user.profile?.department || 'Department'}
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Year of Study</span>
                    <p className="font-extrabold text-slate-900">{user.profile?.year_of_study || 'N/A'}</p>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Designation</span>
                    <p className="font-extrabold text-slate-900">{formData.designation || 'Trainer'}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Test Rights</span>
                    <p className="font-extrabold text-slate-900">{user.profile?.can_create_tests ? 'Full Access' : 'Read-only'}</p>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Social Links Summary */}
          {user?.role !== 'admin' && (formData.linkedin_url || formData.github_url) && (
            <div className="flex justify-center gap-3 pt-2">
              {formData.linkedin_url && (
                <a
                  href={formData.linkedin_url.startsWith('http') ? formData.linkedin_url : `https://${formData.linkedin_url}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-xl bg-purple-50 text-[#6A1B9A] border border-purple-150 hover:bg-purple-100 transition-colors"
                >
                  <LinkedinIcon className="w-4 h-4" />
                </a>
              )}
              {formData.github_url && (
                <a
                  href={formData.github_url.startsWith('http') ? formData.github_url : `https://${formData.github_url}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-xl bg-purple-50 text-[#6A1B9A] border border-purple-150 hover:bg-purple-100 transition-colors"
                >
                  <GithubIcon className="w-4 h-4" />
                </a>
              )}
            </div>
          )}
        </div>

        {/* Right 2 Cols: Form Panel */}
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleUpdate} className="space-y-6 bg-white p-8 rounded-3xl border border-purple-100 shadow-[0_4px_20px_-2px_rgba(106,27,154,0.04)]">
            <div>
              <h3 className="font-display font-black text-lg text-slate-900 border-b border-purple-50 pb-2 flex items-center gap-2">
                <User className="w-5 h-5 text-[#6A1B9A]" />
                <span>Personal Information</span>
              </h3>
            </div>

            <div className="space-y-4">
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

              {/* Dynamically render Student or Staff specific fields */}
              {user?.role === 'student' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">College Name</label>
                    <input
                      type="text"
                      value={formData.college_name}
                      onChange={e => setFormData({ ...formData, college_name: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-[#F5EFFB] border border-purple-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#6A1B9A]"
                    />
                  </div>
                </div>
              )}

              {user?.role === 'staff' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Trainer Phone Number</label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={e => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-[#F5EFFB] border border-purple-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#6A1B9A]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Designation</label>
                    <input
                      type="text"
                      value={formData.designation}
                      onChange={e => setFormData({ ...formData, designation: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-[#F5EFFB] border border-purple-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#6A1B9A]"
                    />
                  </div>
                </div>
              )}

              {/* Bio for Student & Staff */}
              {user?.role !== 'admin' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Professional Bio</label>
                  <textarea
                    rows={3}
                    value={formData.bio}
                    onChange={e => setFormData({ ...formData, bio: e.target.value })}
                    placeholder="Short description of your skills, interests, and profile..."
                    className="w-full px-3.5 py-2.5 bg-[#F5EFFB] border border-purple-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#6A1B9A] resize-none"
                  />
                </div>
              )}

              {/* Social URLs for Student & Staff */}
              {user?.role !== 'admin' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-purple-50">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                      <LinkedinIcon className="w-4 h-4 text-[#0A66C2]" />
                      <span>LinkedIn Profile URL</span>
                    </label>
                    <input
                      type="text"
                      value={formData.linkedin_url}
                      onChange={e => setFormData({ ...formData, linkedin_url: e.target.value })}
                      placeholder="linkedin.com/in/username"
                      className="w-full px-3.5 py-2.5 bg-[#F5EFFB] border border-purple-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#6A1B9A]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                      <GithubIcon className="w-4 h-4 text-slate-800" />
                      <span>GitHub Profile URL</span>
                    </label>
                    <input
                      type="text"
                      value={formData.github_url}
                      onChange={e => setFormData({ ...formData, github_url: e.target.value })}
                      placeholder="github.com/username"
                      className="w-full px-3.5 py-2.5 bg-[#F5EFFB] border border-purple-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#6A1B9A]"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Login Credentials and Password Section */}
            <div className="pt-6 border-t border-purple-100 space-y-4">
              <h3 className="font-display font-black text-lg text-slate-900 pb-2 border-b border-purple-50 flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-[#6A1B9A]" />
                <span>Account Login & Security</span>
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Login Email / Username</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-[#F5EFFB] border border-purple-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#6A1B9A]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">New Password (Optional)</label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={e => setFormData({ ...formData, password: e.target.value })}
                      placeholder="Leave blank to keep current"
                      className="w-full px-3.5 py-2.5 bg-[#F5EFFB] border border-purple-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#6A1B9A]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Confirm New Password</label>
                    <input
                      type="password"
                      value={formData.confirm_password}
                      onChange={e => setFormData({ ...formData, confirm_password: e.target.value })}
                      placeholder="Confirm your new password"
                      className="w-full px-3.5 py-2.5 bg-[#F5EFFB] border border-purple-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#6A1B9A]"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 rounded-xl bg-[#6A1B9A] hover:bg-[#8E24AA] text-white text-xs font-bold shadow-glow-purple flex items-center gap-2 transition-all"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{loading ? 'Saving Settings...' : 'Save Settings & Credentials'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
