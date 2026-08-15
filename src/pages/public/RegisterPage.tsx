import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../../assets/logo.png';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import confetti from 'canvas-confetti';
import {
  GraduationCap,
  User,
  Mail,
  Phone,
  Lock,
  Building,
  BookOpen,
  Calendar,
  CheckCircle2,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const { registerStudent } = useAuth();
  const { showToast } = useNotification();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    mobile: '',
    password: '',
    confirm_password: '',
    college_name: '',
    degree: 'B.Tech',
    department: 'Computer Science',
    year_of_study: '3rd Year',
  });

  const [loading, setLoading] = useState(false);
  const [createdStudent, setCreatedStudent] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirm_password) {
      showToast('Passwords do not match', 'error');
      return;
    }

    if (formData.password.length < 6) {
      showToast('Password must be at least 6 characters', 'warning');
      return;
    }

    setLoading(true);
    try {
      const response = await registerStudent(formData);
      setCreatedStudent(response.user);

      // Trigger confetti celebration
      confetti({
        particleCount: 120,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#6A1B9A', '#9C27B0', '#BA68C8', '#10B981'],
      });

      showToast('Your student profile has been created successfully!', 'success', 'Registration Complete');
    } catch (err: any) {
      showToast(err.message || 'Registration failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 bg-[#FAFAFF]">
      <div className="w-full max-w-2xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-3">
          <Link to="/" className="inline-flex items-center justify-center">
            <img src={logo} alt="MindMend Academy Logo" className="h-14 w-auto object-contain" />
          </Link>
          <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-slate-900">
            Create Your Student Account
          </h2>
          <p className="text-xs text-slate-500 font-medium max-w-md mx-auto">
            Join MindMend Academy to get your official Student ID, enroll in training cohorts, and take online assessments.
          </p>
        </div>

        {/* Success Modal / Banner when Student ID is generated */}
        {createdStudent ? (
          <div className="p-8 rounded-3xl bg-white border border-purple-200 shadow-xl text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-purple-50 border border-purple-200 flex items-center justify-center text-[#6A1B9A] mx-auto">
              <Sparkles className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                Registration Successful
              </span>
              <h3 className="font-display font-black text-2xl text-slate-900">
                Welcome, {createdStudent.full_name}!
              </h3>
              <p className="text-xs text-slate-600 font-medium">
                Your unique Student ID has been generated:
              </p>
              <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200 inline-block font-mono font-black text-2xl text-[#6A1B9A] tracking-wider">
                {createdStudent.student_id}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 text-left space-y-1.5 max-w-md mx-auto font-medium">
              <p><strong className="text-slate-900">Email:</strong> {createdStudent.email}</p>
              <p><strong className="text-slate-900">College:</strong> {createdStudent.college_name}</p>
              <p><strong className="text-slate-900">Program:</strong> {createdStudent.degree} - {createdStudent.department} ({createdStudent.year_of_study})</p>
            </div>

            <button
              onClick={() => navigate('/student/dashboard')}
              className="px-8 py-3.5 rounded-xl bg-[#6A1B9A] hover:bg-[#52137a] text-white font-bold text-sm shadow-md transition-all inline-flex items-center gap-2"
            >
              <span>Go to Student Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="p-8 rounded-3xl bg-white border border-purple-100 shadow-xl space-y-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Personal Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Full Name *</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={formData.full_name}
                      onChange={e => setFormData({ ...formData, full_name: e.target.value })}
                      placeholder="e.g. Aakash Patel"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#6A1B9A]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Email Address *</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={e => setFormData({ ...formData, email: e.target.value })}
                      placeholder="student@college.edu"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#6A1B9A]"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Mobile Number *</label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      required
                      value={formData.mobile}
                      onChange={e => setFormData({ ...formData, mobile: e.target.value })}
                      placeholder="+91 98765 43210"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#6A1B9A]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">College Name *</label>
                  <div className="relative">
                    <Building className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={formData.college_name}
                      onChange={e => setFormData({ ...formData, college_name: e.target.value })}
                      placeholder="e.g. National Institute of Tech"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#6A1B9A]"
                    />
                  </div>
                </div>
              </div>

              {/* Academic Details */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Degree *</label>
                  <select
                    value={formData.degree}
                    onChange={e => setFormData({ ...formData, degree: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#6A1B9A]"
                  >
                    <option value="B.Tech">B.Tech</option>
                    <option value="B.E.">B.E.</option>
                    <option value="BCA">BCA</option>
                    <option value="MCA">MCA</option>
                    <option value="B.Sc">B.Sc Computer Science</option>
                    <option value="M.Tech">M.Tech</option>
                    <option value="MBA">MBA / Management</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Department *</label>
                  <input
                    type="text"
                    required
                    value={formData.department}
                    onChange={e => setFormData({ ...formData, department: e.target.value })}
                    placeholder="CSE, IT, ECE, AI"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#6A1B9A]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Year of Study *</label>
                  <select
                    value={formData.year_of_study}
                    onChange={e => setFormData({ ...formData, year_of_study: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#6A1B9A]"
                  >
                    <option value="1st Year">1st Year</option>
                    <option value="2nd Year">2nd Year</option>
                    <option value="3rd Year">3rd Year</option>
                    {/* <option value="4th Year">4th Year</option> */}
                    <option value="Final Year">Final Year</option>
                    <option value="Graduated">Graduated (2025/2026)</option>
                  </select>
                </div>
              </div>

              {/* Passwords */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Password *</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      required
                      value={formData.password}
                      onChange={e => setFormData({ ...formData, password: e.target.value })}
                      placeholder="Min 6 characters"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#6A1B9A]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Confirm Password *</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      required
                      value={formData.confirm_password}
                      onChange={e => setFormData({ ...formData, confirm_password: e.target.value })}
                      placeholder="Re-enter password"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#6A1B9A]"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-[#6A1B9A] hover:bg-[#52137a] text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2"
              >
                <span>{loading ? 'Creating Account & Generating ID...' : 'Register Student & Generate ID'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <div className="pt-2 text-center text-xs text-slate-500 font-medium border-t border-slate-100">
              Already have an account?{' '}
              <Link to="/login" className="font-bold text-[#6A1B9A] hover:underline">
                Log In
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
