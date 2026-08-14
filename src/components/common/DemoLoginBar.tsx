import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, UserCheck, GraduationCap, LogOut, Sparkles } from 'lucide-react';

export const DemoLoginBar: React.FC = () => {
  const { user, quickDemoLogin, logout } = useAuth();
  const navigate = useNavigate();

  const handleDemo = async (roleKey: 'admin' | 'staff1' | 'staff2' | 'staff3' | 'student1', dest: string) => {
    try {
      await quickDemoLogin(roleKey);
      navigate(dest);
    } catch (err) {
      console.error('Quick login failed:', err);
    }
  };

  return (
    <div className="bg-gradient-to-r from-[#1E1138] via-[#0F172A] to-[#130E26] border-b border-brand-500/20 px-3 py-1.5 text-xs text-slate-300">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 font-medium text-brand-300">
          <Sparkles className="w-3.5 h-3.5 text-brand-400 animate-pulse" />
          <span className="hidden sm:inline">1-Click Demo Evaluation:</span>
          <span className="sm:hidden">Demo:</span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => handleDemo('admin', '/admin/dashboard')}
            className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1 font-medium ${
              user?.role === 'admin'
                ? 'bg-brand-600 text-white shadow-sm'
                : 'bg-brand-950/60 hover:bg-brand-900/60 text-brand-200 border border-brand-500/30'
            }`}
          >
            <ShieldCheck className="w-3 h-3 text-brand-400" />
            <span>Admin</span>
          </button>

          <button
            onClick={() => handleDemo('staff1', '/staff/dashboard')}
            className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1 font-medium ${
              user?.role === 'staff' && user.staff_id === 'STF20260001'
                ? 'bg-brand-600 text-white shadow-sm'
                : 'bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 border border-slate-700'
            }`}
          >
            <UserCheck className="w-3 h-3 text-cyan-400" />
            <span>Staff (Java Lead)</span>
          </button>

          <button
            onClick={() => handleDemo('staff2', '/staff/dashboard')}
            className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1 font-medium hidden md:flex ${
              user?.role === 'staff' && user.staff_id === 'STF20260002'
                ? 'bg-brand-600 text-white shadow-sm'
                : 'bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 border border-slate-700'
            }`}
          >
            <UserCheck className="w-3 h-3 text-amber-400" />
            <span>Staff (Power BI)</span>
          </button>

          <button
            onClick={() => handleDemo('student1', '/student/dashboard')}
            className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1 font-medium ${
              user?.role === 'student'
                ? 'bg-brand-600 text-white shadow-sm'
                : 'bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-200 border border-emerald-500/30'
            }`}
          >
            <GraduationCap className="w-3 h-3 text-emerald-400" />
            <span>Student (STU20260001)</span>
          </button>

          {user && (
            <button
              onClick={() => {
                logout();
                navigate('/login');
              }}
              className="px-2 py-1 rounded-md bg-rose-950/50 hover:bg-rose-900/50 text-rose-300 border border-rose-800/40 transition-all flex items-center gap-1 ml-1"
              title="Logout"
            >
              <LogOut className="w-3 h-3" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
