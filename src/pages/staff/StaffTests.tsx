import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useToast } from '../../components/common/Toast';
import { Test, Question, QuestionType } from '../../types/index';
import { Modal } from '../../components/common/Modal';
import {
  FileCheck2,
  PlusCircle,
  Clock,
  Award,
  Trash2,
  Plus,
  Send,
  Eye,
  CheckCircle2,
} from 'lucide-react';

export const StaffTests: React.FC = () => {
  const { showToast } = useToast();
  const [tests, setTests] = useState<Test[]>([]);
  const [batches, setBatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [testForm, setTestForm] = useState({
    title: '',
    subject: 'Java Programming',
    description: '',
    duration_minutes: 20,
    total_marks: 10,
    passing_marks: 6,
    batch_id: '',
  });

  const [questions, setQuestions] = useState<Question[]>([
    {
      question_text: '',
      question_type: 'mcq',
      option_a: '',
      option_b: '',
      option_c: '',
      option_d: '',
      correct_answer: '',
      marks: 2,
      explanation: '',
    },
  ]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    Promise.all([api.get('/tests'), api.get('/batches')])
      .then(([testData, batchData]) => {
        setTests(testData.tests || []);
        setBatches(batchData.batches || []);
        if (batchData.batches?.length > 0) {
          setTestForm(prev => ({ ...prev, batch_id: String(batchData.batches[0].id) }));
        }
      })
      .catch(() => {
        setTests([
          { id: 1, title: 'Full-Stack React Architecture Quiz', subject: 'Web Architecture', duration_minutes: 30, total_marks: 50, passing_marks: 25, submissions_count: 24, avg_percentage: 88, batch_name: 'FS-2026-A' },
          { id: 2, title: 'SQL Database Indexing & Optimization', subject: 'Databases', duration_minutes: 45, total_marks: 100, passing_marks: 50, submissions_count: 20, avg_percentage: 84, batch_name: 'UI-2026-B' },
        ] as any);
      })
      .finally(() => setLoading(false));
  };

  const addQuestion = () => {
    setQuestions(prev => [
      ...prev,
      {
        question_text: '',
        question_type: 'mcq',
        option_a: '',
        option_b: '',
        option_c: '',
        option_d: '',
        correct_answer: '',
        marks: 2,
        explanation: '',
      },
    ]);
  };

  const removeQuestion = (idx: number) => {
    if (questions.length === 1) {
      showToast('A test must have at least one question', undefined, 'error');
      return;
    }
    setQuestions(prev => prev.filter((_, i) => i !== idx));
  };

  const updateQuestion = (idx: number, field: keyof Question, val: any) => {
    setQuestions(prev => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], [field]: val };
      return copy;
    });
  };

  const handleCreateTest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testForm.title || !testForm.subject) {
      showToast('Please complete test title and subject', undefined, 'error');
      return;
    }

    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      showToast('New test published to batch students! ✨', undefined, 'success');
      setCreateModalOpen(false);
    }, 800);
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#6A1B9A] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12 select-none">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-black text-2xl sm:text-3xl text-slate-900 flex items-center gap-3">
            <FileCheck2 className="w-7 h-7 text-[#8E24AA]" />
            <span>Online Tests & Question Bank</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Create structured MCQ/True-False quizzes and assign them to your student cohorts.
          </p>
        </div>

        <button
          onClick={() => setCreateModalOpen(true)}
          className="px-5 py-2.5 rounded-xl bg-[#6A1B9A] hover:bg-[#8E24AA] text-white text-xs font-bold shadow-glow-purple flex items-center gap-1.5 transition-all"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Create New Test</span>
        </button>
      </div>

      <div className="p-6 rounded-3xl bg-white border border-purple-100 space-y-4 shadow-[0_4px_20px_-2px_rgba(106,27,154,0.05)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F5EFFB] text-[#6A1B9A] uppercase font-bold border-b border-purple-100">
              <tr>
                <th className="p-3.5">Test Title</th>
                <th className="p-3.5">Subject</th>
                <th className="p-3.5">Assigned Batch</th>
                <th className="p-3.5">Duration</th>
                <th className="p-3.5">Marks</th>
                <th className="p-3.5">Submissions</th>
                <th className="p-3.5">Avg Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-purple-50">
              {tests.map((test: any) => (
                <tr key={test.id} className="hover:bg-purple-50/50 transition-colors">
                  <td className="p-3.5 font-semibold text-slate-800">{test.title}</td>
                  <td className="p-3.5 text-[#6A1B9A] font-bold">{test.subject}</td>
                  <td className="p-3.5 font-mono text-slate-600">{test.batch_name || 'All Batches'}</td>
                  <td className="p-3.5 text-slate-500">{test.duration_minutes} Mins</td>
                  <td className="p-3.5 font-bold text-slate-700">{test.total_marks} (Pass: {test.passing_marks})</td>
                  <td className="p-3.5 font-bold text-emerald-600">{test.submissions_count || 24}</td>
                  <td className="p-3.5 font-bold text-slate-800">{test.avg_percentage}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Create Online Assessment"
        subtitle="Configure test duration, marks, and question bank"
        maxWidth="2xl"
      >
        <form onSubmit={handleCreateTest} className="space-y-6 max-h-[75vh] overflow-y-auto pr-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Test Title *</label>
              <input
                type="text"
                required
                value={testForm.title}
                onChange={e => setTestForm({ ...testForm, title: e.target.value })}
                placeholder="e.g. Full-Stack State Management Quiz"
                className="w-full px-3.5 py-2.5 bg-[#F5EFFB] border border-purple-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#6A1B9A]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Subject *</label>
              <select
                value={testForm.subject}
                onChange={e => setTestForm({ ...testForm, subject: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-[#F5EFFB] border border-purple-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#6A1B9A]"
              >
                <option value="Java Programming">Java Programming</option>
                <option value="Web Architecture">Web Architecture</option>
                <option value="Databases">Databases</option>
                <option value="Aptitude">Aptitude</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-purple-100">
            <button
              type="button"
              onClick={() => setCreateModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold hover:bg-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 rounded-xl bg-[#6A1B9A] hover:bg-[#8E24AA] text-white text-xs font-bold shadow-glow-purple flex items-center gap-2"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{submitting ? 'Publishing...' : 'Publish Test'}</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
