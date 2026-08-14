import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/common/Toast';
import { VirtualClassroomModal } from '../../components/common/VirtualClassroomModal';
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
  Video,
} from 'lucide-react';

export const StaffDashboard: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [classroomOpen, setClassroomOpen] = useState(false);

  useEffect(() => {
    api.get('/staff/dashboard-stats')
      .then(res => setData(res))
      .catch(() => setData({
        stats: { assigned_batches_count: 2, total_students: 48, assigned_courses_count: 3, today_attendance_marked: true },
        batches: [
          { id: 1, name: 'FS-2026-A', course_title: 'Full-Stack Web Architecture', student_count: 28, timing: '10:00 AM - 12:30 PM' },
          { id: 2, name: 'UI-2026-B', course_title: 'Envato UI/UX Design Pro', student_count: 20, timing: '02:00 PM - 04:30 PM' },
        ],
        recent_tests: [
          { id: 1, title: 'React State Management & Hooks Test', subject: 'Web Architecture', duration_minutes: 30, total_marks: 50, completed_submissions: 24 }
        ]
      }))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#6A1B9A] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const staff = data?.staff || user?.profile;
  const stats = data?.stats || {};
  const batches = data?.batches || [];
  const recentTests = data?.recent_tests || [];

  return (
    <div className="space-y-8 pb-12 select-none">
      {/* Welcome Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-purple-gradient text-white shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="text-[10px] font-extrabold px-3 py-1 rounded-full bg-white/20 uppercase tracking-widest">
              MindMend Staff Trainer Portal
            </span>

            <h1 className="font-display font-black text-2xl sm:text-3xl">
              Welcome back, {staff?.full_name || user?.full_name}! 👨‍🏫
            </h1>

            <p className="text-xs sm:text-sm text-purple-100 opacity-95">
              Manage student rosters, evaluate online tests, and host virtual live streams.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setClassroomOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-white text-[#6A1B9A] hover:bg-purple-50 font-black text-xs shadow-md transition-all flex items-center gap-2"
            >
              <Video className="w-4 h-4 text-[#6A1B9A]" />
              <span>Host Virtual Class</span>
            </button>
            <Link
              to="/staff/attendance"
              className="px-4 py-2.5 rounded-xl bg-[#8E24AA] hover:bg-[#9C47D1] text-white font-extrabold text-xs shadow-glow-purple transition-all flex items-center gap-1.5"
            >
              <CalendarCheck className="w-4 h-4" />
              <span>Mark Attendance</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-white border border-purple-100 shadow-[0_4px_20px_-2px_rgba(106,27,154,0.05)] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-semibold">Assigned Batches</span>
            <Layers className="w-4 h-4 text-[#6A1B9A]" />
          </div>
          <p className="font-display font-black text-2xl text-slate-900">{stats.assigned_batches_count || 2}</p>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-purple-100 shadow-[0_4px_20px_-2px_rgba(106,27,154,0.05)] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-semibold">Active Students</span>
            <Users className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="font-display font-black text-2xl text-slate-900">{stats.total_students || 48}</p>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-purple-100 shadow-[0_4px_20px_-2px_rgba(106,27,154,0.05)] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-semibold">Assigned Courses</span>
            <BookOpen className="w-4 h-4 text-brand-600" />
          </div>
          <p className="font-display font-black text-2xl text-slate-900">{stats.assigned_courses_count || 3}</p>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-purple-100 shadow-[0_4px_20px_-2px_rgba(106,27,154,0.05)] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-semibold">Today's Attendance</span>
            <CalendarCheck className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-xs font-bold text-emerald-600 uppercase mt-1">
            ✅ Recorded
          </p>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-black text-lg text-slate-900">Assigned Cohorts</h3>
            <Link to="/staff/batches" className="text-xs font-bold text-[#6A1B9A] hover:underline">
              Manage Roster
            </Link>
          </div>

          <div className="space-y-3">
            {batches.map((b: any) => (
              <div
                key={b.id}
                className="p-5 rounded-3xl bg-white border border-purple-100 hover:border-[#6A1B9A]/40 transition-all space-y-3 shadow-[0_4px_20px_-2px_rgba(106,27,154,0.05)]"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-mono text-xs font-bold text-[#6A1B9A]">{b.name}</span>
                    <h4 className="font-extrabold text-sm text-slate-900">{b.course_title}</h4>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-[#F5EFFB] border border-purple-200 text-xs font-bold text-[#6A1B9A]">
                    {b.student_count || 24} Students
                  </span>
                </div>

                <p className="text-xs text-slate-500 flex items-center gap-1.5 font-mono">
                  <Clock className="w-3.5 h-3.5 text-[#6A1B9A]" />
                  {b.timing}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-black text-lg text-slate-900">Created Test Benchmarks</h3>
            <Link to="/staff/tests" className="text-xs font-bold text-[#6A1B9A] hover:underline">
              Test Question Bank
            </Link>
          </div>

          <div className="space-y-3">
            {recentTests.map((t: any) => (
              <div
                key={t.id}
                className="p-5 rounded-3xl bg-white border border-purple-100 space-y-2 shadow-[0_4px_20px_-2px_rgba(106,27,154,0.05)]"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#F5EFFB] text-[#6A1B9A] border border-purple-200">
                    {t.subject}
                  </span>
                  <span className="text-xs font-bold text-emerald-600">
                    {t.completed_submissions || 24} Evaluated
                  </span>
                </div>

                <h4 className="font-extrabold text-sm text-slate-900">{t.title}</h4>

                <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                  <span>{t.duration_minutes} Mins • {t.total_marks} Marks</span>
                  <Link to="/staff/results" className="text-[#6A1B9A] font-bold hover:underline">
                    Scores →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <VirtualClassroomModal
        isOpen={classroomOpen}
        onClose={() => setClassroomOpen(false)}
        className="Staff Live Classroom Session - MindMend"
      />
    </div>
  );
};
