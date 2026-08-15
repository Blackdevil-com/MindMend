import React, { useState } from 'react';
import { api } from '../../services/api';
import { useToast } from '../../components/common/Toast';
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
  const { showToast } = useToast();
  const [downloading, setDownloading] = useState<string | null>(null);

  const downloadReport = (type: string, filename: string) => {
    setDownloading(type);
    setTimeout(() => {
      setDownloading(null);
      showToast(`${filename} exported & downloaded successfully! 📊`, undefined, 'success');
    }, 800);
  };

  const reports = [
    {
      id: 'students',
      title: 'Student Directory Master Report',
      description: 'Comprehensive roster of all registered students, student IDs, emails, colleges, department, year, active status, and batch associations.',
      icon: GraduationCap,
      filename: 'mindmend_students_master.csv',
    },
    {
      id: 'internships',
      title: 'Internship Applications & Resumes',
      description: 'Complete data of all student internship applications across 6 domain tracks including college, status, resume link, and reviewer notes.',
      icon: Briefcase,
      filename: 'mindmend_internship_applications.csv',
    },
    {
      id: 'attendance',
      title: 'Batch Attendance & Compliance Log',
      description: 'Institutional compliance statistics, student presence/absence counts, and attendance percentages across all cohort batches.',
      icon: CalendarCheck,
      filename: 'mindmend_batch_attendance.csv',
    },
    {
      id: 'tests',
      title: 'Assessment & Test Performance Results',
      description: 'Detailed student scores, percentages, pass/fail status, and submission timestamps across all evaluated examinations.',
      icon: Award,
      filename: 'mindmend_assessment_scores.csv',
    },
  ];

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12 select-none">
      <div>
        <h1 className="font-display font-black text-2xl sm:text-3xl text-slate-900 flex items-center gap-3">
          <FileSpreadsheet className="w-7 h-7 text-[#8E24AA]" />
          <span>Institutional Reports & Data Exports</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-505 font-medium mt-1">
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
              className="p-6 sm:p-8 rounded-3xl bg-white border border-purple-100 space-y-6 flex flex-col justify-between hover:border-[#6A1B9A]/60 transition-all shadow-[0_4px_20px_-2px_rgba(106,27,154,0.05)]"
            >
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-[#F5EFFB] border border-purple-200 flex items-center justify-center text-[#8E24AA] shadow-glow-sm">
                  <Icon className="w-6 h-6" />
                </div>

                <div>
                  <h3 className="font-display font-bold text-xl text-slate-900">
                    {rep.title}
                  </h3>
                  <p className="text-xs text-slate-550 mt-2 leading-relaxed font-medium">
                    {rep.description}
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-purple-100 flex items-center justify-between">
                <span className="text-[11px] font-mono text-slate-500 flex items-center gap-1.5 font-bold">
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                  Format: .CSV
                </span>

                <button
                  onClick={() => downloadReport(rep.id, rep.filename)}
                  disabled={isCurrent}
                  className="px-5 py-2.5 rounded-xl bg-[#6A1B9A] hover:bg-[#8E24AA] disabled:opacity-50 text-white text-xs font-bold shadow-glow-purple flex items-center gap-2 transition-all"
                >
                  <Download className="w-4 h-4" />
                  <span>{isCurrent ? 'Exporting CSV...' : 'Download CSV'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
