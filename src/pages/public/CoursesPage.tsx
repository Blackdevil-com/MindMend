import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { Course } from '../../types/index';
import {
  BookOpen,
  Search,
  Clock,
  UserCheck,
  CheckCircle2,
  ChevronRight,
  Filter,
  GraduationCap,
  Sparkles,
  Star,
} from 'lucide-react';

export const CoursesPage: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/courses')
      .then(data => setCourses(data.courses || []))
      .catch(err => console.error('Failed to load courses', err))
      .finally(() => setLoading(false));
  }, []);

  const categories = ['All', 'Software Development', 'Data & Analytics', 'Data & Productivity', 'Placement Preparation', 'Career & Soft Skills'];

  const filteredCourses = courses.filter(c => {
    const matchesCat = selectedCategory === 'All' || c.category === selectedCategory;
    const matchesSearch =
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-12 py-10 pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 bg-[#FAFAFF] text-slate-900 font-sans">
      {/* 1. Header Banner */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-purple-100 border border-purple-200 text-[#6A1B9A] text-xs font-bold shadow-sm">
          <BookOpen className="w-3.5 h-3.5" />
          <span>Professional Training Curriculum</span>
        </div>
        <h1 className="font-display font-black text-4xl sm:text-5xl text-slate-900 tracking-tight">
          Career-Oriented Training Programs
        </h1>
        <p className="text-slate-600 text-sm sm:text-base leading-relaxed font-medium">
          Master in-demand technologies with industry-recognized curricula, practical labs, and live mentoring.
        </p>
      </div>

      {/* 2. Filters & Search */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-purple-100 shadow-sm">
        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                selectedCategory === cat
                  ? 'bg-[#6A1B9A] text-white shadow-md'
                  : 'bg-slate-100 text-slate-600 hover:bg-purple-50 hover:text-[#6A1B9A]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search input */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search courses or topics..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#6A1B9A]"
          />
        </div>
      </div>

      {/* 3. Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredCourses.map(course => (
          <div
            key={course.id}
            className="flex flex-col justify-between rounded-3xl bg-white border border-purple-100 hover:border-[#6A1B9A]/40 p-6 transition-all duration-300 shadow-sm hover:shadow-xl hover:-translate-y-1 space-y-6 group"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-purple-50 text-[#6A1B9A] border border-purple-100">
                  {course.category}
                </span>
                <span className="text-xs text-slate-500 flex items-center gap-1 font-medium">
                  <Clock className="w-3.5 h-3.5 text-[#6A1B9A]" />
                  {course.duration}
                </span>
              </div>

              <div>
                <h3 className="font-display font-extrabold text-2xl text-slate-900 group-hover:text-[#6A1B9A] transition-colors">
                  {course.title}
                </h3>
                <p className="text-xs text-slate-500 mt-2 line-clamp-3 leading-relaxed font-medium">
                  {course.description}
                </p>
              </div>

              {/* Module count */}
              <div className="p-3.5 rounded-xl bg-purple-50/60 border border-purple-100 text-xs text-slate-700 space-y-1">
                <div className="flex justify-between items-center font-bold text-slate-900">
                  <span>{course.modules?.length || 0} In-Depth Modules</span>
                  <span className="text-[#6A1B9A] font-mono text-[11px]">Comprehensive</span>
                </div>
                <p className="text-[11px] text-slate-500 font-medium">
                  Includes live coding exercises, assignments & tests.
                </p>
              </div>

              {/* Skills pill tags */}
              <div className="space-y-2">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Skills Covered:
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {course.skills_gained?.slice(0, 5).map((skill, sIdx) => (
                    <span
                      key={sIdx}
                      className="text-[11px] px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <div>
                <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Trainer</p>
                <p className="text-xs font-bold text-slate-800">{course.trainer_name || 'Senior Instructor'}</p>
              </div>

              <Link
                to={`/courses/${course.slug}`}
                className="px-4 py-2.5 rounded-xl bg-[#6A1B9A] hover:bg-[#52137a] text-white text-xs font-bold shadow-md flex items-center gap-1.5 transition-all"
              >
                <span>View Syllabus</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
