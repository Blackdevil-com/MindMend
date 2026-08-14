import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import logo from '../../assets/logo.png';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import {
  GraduationCap,
  UserCheck,
  ShieldCheck,
  Lock,
  Mail,
  User,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const { showToast } = useNotification();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [activeTab, setActiveTab] = useState<'student' | 'staff' | 'admin'>('student');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const fillDemo = (role: 'student' | 'staff' | 'admin') => {
    setActiveTab(role);
    if (role === 'student') {
      setIdentifier('STU20260001');
      setPassword('Student@123');
    } else if (role === 'staff') {
      setIdentifier('STF20260001');
      setPassword('Staff@123');
    } else {
      setIdentifier('admin@mindmend.edu');
      setPassword('Admin@123');
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier || !password) {
      showToast('Please enter your credentials', 'warning');
      return;
    }

    setLoading(true);
    try {
      const user = await login(identifier, password);
      showToast(`Welcome back, ${user.full_name || 'User'}!`, 'success', 'Login Successful');

      if (user.role === 'admin') {
        navigate('/admin/dashboard');
      } else if (user.role === 'staff') {
        navigate('/staff/dashboard');
      } else {
        navigate('/student/dashboard');
      }
    } catch (err: any) {
      showToast(err.message || 'Login failed. Please verify credentials.', 'error', 'Authentication Failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-[#FAFAFF]">
      <div className="w-full max-w-md space-y-6">
        {/* Header & Logo */}
        <div className="text-center space-y-3">
          <Link to="/" className="inline-flex items-center justify-center">
            <img src={logo} alt="MindMend Academy Logo" className="h-14 w-auto object-contain" />
          </Link>
          <h2 className="font-display font-extrabold text-2xl text-slate-900">
            Sign In to Your Workspace
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Access your courses, tests, attendance, and placement tools.
          </p>
        </div>

        {/* Card */}
        <div className="p-7 rounded-3xl bg-white border border-purple-100 shadow-xl space-y-6">
          {/* Role Tabs */}
          <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-2xl border border-slate-200">
            <button
              type="button"
              onClick={() => {
                setActiveTab('student');
                setIdentifier('');
                setPassword('');
              }}
              className={`py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'student'
                  ? 'bg-[#6A1B9A] text-white shadow-md'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Student</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('staff');
                setIdentifier('');
                setPassword('');
              }}
              className={`py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'staff'
                  ? 'bg-[#6A1B9A] text-white shadow-md'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Staff</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('admin');
                setIdentifier('');
                setPassword('');
              }}
              className={`py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'admin'
                  ? 'bg-[#6A1B9A] text-white shadow-md'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Admin</span>
            </button>
          </div>

          {/* Quick Demo Autofill Notice */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-purple-50 border border-purple-100 text-[11px] text-slate-700 font-medium">
            <span className="flex items-center gap-1.5 font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-[#6A1B9A]" />
              Auto-fill demo credentials:
            </span>
            <button
              type="button"
              onClick={() => fillDemo(activeTab)}
              className="px-2.5 py-1 rounded-lg bg-[#6A1B9A] hover:bg-[#52137a] text-white font-bold text-[10px] shadow-sm transition-colors"
            >
              Fill {activeTab}
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {activeTab === 'student'
                  ? 'Student ID or Email'
                  : activeTab === 'staff'
                  ? 'Staff ID (e.g. STF20260001)'
                  : 'Admin Email'}
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={e => setIdentifier(e.target.value)}
                  placeholder={
                    activeTab === 'student'
                      ? 'STU20260001 or email'
                      : activeTab === 'staff'
                      ? 'STF20260001'
                      : 'admin@mindmend.edu'
                  }
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#6A1B9A]"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-700">Password</label>
                <a href="#" className="text-[11px] text-[#6A1B9A] font-semibold hover:underline">
                  Forgot?
                </a>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#6A1B9A]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-[#6A1B9A] hover:bg-[#52137a] text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2"
            >
              <span>{loading ? 'Authenticating...' : `Sign In as ${activeTab}`}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Registration link */}
          <div className="pt-2 text-center text-xs text-slate-500 font-medium border-t border-slate-100">
            Don't have a Student Account?{' '}
            <Link to="/register" className="font-bold text-[#6A1B9A] hover:underline">
              Sign Up Now
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
