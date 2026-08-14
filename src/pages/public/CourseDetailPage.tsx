import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { Course, Batch } from '../../types/index';
import { Modal } from '../../components/common/Modal';
import {
  BookOpen,
  Clock,
  UserCheck,
  CheckCircle2,
  Calendar,
  Layers,
  ArrowRight,
  ShieldCheck,
  Award,
  ChevronDown,
  ChevronUp,
  Sparkles,
} from 'lucide-react';

export const CourseDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();
  const { showToast } = useNotification();
  const navigate = useNavigate();

  const [course, setCourse] = useState<Course | null>(null);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedModules, setExpandedModules] = useState<Record<number, boolean>>({ 0: true, 1: true });
  const [enrollModalOpen, setEnrollModalOpen] = useState(false);
  const [enrolling, setEnrolling] = useState(false);

  useEffect(() => {
    if (slug) {
      api.get(`/courses/${slug}`)
        .then(data => {
          setCourse(data.course);
          setBatches(data.batches || []);
        })
        .catch(err => {
          console.error('Failed to load course details', err);
          showToast('Could not load course details', 'error');
        })
        .finally(() => setLoading(false));
    }
  }, [slug]);

  const toggleModule = (idx: number) => {
    setExpandedModules(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  const handleEnroll = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (user.role !== 'student') {
      showToast('Only students can enroll in courses', 'warning');
      return;
    }

    setEnrolling(true);
    try {
      await api.post('/students/assign-course', {
        student_id: user.student_internal_id || user.id,
        course_id: course?.id,
      });
      showToast(`Successfully enrolled in ${course?.title}!`, 'success', 'Enrollment Confirmed');
      setEnrollModalOpen(false);
      navigate('/student/courses');
    } catch (err: any) {
      showToast(err.message || 'Failed to enroll', 'error');
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#6A1B9A] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="max-w-xl mx-auto my-20 p-8 rounded-3xl bg-white border border-purple-100 text-center space-y-4 shadow-sm">
        <h2 className="text-xl font-bold text-slate-900">Course Not Found</h2>
        <p className="text-sm text-slate-500 font-medium">The requested course could not be located.</p>
        <Link to="/courses" className="inline-block px-6 py-2.5 bg-[#6A1B9A] rounded-xl text-white text-xs font-bold shadow-md">
          Return to Courses
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pb-24 space-y-12 bg-[#FAFAFF] text-slate-900 font-sans">
      {/* 1. Course Header Hero */}
      <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-purple-100/90 via-purple-50 to-purple-100/90 border border-purple-200 shadow-sm relative overflow-hidden">
        <div className="max-w-3xl space-y-5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-white text-[#6A1B9A] shadow-sm">
              {course.category}
            </span>
            <span className="text-xs text-slate-600 font-medium flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-[#6A1B9A]" />
              {course.duration}
            </span>
          </div>

          <h1 className="font-display font-black text-3xl sm:text-5xl text-slate-900 tracking-tight leading-tight">
            {course.title}
          </h1>

          <p className="text-slate-600 text-sm sm:text-base leading-relaxed font-medium">
            {course.description}
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-4">
            <button
              onClick={() => setEnrollModalOpen(true)}
              className="px-8 py-3.5 rounded-xl bg-[#6A1B9A] hover:bg-[#52137a] text-white font-bold text-sm shadow-lg shadow-purple-900/20 transition-all transform hover:-translate-y-0.5"
            >
              Enroll in this Course
            </button>
            <Link
              to="/courses"
              className="px-6 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-sm font-bold border border-slate-200 shadow-sm transition-colors"
            >
              All Courses
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Grid Layout: Curriculum + Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Left 2 Cols: Modules & Syllabus */}
        <div className="lg:col-span-2 space-y-8">
          <div>
            <h2 className="font-display font-extrabold text-2xl text-slate-900">
              Course Curriculum & Modules
            </h2>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              Click each module to view detailed topics and hands-on deliverables.
            </p>
          </div>

          <div className="space-y-4">
            {course.modules?.map((mod, idx) => {
              const isExpanded = expandedModules[idx];
              return (
                <div
                  key={idx}
                  className="rounded-2xl bg-white border border-purple-100 overflow-hidden shadow-sm transition-all"
                >
                  <button
                    onClick={() => toggleModule(idx)}
                    className="w-full p-5 text-left flex items-center justify-between hover:bg-purple-50/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-lg bg-purple-100 text-[#6A1B9A] flex items-center justify-center font-bold text-xs font-mono">
                        {String(idx + 1).padStart(2, '0')}
                      </span>
                      <h3 className="font-bold text-sm sm:text-base text-slate-900">{mod.title}</h3>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-[#6A1B9A]" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-slate-400" />
                    )}
                  </button>

                  {isExpanded && (
                    <div className="px-5 pb-5 pt-1 border-t border-purple-50 bg-slate-50/60">
                      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-slate-700 font-medium">
                        {mod.topics?.map((topic, tIdx) => (
                          <li key={tIdx} className="flex items-start gap-2">
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#6A1B9A] flex-shrink-0 mt-0.5" />
                            <span>{topic}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Skills Acquired */}
          <div className="p-6 rounded-2xl bg-white border border-purple-100 shadow-sm space-y-4">
            <h3 className="font-display font-bold text-lg text-slate-900">Skills You Will Master</h3>
            <div className="flex flex-wrap gap-2">
              {course.skills_gained?.map((skill, sIdx) => (
                <span
                  key={sIdx}
                  className="px-3.5 py-1.5 rounded-xl bg-purple-50 border border-purple-100 text-[#6A1B9A] text-xs font-bold"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Trainer & Batches */}
        <div className="space-y-6">
          {/* Trainer Card */}
          <div className="p-6 rounded-2xl bg-white border border-purple-100 shadow-sm space-y-4">
            <h3 className="font-display font-bold text-xs text-slate-400 uppercase tracking-wider">
              Lead Instructor
            </h3>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-[#6A1B9A] text-white flex items-center justify-center font-bold text-lg shadow-md">
                {course.trainer_name?.charAt(0) || 'T'}
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900">{course.trainer_name || 'Senior Instructor'}</h4>
                <p className="text-xs text-[#6A1B9A] font-semibold">{course.trainer_designation || 'MindMend Lead Trainer'}</p>
                {course.trainer_email && (
                  <p className="text-[11px] text-slate-400 font-medium">{course.trainer_email}</p>
                )}
              </div>
            </div>
          </div>

          {/* Active Batches */}
          <div className="p-6 rounded-2xl bg-white border border-purple-100 shadow-sm space-y-4">
            <h3 className="font-display font-bold text-xs text-slate-400 uppercase tracking-wider">
              Upcoming Cohort Batches
            </h3>
            {batches.length === 0 ? (
              <p className="text-xs text-slate-500 font-medium">New batch schedules will be announced shortly.</p>
            ) : (
              <div className="space-y-3">
                {batches.map(b => (
                  <div key={b.id} className="p-3.5 rounded-xl bg-purple-50/60 border border-purple-100 space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="font-mono text-xs font-bold text-[#6A1B9A]">{b.name}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 font-bold border border-emerald-200">
                        Enrollments Open
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 font-medium flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-[#6A1B9A]" />
                      {b.timing}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Enroll Modal */}
      <Modal
        isOpen={enrollModalOpen}
        onClose={() => setEnrollModalOpen(false)}
        title={`Confirm Enrollment: ${course.title}`}
        subtitle="Join the training program to access live batches, curriculum, and tests."
      >
        <div className="space-y-5">
          <div className="p-4 rounded-xl bg-purple-50 border border-purple-100 space-y-2 text-xs text-slate-700 font-medium">
            <div className="flex justify-between text-slate-900 font-bold">
              <span>Course:</span>
              <span>{course.title}</span>
            </div>
            <div className="flex justify-between">
              <span>Duration:</span>
              <span>{course.duration}</span>
            </div>
            <div className="flex justify-between">
              <span>Instructor:</span>
              <span>{course.trainer_name || 'Senior Specialist'}</span>
            </div>
          </div>

          {!user ? (
            <div className="space-y-3 text-center">
              <p className="text-xs text-amber-700 font-semibold">You must be logged in as a student to enroll.</p>
              <div className="grid grid-cols-2 gap-3">
                <Link
                  to="/login"
                  className="py-2.5 px-4 rounded-xl bg-slate-100 text-slate-800 text-xs font-bold text-center hover:bg-slate-200"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="py-2.5 px-4 rounded-xl bg-[#6A1B9A] text-white text-xs font-bold text-center shadow-md"
                >
                  Register Student
                </Link>
              </div>
            </div>
          ) : (
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setEnrollModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200"
              >
                Cancel
              </button>
              <button
                onClick={handleEnroll}
                disabled={enrolling}
                className="px-6 py-2 rounded-xl bg-[#6A1B9A] hover:bg-[#52137a] text-white text-xs font-bold shadow-md flex items-center gap-2"
              >
                {enrolling ? 'Enrolling...' : 'Confirm Enrollment'}
              </button>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};
