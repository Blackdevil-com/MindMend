import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  GraduationCap,
  BookOpen,
  FileCheck2,
  Award,
  CalendarCheck,
  Briefcase,
  TrendingUp,
  Clock,
  ArrowRight,
  Bell,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

export const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/students/dashboard-stats')
      .then(res => setData(res))
      .catch(err => console.error('Failed to load student dashboard stats', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const student = data?.student || user?.profile;
  const stats = data?.stats || {};
  const courses = data?.courses || [];
  const activeTests = data?.active_tests || [];
  const announcements = data?.recent_announcements || [];

  return (
    <div className="space-y-8 pb-12">
      {/* 1. Welcome Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#170E30] via-[#0F172A] to-[#121A2E] border border-brand-500/30 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-brand-950 text-brand-300 border border-brand-500/40">
                Student Portal
              </span>
              <span className="font-mono text-xs font-bold text-slate-300 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800">
                {student?.student_id || user?.student_id}
              </span>
            </div>

            <h1 className="font-display font-black text-2xl sm:text-3xl text-white">
              Welcome back, {student?.full_name || user?.full_name}! 👋
            </h1>

            <p className="text-xs sm:text-sm text-slate-400">
              {student?.college_name} • {student?.degree} ({student?.department}) • {data?.batch ? `Batch: ${data.batch.name}` : 'Enrolled Student'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/student/tests"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-500 hover:to-brand-600 text-white font-bold text-xs shadow-glow-sm transition-all flex items-center gap-1.5"
            >
              <FileCheck2 className="w-4 h-4" />
              <span>Available Tests</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Top Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="p-5 rounded-2xl bg-[#0F172A] border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Courses Enrolled</span>
            <BookOpen className="w-4 h-4 text-brand-400" />
          </div>
          <p className="font-display font-extrabold text-2xl text-white">{stats.enrolled_courses || 0}</p>
        </div>

        <div className="p-5 rounded-2xl bg-[#0F172A] border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Tests Completed</span>
            <FileCheck2 className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="font-display font-extrabold text-2xl text-white">{stats.tests_completed || 0}</p>
        </div>

        <div className="p-5 rounded-2xl bg-[#0F172A] border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Average Score</span>
            <Award className="w-4 h-4 text-amber-400" />
          </div>
          <p className="font-display font-extrabold text-2xl text-white">{stats.average_score || 0}%</p>
        </div>

        <div className="p-5 rounded-2xl bg-[#0F172A] border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Attendance Rate</span>
            <CalendarCheck className="w-4 h-4 text-cyan-400" />
          </div>
          <p className="font-display font-extrabold text-2xl text-white">{stats.attendance_percentage || 100}%</p>
        </div>

        <div className="p-5 rounded-2xl bg-[#0F172A] border border-slate-800 space-y-2 col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Internship Status</span>
            <Briefcase className="w-4 h-4 text-purple-400" />
          </div>
          <p className="text-sm font-bold text-brand-300 capitalize truncate">
            {stats.internship_status?.replace('_', ' ') || 'Not Applied'}
          </p>
        </div>
      </div>

      {/* 3. Tests & Courses Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Online Tests */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display font-bold text-lg text-white">Assigned Online Tests</h3>
              <p className="text-xs text-slate-400">Take scheduled quizzes and benchmark your skills</p>
            </div>
            <Link to="/student/tests" className="text-xs font-semibold text-brand-400 hover:text-brand-300">
              View All
            </Link>
          </div>

          <div className="space-y-3">
            {activeTests.length === 0 ? (
              <div className="p-8 rounded-2xl bg-[#0F172A] border border-slate-800 text-center text-xs text-slate-400">
                No active tests assigned at this moment.
              </div>
            ) : (
              activeTests.slice(0, 4).map((test: any) => (
                <div
                  key={test.id}
                  className="p-5 rounded-2xl bg-[#0F172A] border border-slate-800 hover:border-brand-500/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded bg-brand-950 text-brand-300 border border-brand-500/30">
                        {test.subject}
                      </span>
                      <span className="text-xs text-slate-400 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {test.duration_minutes} Mins
                      </span>
                      <span className="text-xs text-slate-400">
                        • {test.total_marks} Marks
                      </span>
                    </div>
                    <h4 className="font-bold text-sm text-white">{test.title}</h4>
                  </div>

                  <div>
                    {test.attempt_status === 'submitted' ? (
                      <Link
                        to={`/student/results/${test.attempt_id}`}
                        className="px-4 py-2 rounded-xl bg-emerald-950/80 text-emerald-300 border border-emerald-500/30 text-xs font-bold flex items-center gap-1.5 hover:bg-emerald-900/80 transition-colors"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Score: {test.attempt_percentage}%</span>
                      </Link>
                    ) : (
                      <Link
                        to={`/student/tests/take/${test.id}`}
                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-500 hover:to-brand-600 text-white text-xs font-bold shadow-sm flex items-center gap-1.5 transition-all"
                      >
                        <span>Take Test</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Enrolled Courses Progress */}
          <div className="space-y-4 pt-4">
            <h3 className="font-display font-bold text-lg text-white">My Enrolled Courses</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {courses.map((course: any) => (
                <div
                  key={course.id}
                  className="p-4 rounded-2xl bg-[#0F172A] border border-slate-800 space-y-3"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] font-bold text-brand-400 uppercase tracking-wider">{course.category}</span>
                      <h4 className="font-bold text-sm text-white mt-0.5">{course.title}</h4>
                    </div>
                    <span className="text-xs font-mono text-slate-400">{course.progress || 0}%</span>
                  </div>

                  <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-brand-500 rounded-full transition-all duration-500"
                      style={{ width: `${course.progress || 10}%` }}
                    />
                  </div>

                  <Link
                    to={`/courses/${course.slug}`}
                    className="text-[11px] font-semibold text-brand-400 hover:text-brand-300 flex items-center gap-1"
                  >
                    <span>View Curriculum Syllabus</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Announcements & Shortcuts */}
        <div className="space-y-6">
          {/* Announcements Card */}
          <div className="p-6 rounded-3xl bg-[#0F172A] border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-bold text-base text-white flex items-center gap-2">
                <Bell className="w-4 h-4 text-brand-400" />
                <span>Notice Board</span>
              </h3>
              <Link to="/student/announcements" className="text-xs text-brand-400 hover:underline">
                View All
              </Link>
            </div>

            <div className="space-y-3">
              {announcements.length === 0 ? (
                <p className="text-xs text-slate-400">No active announcements</p>
              ) : (
                announcements.map((ann: any) => (
                  <div key={ann.id} className="p-3 rounded-xl bg-slate-900/80 border border-slate-800/80 space-y-1">
                    <h5 className="font-bold text-xs text-white">{ann.title}</h5>
                    <p className="text-[11px] text-slate-300 leading-relaxed line-clamp-2">{ann.content}</p>
                    <span className="text-[10px] text-slate-500 block pt-1">
                      {new Date(ann.created_at).toLocaleDateString()}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Internship Promo Shortcut */}
          <div className="p-6 rounded-3xl bg-gradient-to-br from-brand-950/90 to-purple-950/60 border border-brand-500/30 space-y-4">
            <div className="flex items-center gap-2 text-brand-300 text-xs font-bold">
              <Briefcase className="w-4 h-4" />
              <span>Career Opportunities</span>
            </div>
            <h4 className="font-display font-bold text-lg text-white">
              MindMend 3-Month Industry Internship
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Work on live enterprise projects in Java, Power BI, and Data Analytics. Get certified and referable.
            </p>
            <Link
              to="/student/internship"
              className="inline-block w-full py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold text-center transition-colors shadow-sm"
            >
              Apply or View Status
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
