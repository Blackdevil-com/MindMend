import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { Internship } from '../../types/index';
import { Modal } from '../../components/common/Modal';
import {
  Briefcase,
  CheckCircle2,
  Clock,
  Award,
  Upload,
  Layers,
  ArrowRight,
  Code,
  ShieldCheck,
  Send,
  Sparkles,
} from 'lucide-react';

export const InternshipPage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useNotification();

  const [internships, setInternships] = useState<Internship[]>([]);
  const [selectedDomain, setSelectedDomain] = useState<string>('All');
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [selectedInternship, setSelectedInternship] = useState<Internship | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Application form fields
  const [formData, setFormData] = useState({
    domain: '',
    full_name: '',
    email: '',
    mobile: '',
    college: '',
    degree: 'B.Tech',
    department: 'Computer Science',
    year_of_study: '3rd Year',
    motivation: '',
  });
  const [resumeFile, setResumeFile] = useState<File | null>(null);

  useEffect(() => {
    api.get('/internships')
      .then(data => setInternships(data.internships || []))
      .catch(err => console.error('Failed to load internships', err));
  }, []);

  // Pre-fill form if student user is logged in
  const openApplyModal = (internship?: Internship) => {
    setSelectedInternship(internship || null);
    setFormData({
      domain: internship ? internship.domain : (internships[0]?.domain || 'Java Development'),
      full_name: user?.full_name || '',
      email: user?.email || '',
      mobile: user?.profile?.mobile || '',
      college: user?.profile?.college_name || '',
      degree: user?.profile?.degree || 'B.Tech',
      department: user?.profile?.department || 'Computer Science',
      year_of_study: user?.profile?.year_of_study || '3rd Year',
      motivation: '',
    });
    setResumeFile(null);
    setApplyModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.full_name || !formData.email || !formData.mobile || !formData.college || !formData.motivation) {
      showToast('Please fill out all required fields', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      const data = new FormData();
      data.append('domain', formData.domain);
      data.append('full_name', formData.full_name);
      data.append('email', formData.email);
      data.append('mobile', formData.mobile);
      data.append('college', formData.college);
      data.append('degree', formData.degree);
      data.append('department', formData.department);
      data.append('year_of_study', formData.year_of_study);
      data.append('motivation', formData.motivation);
      if (selectedInternship?.id) {
        data.append('internship_id', String(selectedInternship.id));
      }
      if (resumeFile) {
        data.append('resume', resumeFile);
      }

      await api.post('/internships/apply', data);
      showToast('Internship application submitted successfully! Our team will review your profile.', 'success', 'Application Received');
      setApplyModalOpen(false);
    } catch (err: any) {
      showToast(err.message || 'Failed to submit application', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const domains = ['All', 'Java Development', 'Data Analytics', 'Power BI', 'AI & Data Science', 'Web Development', 'Business/Data Analytics'];

  const filteredInternships = internships.filter(
    item => selectedDomain === 'All' || item.domain === selectedDomain
  );

  return (
    <div className="space-y-16 py-10 pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 bg-[#FAFAFF] text-slate-900 font-sans">
      {/* 1. Hero Section */}
      <div className="text-center max-w-3xl mx-auto space-y-5">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-100 border border-purple-200 text-[#6A1B9A] text-xs font-bold shadow-sm">
          <Briefcase className="w-3.5 h-3.5" />
          <span>Real-World Industry Internship Program</span>
        </div>

        <h1 className="font-display font-black text-4xl sm:text-5xl text-slate-900 tracking-tight leading-tight">
          Launch Your Career With{' '}
          <span className="text-[#6A1B9A]">
            Real-World Experience
          </span>
        </h1>

        <p className="text-slate-600 text-sm sm:text-base leading-relaxed font-medium">
          MindMend provides comprehensive, hands-on internship opportunities where students work directly on enterprise projects, receive weekly code reviews, and earn verified certificates to supercharge their placement profiles.
        </p>

        <div className="pt-2">
          <button
            onClick={() => openApplyModal()}
            className="px-8 py-3.5 rounded-xl bg-[#6A1B9A] hover:bg-[#52137a] text-white font-bold text-sm shadow-lg shadow-purple-900/20 transition-all transform hover:-translate-y-0.5"
          >
            Apply for Internship
          </button>
        </div>
      </div>

      {/* 2. Process Workflow */}
      <div className="p-8 sm:p-10 rounded-3xl bg-white border border-purple-100 shadow-sm space-y-6">
        <h2 className="font-display font-extrabold text-xl sm:text-2xl text-slate-900 text-center">
          How Our Internship Program Works
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
          {[
            { step: '01', title: 'Submit Application', desc: 'Choose your desired track and submit your college credentials & resume.' },
            { step: '02', title: 'Skills Screening', desc: 'Shortlisted candidates attend a quick fundamental assessment.' },
            { step: '03', title: 'Project Execution', desc: 'Work on 3 live enterprise deliverables with mentor support.' },
            { step: '04', title: 'Certificate & Referrals', desc: 'Receive your verified internship certificate and placement referrals.' },
          ].map((s, idx) => (
            <div key={idx} className="space-y-2 p-5 rounded-2xl bg-purple-50/60 border border-purple-100">
              <span className="font-mono text-2xl font-black text-[#6A1B9A]">{s.step}</span>
              <h3 className="font-bold text-sm text-slate-900">{s.title}</h3>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Domain Filters */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        {domains.map(dom => (
          <button
            key={dom}
            onClick={() => setSelectedDomain(dom)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              selectedDomain === dom
                ? 'bg-[#6A1B9A] text-white shadow-md'
                : 'bg-white text-slate-600 hover:text-[#6A1B9A] hover:bg-purple-50 border border-purple-100'
            }`}
          >
            {dom}
          </button>
        ))}
      </div>

      {/* 4. Internship Openings Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {filteredInternships.map(intern => (
          <div
            key={intern.id}
            className="p-8 rounded-3xl bg-white border border-purple-100 hover:border-[#6A1B9A]/40 transition-all space-y-6 flex flex-col justify-between shadow-sm hover:shadow-xl hover:-translate-y-1"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-purple-50 text-[#6A1B9A] border border-purple-100">
                  {intern.domain}
                </span>
                <span className="text-xs text-slate-500 flex items-center gap-1 font-medium">
                  <Clock className="w-3.5 h-3.5 text-[#6A1B9A]" />
                  {intern.duration}
                </span>
              </div>

              <h3 className="font-display font-extrabold text-2xl text-slate-900">
                {intern.title}
              </h3>

              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                {intern.description}
              </p>

              {/* Eligibility */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">Eligibility:</span>
                <p className="text-slate-800 font-semibold">{intern.eligibility}</p>
              </div>

              {/* Skills required */}
              <div className="space-y-2">
                <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">Skills Required:</span>
                <div className="flex flex-wrap gap-1.5">
                  {intern.skills_required?.map((sk, idx) => (
                    <span key={idx} className="text-[11px] px-2.5 py-0.5 rounded-md bg-purple-50 text-[#6A1B9A] font-bold border border-purple-100">
                      {sk}
                    </span>
                  ))}
                </div>
              </div>

              {/* Projects */}
              <div className="space-y-2">
                <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">Enterprise Projects:</span>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700 font-medium">
                  {intern.projects?.map((proj, pIdx) => (
                    <li key={pIdx} className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                      <span>{proj}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                <Award className="w-4 h-4 text-[#6A1B9A]" />
                <span>Verified Certificate</span>
              </div>

              <button
                onClick={() => openApplyModal(intern)}
                className="px-5 py-2.5 rounded-xl bg-[#6A1B9A] hover:bg-[#52137a] text-white text-xs font-bold shadow-md transition-all"
              >
                Apply for Track
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* 5. Apply Modal Form */}
      <Modal
        isOpen={applyModalOpen}
        onClose={() => setApplyModalOpen(false)}
        title="Internship Application Form"
        subtitle="Apply for MindMend 3-Month Industry Internship Program"
        maxWidth="xl"
      >
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Full Name *</label>
              <input
                type="text"
                required
                value={formData.full_name}
                onChange={e => setFormData({ ...formData, full_name: e.target.value })}
                placeholder="e.g. Aakash Patel"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#6A1B9A]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Email Address *</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                placeholder="name@college.edu"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#6A1B9A]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Mobile Number *</label>
              <input
                type="tel"
                required
                value={formData.mobile}
                onChange={e => setFormData({ ...formData, mobile: e.target.value })}
                placeholder="+91 98765 43210"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#6A1B9A]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Interested Domain *</label>
              <select
                value={formData.domain}
                onChange={e => setFormData({ ...formData, domain: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#6A1B9A]"
              >
                {domains.filter(d => d !== 'All').map(d => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">College Name *</label>
              <input
                type="text"
                required
                value={formData.college}
                onChange={e => setFormData({ ...formData, college: e.target.value })}
                placeholder="e.g. National Institute of Tech"
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
                <option value="4th Year">4th Year</option>
                <option value="Final Year">Final Year</option>
                <option value="Graduate">Graduate</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Degree *</label>
              <input
                type="text"
                required
                value={formData.degree}
                onChange={e => setFormData({ ...formData, degree: e.target.value })}
                placeholder="B.Tech, B.E., MCA, B.Sc"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#6A1B9A]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Department *</label>
              <input
                type="text"
                required
                value={formData.department}
                onChange={e => setFormData({ ...formData, department: e.target.value })}
                placeholder="CSE, IT, ECE, Data Science"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#6A1B9A]"
              />
            </div>
          </div>

          {/* Resume upload */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Resume Upload (PDF / DOC)</label>
            <div className="relative border-2 border-dashed border-purple-200 hover:border-[#6A1B9A] rounded-xl p-4 text-center cursor-pointer transition-colors bg-purple-50/40">
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={e => setResumeFile(e.target.files ? e.target.files[0] : null)}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <Upload className="w-6 h-6 text-[#6A1B9A] mx-auto mb-1" />
              <p className="text-xs font-bold text-slate-800">
                {resumeFile ? resumeFile.name : 'Click to select or drag and drop your resume'}
              </p>
              <p className="text-[10px] text-slate-400 font-medium">Max size 10MB (PDF, DOCX)</p>
            </div>
          </div>

          {/* Motivation */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Why do you want to join? *</label>
            <textarea
              rows={3}
              required
              value={formData.motivation}
              onChange={e => setFormData({ ...formData, motivation: e.target.value })}
              placeholder="Tell us about your learning goals and why you are excited for this internship..."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#6A1B9A] resize-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={() => setApplyModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 rounded-xl bg-[#6A1B9A] hover:bg-[#52137a] text-white text-xs font-bold shadow-md flex items-center gap-2"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{submitting ? 'Submitting Application...' : 'Submit Application'}</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
