import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import {
  Users,
  GraduationCap,
  UserCheck,
  BookOpen,
  FileCheck2,
  Briefcase,
  Award,
  TrendingUp,
  Clock,
  ArrowRight,
  Activity,
  Layers,
  Sparkles,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

export const AdminDashboard: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/cms/admin/summary')
      .then(res => setData(res))
      .catch(err => console.error('Failed to load admin summary', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const stats = data?.stats || {};
  const charts = data?.charts || {};
  const recentActivities = data?.recent_activities || [];

  const statCards = [
    { label: 'Total Students', value: stats.total_students, sub: `${stats.active_students} Active`, icon: GraduationCap, color: 'from-brand-600 to-indigo-600' },
    { label: 'Total Staff / Trainers', value: stats.total_staff, sub: 'Active Instructors', icon: UserCheck, color: 'from-cyan-600 to-blue-600' },
    { label: 'Active Courses', value: stats.active_courses, sub: '5 Core Programs', icon: BookOpen, color: 'from-purple-600 to-violet-600' },
    { label: 'Total Online Tests', value: stats.total_tests, sub: `${stats.tests_completed} Submissions`, icon: FileCheck2, color: 'from-emerald-600 to-teal-600' },
    { label: 'Internship Applications', value: stats.internship_applications, sub: 'Across 6 Tracks', icon: Briefcase, color: 'from-amber-600 to-orange-600' },
    { label: 'Average Student Score', value: `${stats.avg_student_score || 0}%`, sub: 'Institution Benchmark', icon: Award, color: 'from-pink-600 to-rose-600' },
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* 1. Top Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#1D1036] via-[#0F172A] to-[#121E2F] border border-brand-500/30 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-amber-950 text-amber-300 border border-amber-500/40">
              Admin Control Center
            </span>
            <h1 className="font-display font-black text-2xl sm:text-3xl text-white">
              MindMend Executive Administration
            </h1>
            <p className="text-xs sm:text-sm text-slate-400">
              Complete oversight across student lifecycle, staff authorizations, testing engine, batches, and corporate internships.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/admin/tests"
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-500 text-white font-bold text-xs shadow-glow-sm flex items-center gap-1.5 transition-all"
            >
              <FileCheck2 className="w-4 h-4" />
              <span>Manage Tests</span>
            </Link>
            <Link
              to="/admin/reports"
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 transition-colors"
            >
              Export Reports
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Top Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-[#0F172A] border border-slate-800 space-y-2 relative overflow-hidden"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-slate-400">{card.label}</span>
                <Icon className="w-4 h-4 text-brand-400" />
              </div>
              <p className="font-display font-extrabold text-2xl text-white">{card.value}</p>
              <span className="text-[10px] text-slate-400 font-medium block">{card.sub}</span>
            </div>
          );
        })}
      </div>

      {/* 3. Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Course Enrollments */}
        <div className="p-6 rounded-3xl bg-[#0F172A] border border-slate-800 space-y-6 shadow-xl">
          <div>
            <h3 className="font-display font-bold text-base text-white flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-brand-400" />
              <span>Course Enrollment Distribution</span>
            </h3>
            <p className="text-xs text-slate-400">Total registered students by course curriculum</p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.course_enrollments || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                <XAxis dataKey="title" stroke="#64748B" fontSize={10} interval={0} />
                <YAxis stroke="#64748B" fontSize={10} />
                <Tooltip contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }} />
                <Bar dataKey="students_count" fill="#7C3AED" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Batch Performance comparison */}
        <div className="p-6 rounded-3xl bg-[#0F172A] border border-slate-800 space-y-6 shadow-xl">
          <div>
            <h3 className="font-display font-bold text-base text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              <span>Batch Average Performance (%)</span>
            </h3>
            <p className="text-xs text-slate-400">Comparative assessment average across cohorts</p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.batch_stats || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                <XAxis dataKey="name" stroke="#64748B" fontSize={11} />
                <YAxis domain={[0, 100]} stroke="#64748B" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }} />
                <Bar dataKey="avg_score" fill="#06B6D4" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 4. Recent Activity Feed */}
      <div className="p-6 rounded-3xl bg-[#0F172A] border border-slate-800 space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <h3 className="font-display font-bold text-base text-white flex items-center gap-2">
            <Activity className="w-4 h-4 text-brand-400" />
            <span>Platform Live Activity Feed</span>
          </h3>
          <span className="text-xs text-slate-400">Real-time system events</span>
        </div>

        <div className="divide-y divide-slate-800">
          {recentActivities.map((act: any, idx: number) => (
            <div key={idx} className="py-3 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className={`w-2 h-2 rounded-full ${
                  act.type === 'student' ? 'bg-brand-400' : act.type === 'test' ? 'bg-emerald-400' : 'bg-amber-400'
                }`} />
                <p className="text-xs text-slate-200 font-medium">{act.title}</p>
              </div>
              <span className="text-[11px] text-slate-500 font-mono flex-shrink-0">
                {new Date(act.created_at).toLocaleDateString()}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
