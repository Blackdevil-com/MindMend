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
      .catch(err => console.error('Failed to load announcements', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-12">
      <div>
        <h1 className="font-display font-black text-2xl sm:text-3xl text-white">
          Academy & Batch Announcements
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Stay updated with latest exam schedules, workshop announcements, and placement drives.
        </p>
      </div>

      <div className="space-y-4">
        {announcements.length === 0 ? (
          <div className="p-12 rounded-3xl bg-[#0F172A] border border-slate-800 text-center space-y-2">
            <Bell className="w-8 h-8 text-slate-500 mx-auto" />
            <p className="text-sm font-semibold text-slate-300">No active announcements</p>
          </div>
        ) : (
          announcements.map(ann => (
            <div
              key={ann.id}
              className="p-6 rounded-3xl bg-[#0F172A] border border-slate-800 space-y-3 shadow-sm hover:border-brand-500/40 transition-all"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded bg-brand-950 text-brand-300 border border-brand-500/30 uppercase">
                  {ann.target_type === 'all' ? 'All Students' : `Target: ${ann.batch_name || ann.course_title || 'Batch'}`}
                </span>
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-brand-400" />
                  {new Date(ann.created_at).toLocaleDateString()}
                </span>
              </div>

              <h3 className="font-display font-bold text-lg text-white">{ann.title}</h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">{ann.content}</p>

              <div className="pt-2 flex items-center gap-2 text-[11px] text-slate-400">
                <User className="w-3.5 h-3.5 text-brand-400" />
                <span>Posted by {ann.author_name || 'MindMend Administration'}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
