import React from 'react';
import { Link } from 'react-router-dom';
import {
  Target,
  Eye,
  CheckCircle2,
  Code,
  Users,
  Award,
  BookOpen,
  Briefcase,
  ShieldCheck,
  Zap,
  GraduationCap,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

export const AboutPage: React.FC = () => {
  const pillars = [
    {
      title: 'Practical Learning',
      desc: 'Hands-on live coding, spreadsheet problem sets, and real-time dashboard engineering over passive lectures.',
      icon: Code,
    },
    {
      title: 'Industry Skills',
      desc: 'Modern tech stacks including Java 17+, Power BI DAX modeling, Advanced Excel formulas, and corporate English.',
      icon: Zap,
    },
    {
      title: 'Expert Mentorship',
      desc: 'Learn directly from experienced practitioners who actively mentor you on project architecture and interviews.',
      icon: Users,
    },
    {
      title: 'Career Preparation',
      desc: 'Rigorous mock interview panels, resume reviews, group discussions, and behavioral STAR coaching.',
      icon: Briefcase,
    },
    {
      title: 'Continuous Assessment',
      desc: 'Regular timed test series, automated grading, and comprehensive performance analytics to track strengths and weaknesses.',
      icon: ShieldCheck,
    },
  ];

  return (
    <div className="space-y-20 py-10 pb-24 bg-[#FAFAFF] text-slate-900 font-sans">
      {/* 1. Header Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-100 border border-purple-200 text-[#6A1B9A] text-xs font-bold shadow-sm">
            <Sparkles className="w-3.5 h-3.5" />
            <span>About MindMend Academy</span>
          </div>
          <h1 className="font-display font-black text-4xl sm:text-5xl text-slate-900 tracking-tight leading-tight">
            Empowering the Next Generation of{' '}
            <span className="text-[#6A1B9A]">
              Industry-Ready Leaders
            </span>
          </h1>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed font-medium">
            MindMend Academy is a dedicated educational training and career acceleration institution. We specialize in transforming engineering, science, and management students into confident, highly competent professionals ready for campus recruitment and industry careers.
          </p>
        </div>
      </section>

      {/* 2. Mission & Vision Dual Cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Mission */}
          <div className="p-8 sm:p-10 rounded-3xl bg-white border border-purple-100 relative overflow-hidden space-y-4 shadow-sm hover:shadow-md transition-all">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-center text-[#6A1B9A] shadow-sm">
              <Target className="w-6 h-6" />
            </div>
            <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-slate-900">
              Our Mission
            </h2>
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed font-medium">
              Help students develop practical technical and professional skills required for modern careers. We deliver intensive, outcome-driven training that turns theoretical knowledge into demonstrable capabilities that employers actively look for.
            </p>
          </div>

          {/* Vision */}
          <div className="p-8 sm:p-10 rounded-3xl bg-white border border-purple-100 relative overflow-hidden space-y-4 shadow-sm hover:shadow-md transition-all">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-center text-[#6A1B9A] shadow-sm">
              <Eye className="w-6 h-6" />
            </div>
            <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-slate-900">
              Our Vision
            </h2>
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed font-medium">
              Build a community of confident, skilled and industry-ready students. We envision an educational ecosystem where every aspiring student has access to top-tier mentorship, verified projects, and measurable career outcomes.
            </p>
          </div>
        </div>
      </section>

      {/* 3. Five Core Pillars */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-slate-900 tracking-tight">
            Our Five Core Pillars of Excellence
          </h2>
          <p className="text-slate-500 text-sm font-medium">
            Everything we design at MindMend is built on these foundational standards of education.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {pillars.map((p, idx) => {
            const Icon = p.icon;
            return (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-white border border-purple-100 hover:border-[#6A1B9A]/30 transition-all space-y-4 group shadow-sm hover:shadow-lg hover:-translate-y-1"
              >
                <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-[#6A1B9A] group-hover:bg-[#6A1B9A] group-hover:text-white transition-all">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-display font-bold text-base text-slate-900 group-hover:text-[#6A1B9A] transition-colors">
                  {p.title}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed font-medium">{p.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. What We Provide */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-purple-50/80 via-white to-purple-50/80 border border-purple-100 space-y-8 shadow-sm">
          <div>
            <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-slate-900">
              What MindMend Academy Delivers
            </h2>
            <p className="text-slate-500 text-sm mt-1 font-medium">
              A complete end-to-end student enablement system designed for maximum placement conversion.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              'Industry-aligned syllabus in Java, Power BI, Excel, Aptitude, and English Communication',
              'Structured batch cohorts with dedicated trainer schedules and daily attendance tracking',
              'Integrated online examination engine with live countdown timer and instant evaluation',
              '3-Month verified internship tracks with real-world enterprise project assignments',
              'Comprehensive student performance dashboards with analytics & score progress charts',
              'Dedicated placement preparation modules including mock interviews and resume building',
            ].map((item, idx) => (
              <div key={idx} className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-slate-700 font-medium leading-relaxed">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Call to action */}
      <section className="max-w-4xl mx-auto px-4 text-center space-y-6">
        <div className="p-8 sm:p-12 rounded-3xl bg-[#180033] text-white shadow-xl space-y-6">
          <h2 className="font-display font-bold text-3xl text-white">
            Begin Your Career Transformation with MindMend
          </h2>
          <p className="text-purple-200 text-sm max-w-xl mx-auto font-medium">
            Join thousands of successful alumni who stepped into top software, analytics, and consulting roles.
          </p>
          <div className="flex flex-wrap justify-center gap-4 pt-2">
            <Link
              to="/register"
              className="px-8 py-3.5 rounded-xl bg-white text-[#6A1B9A] hover:bg-purple-50 font-bold text-sm shadow-md transition-all"
            >
              Create Student Account
            </Link>
            <Link
              to="/courses"
              className="px-8 py-3.5 rounded-xl border border-purple-400/40 text-purple-100 hover:bg-purple-900/40 font-semibold text-sm transition-all"
            >
              Browse All Courses
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
