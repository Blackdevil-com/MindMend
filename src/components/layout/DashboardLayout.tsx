import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Sidebar } from './Sidebar';
import { api } from '../../services/api';
import { ToastProvider } from '../common/Toast';
import { ChatModal } from '../common/ChatModal';
import { VirtualClassroomModal } from '../common/VirtualClassroomModal';
import {
  Menu,
  X,
  Bell,
  CheckCircle,
  User,
  Shield,
  Sparkles,
  Search,
  MessageSquare,
  Video,
  FileText,
  BookOpen,
} from 'lucide-react';

export const DashboardLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [chatOpen, setChatOpen] = useState(false);
  const [classroomOpen, setClassroomOpen] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const path = location.pathname;
    if (path.startsWith('/admin') && user.role !== 'admin') {
      navigate('/login');
    } else if (path.startsWith('/staff') && user.role !== 'staff' && user.role !== 'admin') {
      navigate('/login');
    } else if (path.startsWith('/student') && user.role !== 'student') {
      navigate('/login');
    }

    api.get('/cms/notifications')
      .then(data => setNotifications(data.notifications || []))
      .catch(() => setNotifications([
        { id: 1, title: 'Welcome to MindMend Academy!', message: 'Your portal is optimized with interactive light theme tools.', created_at: new Date(), is_read: 0 },
        { id: 2, title: 'New Test Assigned', message: 'Full-Stack React Architecture Quiz is now live.', created_at: new Date(), is_read: 0 },
      ]));
  }, [location.pathname, user]);

  const markAllRead = async () => {
    try {
      await api.patch('/cms/notifications/all/read');
    } catch (err) {
      // Fallback
    }
    setNotifications(prev => prev.map(n => ({ ...n, is_read: 1 })));
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#F6F5FB] text-slate-800 font-sans antialiased select-none">
        {/* 1. LEFT STATIC SIDEBAR (Stationary 256px column) */}
        <div className="hidden lg:flex w-64 h-screen shrink-0 border-r border-purple-100 bg-white z-40">
          <Sidebar />
        </div>

        {/* Mobile Drawer */}
        {mobileSidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            <div
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
              onClick={() => setMobileSidebarOpen(false)}
            />
            <div className="relative z-10 w-64 h-full bg-white">
              <Sidebar onCloseMobile={() => setMobileSidebarOpen(false)} />
            </div>
          </div>
        )}

        {/* 2. RIGHT MAIN SCROLLABLE PANEL (Only this side scrolls) */}
        <div className="flex-1 flex flex-col h-screen min-w-0 overflow-y-auto custom-scrollbar">
          {/* Header */}
          <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-purple-100 px-4 sm:px-6 py-3 flex items-center justify-between gap-4 shadow-sm shrink-0">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMobileSidebarOpen(true)}
                className="lg:hidden p-2 rounded-xl bg-purple-50 text-slate-700 hover:text-[#6A1B9A]"
              >
                <Menu className="w-5 h-5" />
              </button>

              {/* Global Search */}
              <div className="relative hidden md:block w-72">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => {
                    setSearchQuery(e.target.value);
                    setSearchOpen(e.target.value.length > 0);
                  }}
                  placeholder="Search courses, tests, syllabus..."
                  className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#F5EFFB] border border-purple-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#6A1B9A] focus:ring-1 focus:ring-[#6A1B9A]"
                />

                {searchOpen && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-purple-100 rounded-2xl shadow-xl p-3 space-y-2 z-50">
                    <div className="text-[10px] font-bold uppercase text-[#6A1B9A]">Search Results</div>
                    <Link
                      to="/student/courses"
                      onClick={() => setSearchOpen(false)}
                      className="flex items-center gap-2 p-2 rounded-xl hover:bg-purple-50 text-xs text-slate-800"
                    >
                      <BookOpen className="w-3.5 h-3.5 text-[#6A1B9A]" />
                      <span>Full-Stack Web Development</span>
                    </Link>
                    <Link
                      to="/student/tests"
                      onClick={() => setSearchOpen(false)}
                      className="flex items-center gap-2 p-2 rounded-xl hover:bg-purple-50 text-xs text-slate-800"
                    >
                      <FileText className="w-3.5 h-3.5 text-emerald-600" />
                      <span>React Architecture Quiz</span>
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Header Right Actions */}
            <div className="flex items-center gap-3">



              {/* Notifications */}
              <div className="relative">
                <button
                  onClick={() => setNotificationsOpen(!notificationsOpen)}
                  className="p-2.5 rounded-xl bg-purple-50 border border-purple-100 hover:bg-purple-100 text-slate-700 hover:text-[#6A1B9A] transition-colors relative"
                  title="Notifications"
                >
                  <Bell className="w-4 h-4" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#6A1B9A] text-white rounded-full text-[10px] font-bold flex items-center justify-center shadow-sm">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {notificationsOpen && (
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-purple-100 rounded-2xl shadow-2xl p-4 z-50">
                    <div className="flex items-center justify-between pb-3 border-b border-purple-100">
                      <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                        <Bell className="w-4 h-4 text-[#6A1B9A]" />
                        <span>Notifications</span>
                      </h4>
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllRead}
                          className="text-[11px] text-[#6A1B9A] hover:underline font-bold"
                        >
                          Mark all read
                        </button>
                      )}
                    </div>

                    <div className="max-h-72 overflow-y-auto divide-y divide-purple-50 py-2 space-y-1">
                      {notifications.map(n => (
                        <div
                          key={n.id}
                          className={`p-3 rounded-xl transition-colors ${
                            !n.is_read ? 'bg-[#F5EFFB] border border-purple-200' : 'hover:bg-slate-50'
                          }`}
                        >
                          <p className="text-xs font-bold text-slate-900">{n.title}</p>
                          <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">{n.message}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* User Profile Avatar */}
              <div className="flex items-center gap-2.5 pl-2 border-l border-purple-100">
                <div className="w-9 h-9 rounded-xl bg-purple-gradient text-white font-black text-xs flex items-center justify-center shadow-md">
                  {user?.full_name?.charAt(0) || 'U'}
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-xs font-extrabold text-slate-900 leading-tight">{user?.full_name || 'User'}</p>
                  <span className="text-[10px] text-[#6A1B9A] uppercase font-bold">{user?.role}</span>
                </div>
              </div>
            </div>
          </header>

          {/* Body Content */}
          <main className="p-4 sm:p-6 lg:p-8 flex-1">
            <Outlet />
          </main>
        </div>

        {/* Global Modals */}
        <ChatModal isOpen={chatOpen} onClose={() => setChatOpen(false)} />
        <VirtualClassroomModal isOpen={classroomOpen} onClose={() => setClassroomOpen(false)} />
      </div>
  );
};
