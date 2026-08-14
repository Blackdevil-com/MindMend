import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import logo from '../../assets/logo.png';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  UserCheck,
  BookOpen,
  Layers,
  FileCheck2,
  Award,
  CalendarCheck,
  Briefcase,
  Bell,
  MessageSquare,
  FileSpreadsheet,
  Settings,
  LogOut,
  ChevronRight,
  TrendingUp,
  User,
  GraduationCap,
} from 'lucide-react';

interface SidebarProps {
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onCloseMobile }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Build links based on role
  const getNavLinks = () => {
    if (!user) return [];

    if (user.role === 'admin') {
      return [
        { label: 'Overview', path: '/admin/dashboard', icon: LayoutDashboard },
        { label: 'Students', path: '/admin/students', icon: GraduationCap },
        { label: 'Staff / Trainers', path: '/admin/staff', icon: UserCheck },
        { label: 'Courses', path: '/admin/courses', icon: BookOpen },
        { label: 'Batches', path: '/admin/batches', icon: Layers },
        { label: 'Online Tests', path: '/admin/tests', icon: FileCheck2 },
        { label: 'Results & Analytics', path: '/admin/results', icon: Award },
        { label: 'Internships', path: '/admin/internships', icon: Briefcase },
        { label: 'Attendance Reports', path: '/admin/attendance', icon: CalendarCheck },
        { label: 'Announcements', path: '/admin/announcements', icon: Bell },
        { label: 'CMS & Inquiries', path: '/admin/cms', icon: MessageSquare },
        { label: 'Export Reports', path: '/admin/reports', icon: FileSpreadsheet },
      ];
    }

    if (user.role === 'staff') {
      return [
        { label: 'Dashboard', path: '/staff/dashboard', icon: LayoutDashboard },
        { label: 'My Batches & Students', path: '/staff/batches', icon: Layers },
        { label: 'Assigned Courses', path: '/courses', icon: BookOpen },
        { label: 'Tests & Question Bank', path: '/staff/tests', icon: FileCheck2 },
        { label: 'Mark Attendance', path: '/staff/attendance', icon: CalendarCheck },
        { label: 'Student Results', path: '/staff/results', icon: Award },
        { label: 'Post Announcements', path: '/staff/announcements', icon: Bell },
      ];
    }

    // Student navigation
    return [
      { label: 'Dashboard', path: '/student/dashboard', icon: LayoutDashboard },
      { label: 'My Courses', path: '/student/courses', icon: BookOpen },
      { label: 'Online Tests', path: '/student/tests', icon: FileCheck2 },
      { label: 'Test Results', path: '/student/results', icon: Award },
      { label: 'Performance Analytics', path: '/student/performance', icon: TrendingUp },
      { label: 'My Attendance', path: '/student/attendance', icon: CalendarCheck },
      { label: 'Internship Portal', path: '/student/internship', icon: Briefcase },
      { label: 'Announcements', path: '/student/announcements', icon: Bell },
      { label: 'My Profile', path: '/student/profile', icon: User },
    ];
  };

  const navLinks = getNavLinks();

  return (
    <aside className="w-64 bg-[#0B101D] border-r border-slate-800 flex flex-col h-full overflow-y-auto select-none">
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-800 flex flex-col items-start gap-2">
        <Link to="/" className="inline-block p-2 rounded-xl bg-white/95 backdrop-blur-md shadow-sm border border-purple-100">
          <img src={logo} alt="MindMend Academy" className="h-9 w-auto object-contain" />
        </Link>
        <span className="text-[10px] text-brand-400 font-bold uppercase tracking-wider pl-1">
          {user?.role === 'admin' ? 'Administration' : user?.role === 'staff' ? 'Trainer Portal' : 'Student Portal'}
        </span>
      </div>

      {/* User Badge Info */}
      <div className="p-4 mx-3 my-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-brand-600 to-brand-900 flex items-center justify-center text-white font-bold text-sm shadow-sm flex-shrink-0">
          {user?.full_name?.charAt(0) || 'U'}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold text-white truncate">{user?.full_name || user?.email}</p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            <span className="text-[11px] text-slate-400 font-mono">
              {user?.student_id || user?.staff_id || 'Admin Superuser'}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-3 space-y-1 py-2">
        <div className="px-3 py-1 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
          Main Navigation
        </div>
        {navLinks.map(link => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.path}
              to={link.path}
              onClick={onCloseMobile}
              className={({ isActive }) =>
                `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all group ${
                  isActive
                    ? 'bg-brand-600/90 text-white shadow-glow-sm border border-brand-400/30'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                }`
              }
            >
              <div className="flex items-center gap-3">
                <Icon className="w-4 h-4 text-brand-400 group-hover:text-white transition-colors" />
                <span>{link.label}</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
            </NavLink>
          );
        })}
      </nav>

      {/* Logout & Bottom Actions */}
      <div className="p-3 border-t border-slate-800 space-y-1">
        <NavLink
          to="/"
          className="flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800/50 transition-colors"
        >
          <BookOpen className="w-4 h-4 text-slate-400" />
          <span>View Public Website</span>
        </NavLink>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-950/40 hover:text-rose-300 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};
