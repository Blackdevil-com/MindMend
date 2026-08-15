import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { Course, Testimonial } from '../../types/index';
import {
  Sparkles,
  ArrowRight,
  Code,
  BarChart3,
  Video,
  Palette,
  Camera,
  Layout,
  Megaphone,
  Smartphone,
  CheckCircle2,
  Users,
  Award,
  BookOpen,
  Star,
  GraduationCap,
  ChevronDown,
  Play,
  MessageSquare,
  Send,
  HelpCircle,
  Briefcase,
} from 'lucide-react';

// Curly Swirl Decorative SVG component matching the design image
const CurlySwirl: React.FC<{ className?: string }> = ({ className = 'w-16 h-6 text-brand-600' }) => (
  <svg className={className} viewBox="0 0 100 30" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M5 15C15 5 25 25 35 15C45 5 55 25 65 15C75 5 85 25 95 15"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
    />
  </svg>
);

export const HomePage: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'live' | 'labs' | 'projects' | 'support'>('live');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  useEffect(() => {
    Promise.all([
      api.get('/courses'),
      api.get('/cms/testimonials'),
    ])
      .then(([courseData, testData]) => {
        setCourses(courseData.courses || []);
        setTestimonials(testData.testimonials || []);
      })
      .catch(err => console.error('Failed to load homepage data', err))
      .finally(() => setLoading(false));
  }, []);

  const categories = [
    { title: '2D Animation & Motion', count: '12 Courses', icon: Video },
    { title: 'Creative & Graphic Design', count: '18 Courses', icon: Palette },
    { title: 'Video Editing & VFX', count: '15 Courses', icon: Video },
    { title: 'Film Production & Cinematography', count: '10 Courses', icon: Camera },
    { title: 'UI/UX Design & Architecture', count: '24 Courses', icon: Layout },
    { title: 'Digital Marketing & Strategy', count: '16 Courses', icon: Megaphone },
    { title: 'Photography & Lighting', count: '14 Courses', icon: Camera },
    { title: 'Web Development & Mobile', count: '22 Courses', icon: Code },
  ];

  const mentors = [
    {
      name: 'Alex Morgan',
      role: 'Lead UX Architect',
      image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    },
    {
      name: 'Dr. Lin Chen',
      role: 'AI & Data Specialist',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    },
    {
      name: 'Emily Carter',
      role: 'Creative Director',
      image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
    },
    {
      name: 'Rian Patel',
      role: 'Fullstack Dev Lead',
      image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
    },
  ];

  const faqs = [
    {
      question: 'What types of courses are available on the platform?',
      answer: 'We offer practical, job-oriented tracks in Fullstack Web Engineering, Java Systems, Power BI & Data Analytics, UI/UX Architecture, Digital Marketing, and Placement Aptitude.',
    },
    {
      question: 'Is there a certificate awarded upon course completion?',
      answer: 'Yes! Every student who completes course projects and assessment milestones receives an industry-verified digital certificate shareable on LinkedIn and resumes.',
    },
    {
      question: 'How do the 1-on-1 mentorship & live sessions work?',
      answer: 'You can attend interactive live classes weekly, submit code assignments for direct trainer feedback, and schedule 1-on-1 doubt clearance sessions.',
    },
    {
      question: 'Are the courses accessible on mobile devices?',
      answer: 'Absolutely. Our responsive learning platform works seamlessly across desktop browsers, tablets, and mobile devices so you can learn anytime.',
    },
  ];

  return (
    <div className="space-y-24 pb-20 bg-[#FAFAFF] text-slate-900 overflow-x-hidden font-sans">
      {/* 1. HERO SECTION */}
      <section className="relative pt-10 pb-16 overflow-hidden">
        {/* Soft background glow */}
        <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-purple-100/60 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6">
              <h1 className="font-display font-black text-4xl sm:text-5xl lg:text-6xl text-slate-900 tracking-tight leading-[1.15]">
                Master{' '}
                <span className="relative inline-block text-[#6A1B9A]">
                  Creative Skills
                  <CurlySwirl className="absolute -bottom-2 left-0 w-full h-4 text-[#6A1B9A]" />
                </span>{' '}
                and Launch Your Career Now!!
              </h1>

              <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl font-medium">
                Unlock your potential with expert-led courses designed for modern skills, hands-on practical projects, and guaranteed career growth.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link
                  to="/register"
                  className="px-8 py-3.5 rounded-xl bg-[#6A1B9A] hover:bg-[#52137a] text-white font-bold text-base shadow-lg shadow-purple-900/20 transition-all transform hover:-translate-y-0.5 flex items-center gap-2"
                >
                  <span>Join Now</span>
                </Link>

                <Link
                  to="/courses"
                  className="px-8 py-3.5 rounded-xl border-2 border-[#6A1B9A] text-[#6A1B9A] hover:bg-purple-50 font-bold text-base transition-all"
                >
                  <span>Learn More</span>
                </Link>
              </div>

              {/* Avatar Rating Badge */}
              <div className="pt-6 flex items-center gap-4 border-t border-purple-100">
                <div className="flex -space-x-3 overflow-hidden">
                  <img
                    className="inline-block h-10 w-10 rounded-full ring-2 ring-white object-cover"
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80"
                    alt="Student"
                  />
                  <img
                    className="inline-block h-10 w-10 rounded-full ring-2 ring-white object-cover"
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80"
                    alt="Student"
                  />
                  <img
                    className="inline-block h-10 w-10 rounded-full ring-2 ring-white object-cover"
                    src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80"
                    alt="Student"
                  />
                  <img
                    className="inline-block h-10 w-10 rounded-full ring-2 ring-white object-cover"
                    src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80"
                    alt="Student"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-1 text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400" />
                    ))}
                    <span className="text-xs font-bold text-slate-800 ml-1">4.9/5 overall rating</span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium">Trusted by 10,000+ Students worldwide</p>
                </div>
              </div>
            </div>

            {/* Right Hero Image Frame */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                <div className="overflow-hidden rounded-3xl bg-slate-100 shadow-2xl border-4 border-white">
                  <img
                    src="/assets/hero_student.jpg"
                    alt="Smiling Student at Laptop"
                    className="w-full h-[420px] object-cover"
                  />
                </div>

                {/* Floating Play Badge */}
                <div className="absolute -bottom-5 -left-5 bg-white p-3 rounded-2xl shadow-xl flex items-center gap-3 border border-purple-100 animate-bounce">
                  <div className="w-12 h-12 rounded-full bg-[#6A1B9A] text-white flex items-center justify-center shadow-md">
                    <Play className="w-5 h-5 fill-white ml-0.5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">Watch Live Demo</p>
                    <p className="text-[10px] text-slate-500">2 Min Overview</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Brands ticker removed */}
        </div>
      </section>

      {/* 2. EXPLORE OVER 100+ ONLINE COURSES (CATEGORIES) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-3">
          <div className="flex items-center justify-center gap-2 text-[#6A1B9A]">
            <CurlySwirl className="w-12 h-5" />
          </div>
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-slate-900 tracking-tight">
            Explore Over 100+ Online Courses
          </h2>
          <p className="text-slate-500 text-sm max-w-xl mx-auto font-medium">
            Dive into specialized tracks meticulously built by tech leads and creative directors.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((cat, idx) => {
            const Icon = cat.icon;
            return (
              <div
                key={idx}
                className="bg-white p-6 rounded-2xl border border-purple-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group text-center space-y-4 cursor-pointer"
              >
                <div className="w-14 h-14 mx-auto rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-center text-[#6A1B9A] group-hover:bg-[#6A1B9A] group-hover:text-white transition-all">
                  <Icon className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-slate-900 text-lg group-hover:text-[#6A1B9A] transition-colors">
                    {cat.title}
                  </h3>
                  <p className="text-xs text-slate-400 font-medium mt-1">{cat.count}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. OUR COURSE HIGHLIGHTS / LIVE SESSIONS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center space-y-3">
          <div className="flex items-center justify-center gap-2 text-[#6A1B9A]">
            <CurlySwirl className="w-12 h-5" />
          </div>
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-slate-900 tracking-tight">
            Our Course Highlights
          </h2>
        </div>

        {/* Tab switcher */}
        <div className="flex flex-wrap items-center justify-center gap-2 max-w-3xl mx-auto p-1.5 bg-slate-100 rounded-2xl border border-slate-200">
          <button
            onClick={() => setActiveTab('live')}
            className={`px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === 'live'
                ? 'bg-[#6A1B9A] text-white shadow-md'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            1. Live Sessions
          </button>
          <button
            onClick={() => setActiveTab('labs')}
            className={`px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === 'labs'
                ? 'bg-[#6A1B9A] text-white shadow-md'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            2. Interactive Labs
          </button>
          <button
            onClick={() => setActiveTab('projects')}
            className={`px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === 'projects'
                ? 'bg-[#6A1B9A] text-white shadow-md'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            3. Real Projects
          </button>
          <button
            onClick={() => setActiveTab('support')}
            className={`px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === 'support'
                ? 'bg-[#6A1B9A] text-white shadow-md'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            4. 1-on-1 Support
          </button>
        </div>

        {/* Active Tab Card Container */}
        <div className="bg-gradient-to-r from-purple-50/80 via-white to-purple-50/80 rounded-3xl p-8 sm:p-12 border border-purple-100 shadow-lg">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Description */}
            <div className="lg:col-span-7 space-y-6">
              <h3 className="font-display font-extrabold text-2xl sm:text-3xl text-slate-900">
                {activeTab === 'live' && 'Live Interactive Sessions'}
                {activeTab === 'labs' && 'Interactive Hands-on Labs'}
                {activeTab === 'projects' && 'Real-World Production Projects'}
                {activeTab === 'support' && '1-on-1 Mentorship & Support'}
              </h3>

              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-purple-100 text-[#6A1B9A] flex items-center justify-center flex-shrink-0 mt-0.5 font-bold text-xs">
                    ✓
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed font-medium">
                    Engage directly with industry leaders during live interactive workshops and real-time code reviews.
                  </p>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-purple-100 text-[#6A1B9A] flex items-center justify-center flex-shrink-0 mt-0.5 font-bold text-xs">
                    ✓
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed font-medium">
                    Get immediate live Q&A clarification, collaborative coding sessions, and peer-to-peer breakout challenges.
                  </p>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-purple-100 text-[#6A1B9A] flex items-center justify-center flex-shrink-0 mt-0.5 font-bold text-xs">
                    ✓
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed font-medium">
                    Flexible scheduling with HD recorded catch-ups so you never miss a lecture.
                  </p>
                </li>
              </ul>
            </div>

            {/* Right Image */}
            <div className="lg:col-span-5">
              <div className="overflow-hidden rounded-2xl shadow-xl border-4 border-white">
                <img
                  src="/assets/live_student.jpg"
                  alt="Student Listening to Live Lecture"
                  className="w-full h-[280px] object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. OUR POPULAR ENROLLED COURSES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-3">
          <div className="flex items-center justify-center gap-2 text-[#6A1B9A]">
            <CurlySwirl className="w-12 h-5" />
          </div>
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-slate-900 tracking-tight">
            Our Popular Enrolled Courses
          </h2>
          <p className="text-slate-500 text-sm max-w-xl mx-auto font-medium">
            Hand-picked training programs designed to accelerate your placement readiness and technical command.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {courses.slice(0, 6).map((course, i) => {
            const courseImages = [
              'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=600&q=80',
              'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=600&q=80',
              'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=600&q=80',
              'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=600&q=80',
              'https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?auto=format&fit=crop&w=600&q=80',
              'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=600&q=80',
            ];
            const bgImage = courseImages[i % courseImages.length];

            return (
              <div
                key={course.id}
                className="bg-white rounded-2xl border border-purple-100 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  <div className="relative h-48 overflow-hidden bg-slate-100">
                    <img
                      src={bgImage}
                      alt={course.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <span className="absolute top-3 right-3 px-3 py-1 rounded-full bg-white/90 backdrop-blur-sm text-[11px] font-bold text-[#6A1B9A] shadow-sm">
                      {course.category}
                    </span>
                  </div>

                  <div className="p-6 space-y-3">
                    <div className="flex items-center gap-1 text-amber-400 text-xs font-bold">
                      <Star className="w-4 h-4 fill-amber-400" />
                      <span>4.9</span>
                      <span className="text-slate-400 font-normal ml-1">(1.2k reviews)</span>
                    </div>

                    <h3 className="font-display font-bold text-slate-900 text-lg group-hover:text-[#6A1B9A] transition-colors line-clamp-1">
                      {course.title}
                    </h3>

                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed font-medium">
                      {course.description}
                    </p>
                  </div>
                </div>

                <div className="p-6 pt-0 border-t border-slate-100 mt-4 flex items-center justify-end">
                  <Link
                    to={`/courses/${course.slug}`}
                    className="px-4 py-2 rounded-xl bg-[#6A1B9A] hover:bg-[#52137a] text-white text-xs font-bold shadow-md transition-all flex items-center gap-1"
                  >
                    <span>Enroll Now</span>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        <div className="text-center pt-4">
          <Link
            to="/courses"
            className="inline-flex items-center gap-2 px-8 py-3 rounded-xl border-2 border-[#6A1B9A] text-[#6A1B9A] hover:bg-purple-50 font-bold text-sm transition-all"
          >
            <span>View All Courses</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* 5. GET SKILLED & CERTIFIED (BANNER SECTION) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-r from-purple-100/90 via-purple-50 to-purple-100/90 border border-purple-200 p-8 sm:p-14 overflow-hidden relative shadow-lg">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white text-[#6A1B9A] text-xs font-bold shadow-sm">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Verified Career Certificate</span>
              </div>

              <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-slate-900 tracking-tight">
                Get Skilled & Certified by MindMend
              </h2>

              <p className="text-slate-600 text-base leading-relaxed font-medium">
                Empower your future by learning from industry leaders. Receive verifiable certifications upon completing practical coursework and capstones to stand out to global recruiters.
              </p>

              <div className="pt-2">
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-[#6A1B9A] hover:bg-[#52137a] text-white font-bold text-base shadow-lg shadow-purple-900/20 transition-all"
                >
                  <span>Join Now</span>
                </Link>
              </div>
            </div>

            <div className="lg:col-span-5 flex justify-center">
              <div className="overflow-hidden rounded-2xl border-4 border-white shadow-xl max-w-xs sm:max-w-sm">
                <img
                  src="/assets/certified_student.jpg"
                  alt="Certified Graduate Student"
                  className="w-full h-[320px] object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. TOP REVIEWED MENTORS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-3">
          <div className="flex items-center justify-center gap-2 text-[#6A1B9A]">
            <CurlySwirl className="w-12 h-5" />
          </div>
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-slate-900 tracking-tight">
            Top Reviewed Mentors
          </h2>
          <p className="text-slate-500 text-sm max-w-xl mx-auto font-medium">
            Learn from senior engineers, lead architects, and creative directors with proven field track records.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {mentors.map((m, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl border border-purple-100 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 text-center group"
            >
              <div className="h-56 overflow-hidden bg-slate-100">
                <img
                  src={m.image}
                  alt={m.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-5 space-y-1">
                <h3 className="font-display font-bold text-slate-900 text-lg group-hover:text-[#6A1B9A] transition-colors">
                  {m.name}
                </h3>
                <p className="text-xs text-slate-500 font-medium">{m.role}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 7. HEAR FROM OUR BELOVED STUDENTS (TESTIMONIALS) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-3">
          <div className="flex items-center justify-center gap-2 text-[#6A1B9A]">
            <CurlySwirl className="w-12 h-5" />
          </div>
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-slate-900 tracking-tight">
            Hear From Our Beloved Students
          </h2>
        </div>

        <div className="bg-gradient-to-r from-purple-100/60 via-purple-50 to-purple-100/60 p-8 sm:p-12 rounded-3xl border border-purple-100 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.slice(0, 6).map(tm => (
              <div
                key={tm.id}
                className="bg-white p-6 rounded-2xl border border-purple-100 shadow-sm flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center gap-1 text-amber-400">
                    {[...Array(tm.rating || 5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400" />
                    ))}
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed font-medium italic">
                    "{tm.content}"
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#6A1B9A] text-white flex items-center justify-center font-bold text-sm">
                    {tm.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-slate-900">{tm.name}</h4>
                    <p className="text-[11px] text-[#6A1B9A] font-semibold">{tm.role}</p>
                    <p className="text-[10px] text-slate-400 font-medium">{tm.company_or_college}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. CURIOUS MINDS: YOUR TOP QUESTIONS ANSWERED! (FAQ ACCORDION) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-3">
          <div className="flex items-center justify-center gap-2 text-[#6A1B9A]">
            <CurlySwirl className="w-12 h-5" />
          </div>
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-slate-900 tracking-tight">
            Curious Minds: Your Top Questions Answered!
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* FAQ Accordion */}
          <div className="lg:col-span-7 space-y-4">
            {faqs.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div
                  key={idx}
                  className="bg-white rounded-2xl border border-purple-100 overflow-hidden shadow-sm transition-all"
                >
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="w-full p-5 text-left font-bold text-slate-900 text-sm sm:text-base flex items-center justify-between gap-4 hover:text-[#6A1B9A] transition-colors"
                  >
                    <span>{faq.question}</span>
                    <ChevronDown
                      className={`w-5 h-5 text-[#6A1B9A] transition-transform duration-300 flex-shrink-0 ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 text-xs sm:text-sm text-slate-600 leading-relaxed font-medium border-t border-purple-50 pt-3">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Right Image */}
          <div className="lg:col-span-5">
            <div className="overflow-hidden rounded-3xl border-4 border-white shadow-xl">
              <img
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=600&q=80"
                alt="Students discussing FAQ"
                className="w-full h-[360px] object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 9. GET IN TOUCH! WE'RE HERE TO HELP AND CHAT! */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-3">
          <div className="flex items-center justify-center gap-2 text-[#6A1B9A]">
            <CurlySwirl className="w-12 h-5" />
          </div>
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-slate-900 tracking-tight">
            Get In Touch! We're Here to Help and Chat!
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="rounded-2xl overflow-hidden shadow-md h-64 relative group border border-purple-100">
            <img
              src="https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=600&q=80"
              alt="Classroom discussion"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent p-6 flex flex-col justify-end text-white">
              <h3 className="font-bold text-lg">Have Questions About Admissions?</h3>
              <p className="text-xs text-slate-200 font-medium">Our student advisors are ready to guide you.</p>
            </div>
          </div>

          {/* Card 2 */}
          <div className="rounded-2xl overflow-hidden shadow-md h-64 relative group border border-purple-100">
            <img
              src="https://images.unsplash.com/photo-1531545514256-b1400bc00f31?auto=format&fit=crop&w=600&q=80"
              alt="Mentorship conversation"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent p-6 flex flex-col justify-end text-white">
              <h3 className="font-bold text-lg">Corporate & Campus Hiring</h3>
              <p className="text-xs text-slate-200 font-medium">Partner with us for top engineering talent.</p>
            </div>
          </div>

          {/* Card 3 - Primary Purple Call Card */}
          <div className="rounded-2xl bg-[#6A1B9A] p-8 text-white flex flex-col justify-between shadow-xl space-y-6">
            <div className="space-y-3">
              <h3 className="font-display font-extrabold text-2xl">Connect In Person</h3>
              <p className="text-xs text-purple-100 leading-relaxed font-medium">
                Reach out to us via email or phone for batch timings, curriculum roadmaps, and internship details.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
                  <MessageSquare className="w-4 h-4 fill-white" />
                </div>
                <span className="text-xs font-semibold">mindmendtraining@gmail.com</span>
              </div>

              <Link
                to="/contact"
                className="w-full py-3 rounded-xl bg-white text-[#6A1B9A] font-bold text-center text-xs shadow-md hover:bg-purple-50 transition-colors flex items-center justify-center gap-2"
              >
                <span>Get In Touch</span>
                <Send className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

// Brand Icon Helpers
const MicrosoftLogo: React.FC = () => (
  <svg className="w-5 h-5 inline-block" viewBox="0 0 23 23" fill="currentColor">
    <path fill="#f35325" d="M1 1h10v10H1z"/>
    <path fill="#81bc06" d="M12 1h10v10H12z"/>
    <path fill="#05a6f0" d="M1 12h10v10H1z"/>
    <path fill="#ffba08" d="M12 12h10v10H12z"/>
  </svg>
);

const GoogleLogo: React.FC = () => (
  <svg className="w-5 h-5 inline-block" viewBox="0 0 24 24" fill="currentColor">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
  </svg>
);
