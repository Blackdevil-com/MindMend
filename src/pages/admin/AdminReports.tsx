import React, { useState } from 'react';
import { api } from '../../services/api';
import { useNotification } from '../../context/NotificationContext';
import {
  FileSpreadsheet,
  Download,
  GraduationCap,
  CalendarCheck,
  Award,
  Briefcase,
  Layers,
  Sparkles,
} from 'lucide-react';

export const AdminReports: React.FC = () => {
  const { showToast } = useNotification();
  const [downloading, setDownloading] = useState<string | null>(null);

  const downloadReport = async (type: string, url: string, filename: string) => {
    setDownloading(type);
    try {
      const csvText = await api.get(url);
      const blob = new Blob([csvText], { type: 'text/csv' });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = filename;
      link.click();
      showToast(`${filename} downloaded successfully!`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Export download failed', 'error');
    } finally {
      setDownloading(null);
    }
  };

  const reports = [
    {
      id: 'students',
      title: 'Student Directory Master Report',
      description: 'Comprehensive roster of all registered students, student IDs, emails, colleges, department, year, active status, and batch associations.',
      icon: GraduationCap,
      url: '/students/export/csv',
      filename: 'mindmend_students_master.csv',
      color: 'from-brand-600 to-indigo-600',
    },
    {
      id: 'internships',
      title: 'Internship Applications & Resumes',
      description: 'Complete data of all student internship applications across 6 domain tracks including college, status, resume link, and admin feedback.',
      icon: Briefcase,
      url: '/internships/admin/export/csv',
      filename: 'mindmend_internship_applications.csv',
      color: 'from-amber-600 to-orange-600',
    },
    {
      id: 'attendance',
      title: 'Batch Attendance & Compliance Log',
      description: 'Institutional compliance statistics, student presence/absence counts, and attendance percentages across all cohort batches.',
      icon: CalendarCheck,
      url: '/attendance/export/csv?batch_id=1',
      filename: 'mindmend_batch_attendance.csv',
      color: 'from-cyan-600 to-blue-600',
    },
    {
      id: 'tests',
      title: 'Assessment & Test Performance Results',
      description: 'Detailed student scores, percentages, pass/fail status, and submission timestamps across all evaluated examinations.',
      icon: Award,
      url: '/tests/1/export/csv',
      filename: 'mindmend_assessment_scores.csv',
      color: 'from-purple-600 to-violet-600',
    },
  ];

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      <div>
        <h1 className="font-display font-black text-2xl sm:text-3xl text-white">
          Institutional Reports & Data Exports
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Download standardized CSV audit logs for administrative records, accreditation, and student performance tracking.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reports.map(rep => {
          const Icon = rep.icon;
          const isCurrent = downloading === rep.id;

          return (
            <div
              key={rep.id}
              className="p-6 sm:p-8 rounded-3xl bg-[#0F172A] border border-slate-800 space-y-6 flex flex-col justify-between hover:border-brand-500/40 transition-all shadow-xl"
            >
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-600/30 to-slate-900 border border-brand-500/30 flex items-center justify-center text-brand-400 shadow-glow-sm">
                  <Icon className="w-6 h-6" />
                </div>

                <div>
                  <h3 className="font-display font-bold text-xl text-white">
                    {rep.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                    {rep.description}
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                <span className="text-[11px] font-mono text-slate-500 flex items-center gap-1.5">
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                  Format: .CSV
                </span>

                <button
                  onClick={() => downloadReport(rep.id, rep.url, rep.filename)}
                  disabled={isCurrent}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-500 hover:to-brand-600 disabled:opacity-50 text-white text-xs font-bold shadow-glow-sm flex items-center gap-2 transition-all"
                >
                  <Download className="w-4 h-4" />
                  <span>{isCurrent ? 'Generating CSV...' : 'Download CSV'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
