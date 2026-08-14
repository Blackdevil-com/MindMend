import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/common/Toast';
import { CheckoutModal } from '../../components/common/CheckoutModal';
import {
  BookOpen,
  Clock,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Layers,
  Search,
  PlusCircle,
  PlayCircle,
  Star,
} from 'lucide-react';

export const StudentCourses: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [courses, setCourses] = useState<any[]>([]);
  const [allCourses, setAllCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [selectedCourseTitle, setSelectedCourseTitle] = useState('');

  useEffect(() => {
    Promise.all([
      api.get('/students/dashboard-stats'),
      api.get('/courses'),
    ])
      .then(([studentData, catalogData]) => {
        setCourses(studentData.courses || [
          { id: 1, title: 'Envato Masterclass: Web UI & UX Design', category: 'Design', progress: 85, duration: '6 Weeks', description: 'Comprehensive guide to building production UI/UX using Figma and modern frontend design principles.', slug: 'full-stack-web-development' },
          { id: 2, title: 'Mastering Git & Vercel Deployment', category: 'DevOps', progress: 60, duration: '4 Weeks', description: 'Master Git version control, GitHub Actions CI/CD pipelines, and serverless hosting on Vercel.', slug: 'power-bi-data-analytics' },
        ]);
        setAllCourses(catalogData.courses || [
          { id: 3, title: 'Java Enterprise Microservices & Spring Boot', category: 'Backend', duration: '8 Weeks', description: 'Build enterprise RESTful web services with Java, Spring Boot 3, and PostgreSQL.', slug: 'java-full-stack' },
          { id: 4, title: 'Python for Data Science & Machine Learning', category: 'AI & Data', duration: '10 Weeks', description: 'Pandas, NumPy, Scikit-learn, and predictive modeling for industry applications.', slug: 'aptitude-reasoning' },
        ]);
      })
      .catch(err => console.error('Failed to load student courses', err))
      .finally(() => setLoading(false));
  }, []);

  const handleEnrollCourse = (courseTitle: string) => {
    setSelectedCourseTitle(courseTitle);
    setCheckoutOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#6A1B9A] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const enrolledCourseIds = new Set(courses.map(c => c.id));
  const filteredAll = allCourses.filter(c =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-10 max-w-6xl mx-auto pb-12 select-none">
      {/* Top Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#6A1B9A] via-[#52147C] to-[#2A0642] border border-[#8E24AA]/40 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-extrabold px-3 py-1 rounded-full bg-white/20 uppercase tracking-widest">
              My Academic Tracks
            </span>
          </div>
          <h1 className="font-display font-black text-2xl sm:text-3xl">
            My Enrolled Training Courses
          </h1>
          <p className="text-xs sm:text-sm text-purple-100 opacity-90 max-w-xl">
            Access curriculum modules, live interactive lectures, and certified project assignments.
          </p>
        </div>

        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-300 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search catalog..."
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white/10 border border-white/20 text-xs text-white placeholder-slate-300 focus:outline-none focus:bg-white/20"
          />
        </div>
      </div>

      {/* 1. Enrolled Courses Grid */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="font-display font-extrabold text-xl text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-[#8E24AA]" />
            <span>Active Courses ({courses.length})</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {courses.map(course => (
            <div
              key={course.id}
              className="p-6 rounded-3xl bg-[#120B20] border border-[#2A1A4A] hover:border-[#6A1B9A]/60 transition-all space-y-4 flex flex-col justify-between shadow-lg"
            >
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold px-3 py-1 rounded-full bg-[#6A1B9A]/20 text-brand-300 border border-[#6A1B9A]/40 uppercase tracking-wider">
                    {course.category || 'Development'}
                  </span>
                  <span className="text-xs text-slate-400 font-mono flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {course.duration || '6 Weeks'}
                  </span>
                </div>

                <h3 className="font-display font-bold text-lg text-white">{course.title}</h3>
                <p className="text-xs text-slate-300 leading-relaxed line-clamp-2">{course.description}</p>

                {/* Progress bar */}
                <div className="space-y-1.5 pt-2">
                  <div className="flex justify-between text-xs text-slate-300 font-medium">
                    <span>Course Completion Progress</span>
                    <span className="font-mono text-brand-300 font-bold">{course.progress || 70}%</span>
                  </div>
                  <div className="w-full h-2.5 bg-[#0A0612] rounded-full overflow-hidden border border-[#2A1A4A]">
                    <div
                      className="h-full bg-gradient-to-r from-[#6A1B9A] to-[#8E24AA] rounded-full transition-all duration-500"
                      style={{ width: `${course.progress || 70}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-[#2A1A4A] flex items-center justify-between">
                <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Enrolled & Active</span>
                </span>

                <Link
                  to={`/courses/${course.slug || 'full-stack-web-development'}`}
                  className="px-4 py-2 rounded-xl bg-[#6A1B9A] hover:bg-[#8E24AA] text-white text-xs font-bold transition-all shadow-glow-sm flex items-center gap-1.5"
                >
                  <span>Open Syllabus</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Explore Other Catalog Courses */}
      <div className="space-y-6 pt-6 border-t border-[#2A1A4A]">
        <div>
          <h2 className="font-display font-extrabold text-xl text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#8E24AA]" />
            <span>Explore Enterprise Catalog</span>
          </h2>
          <p className="text-xs text-slate-400">
            Expand your job readiness with accredited certifications in Cloud, Backend, and AI.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAll.filter(c => !enrolledCourseIds.has(c.id)).map(course => (
            <div
              key={course.id}
              className="p-5 rounded-3xl bg-[#120B20] border border-[#2A1A4A] hover:border-[#6A1B9A]/50 transition-all space-y-4 flex flex-col justify-between shadow-md"
            >
              <div className="space-y-2">
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#1A0E30] text-slate-400 border border-[#2A1A4A]">
                  {course.category}
                </span>
                <h4 className="font-bold text-sm text-white">{course.title}</h4>
                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{course.description}</p>
              </div>

              <div className="pt-3 border-t border-[#2A1A4A] flex items-center justify-between">
                <span className="text-xs text-slate-400 font-medium">{course.duration}</span>
                <button
                  onClick={() => handleEnrollCourse(course.title)}
                  className="px-3 py-1.5 rounded-xl bg-[#6A1B9A] hover:bg-[#8E24AA] text-white text-xs font-bold transition-all shadow-glow-sm flex items-center gap-1"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Enroll</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Checkout Payment Modal */}
      <CheckoutModal
        isOpen={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        planName={selectedCourseTitle || 'Enterprise Course Enrollment'}
        price="₹2,499"
      />
    </div>
  );
};
