import React, { useState } from 'react';
import { api } from '../../services/api';
import { useNotification } from '../../context/NotificationContext';
import {
  MapPin,
  Phone,
  Mail,
  Send,
  MessageSquare,
  Clock,
  CheckCircle2,
  HelpCircle,
  Sparkles,
} from 'lucide-react';

export const ContactPage: React.FC = () => {
  const { showToast } = useNotification();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      showToast('Please fill out all required fields', 'warning');
      return;
    }

    setLoading(true);
    try {
      await api.post('/cms/contact', formData);
      showToast('Thank you! Your message has been sent successfully. Our team will contact you shortly.', 'success', 'Message Sent');
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
    } catch (err: any) {
      showToast(err.message || 'Failed to send message', 'error');
    } finally {
      setLoading(false);
    }
  };

  const faqs = [
    { q: 'Who can enroll in MindMend training batches?', a: 'All engineering (B.Tech/B.E.), computer application (BCA/MCA), science (B.Sc), and management students looking for industry-aligned skills and campus placement prep can enroll.' },
    { q: 'Are classes conducted with live trainers?', a: 'Yes! All modules are led by senior industry architects with dedicated live coding labs, question-and-answer intervals, and real-time guidance.' },
    { q: 'Do you provide verified internship certificates?', a: 'Yes, students completing the 3-month internship program receive verified certificates and direct project referrals for hiring partners.' },
    { q: 'Can colleges partner for bulk campus training?', a: 'Yes! MindMend partners with universities across India for semester placement bootcamps and faculty development programs.' },
  ];

  return (
    <div className="space-y-16 py-10 pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 bg-[#FAFAFF] text-slate-900 font-sans">
      {/* 1. Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-purple-100 border border-purple-200 text-[#6A1B9A] text-xs font-bold shadow-sm">
          <Mail className="w-3.5 h-3.5" />
          <span>Get in Touch</span>
        </div>
        <h1 className="font-display font-black text-4xl sm:text-5xl text-slate-900 tracking-tight">
          Contact MindMend Academy
        </h1>
        <p className="text-slate-600 text-sm sm:text-base leading-relaxed font-medium">
          Have queries about training cohorts, custom syllabus, college campus tie-ups, or internship programs? We’d love to hear from you.
        </p>
      </div>

      {/* 2. Contact Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Left 1 Col: Contact Info Cards */}
        <div className="space-y-6">
          <div className="p-8 rounded-3xl bg-white border border-purple-100 shadow-sm space-y-6">
            <h3 className="font-display font-extrabold text-xl text-slate-900">Academy Information</h3>

            <div className="space-y-5 text-xs sm:text-sm text-slate-600 font-medium">
              <div className="flex items-start gap-3.5">
                <div className="p-3 rounded-xl bg-purple-50 border border-purple-100 text-[#6A1B9A]">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-slate-900">Campus Headquarters</p>
                  <p className="text-slate-500 mt-0.5 leading-relaxed">
                    MindMend Tech Hub, 4th Floor, Electronic City Phase 1, Bangalore, KA 560100
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="p-3 rounded-xl bg-purple-50 border border-purple-100 text-[#6A1B9A]">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-slate-900">Phone Support</p>
                  <p className="text-slate-500 mt-0.5">+91 98765 43210</p>
                  <p className="text-slate-500">+91 80 4123 4567</p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="p-3 rounded-xl bg-purple-50 border border-purple-100 text-[#6A1B9A]">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-slate-900">Direct Email</p>
                  <p className="text-slate-500 mt-0.5">contact@mindmend.edu</p>
                  <p className="text-slate-500">admissions@mindmend.edu</p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="p-3 rounded-xl bg-purple-50 border border-purple-100 text-[#6A1B9A]">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-slate-900">Operating Hours</p>
                  <p className="text-slate-500 mt-0.5">Monday - Saturday: 8:00 AM - 8:00 PM</p>
                  <p className="text-slate-500">Sunday: Closed</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right 2 Cols: Form */}
        <div className="lg:col-span-2 p-8 rounded-3xl bg-white border border-purple-100 shadow-sm space-y-6">
          <div>
            <h2 className="font-display font-extrabold text-2xl text-slate-900">Send Us a Message</h2>
            <p className="text-xs text-slate-500 font-medium mt-1">
              Fill out the details below and an academic advisor will get back to you within 24 hours.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Your Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Rahul Verma"
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
                  placeholder="name@email.com"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#6A1B9A]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Mobile Number</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+91 98765 43210"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#6A1B9A]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Subject *</label>
                <input
                  type="text"
                  required
                  value={formData.subject}
                  onChange={e => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="Course Query / Campus Partnership / Internship"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#6A1B9A]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Message *</label>
              <textarea
                rows={5}
                required
                value={formData.message}
                onChange={e => setFormData({ ...formData, message: e.target.value })}
                placeholder="How can MindMend help you?"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#6A1B9A] resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3.5 rounded-xl bg-[#6A1B9A] hover:bg-[#52137a] text-white font-bold text-sm shadow-md transition-all flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>{loading ? 'Sending...' : 'Send Message'}</span>
            </button>
          </form>
        </div>
      </div>

      {/* 3. Frequently Asked Questions */}
      <div className="p-8 sm:p-12 rounded-3xl bg-white border border-purple-100 shadow-sm space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-slate-900">
            Frequently Asked Questions
          </h2>
          <p className="text-xs text-slate-500 font-medium">Everything you need to know about MindMend programs.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {faqs.map((faq, idx) => (
            <div key={idx} className="p-5 rounded-2xl bg-purple-50/50 border border-purple-100 space-y-2">
              <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-[#6A1B9A] flex-shrink-0" />
                <span>{faq.q}</span>
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed font-medium pl-6">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
