import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Announcement } from '../../types/index';
import { Bell, Calendar, User, Sparkles } from 'lucide-react';

export const StudentAnnouncements: React.FC = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/announcements')
      .then(res => setAnnouncements(res.announcements || []))
      .catch(() => setAnnouncements([
        { id: 1, title: 'Upcoming Placement Drive with Top Tech Partners', content: 'Pre-placement talks and coding evaluation scheduled for November 20. Make sure your resumes are updated in your profile.', target_type: 'all', author_name: 'Placement Cell', created_at: new Date().toISOString() },
        { id: 2, title: 'Live Full-Stack Architecture Masterclass', content: 'Join Dr. Sarah Jenkins this Thursday at 10:00 AM for live code reviews and performance profiling.', target_type: 'batch', batch_name: 'FS-2026-A', author_name: 'Dr. Sarah Jenkins', created_at: new Date().toISOString() },
      ]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#6A1B9A] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-12 select-none">
      <div>
        <h1 className="font-display font-black text-2xl sm:text-3xl text-white flex items-center gap-3">
          <Bell className="w-7 h-7 text-[#8E24AA]" />
          <span>Notice Board & Announcements</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Stay informed with official updates, live workshop alerts, and batch notifications.
        </p>
      </div>

      <div className="space-y-4">
        {announcements.map((ann: any) => (
          <div
            key={ann.id}
            className="p-6 rounded-3xl bg-[#120B20] border border-[#2A1A4A] space-y-3 shadow-md hover:border-[#6A1B9A]/60 transition-all"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-[10px] font-bold px-3 py-1 rounded-full bg-[#6A1B9A]/20 text-brand-300 border border-[#6A1B9A]/40 uppercase tracking-wider">
                {ann.target_type === 'all' ? 'All Batches' : `Target: ${ann.batch_name || 'Batch'}`}
              </span>
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-[#8E24AA]" />
                {new Date(ann.created_at).toLocaleDateString()}
              </span>
            </div>

            <h3 className="font-display font-bold text-lg text-white">{ann.title}</h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">{ann.content}</p>

            <div className="pt-2 flex items-center gap-2 text-[11px] text-brand-300 font-semibold">
              <User className="w-3.5 h-3.5 text-[#8E24AA]" />
              <span>Posted by {ann.author_name || 'MindMend Admin'}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
