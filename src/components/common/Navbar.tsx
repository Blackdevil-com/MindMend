import React, { useState } from 'react';
import logo from '../../assets/logo.png';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Menu,
  X,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  User,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const getDashboardLink = () => {
    if (!user) return '/login';
    if (user.role === 'admin') return '/admin/dashboard';
    if (user.role === 'staff') return '/staff/dashboard';
    return '/student/dashboard';
  };

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'About', path: '/about' },
    { label: 'Courses', path: '/courses' },
    { label: 'Internship', path: '/internship' },
    { label: 'Contact', path: '/contact' },
  ];

  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-purple-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo Brand */}
          <Link to="/" className="flex items-center gap-3 group shrink-0">
            <img
              src={logo}
              alt="MindMend Academy Logo"
              className="h-6 sm:h-8 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
            />
            <div className="hidden sm:block">
              <div className="font-display font-black text-xl tracking-tight text-slate-900 flex items-center gap-1.5">
                <span>MINDMEND</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-brand-100 text-brand-700 border border-brand-200">
                  ACADEMY
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">Educational Training & Career Development</p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-100/80 p-1.5 rounded-full border border-slate-200">
            {navLinks.map(link => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${isActive(link.path)
                  ? 'bg-brand-600 text-white shadow-md'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white'
                  }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right Action CTA */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                <Link
                  to={getDashboardLink()}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold shadow-md transition-all"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>
                    {user.role === 'admin'
                      ? 'Admin Portal'
                      : user.role === 'staff'
                        ? 'Staff Portal'
                        : 'Student Dashboard'}
                  </span>
                </Link>

                <div className="relative group">
                  <button className="flex items-center gap-2 p-1.5 rounded-xl bg-slate-100 border border-slate-200 hover:border-brand-300 transition-colors">
                    <div className="w-8 h-8 rounded-lg bg-brand-100 text-brand-700 flex items-center justify-center font-bold text-xs">
                      {user.full_name ? user.full_name.charAt(0) : 'U'}
                    </div>
                  </button>

                  <div className="absolute right-0 mt-2 w-56 p-2 bg-white border border-slate-200 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <div className="px-3 py-2 border-b border-slate-100">
                      <p className="text-xs font-semibold text-slate-800 truncate">{user.full_name || user.email}</p>
                      <p className="text-[11px] text-brand-600 capitalize flex items-center gap-1 mt-0.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        {user.role} {user.student_id ? `(${user.student_id})` : user.staff_id ? `(${user.staff_id})` : ''}
                      </p>
                    </div>

                    <Link
                      to={getDashboardLink()}
                      className="flex items-center gap-2 px-3 py-2 text-xs text-slate-700 hover:bg-brand-50 hover:text-brand-700 rounded-lg transition-colors mt-1"
                    >
                      <LayoutDashboard className="w-3.5 h-3.5" />
                      <span>My Dashboard</span>
                    </Link>

                    <button
                      onClick={() => {
                        logout();
                        navigate('/');
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2.5">
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-700 hover:text-brand-600 hover:bg-purple-50 transition-all"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold shadow-md transition-all"
                >
                  <GraduationCap className="w-4 h-4" />
                  <span>Register</span>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile hamburger button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#0F172A] border-b border-slate-800 px-4 pt-2 pb-6 space-y-3">
          <div className="grid grid-cols-1 gap-1">
            {navLinks.map(link => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive(link.path) ? 'bg-brand-600 text-white' : 'text-slate-300 hover:bg-slate-800'
                  }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-800 flex flex-col gap-2">
            {user ? (
              <>
                <Link
                  to={getDashboardLink()}
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-2.5 px-4 rounded-xl bg-brand-600 text-white text-center text-sm font-semibold flex items-center justify-center gap-2"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Enter Dashboard</span>
                </Link>
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                    navigate('/');
                  }}
                  className="w-full py-2 px-4 rounded-xl bg-rose-950/40 text-rose-300 text-center text-sm font-semibold flex items-center justify-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-2.5 px-4 rounded-xl bg-slate-800 text-slate-200 text-center text-sm font-semibold"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-2.5 px-4 rounded-xl bg-brand-600 text-white text-center text-sm font-semibold"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
