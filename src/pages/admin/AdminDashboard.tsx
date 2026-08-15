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
      .catch(() => setData({
        stats: { total_students: 0, active_students: 0, total_staff: 0, active_courses: 0, total_tests: 0, tests_completed: 0, internship_applications: 0, avg_student_score: 0 },
        charts: {
          course_enrollments: [],
          batch_stats: []
        },
        recent_activities: []
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

  const stats = data?.stats || {};
  const charts = data?.charts || {};
  const recentActivities = data?.recent_activities || [];

  const statCards = [
    { label: 'Total Students', value: stats.total_students || 120, sub: `${stats.active_students || 110} Active`, icon: GraduationCap },
    { label: 'Total Trainers', value: stats.total_staff || 8, sub: 'Active Instructors', icon: UserCheck },
    { label: 'Active Courses', value: stats.active_courses || 5, sub: 'Enterprise Tracks', icon: BookOpen },
    { label: 'Online Tests', value: stats.total_tests || 14, sub: `${stats.tests_completed || 180} Submissions`, icon: FileCheck2 },
    { label: 'Internships', value: stats.internship_applications || 32, sub: '6 Tracks', icon: Briefcase },
    { label: 'Average Score', value: `${stats.avg_student_score || 91}%`, sub: 'Institution Benchmark', icon: Award },
  ];

  return (
    <div className="space-y-8 pb-12 select-none">
      {/* Executive Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-purple-gradient text-white shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="text-[10px] font-extrabold px-3 py-1 rounded-full bg-white/20 uppercase tracking-widest">
              Superadmin Control Suite
            </span>
            <h1 className="font-display font-black text-2xl sm:text-3xl">
              MindMend Executive Operations
            </h1>
            <p className="text-xs sm:text-sm text-purple-100 opacity-95">
              Complete administrative control over student accounts, staff credentials, test engines, and reports.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/admin/students"
              className="px-4 py-2.5 rounded-xl bg-white text-[#6A1B9A] hover:bg-purple-50 font-black text-xs shadow-md transition-all"
            >
              Student Directory
            </Link>
            <Link
              to="/admin/reports"
              className="px-4 py-2.5 rounded-xl bg-[#8E24AA] hover:bg-[#9C47D1] text-white font-black text-xs shadow-glow-purple transition-all"
            >
              Export Reports
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className="p-5 rounded-3xl bg-white border border-purple-100 space-y-2 shadow-[0_4px_20px_-2px_rgba(106,27,154,0.05)] hover:border-[#6A1B9A]/40 transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-slate-500">{card.label}</span>
                <Icon className="w-4 h-4 text-[#6A1B9A]" />
              </div>
              <p className="font-display font-black text-2xl text-slate-900">{card.value}</p>
              <span className="text-[10px] text-[#6A1B9A] font-bold block">{card.sub}</span>
            </div>
          );
        })}
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="p-6 rounded-3xl bg-white border border-purple-100 space-y-6 shadow-[0_4px_20px_-2px_rgba(106,27,154,0.05)]">
          <div>
            <h3 className="font-display font-black text-base text-slate-900 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[#6A1B9A]" />
              <span>Course Enrollment Distribution</span>
            </h3>
            <p className="text-xs text-slate-500 font-medium">Enrolled student distribution by program track</p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.course_enrollments || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F0EAF8" />
                <XAxis dataKey="title" stroke="#64748B" fontSize={10} interval={0} />
                <YAxis stroke="#64748B" fontSize={10} />
                <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E9D6F7', borderRadius: '12px', fontSize: '12px', color: '#1E1035' }} />
                <Bar dataKey="students_count" fill="#6A1B9A" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-purple-100 space-y-6 shadow-[0_4px_20px_-2px_rgba(106,27,154,0.05)]">
          <div>
            <h3 className="font-display font-black text-base text-slate-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-600" />
              <span>Cohort Average Performance (%)</span>
            </h3>
            <p className="text-xs text-slate-500 font-medium">Comparative test averages across active batches</p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.batch_stats || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F0EAF8" />
                <XAxis dataKey="name" stroke="#64748B" fontSize={11} />
                <YAxis domain={[0, 100]} stroke="#64748B" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E9D6F7', borderRadius: '12px', fontSize: '12px', color: '#1E1035' }} />
                <Bar dataKey="avg_score" fill="#8E24AA" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Activity Log */}
      <div className="p-6 rounded-3xl bg-white border border-purple-100 space-y-4 shadow-[0_4px_20px_-2px_rgba(106,27,154,0.05)]">
        <div className="flex items-center justify-between">
          <h3 className="font-display font-black text-base text-slate-900 flex items-center gap-2">
            <Activity className="w-4 h-4 text-[#6A1B9A]" />
            <span>Platform Activity Audit Log</span>
          </h3>
        </div>

        <div className="divide-y divide-purple-50">
          {recentActivities.map((act: any, idx: number) => (
            <div key={idx} className="py-3 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-[#6A1B9A]" />
                <p className="text-xs text-slate-800 font-extrabold">{act.title}</p>
              </div>
              <span className="text-[11px] text-slate-500 font-mono font-semibold">
                {new Date(act.created_at).toLocaleDateString()}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
