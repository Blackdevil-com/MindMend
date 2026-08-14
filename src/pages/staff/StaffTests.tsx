import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useNotification } from '../../context/NotificationContext';
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
  const { showToast } = useNotification();
  const [tests, setTests] = useState<Test[]>([]);
  const [batches, setBatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // New test state
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
      .catch(err => console.error('Failed to load tests/batches', err))
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
      showToast('A test must have at least one question', 'warning');
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
      showToast('Please complete required fields', 'warning');
      return;
    }

    // Validate questions
    for (let i = 0; i < questions.length; i++) {
      if (!questions[i].question_text || !questions[i].correct_answer) {
        showToast(`Please fill the question text and correct answer for Question #${i + 1}`, 'warning');
        return;
      }
    }

    setSubmitting(true);
    try {
      await api.post('/tests', {
        ...testForm,
        batch_id: testForm.batch_id ? Number(testForm.batch_id) : null,
        questions,
      });

      showToast('New test and questions published successfully!', 'success', 'Test Created');
      setCreateModalOpen(false);
      loadData();
    } catch (err: any) {
      showToast(err.message || 'Failed to create test', 'error');
    } finally {
      setSubmitting(false);
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
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-black text-2xl sm:text-3xl text-white">
            Online Tests & Question Bank
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Create structured MCQ/True-False quizzes and assign them to your student batches.
          </p>
        </div>

        <button
          onClick={() => setCreateModalOpen(true)}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-500 hover:to-brand-600 text-white text-xs font-bold shadow-glow-sm flex items-center gap-1.5 transition-all"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Create New Test</span>
        </button>
      </div>

      {/* Tests Table */}
      <div className="p-6 rounded-3xl bg-[#0F172A] border border-slate-800 space-y-4 shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/80 text-slate-400 uppercase font-semibold border-b border-slate-800">
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
            <tbody className="divide-y divide-slate-800">
              {tests.map(test => (
                <tr key={test.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="p-3.5 font-semibold text-white">{test.title}</td>
                  <td className="p-3.5 text-brand-300">{test.subject}</td>
                  <td className="p-3.5 font-mono text-slate-300">{test.batch_name || 'All Batches'}</td>
                  <td className="p-3.5 text-slate-400">{test.duration_minutes} Mins</td>
                  <td className="p-3.5 font-bold text-slate-200">{test.total_marks} (Pass: {test.passing_marks})</td>
                  <td className="p-3.5 font-bold text-emerald-400">{test.submissions_count || 0}</td>
                  <td className="p-3.5 font-bold text-white">{test.avg_percentage !== null ? `${test.avg_percentage}%` : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Test Modal */}
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
              <label className="block text-xs font-semibold text-slate-300 mb-1">Test Title *</label>
              <input
                type="text"
                required
                value={testForm.title}
                onChange={e => setTestForm({ ...testForm, title: e.target.value })}
                placeholder="e.g. Java Collections & Streams Quiz"
                className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Subject *</label>
              <select
                value={testForm.subject}
                onChange={e => setTestForm({ ...testForm, subject: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-brand-500"
              >
                <option value="Java Programming">Java Programming</option>
                <option value="Power BI">Power BI</option>
                <option value="Aptitude">Aptitude</option>
                <option value="MS Excel">MS Excel</option>
                <option value="Communication Skills">Communication Skills</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Duration (Min) *</label>
              <input
                type="number"
                min="5"
                required
                value={testForm.duration_minutes}
                onChange={e => setTestForm({ ...testForm, duration_minutes: Number(e.target.value) })}
                className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Total Marks *</label>
              <input
                type="number"
                min="1"
                required
                value={testForm.total_marks}
                onChange={e => setTestForm({ ...testForm, total_marks: Number(e.target.value) })}
                className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Passing Marks *</label>
              <input
                type="number"
                min="1"
                required
                value={testForm.passing_marks}
                onChange={e => setTestForm({ ...testForm, passing_marks: Number(e.target.value) })}
                className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Target Batch</label>
              <select
                value={testForm.batch_id}
                onChange={e => setTestForm({ ...testForm, batch_id: e.target.value })}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-brand-500"
              >
                <option value="">All Batches</option>
                {batches.map(b => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Question Builder */}
          <div className="space-y-4 pt-4 border-t border-slate-800">
            <div className="flex items-center justify-between">
              <h4 className="font-display font-bold text-sm text-white">
                Questions Builder ({questions.length})
              </h4>
              <button
                type="button"
                onClick={addQuestion}
                className="px-3 py-1.5 rounded-lg bg-brand-600/80 hover:bg-brand-600 text-white text-xs font-semibold flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Question</span>
              </button>
            </div>

            {questions.map((q, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-brand-300">Question #{idx + 1}</span>
                  <div className="flex items-center gap-2">
                    <select
                      value={q.question_type}
                      onChange={e => updateQuestion(idx, 'question_type', e.target.value as QuestionType)}
                      className="px-2.5 py-1 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white"
                    >
                      <option value="mcq">Multiple Choice</option>
                      <option value="true_false">True / False</option>
                      <option value="short_answer">Short Answer</option>
                    </select>

                    <button
                      type="button"
                      onClick={() => removeQuestion(idx)}
                      className="p-1 rounded text-rose-400 hover:bg-rose-950/60"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <input
                  type="text"
                  required
                  placeholder="Enter the question text..."
                  value={q.question_text}
                  onChange={e => updateQuestion(idx, 'question_text', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-brand-500"
                />

                {q.question_type === 'mcq' && (
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Option A"
                      value={q.option_a || ''}
                      onChange={e => updateQuestion(idx, 'option_a', e.target.value)}
                      className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white"
                    />
                    <input
                      type="text"
                      placeholder="Option B"
                      value={q.option_b || ''}
                      onChange={e => updateQuestion(idx, 'option_b', e.target.value)}
                      className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white"
                    />
                    <input
                      type="text"
                      placeholder="Option C"
                      value={q.option_c || ''}
                      onChange={e => updateQuestion(idx, 'option_c', e.target.value)}
                      className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white"
                    />
                    <input
                      type="text"
                      placeholder="Option D"
                      value={q.option_d || ''}
                      onChange={e => updateQuestion(idx, 'option_d', e.target.value)}
                      className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white"
                    />
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    required
                    placeholder="Exact Correct Answer *"
                    value={q.correct_answer || ''}
                    onChange={e => updateQuestion(idx, 'correct_answer', e.target.value)}
                    className="px-3 py-1.5 bg-brand-950/60 border border-brand-500/40 rounded-lg text-xs text-white"
                  />
                  <input
                    type="text"
                    placeholder="Explanation (Optional)"
                    value={q.explanation || ''}
                    onChange={e => updateQuestion(idx, 'explanation', e.target.value)}
                    className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white"
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setCreateModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold shadow-glow-sm flex items-center gap-2"
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
