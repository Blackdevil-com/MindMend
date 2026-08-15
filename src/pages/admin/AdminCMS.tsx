import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useNotification } from '../../context/NotificationContext';
import { Testimonial, ContactMessage } from '../../types/index';
import {
  MessageSquare,
  Star,
  Mail,
  Phone,
  Calendar,
  CheckCircle2,
  Clock,
  Sparkles,
} from 'lucide-react';

export const AdminCMS: React.FC = () => {
  const { showToast } = useNotification();
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'messages' | 'testimonials'>('messages');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    Promise.all([
      api.get('/cms/admin/messages'),
      api.get('/cms/testimonials'),
    ])
      .then(([msgData, testData]) => {
        setMessages(msgData.messages || []);
        setTestimonials(testData.testimonials || []);
      })
      .catch(err => console.error('Failed to load CMS data', err))
      .finally(() => setLoading(false));
  };

  const handleMarkReplied = async (id: number) => {
    try {
      await api.patch(`/cms/admin/messages/${id}/status`, { status: 'replied' });
      showToast('Marked as replied', 'success');
      loadData();
    } catch (err) {
      showToast('Failed to update status', 'error');
    }
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12 select-none">
      <div>
        <h1 className="font-display font-black text-2xl sm:text-3xl text-slate-900">
          Content & Inquiries Management
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
          Manage public contact inquiries, candidate lead requests, and student testimonials.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-[#F5EFFB] border border-purple-100 w-fit">
        <button
          onClick={() => setActiveTab('messages')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'messages'
              ? 'bg-[#6A1B9A] text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-800'
          }`}
        >
          <Mail className="w-4 h-4" />
          <span>Contact Messages ({messages.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('testimonials')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'testimonials'
              ? 'bg-[#6A1B9A] text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-800'
          }`}
        >
          <Star className="w-4 h-4" />
          <span>Testimonials ({testimonials.length})</span>
        </button>
      </div>

      {/* Contact Messages View */}
      {activeTab === 'messages' && (
        <div className="space-y-4">
          {messages.length === 0 ? (
            <div className="p-12 rounded-3xl bg-white border border-purple-100 text-center text-xs text-slate-500 shadow-sm">
              No inquiries in the contact inbox.
            </div>
          ) : (
            messages.map(msg => (
              <div
                key={msg.id}
                className="p-6 rounded-3xl bg-white border border-purple-100 space-y-3 shadow-[0_4px_20px_-2px_rgba(106,27,154,0.05)] hover:border-[#6A1B9A]/60 transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-purple-100">
                  <div>
                    <h3 className="font-bold text-base text-slate-900">{msg.name}</h3>
                    <p className="text-xs text-slate-500 font-mono mt-0.5">
                      {msg.email} • {msg.phone || 'No phone'}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                      msg.status === 'replied'
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                        : 'bg-amber-100 text-amber-800 border-amber-200'
                    }`}>
                      {msg.status}
                    </span>
                    <span className="text-xs text-slate-500 font-mono">
                      {new Date(msg.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <span className="text-xs font-bold text-[#6A1B9A] block">Subject: {msg.subject}</span>
                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-[#FAFAFE] p-3.5 rounded-2xl border border-purple-100">
                    "{msg.message}"
                  </p>
                </div>

                {msg.status === 'new' && (
                  <div className="flex justify-end pt-2">
                    <button
                      onClick={() => handleMarkReplied(msg.id)}
                      className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Mark as Replied</span>
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Testimonials View */}
      {activeTab === 'testimonials' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {testimonials.map(t => (
            <div
              key={t.id}
              className="p-6 rounded-3xl bg-white border border-purple-100 space-y-4 shadow-[0_4px_20px_-2px_rgba(106,27,154,0.05)]"
            >
              <div className="flex items-center gap-1 text-amber-500">
                {[...Array(t.rating || 5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
              </div>

              <p className="text-xs text-slate-650 italic leading-relaxed font-medium">
                "{t.content}"
              </p>

              <div className="pt-3 border-t border-purple-100 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-xs text-slate-900">{t.name}</h4>
                  <p className="text-[11px] text-[#6A1B9A] font-bold mt-0.5">{t.role}</p>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#F5EFFB] text-[#6A1B9A] border border-purple-200">
                  {t.company_or_college}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
