import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/common/Toast';
import { CheckoutModal } from '../../components/common/CheckoutModal';
import { VirtualClassroomModal } from '../../components/common/VirtualClassroomModal';
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
  Plus,
  ChevronLeft,
  ChevronRight,
  Star,
  Sparkles,
  CheckSquare,
  PlayCircle,
  Video,
  ListTodo,
} from 'lucide-react';

export const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Modal triggers
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [classroomOpen, setClassroomOpen] = useState(false);
  const [activeClassTitle, setActiveClassTitle] = useState('Full-Stack React & Node.js Workshop');

  // Interactive Tasks State
  const [tasks, setTasks] = useState<any[]>([]);

  const [taskFilter, setTaskFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [newTaskText, setNewTaskText] = useState('');
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);

  // Interactive Calendar State
  const [currentMonth, setCurrentMonth] = useState('November 2026');
  const [selectedDay, setSelectedDay] = useState(14);

  // Daily Schedule Timeline State (computed dynamically)

  useEffect(() => {
    api.get('/students/dashboard-stats')
      .then(res => setData(res))
      .catch(err => console.error('Failed to load student dashboard stats', err))
      .finally(() => setLoading(false));
  }, []);

  const toggleTaskStatus = (id: number) => {
    setTasks(prev =>
      prev.map(t => {
        if (t.id === id) {
          const nextStatus = t.status === 'completed' ? 'pending' : 'completed';
          showToast(
            nextStatus === 'completed' ? 'Task marked as completed! 🎉' : 'Task marked as pending',
            undefined,
            'success'
          );
          return { ...t, status: nextStatus };
        }
        return t;
      })
    );
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskText.trim()) return;

    setTasks(prev => [
      ...prev,
      {
        id: Date.now(),
        text: newTaskText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'pending',
        category: 'Personal Study',
      },
    ]);
    setNewTaskText('');
    setShowAddTaskModal(false);
    showToast('New study task added!', undefined, 'success');
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#6A1B9A] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const student = data?.student || user?.profile;
  const stats = data?.stats || {};
  const courses = data?.courses || [];
  const scheduleItems = data?.batch ? [
    { time: data.batch.timing || '09:00 AM - 11:30 AM', title: `${data.batch.name} Batch Session`, trainer: 'Lead Instructor', status: 'Active', live: true }
  ] : [];

  const filteredTasks = tasks.filter(t => {
    if (taskFilter === 'completed') return t.status === 'completed';
    if (taskFilter === 'pending') return t.status === 'pending';
    return true;
  });

  return (
    <div className="space-y-8 pb-12 select-none">
      {/* 1. VIP Hero Banner (Matching Purple Light Image Layout) */}
      <div className="p-6 sm:p-8 rounded-3xl bg-purple-gradient text-white shadow-xl relative overflow-hidden">
        {/* Background Decorative Graphic */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-white/10 backdrop-blur-2xl rounded-l-full pointer-events-none hidden md:block"></div>

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-black px-3 py-1 rounded-full bg-white/20 text-white tracking-wider flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>UNLOCKED PREMIUM VIP</span>
              </span>
              <div className="flex items-center text-amber-300 gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-amber-300" />
                ))}
              </div>
            </div>

            <h1 className="font-display font-black text-2xl sm:text-3xl lg:text-4xl leading-tight">
              Unlock High-Level Access & Enterprise Skills 
            </h1>

            <p className="text-xs sm:text-sm text-purple-100 opacity-95 leading-relaxed">
              Welcome back, <strong className="text-white">{student?.full_name || user?.full_name}</strong>! Access live virtual classes, interactive quizzes, and career placement mentorship.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <button
              onClick={() => setCheckoutOpen(true)}
              className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-white text-[#6A1B9A] hover:bg-purple-50 font-black text-xs shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-[#6A1B9A]" />
              <span>Upgrade to VIP All-Access</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Key Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-purple-100 shadow-[0_4px_20px_-2px_rgba(106,27,154,0.05)] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-semibold">Courses Enrolled</span>
            <BookOpen className="w-4 h-4 text-[#6A1B9A]" />
          </div>
          <p className="font-display font-black text-2xl text-slate-900">{stats.enrolled_courses || 0}</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-purple-100 shadow-[0_4px_20px_-2px_rgba(106,27,154,0.05)] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-semibold">Tests Attempted</span>
            <FileCheck2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="font-display font-black text-2xl text-slate-900">{stats.tests_completed || 0}</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-purple-100 shadow-[0_4px_20px_-2px_rgba(106,27,154,0.05)] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-semibold">Average Score</span>
            <Award className="w-4 h-4 text-amber-500" />
          </div>
          <p className="font-display font-black text-2xl text-slate-900">{stats.average_score || 0}%</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-purple-100 shadow-[0_4px_20px_-2px_rgba(106,27,154,0.05)] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-semibold">Attendance Rate</span>
            <CalendarCheck className="w-4 h-4 text-cyan-600" />
          </div>
          <p className="font-display font-black text-2xl text-slate-900">{stats.attendance_percentage || 100}%</p>
        </div>
      </div>

      {/* 3. Main Dashboard Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT COLUMN (2 Cols): My Courses & Today's Tasks */}
        <div className="lg:col-span-2 space-y-8">
          {/* Section A: My Enrolled Courses */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-display font-black text-xl text-slate-900">My Enrolled Courses</h3>
                <p className="text-xs text-slate-500 font-medium">Track module completion and view syllabus</p>
              </div>
              <Link to="/student/courses" className="text-xs font-bold text-[#6A1B9A] hover:underline">
                View All Courses
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {courses.map((c: any) => (
                <div
                  key={c.id}
                  className="p-5 rounded-2xl bg-white border border-purple-100 hover:border-[#6A1B9A]/40 transition-all space-y-4 shadow-[0_4px_20px_-2px_rgba(106,27,154,0.05)]"
                >
                  <div className="flex items-start justify-between">
                    <span className="px-2.5 py-1 rounded-lg bg-[#F5EFFB] text-[#6A1B9A] border border-purple-200 text-[10px] font-bold">
                      {c.category}
                    </span>
                    <span className="text-xs font-mono font-bold text-[#6A1B9A]">{c.progress || 75}%</span>
                  </div>

                  <div>
                    <h4 className="font-extrabold text-sm text-slate-900 line-clamp-1">{c.title}</h4>
                    <p className="text-xs text-slate-500 mt-1">Instructor: {c.instructor || 'Staff Trainer'}</p>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1">
                    <div className="w-full h-2 bg-purple-50 rounded-full overflow-hidden border border-purple-100">
                      <div
                        className="h-full bg-purple-gradient rounded-full transition-all duration-500"
                        style={{ width: `${c.progress || 75}%` }}
                      />
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-1">
                    <Link
                      to="/student/courses"
                      className="px-3.5 py-1.5 rounded-xl bg-[#6A1B9A] hover:bg-[#8E24AA] text-white text-xs font-bold transition-all shadow-glow-sm flex items-center gap-1.5"
                    >
                      <PlayCircle className="w-3.5 h-3.5" />
                      <span>Continue</span>
                    </Link>

                    <Link
                      to="/student/courses"
                      className="text-xs font-semibold text-slate-600 hover:text-[#6A1B9A] flex items-center gap-1"
                    >
                      <span>Syllabus</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section B: Today's Tasks Checklist */}
          <div className="p-6 rounded-3xl bg-white border border-purple-100 shadow-[0_4px_20px_-2px_rgba(106,27,154,0.05)] space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-purple-gradient text-white flex items-center justify-center shadow-md">
                  <CheckSquare className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display font-black text-lg text-slate-900">Today's Tasks</h3>
                  <p className="text-xs text-slate-500 font-medium">Interactive study checklist for today</p>
                </div>
              </div>

              {/* Task Filters & Add Button */}
              <div className="flex items-center gap-2">
                <div className="flex p-1 rounded-xl bg-[#F5EFFB] border border-purple-100 text-xs font-bold">
                  {(['all', 'pending', 'completed'] as const).map(tab => (
                    <button
                      key={tab}
                      onClick={() => setTaskFilter(tab)}
                      className={`px-3 py-1 rounded-lg capitalize transition-all ${
                        taskFilter === tab ? 'bg-[#6A1B9A] text-white shadow-sm' : 'text-slate-600 hover:text-[#6A1B9A]'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setShowAddTaskModal(true)}
                  className="p-2 rounded-xl bg-[#6A1B9A] hover:bg-[#8E24AA] text-white text-xs font-bold transition-all shadow-glow-sm"
                  title="Add Task"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Task Items List */}
            <div className="space-y-3">
              {filteredTasks.map(t => (
                <div
                  key={t.id}
                  onClick={() => toggleTaskStatus(t.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-4 ${
                    t.status === 'completed'
                      ? 'bg-[#F9F6FC] border-purple-100 opacity-80'
                      : 'bg-white border-purple-200 hover:border-[#6A1B9A] shadow-sm'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-colors ${
                        t.status === 'completed'
                          ? 'bg-[#6A1B9A] border-[#6A1B9A] text-white'
                          : 'border-purple-300 bg-white'
                      }`}
                    >
                      {t.status === 'completed' && <CheckCircle2 className="w-4 h-4" />}
                    </div>
                    <div>
                      <p
                        className={`text-xs font-extrabold ${
                          t.status === 'completed' ? 'text-slate-400 line-through' : 'text-slate-900'
                        }`}
                      >
                        {t.text}
                      </p>
                      <span className="text-[10px] text-[#6A1B9A] font-mono font-semibold">{t.category}</span>
                    </div>
                  </div>

                  <span className="text-[11px] font-mono text-slate-500 font-semibold">{t.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN (1 Col): Mini Calendar & Timetable Timeline */}
        <div className="space-y-8">
          {/* Widget 1: Interactive Mini Calendar */}
          <div className="p-6 rounded-3xl bg-white border border-purple-100 shadow-[0_4px_20px_-2px_rgba(106,27,154,0.05)] space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-display font-black text-base text-slate-900">{currentMonth}</h4>
              <div className="flex items-center gap-1">
                <button className="p-1 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-purple-50">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button className="p-1 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-purple-50">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Calendar Days Grid */}
            <div className="grid grid-cols-7 gap-1 text-center text-xs">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d, i) => (
                <span key={i} className="text-[10px] font-bold text-slate-400 uppercase py-1">
                  {d}
                </span>
              ))}

              {[...Array(30)].map((_, i) => {
                const dayNum = i + 1;
                const isSelected = dayNum === selectedDay;
                return (
                  <button
                    key={i}
                    onClick={() => setSelectedDay(dayNum)}
                    className={`py-2 rounded-xl text-xs font-bold transition-all ${
                      isSelected
                        ? 'bg-[#6A1B9A] text-white shadow-glow-purple scale-105'
                        : 'text-slate-700 hover:bg-purple-50 hover:text-[#6A1B9A]'
                    }`}
                  >
                    {dayNum}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Widget 2: Today's Schedule & Live Class Launcher */}
          <div className="p-6 rounded-3xl bg-white border border-purple-100 shadow-[0_4px_20px_-2px_rgba(106,27,154,0.05)] space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-display font-black text-base text-slate-900 flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#6A1B9A]" />
                <span>My Timetable</span>
              </h4>
              <span className="text-[10px] font-bold text-[#6A1B9A] uppercase bg-purple-50 px-2 py-0.5 rounded border border-purple-100">Nov {selectedDay}</span>
            </div>

            {/* Timeline Items */}
            <div className="space-y-3 relative before:absolute before:left-3 before:top-3 before:bottom-3 before:w-0.5 before:bg-purple-100">
              {scheduleItems.map((item, idx) => (
                <div key={idx} className="relative pl-8 space-y-1">
                  <div
                    className={`absolute left-1.5 top-1.5 w-3 h-3 rounded-full border-2 border-white ${
                      item.live ? 'bg-rose-500 animate-ping' : item.status === 'Completed' ? 'bg-[#6A1B9A]' : 'bg-slate-300'
                    }`}
                  ></div>

                  <div className="p-3.5 rounded-2xl bg-[#FAFAFE] border border-purple-100 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono text-[#6A1B9A] font-bold">{item.time}</span>
                      <span
                        className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ${
                          item.live
                            ? 'bg-rose-100 text-rose-700 border border-rose-200'
                            : item.status === 'Completed'
                            ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {item.status}
                      </span>
                    </div>

                    <h5 className="font-extrabold text-xs text-slate-900 leading-snug">{item.title}</h5>

                    {/* Join Live Classroom Button Hidden */}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Add Task Modal */}
      {showAddTaskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white border border-purple-100 rounded-3xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <h4 className="font-display font-black text-lg text-slate-900">Add New Learning Task</h4>
            <form onSubmit={handleAddTask} className="space-y-4">
              <input
                type="text"
                value={newTaskText}
                onChange={e => setNewTaskText(e.target.value)}
                placeholder="e.g. Solve 5 LeetCode Array Problems"
                className="w-full px-4 py-3 rounded-xl bg-[#F5EFFB] border border-purple-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#6A1B9A]"
                autoFocus
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddTaskModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[#6A1B9A] hover:bg-[#8E24AA] text-white font-bold text-xs shadow-glow-purple"
                >
                  Save Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIP Checkout Modal */}
      <CheckoutModal isOpen={checkoutOpen} onClose={() => setCheckoutOpen(false)} />

      {/* Virtual Classroom Video Call Modal */}
      <VirtualClassroomModal
        isOpen={classroomOpen}
        onClose={() => setClassroomOpen(false)}
        className={activeClassTitle}
      />
    </div>
  );
};
