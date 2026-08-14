import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  BookOpen,
  Clock,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Layers,
} from 'lucide-react';

export const StudentCourses: React.FC = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState<any[]>([]);
  const [allCourses, setAllCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/students/dashboard-stats'),
      api.get('/courses'),
    ])
      .then(([studentData, catalogData]) => {
        setCourses(studentData.courses || []);
        setAllCourses(catalogData.courses || []);
      })
      .catch(err => console.error('Failed to load student courses', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const enrolledCourseIds = new Set(courses.map(c => c.id));

  return (
    <div className="space-y-12 max-w-6xl mx-auto pb-12">
      {/* 1. Enrolled Courses */}
      <div className="space-y-6">
        <div>
          <h1 className="font-display font-black text-2xl sm:text-3xl text-white">
            My Enrolled Training Tracks
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Access curriculum modules, practical problem sets, and syllabus roadmaps.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {courses.map(course => (
            <div
              key={course.id}
              className="p-6 rounded-3xl bg-[#0F172A] border border-slate-800 hover:border-brand-500/40 transition-all space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded bg-brand-950 text-brand-300 border border-brand-500/30">
                    {course.category}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">{course.duration}</span>
                </div>

                <h3 className="font-display font-bold text-xl text-white">{course.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">{course.description}</p>

                {/* Progress bar */}
                <div className="space-y-1.5 pt-2">
                  <div className="flex justify-between text-xs text-slate-300 font-medium">
                    <span>Course Progress</span>
                    <span className="font-mono text-brand-400">{course.progress || 20}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-brand-500 rounded-full transition-all duration-500"
                      style={{ width: `${course.progress || 20}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Enrolled & Active</span>
                </span>

                <Link
                  to={`/courses/${course.slug}`}
                  className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold transition-colors flex items-center gap-1.5"
                >
                  <span>Open Syllabus</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Explore Other Courses */}
      <div className="space-y-6 pt-6 border-t border-slate-800">
        <div>
          <h2 className="font-display font-extrabold text-xl text-white">
            Explore Other MindMend Courses
          </h2>
          <p className="text-xs text-slate-400">
            Expand your career readiness with complementary modules in Data, Aptitude, or Communications.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {allCourses.filter(c => !enrolledCourseIds.has(c.id)).map(course => (
            <div
              key={course.id}
              className="p-5 rounded-2xl bg-[#0F172A] border border-slate-800 hover:border-slate-700 transition-all space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-900 text-slate-400">
                  {course.category}
                </span>
                <h4 className="font-bold text-sm text-white">{course.title}</h4>
                <p className="text-xs text-slate-400 line-clamp-2">{course.description}</p>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                <span className="text-xs text-slate-400 font-medium">{course.duration}</span>
                <Link
                  to={`/courses/${course.slug}`}
                  className="text-xs font-bold text-brand-400 hover:text-brand-300"
                >
                  Learn More →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
