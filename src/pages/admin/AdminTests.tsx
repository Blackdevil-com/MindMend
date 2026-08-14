import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useNotification } from '../../context/NotificationContext';
import { Test, Question, QuestionType, Batch } from '../../types/index';
import { Modal } from '../../components/common/Modal';
import {
  FileCheck2,
  PlusCircle,
  Copy,
  Trash2,
  Edit2,
  CheckCircle2,
  Clock,
  Award,
  Download,
  Plus,
  Send,
  Eye,
  EyeOff,
} from 'lucide-react';

export const AdminTests: React.FC = () => {
  const { showToast } = useNotification();
  const [tests, setTests] = useState<Test[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);

  // Create/Edit Test Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTestId, setEditingTestId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Submissions Modal
  const [submissionsModalOpen, setSubmissionsModalOpen] = useState(false);
  const [selectedSubmissionsData, setSelectedSubmissionsData] = useState<any>(null);

  const [testForm, setTestForm] = useState({
    title: '',
    subject: 'Java Programming',
    description: '',
    duration_minutes: 25,
    total_marks: 20,
    passing_marks: 12,
    batch_id: '',
    status: 'published',
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
      })
      .catch(err => console.error('Failed to load tests', err))
      .finally(() => setLoading(false));
  };

  const openCreateModal = () => {
    setEditingTestId(null);
    setTestForm({
      title: '',
      subject: 'Java Programming',
      description: '',
      duration_minutes: 25,
      total_marks: 20,
      passing_marks: 12,
      batch_id: batches[0]?.id ? String(batches[0].id) : '',
      status: 'published',
    });
    setQuestions([
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
    setModalOpen(true);
  };

  const openEditModal = async (testId: number) => {
    try {
      const data = await api.get(`/tests/${testId}`);
      setEditingTestId(testId);
      setTestForm({
        title: data.test.title,
        subject: data.test.subject,
        description: data.test.description || '',
        duration_minutes: data.test.duration_minutes,
        total_marks: data.test.total_marks,
        passing_marks: data.test.passing_marks,
        batch_id: data.test.batch_id ? String(data.test.batch_id) : '',
        status: data.test.status,
      });
      setQuestions(data.questions || []);
      setModalOpen(true);
    } catch (err) {
      showToast('Failed to load test for editing', 'error');
    }
  };

  const handleDuplicate = async (testId: number) => {
    try {
      await api.post(`/tests/${testId}/duplicate`);
      showToast('Assessment duplicated as draft', 'success');
      loadData();
    } catch (err) {
      showToast('Failed to duplicate test', 'error');
    }
  };

  const togglePublish = async (test: Test) => {
    const newStatus = test.status === 'published' ? 'draft' : 'published';
    try {
      await api.patch(`/tests/${test.id}/status`, { status: newStatus });
      showToast(`Test status changed to ${newStatus}`, 'info');
      loadData();
    } catch (err) {
      showToast('Failed to update status', 'error');
    }
  };

  const handleDelete = async (testId: number) => {
    if (!window.confirm('Are you sure you want to delete this assessment? All student attempts will be removed.')) return;
    try {
      await api.delete(`/tests/${testId}`);
      showToast('Test deleted', 'info');
      loadData();
    } catch (err) {
      showToast('Failed to delete test', 'error');
    }
  };

  const openSubmissions = async (testId: number) => {
    try {
      const data = await api.get(`/tests/${testId}/submissions`);
      setSelectedSubmissionsData(data);
      setSubmissionsModalOpen(true);
    } catch (err) {
      showToast('Failed to fetch test submissions', 'error');
    }
  };

  const handleExportCSV = async (testId: number) => {
    try {
      const csvText = await api.get(`/tests/${testId}/export/csv`);
      const blob = new Blob([csvText], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `results_${testId}.csv`;
      a.click();
      showToast('Test results exported to CSV', 'success');
    } catch (err) {
      showToast('Export failed', 'error');
    }
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
    if (questions.length === 1) return;
    setQuestions(prev => prev.filter((_, i) => i !== idx));
  };

  const updateQuestion = (idx: number, field: keyof Question, val: any) => {
    setQuestions(prev => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], [field]: val };
      return copy;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testForm.title || !testForm.subject) {
      showToast('Please fill out required fields', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      if (editingTestId) {
        await api.put(`/tests/${editingTestId}`, {
          ...testForm,
          batch_id: testForm.batch_id ? Number(testForm.batch_id) : null,
          questions,
        });
        showToast('Test updated successfully', 'success');
      } else {
        await api.post('/tests', {
          ...testForm,
          batch_id: testForm.batch_id ? Number(testForm.batch_id) : null,
          questions,
        });
        showToast('New online assessment published!', 'success');
      }
      setModalOpen(false);
      loadData();
    } catch (err: any) {
      showToast(err.message || 'Failed to save test', 'error');
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
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-black text-2xl sm:text-3xl text-white">
            Online Examination & Test Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Create, duplicate, publish, configure timers and passing criteria, and inspect candidate scores.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-500 hover:to-brand-600 text-white text-xs font-bold shadow-glow-sm flex items-center gap-1.5 transition-all"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Create Assessment</span>
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
                <th className="p-3.5">Duration</th>
                <th className="p-3.5">Questions</th>
                <th className="p-3.5">Batch</th>
                <th className="p-3.5">Submissions</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {tests.map(t => (
                <tr key={t.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="p-3.5">
                    <p className="font-bold text-white text-sm">{t.title}</p>
                    <p className="text-[11px] text-slate-400 font-mono">Marks: {t.total_marks} (Passing: {t.passing_marks})</p>
                  </td>
                  <td className="p-3.5 text-brand-300 font-semibold">{t.subject}</td>
                  <td className="p-3.5 text-slate-300 font-mono">{t.duration_minutes} Mins</td>
                  <td className="p-3.5 font-bold text-white">{t.questions_count || 0} Qs</td>
                  <td className="p-3.5 font-mono text-cyan-300">{t.batch_name || 'All Batches'}</td>
                  <td className="p-3.5">
                    <button
                      onClick={() => openSubmissions(t.id)}
                      className="px-2.5 py-1 rounded-lg bg-emerald-950/80 hover:bg-emerald-900/80 text-emerald-300 border border-emerald-500/30 font-bold text-xs"
                    >
                      {t.submissions_count || 0} Attempts
                    </button>
                  </td>
                  <td className="p-3.5">
                    <button
                      onClick={() => togglePublish(t)}
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase transition-all ${
                        t.status === 'published'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {t.status}
                    </button>
                  </td>
                  <td className="p-3.5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => openEditModal(t.id)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
                        title="Edit Test & Questions"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleDuplicate(t.id)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-brand-400"
                        title="Duplicate Test"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleExportCSV(t.id)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-400"
                        title="Export CSV"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleDelete(t.id)}
                        className="p-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900/40 text-rose-400"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Submissions Modal */}
      <Modal
        isOpen={submissionsModalOpen}
        onClose={() => setSubmissionsModalOpen(false)}
        title="Assessment Submissions & Score Breakdown"
        subtitle={selectedSubmissionsData?.test?.title}
        maxWidth="4xl"
      >
        {selectedSubmissionsData && (
          <div className="space-y-4 text-xs">
            {/* Quick stats */}
            <div className="grid grid-cols-4 gap-3 p-4 rounded-2xl bg-slate-900/80 border border-slate-800 text-center">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Submissions</span>
                <span className="font-bold text-white text-base">{selectedSubmissionsData.metrics.total_submissions}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Average Score</span>
                <span className="font-bold text-brand-300 text-base">{selectedSubmissionsData.metrics.avg_percentage}%</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Highest Score</span>
                <span className="font-bold text-emerald-400 text-base">{selectedSubmissionsData.metrics.highest_score}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Pass Rate</span>
                <span className="font-bold text-cyan-400 text-base">{selectedSubmissionsData.metrics.pass_rate}%</span>
              </div>
            </div>

            {/* Table */}
            <div className="max-h-64 overflow-y-auto border border-slate-800 rounded-2xl">
              <table className="w-full text-left">
                <thead className="bg-slate-900 text-slate-400 font-semibold uppercase text-[10px] sticky top-0">
                  <tr>
                    <th className="p-3">Student ID</th>
                    <th className="p-3">Candidate</th>
                    <th className="p-3">Score</th>
                    <th className="p-3">Percentage</th>
                    <th className="p-3">Result</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {selectedSubmissionsData.submissions?.map((sub: any) => (
                    <tr key={sub.id} className="hover:bg-slate-800/40">
                      <td className="p-3 font-mono font-bold text-brand-300">{sub.student_id}</td>
                      <td className="p-3 font-semibold text-white">{sub.student_name}</td>
                      <td className="p-3 font-mono font-bold text-slate-200">{sub.score} / {sub.total_marks}</td>
                      <td className="p-3 font-bold">{sub.percentage}%</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          sub.passed ? 'bg-emerald-950 text-emerald-300' : 'bg-rose-950 text-rose-300'
                        }`}>
                          {sub.passed ? 'PASSED' : 'FAILED'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </Modal>

      {/* Test Creation & Question Bank Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingTestId ? 'Edit Online Assessment' : 'Create Online Assessment'}
        subtitle="Manage questions, timing, passing thresholds, and batch assignment"
        maxWidth="2xl"
      >
        <form onSubmit={handleSubmit} className="space-y-6 max-h-[75vh] overflow-y-auto pr-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Test Title *</label>
              <input
                type="text"
                required
                value={testForm.title}
                onChange={e => setTestForm({ ...testForm, title: e.target.value })}
                placeholder="e.g. Core Java Assessment"
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
                Questions ({questions.length})
              </h4>
              <button
                type="button"
                onClick={addQuestion}
                className="px-3 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold flex items-center gap-1"
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
                  placeholder="Question text..."
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
              onClick={() => setModalOpen(false)}
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
              <span>{submitting ? 'Saving Assessment...' : 'Save & Publish Assessment'}</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
