import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import logo from '../../assets/logo.png';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/common/Toast';
import { api } from '../../services/api';
import { Modal } from '../../components/common/Modal';
import {
  GraduationCap,
  UserCheck,
  ShieldCheck,
  Lock,
  Mail,
  User,
  ArrowRight,
  Sparkles,
  KeyRound,
  LogIn,
  MonitorSmartphone,
  Clock,
  AlertTriangle,
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const expiredParam = searchParams.get('expired');

  const [activeTab, setActiveTab] = useState<'student' | 'staff' | 'admin'>('student');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const [forgotModalOpen, setForgotModalOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail.trim() || !resetEmail.includes('@')) {
      showToast('Please enter a valid registered email address', undefined, 'error');
      return;
    }

    setResetLoading(true);
    try {
      const response = await api.post('/auth/forgot-password', { email: resetEmail });
      showToast(response.message || 'Password reset email sent! Please check your inbox.', undefined, 'success');
      setForgotModalOpen(false);
      setResetEmail('');
    } catch (err: any) {
      showToast(err.message || 'Failed to request password reset.', undefined, 'error');
    } finally {
      setResetLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim() || !password.trim()) {
      showToast('Please enter your valid login credentials', undefined, 'error');
      return;
    }

    if (!identifier.includes('@')) {
      showToast('Please login using your registered email address (e.g. name@domain.com)', undefined, 'error');
      return;
    }

    setLoading(true);
    try {
      const user = await login(identifier, password);
      showToast(`Welcome back, ${user.full_name || 'User'}! ✨`, undefined, 'success');

      if (user.role === 'admin') {
        navigate('/admin/dashboard');
      } else if (user.role === 'staff') {
        navigate('/staff/dashboard');
      } else {
        navigate('/student/dashboard');
      }
    } catch (err: any) {
      showToast(err.message || 'Login failed. Please verify credentials.', undefined, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 bg-[#F6F5FB] select-none">
      <div className="w-full max-w-md space-y-6">
        {/* Header & Logo */}
        <div className="text-center space-y-3">
          <Link to="/" className="inline-flex items-center justify-center">
            <img src={logo} alt="MindMend Academy Logo" className="h-14 w-auto object-contain" />
          </Link>
          <h2 className="font-display font-black text-2xl text-slate-900">
            Sign In to MindMend Academy
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Connected with Firebase Authentication &amp; Cloud Database
          </p>
        </div>

        {/* Session expiry / device logout banners */}
        {expiredParam === 'device' && (
          <div className="flex items-start gap-3 px-4 py-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800">
            <MonitorSmartphone className="w-5 h-5 mt-0.5 flex-shrink-0 text-amber-500" />
            <div className="text-xs leading-relaxed">
              <p className="font-bold mb-0.5">Signed out — another device signed in</p>
              <p className="text-amber-700">
                Your account was signed in on another device or browser. Sign in below to reactivate
                your session on this device.
              </p>
            </div>
          </div>
        )}

        {expiredParam === '1' && (
          <div className="flex items-start gap-3 px-4 py-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-800">
            <Clock className="w-5 h-5 mt-0.5 flex-shrink-0 text-red-500" />
            <div className="text-xs leading-relaxed">
              <p className="font-bold mb-0.5">Session expired</p>
              <p className="text-red-700">
                Your session has expired. Please sign in again to continue where you left off.
              </p>
            </div>
          </div>
        )}

        {/* Login Card Container */}
        <div className="p-7 rounded-3xl bg-white border border-purple-100 shadow-[0_4px_25px_-3px_rgba(106,27,154,0.08)] space-y-6">
          {/* Role Tabs */}
          <div className="grid grid-cols-3 gap-1 bg-[#F5EFFB] p-1 rounded-2xl border border-purple-100">
            <button
              type="button"
              onClick={() => {
                setActiveTab('student');
                setIdentifier('');
                setPassword('');
              }}
              className={`py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'student'
                  ? 'bg-[#6A1B9A] text-white shadow-glow-purple'
                  : 'text-slate-600 hover:text-[#6A1B9A]'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
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
                  ? 'bg-[#6A1B9A] text-white shadow-glow-purple'
                  : 'text-slate-600 hover:text-[#6A1B9A]'
              }`}
            >
              <UserCheck className="w-4 h-4" />
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
                  ? 'bg-[#6A1B9A] text-white shadow-glow-purple'
                  : 'text-slate-600 hover:text-[#6A1B9A]'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Admin</span>
            </button>
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {activeTab === 'student'
                  ? 'Registered Student Email'
                  : activeTab === 'staff'
                  ? 'Registered Staff Email'
                  : 'Registered Admin Email'}
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
                      ? 'student@mindmend.edu'
                      : activeTab === 'staff'
                      ? 'trainer@mindmend.edu'
                      : 'admin@mindmend.edu'
                  }
                  className="w-full pl-10 pr-4 py-2.5 bg-[#F5EFFB] border border-purple-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#6A1B9A]"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-700">Password</label>
                <button
                  type="button"
                  onClick={() => setForgotModalOpen(true)}
                  className="text-[11px] text-[#6A1B9A] font-bold hover:underline bg-transparent border-none cursor-pointer p-0"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full pl-10 pr-4 py-2.5 bg-[#F5EFFB] border border-purple-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#6A1B9A]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-[#6A1B9A] hover:bg-[#8E24AA] text-white font-extrabold text-xs shadow-glow-purple transition-all flex items-center justify-center gap-2"
            >
              <LogIn className="w-4 h-4" />
              <span>{loading ? 'Authenticating...' : `Sign In as ${activeTab}`}</span>
            </button>
          </form>

          {/* Registration link */}
          <div className="pt-2 text-center text-xs text-slate-500 font-medium border-t border-purple-100">
            Need a Student Account?{' '}
            <Link to="/register" className="font-extrabold text-[#6A1B9A] hover:underline">
              Create Student Account
            </Link>
          </div>
        </div>
      </div>

      <Modal
        isOpen={forgotModalOpen}
        onClose={() => setForgotModalOpen(false)}
        title="Reset Password"
        subtitle="We will send a temporary password to your registered email address."
      >
        <form onSubmit={handleForgotPassword} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Registered Email Address
            </label>
            <input
              type="email"
              required
              value={resetEmail}
              onChange={e => setResetEmail(e.target.value)}
              placeholder="yourname@domain.com"
              className="w-full px-4 py-2.5 bg-[#F5EFFB] border border-purple-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#6A1B9A]"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setForgotModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold hover:bg-slate-200 border border-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={resetLoading}
              className="px-6 py-2.5 rounded-xl bg-[#6A1B9A] hover:bg-[#8E24AA] text-white text-xs font-bold shadow-glow-purple flex items-center justify-center gap-1.5"
            >
              {resetLoading ? 'Sending...' : 'Send Temporary Password'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
