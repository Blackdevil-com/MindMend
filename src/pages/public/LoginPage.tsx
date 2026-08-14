import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../../assets/logo.png';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/common/Toast';
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
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'student' | 'staff' | 'admin'>('student');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim() || !password.trim()) {
      showToast('Please enter your valid login credentials', undefined, 'error');
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
            Connected with Firebase Authentication & Cloud Database
          </p>
        </div>

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
                  ? 'Student Email / ID'
                  : activeTab === 'staff'
                  ? 'Staff Email / ID'
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
                <a href="#" className="text-[11px] text-[#6A1B9A] font-bold hover:underline">
                  Forgot Password?
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
              Create Firebase Student Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
