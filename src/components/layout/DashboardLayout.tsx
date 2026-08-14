import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Sidebar } from './Sidebar';
import { api } from '../../services/api';
import {
  Menu,
  X,
  Bell,
  CheckCircle,
  User,
  Shield,
  Sparkles,
  Search,
} from 'lucide-react';

export const DashboardLayout: React.FC = () => {
  const { user, logout, refreshUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    // Check if user is authorized
    if (!user) {
      navigate('/login');
      return;
    }

    // Role protection check
    const path = location.pathname;
    if (path.startsWith('/admin') && user.role !== 'admin') {
      navigate('/login');
    } else if (path.startsWith('/staff') && user.role !== 'staff' && user.role !== 'admin') {
      navigate('/login');
    } else if (path.startsWith('/student') && user.role !== 'student') {
      navigate('/login');
    }

    // Fetch user notifications
    api.get('/cms/notifications')
      .then(data => setNotifications(data.notifications || []))
      .catch(err => console.warn('Could not fetch notifications', err));
  }, [location.pathname, user]);

  const markAllRead = async () => {
    try {
      await api.patch('/cms/notifications/all/read');
      setNotifications(prev => prev.map(n => ({ ...n, is_read: 1 })));
      refreshUser();
    } catch (err) {
      console.error('Failed to mark read', err);
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="min-h-screen bg-[#090D16] text-slate-100 flex flex-col font-sans">
      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block h-screen sticky top-0">
          <Sidebar />
        </div>

        {/* Mobile Drawer */}
        {mobileSidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            <div
              className="fixed inset-0 bg-black/80 backdrop-blur-sm"
              onClick={() => setMobileSidebarOpen(false)}
            />
            <div className="relative z-10 w-64 h-full bg-[#0B101D]">
              <Sidebar onCloseMobile={() => setMobileSidebarOpen(false)} />
            </div>
          </div>
        )}

        {/* Main Content View */}
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          {/* Top Bar Header */}
          <header className="sticky top-0 z-30 bg-[#0A0E1A]/95 backdrop-blur-md border-b border-slate-800 px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMobileSidebarOpen(true)}
                className="lg:hidden p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
              >
                <Menu className="w-5 h-5" />
              </button>

              <div>
                <h2 className="font-display font-bold text-base sm:text-lg text-white">
                  {user?.role === 'admin'
                    ? 'Admin Operations Suite'
                    : user?.role === 'staff'
                    ? 'Trainer Dashboard'
                    : 'Student Learning Workspace'}
                </h2>
                <p className="text-[11px] text-slate-400 hidden sm:block">
                  MindMend Career & Student Management Platform
                </p>
              </div>
            </div>

            {/* Header Right Actions */}
            <div className="flex items-center gap-3">
              {/* Role badge */}
              <span className={`px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider hidden sm:inline-block ${
                user?.role === 'admin'
                  ? 'bg-amber-500/10 text-amber-300 border border-amber-500/20'
                  : user?.role === 'staff'
                  ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/20'
                  : 'bg-brand-500/10 text-brand-300 border border-brand-500/20'
              }`}>
                {user?.role}
              </span>

              {/* Notifications Popover */}
              <div className="relative">
                <button
                  onClick={() => setNotificationsOpen(!notificationsOpen)}
                  className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 hover:text-white transition-colors relative"
                  title="Notifications"
                >
                  <Bell className="w-4 h-4" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-brand-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center animate-pulse">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {notificationsOpen && (
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-[#0F172A] border border-slate-700 rounded-2xl shadow-2xl p-4 z-50">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                      <h4 className="font-bold text-sm text-white flex items-center gap-2">
                        <Bell className="w-4 h-4 text-brand-400" />
                        <span>Notifications</span>
                      </h4>
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllRead}
                          className="text-[11px] text-brand-400 hover:text-brand-300 font-medium"
                        >
                          Mark all as read
                        </button>
                      )}
                    </div>

                    <div className="max-h-72 overflow-y-auto divide-y divide-slate-800/60 py-2 space-y-1">
                      {notifications.length === 0 ? (
                        <p className="text-xs text-slate-400 text-center py-6">No new notifications</p>
                      ) : (
                        notifications.map(n => (
                          <div
                            key={n.id}
                            className={`p-2.5 rounded-xl transition-colors ${
                              !n.is_read ? 'bg-brand-950/40 border border-brand-500/20' : 'hover:bg-slate-800/40'
                            }`}
                          >
                            <p className="text-xs font-semibold text-white">{n.title}</p>
                            <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">{n.message}</p>
                            <span className="text-[10px] text-slate-500 mt-1 block">
                              {new Date(n.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* User Avatar */}
              <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
                <div className="w-8 h-8 rounded-lg bg-brand-600 text-white font-bold text-xs flex items-center justify-center">
                  {user?.full_name?.charAt(0) || 'U'}
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-xs font-semibold text-white leading-tight">{user?.full_name || 'User'}</p>
                  <p className="text-[10px] text-slate-400 font-mono">{user?.student_id || user?.staff_id || user?.email}</p>
                </div>
              </div>
            </div>
          </header>

          {/* Page Body */}
          <main className="p-4 sm:p-6 lg:p-8 flex-1">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};
