import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import logo from '../../assets/logo.png';
import { useAuth } from '../../context/AuthContext';
import { CheckoutModal } from '../common/CheckoutModal';
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
  Sparkles,
  Star,
  Globe,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

interface SidebarProps {
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onCloseMobile }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getNavSections = () => {
    if (!user) return [];

    if (user.role === 'admin') {
      return [
        {
          section: 'CORE NAVIGATION',
          items: [
            { label: 'Overview', path: '/admin/dashboard', icon: LayoutDashboard },
            { label: 'Students Directory', path: '/admin/students', icon: GraduationCap },
            { label: 'Staff & Trainers', path: '/admin/staff', icon: UserCheck },
          ],
        },
        {
          section: 'ACADEMIC HUB',
          items: [
            { label: 'Course Catalog', path: '/admin/courses', icon: BookOpen },
            { label: 'Batch Cohorts', path: '/admin/batches', icon: Layers },
            { label: 'Online Assessments', path: '/admin/tests', icon: FileCheck2 },
            { label: 'Test Results', path: '/admin/results', icon: Award },
          ],
        },
        {
          section: 'MANAGEMENT & REPORTS',
          items: [
            { label: 'Internship Portal', path: '/admin/internships', icon: Briefcase },
            { label: 'Attendance Audit', path: '/admin/attendance', icon: CalendarCheck },
            { label: 'Notice Broadcasts', path: '/admin/announcements', icon: Bell },
            { label: 'CMS & Inquiries', path: '/admin/cms', icon: MessageSquare },
            { label: 'Export Audit Logs', path: '/admin/reports', icon: FileSpreadsheet },
          ],
        },
      ];
    }

    if (user.role === 'staff') {
      return [
        {
          section: 'INSTRUCTOR HUB',
          items: [
            { label: 'Dashboard', path: '/staff/dashboard', icon: LayoutDashboard },
            { label: 'My Cohort Batches', path: '/staff/batches', icon: Layers },
            { label: 'Assigned Courses', path: '/courses', icon: BookOpen },
          ],
        },
        {
          section: 'EVALUATION & CLASSROOM',
          items: [
            { label: 'Test Question Bank', path: '/staff/tests', icon: FileCheck2 },
            { label: 'Mark Attendance', path: '/staff/attendance', icon: CalendarCheck },
            { label: 'Student Results', path: '/staff/results', icon: Award },
            { label: 'Post Announcements', path: '/staff/announcements', icon: Bell },
          ],
        },
      ];
    }

    return [
      {
        section: 'STUDENT PORTAL',
        items: [
          { label: 'Dashboard', path: '/student/dashboard', icon: LayoutDashboard },
          { label: 'My Enrolled Courses', path: '/student/courses', icon: BookOpen },
          { label: 'Online Tests', path: '/student/tests', icon: FileCheck2 },
          { label: 'Test Breakdown', path: '/student/results', icon: Award },
        ],
      },
      {
        section: 'ANALYTICS & CAREER',
        items: [
          { label: 'Performance Analytics', path: '/student/performance', icon: TrendingUp },
          { label: 'Attendance Summary', path: '/student/attendance', icon: CalendarCheck },
          { label: 'Corporate Internships', path: '/student/internships', icon: Briefcase },
          { label: 'Announcements Hub', path: '/student/announcements', icon: Bell },
          { label: 'My Profile', path: '/student/profile', icon: User },
        ],
      },
    ];
  };

  const navSections = getNavSections();

  return (
    <>
      <aside className="w-64 bg-white border-r border-purple-100 flex flex-col h-full overflow-hidden select-none shadow-[2px_0_20px_rgba(106,27,154,0.04)]">
        {/* 1. Brand Logo Header */}
        <div className="p-4 border-b border-purple-100 flex flex-col items-start gap-2 bg-[#FAF8FD]">
          <Link to="/" className="inline-block p-1.5 rounded-xl bg-white shadow-sm border border-purple-200">
            <img src={logo} alt="MindMend Academy" className="h-8 w-auto object-contain" />
          </Link>
          <div className="flex items-center justify-between w-full pt-1">
            <span className="text-[10px] text-[#6A1B9A] font-extrabold uppercase tracking-widest flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>{user?.role === 'admin' ? 'Admin Executive' : user?.role === 'staff' ? 'Trainer Portal' : 'Student Portal'}</span>
            </span>
            <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-purple-100 text-[#6A1B9A]">v2.5</span>
          </div>
        </div>

        {/* 2. User Profile Quick Badge */}
        <div className="p-3 mx-3 my-3 rounded-2xl bg-[#F5EFFB] border border-purple-100 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-gradient flex items-center justify-center text-white font-black text-sm shadow-md flex-shrink-0">
            {user?.full_name?.charAt(0) || 'U'}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-black text-slate-900 truncate">{user?.full_name || user?.email}</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <ShieldCheck className="w-3 h-3 text-[#6A1B9A]" />
              <span className="text-[10px] text-[#6A1B9A] font-mono font-bold">
                {user?.student_id || user?.staff_id || 'Superadmin'}
              </span>
            </div>
          </div>
        </div>

        {/* 3. Navigation Sections with Lucide Icons */}
        <div className="flex-1 px-3 space-y-4 py-2 overflow-y-auto custom-scrollbar">
          {navSections.map((sec, sIdx) => (
            <div key={sIdx} className="space-y-1">
              <div className="px-3.5 py-1 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                {sec.section}
              </div>
              {sec.items.map(link => {
                const Icon = link.icon;
                return (
                  <NavLink
                    key={link.path}
                    to={link.path}
                    onClick={onCloseMobile}
                    className={({ isActive }) =>
                      `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all group ${
                        isActive
                          ? 'bg-[#6A1B9A] text-white shadow-glow-purple scale-[1.02]'
                          : 'text-slate-600 hover:text-[#6A1B9A] hover:bg-[#F5EFFB]'
                      }`
                    }
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-4 h-4 transition-colors" />
                      <span>{link.label}</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </NavLink>
                );
              })}
            </div>
          ))}
        </div>

        {/* 4. Optimization Example Element: VIP Pass Banner */}
        <div className="p-3.5 mx-3 my-2 rounded-2xl bg-purple-gradient text-white relative overflow-hidden shadow-lg">
          <div className="relative z-10 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-white/20 uppercase tracking-wider">
                VIP Access
              </span>
              <div className="flex text-amber-300">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3 h-3 fill-amber-300" />
                ))}
              </div>
            </div>
            <h5 className="font-display font-black text-xs leading-snug">
              Unlock Enterprise Courses
            </h5>
            <p className="text-[10px] text-purple-100 opacity-95">
              Unlimited access to live streams & certificates.
            </p>
            <button
              onClick={() => setCheckoutOpen(true)}
              className="w-full py-2 rounded-xl bg-white text-[#6A1B9A] hover:bg-purple-50 font-black text-[11px] transition-all shadow-md flex items-center justify-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#6A1B9A]" />
              <span>Get VIP Pass</span>
            </button>
          </div>
        </div>

        {/* 5. Footer Actions */}
        <div className="p-3 border-t border-purple-100 space-y-1 bg-[#FAF8FD]">
          <NavLink
            to="/"
            className="flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-[#6A1B9A] hover:bg-white transition-colors"
          >
            <Globe className="w-4 h-4 text-slate-400" />
            <span>Public Website</span>
          </NavLink>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-black text-rose-600 hover:bg-rose-50 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      <CheckoutModal isOpen={checkoutOpen} onClose={() => setCheckoutOpen(false)} />
    </>
  );
};
