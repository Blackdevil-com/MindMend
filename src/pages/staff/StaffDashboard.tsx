import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  UserCheck,
  Layers,
  BookOpen,
  FileCheck2,
  CalendarCheck,
  Users,
  Award,
  Clock,
  ArrowRight,
  Sparkles,
  PlusCircle,
} from 'lucide-react';

export const StaffDashboard: React.FC = () => {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/staff/dashboard-stats')
      .then(res => setData(res))
      .catch(err => console.error('Failed to load staff dashboard stats', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const staff = data?.staff || user?.profile;
  const stats = data?.stats || {};
  const batches = data?.batches || [];
  const recentTests = data?.recent_tests || [];

  return (
    <div className="space-y-8 pb-12">
      {/* 1. Welcome Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#1E1235] via-[#0F172A] to-[#0F2231] border border-brand-500/30 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-500/40">
                Staff Trainer Portal
              </span>
              <span className="font-mono text-xs font-bold text-slate-300 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800">
                {staff?.staff_id || user?.staff_id}
              </span>
            </div>

            <h1 className="font-display font-black text-2xl sm:text-3xl text-white">
              Welcome, {staff?.full_name || user?.full_name}! 👨‍🏫
            </h1>

            <p className="text-xs sm:text-sm text-slate-400">
              {staff?.designation || 'MindMend Lead Trainer'} • {staff?.email}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/staff/attendance"
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-500 hover:to-brand-600 text-white font-bold text-xs shadow-glow-sm transition-all flex items-center gap-1.5"
            >
              <CalendarCheck className="w-4 h-4" />
              <span>Mark Today's Attendance</span>
            </Link>
            <Link
              to="/staff/tests"
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 transition-colors flex items-center gap-1.5"
            >
              <PlusCircle className="w-4 h-4 text-brand-400" />
              <span>Create Test</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Top Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-[#0F172A] border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Assigned Batches</span>
            <Layers className="w-4 h-4 text-cyan-400" />
          </div>
          <p className="font-display font-extrabold text-2xl text-white">{stats.assigned_batches_count || 0}</p>
        </div>

        <div className="p-5 rounded-2xl bg-[#0F172A] border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Total Students</span>
            <Users className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="font-display font-extrabold text-2xl text-white">{stats.total_students || 0}</p>
        </div>

        <div className="p-5 rounded-2xl bg-[#0F172A] border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Assigned Courses</span>
            <BookOpen className="w-4 h-4 text-brand-400" />
          </div>
          <p className="font-display font-extrabold text-2xl text-white">{stats.assigned_courses_count || 0}</p>
        </div>

        <div className="p-5 rounded-2xl bg-[#0F172A] border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Today's Attendance</span>
            <CalendarCheck className="w-4 h-4 text-amber-400" />
          </div>
          <p className={`text-xs font-bold uppercase mt-1 ${stats.today_attendance_marked ? 'text-emerald-400' : 'text-amber-400'}`}>
            {stats.today_attendance_marked ? '✅ Recorded' : '⏳ Pending Today'}
          </p>
        </div>
      </div>

      {/* 3. Batches and Recent Tests */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: Assigned Batches */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-bold text-lg text-white">Assigned Cohort Batches</h3>
            <Link to="/staff/batches" className="text-xs font-semibold text-brand-400 hover:text-brand-300">
              Manage Batches
            </Link>
          </div>

          <div className="space-y-3">
            {batches.length === 0 ? (
              <div className="p-8 rounded-2xl bg-[#0F172A] border border-slate-800 text-center text-xs text-slate-400">
                No batches currently assigned.
              </div>
            ) : (
              batches.map((b: any) => (
                <div
                  key={b.id}
                  className="p-5 rounded-2xl bg-[#0F172A] border border-slate-800 hover:border-brand-500/40 transition-all space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-mono text-sm font-bold text-brand-300">{b.name}</span>
                      <h4 className="font-bold text-sm text-white">{b.course_title}</h4>
                    </div>
                    <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-xs font-bold text-slate-300">
                      {b.student_count || 0} Students
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-brand-400" />
                    {b.timing}
                  </p>

                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                    <Link
                      to={`/staff/attendance?batch_id=${b.id}`}
                      className="text-xs font-semibold text-cyan-400 hover:underline"
                    >
                      Mark Attendance →
                    </Link>
                    <Link
                      to={`/staff/batches`}
                      className="text-xs font-semibold text-brand-400 hover:underline"
                    >
                      View Student Roster →
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right: Tests Created */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-bold text-lg text-white">Active Online Tests</h3>
            <Link to="/staff/tests" className="text-xs font-semibold text-brand-400 hover:text-brand-300">
              View All Tests
            </Link>
          </div>

          <div className="space-y-3">
            {recentTests.length === 0 ? (
              <div className="p-8 rounded-2xl bg-[#0F172A] border border-slate-800 text-center text-xs text-slate-400">
                No tests created yet.
              </div>
            ) : (
              recentTests.map((t: any) => (
                <div
                  key={t.id}
                  className="p-5 rounded-2xl bg-[#0F172A] border border-slate-800 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-brand-950 text-brand-300 border border-brand-500/30">
                      {t.subject}
                    </span>
                    <span className="text-xs font-bold text-emerald-400">
                      {t.completed_submissions || 0} Submissions
                    </span>
                  </div>

                  <h4 className="font-bold text-sm text-white">{t.title}</h4>

                  <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                    <span>{t.duration_minutes} Mins • {t.total_marks} Marks</span>
                    <Link
                      to={`/staff/results`}
                      className="text-brand-400 font-semibold hover:underline"
                    >
                      View Marks →
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
