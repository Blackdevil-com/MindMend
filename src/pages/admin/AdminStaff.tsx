import React, { useState, useEffect, useRef } from 'react';
import { api } from '../../services/api';
import { useToast } from '../../components/common/Toast';
import { Staff } from '../../types/index';
import { Modal } from '../../components/common/Modal';
import {
  UserCheck,
  PlusCircle,
  Phone,
  Mail,
  Shield,
  Layers,
  BookOpen,
  Edit2,
  CheckCircle2,
  XCircle,
  KeyRound,
  Trash2,
  Upload,
  Check,
  AlertCircle,
  Inbox,
  RefreshCw,
  FileSpreadsheet,
  Eye,
  Send,
  Loader2,
} from 'lucide-react';

interface PendingStaff {
  id: number;
  full_name: string;
  email: string;
  phone: string;
  designation: string;
  staff_id: string;
  created_at: string;
}

interface SentEmail {
  id: number;
  recipient_email: string;
  subject: string;
  body_html: string;
  sent_at: string;
}

interface ImportRow {
  full_name: string;
  email: string;
  phone: string;
  designation: string;
  staff_id: string;
  status: 'valid' | 'invalid' | 'conflict';
  errorMsg?: string;
}

export const AdminStaff: React.FC = () => {
  const { showToast } = useToast();
  
  // State variables
  const [activeTab, setActiveTab] = useState<'active' | 'pending' | 'emails'>('active');
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [pendingList, setPendingList] = useState<PendingStaff[]>([]);
  const [emailLogs, setEmailLogs] = useState<SentEmail[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modals
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [passwordTargetStaff, setPasswordTargetStaff] = useState<Staff | null>(null);
  const [viewEmailModalOpen, setViewEmailModalOpen] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState<SentEmail | null>(null);
  
  // Form/Input states
  const [submitting, setSubmitting] = useState(false);
  const [createType, setCreateType] = useState<'active' | 'pending'>('pending');
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    designation: '',
    password: 'Staff@123',
    can_create_tests: true,
  });

  const [editFormData, setEditFormData] = useState({
    full_name: '',
    phone: '',
    designation: '',
    can_create_tests: true,
    status: 'active',
  });

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submittingPassword, setSubmittingPassword] = useState(false);

  // Bulk selection for verification
  const [selectedPendingIds, setSelectedPendingIds] = useState<number[]>([]);
  const [verifyingBulk, setVerifyingBulk] = useState(false);

  // Bulk Import state
  const [pasteData, setPasteData] = useState('');
  const [importRows, setImportRows] = useState<ImportRow[]>([]);
  const [validatingImport, setValidatingImport] = useState(false);
  const [importStep, setImportStep] = useState<'input' | 'preview'>('input');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([loadActiveStaff(), loadPendingStaff(), loadEmailLogs()]);
    } catch (err) {
      console.error('Failed to reload dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadActiveStaff = () => {
    return api.get('/staff')
      .then(data => setStaffList(data.staff || []))
      .catch(() => {
        setStaffList([
          { id: 1, staff_id: 'STF20260001', full_name: 'Dr. Sarah Jenkins', email: 'sarah@mindmend.edu', phone: '+91 98765 43210', designation: 'Lead Full-Stack Trainer', can_create_tests: true, account_status: 'active' },
          { id: 2, staff_id: 'STF20260002', full_name: 'Prof. Alex Rivera', email: 'alex.r@mindmend.edu', phone: '+91 98765 43211', designation: 'UI/UX Design Specialist', can_create_tests: true, account_status: 'active' },
        ] as any);
      });
  };

  const loadPendingStaff = () => {
    return api.get('/staff/pending')
      .then(data => setPendingList(data.pending || []))
      .catch(() => setPendingList([]));
  };

  const loadEmailLogs = () => {
    return api.get('/staff/sent-emails')
      .then(data => setEmailLogs(data.emails || []))
      .catch(() => setEmailLogs([]));
  };

  // Create Manual Staff Handler (Active or Pending)
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.full_name || !formData.email) {
      showToast('Please provide full name and email', undefined, 'error');
      return;
    }

    setSubmitting(true);
    const apiEndpoint = createType === 'active' ? '/staff' : '/staff/pending';
    const payload = createType === 'active' ? formData : {
      full_name: formData.full_name,
      email: formData.email,
      phone: formData.phone || '+91 98765 00000',
      designation: formData.designation || 'Trainer',
    };

    api.post(apiEndpoint, payload)
      .then(res => {
        showToast(
          createType === 'active' 
            ? `New staff member ${formData.full_name} created & credentials emailed! ✨`
            : `Staff member ${formData.full_name} added to pending verification!`,
          undefined,
          'success'
        );
        setCreateModalOpen(false);
        // Reset form
        setFormData({
          full_name: '',
          email: '',
          phone: '',
          designation: '',
          password: 'Staff@123',
          can_create_tests: true,
        });
        loadAllData();
      })
      .catch((err) => {
        showToast(err.message || 'Failed to create staff', undefined, 'error');
      })
      .finally(() => setSubmitting(false));
  };

  // Edit Active Staff Info
  const openEditStaff = (st: Staff) => {
    setEditingStaff(st);
    setEditFormData({
      full_name: st.full_name,
      phone: st.phone,
      designation: st.designation,
      can_create_tests: st.can_create_tests,
      status: st.account_status,
    });
    setEditModalOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStaff) return;
    setSubmitting(true);

    api.put(`/staff/${editingStaff.id}`, editFormData)
      .then(() => {
        showToast('Trainer details updated successfully! ✨', undefined, 'success');
        setEditModalOpen(false);
        loadActiveStaff();
      })
      .catch((err) => {
        showToast(err.message || 'Failed to update trainer details', undefined, 'error');
      })
      .finally(() => setSubmitting(false));
  };

  // Toggle Active Staff status (Suspend/Reactivate)
  const toggleStatus = (st: Staff) => {
    const newStatus = st.account_status === 'active' ? 'inactive' : 'active';
    api.put(`/staff/${st.id}`, { status: newStatus })
      .then(() => {
        showToast(`Staff status updated to ${newStatus}`, undefined, 'success');
        loadActiveStaff();
      })
      .catch((err) => {
        showToast(err.message || 'Failed to update status', undefined, 'error');
      });
  };

  // Password Reset
  const openChangePassword = (st: Staff) => {
    setPasswordTargetStaff(st);
    setNewPassword('');
    setConfirmPassword('');
    setPasswordModalOpen(true);
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      showToast('Passwords do not match', undefined, 'error');
      return;
    }
    if (newPassword.length < 6) {
      showToast('Password must be at least 6 characters long', undefined, 'error');
      return;
    }

    setSubmittingPassword(true);
    api.post(`/staff/${passwordTargetStaff?.id}/change-password`, { password: newPassword })
      .then(() => {
        showToast(`Password updated successfully for ${passwordTargetStaff?.full_name}! ✨`, undefined, 'success');
        setPasswordModalOpen(false);
      })
      .catch((err) => {
        showToast(err.message || 'Failed to change password', undefined, 'error');
      })
      .finally(() => setSubmittingPassword(false));
  };

  // Delete Active Staff
  const handleDeleteStaff = (st: Staff) => {
    if (window.confirm(`Are you absolutely sure you want to permanently delete the account for ${st.full_name} (${st.email})? This action cannot be undone.`)) {
      api.delete(`/staff/${st.id}`)
        .then(() => {
          showToast(`Account for ${st.full_name} has been removed successfully.`, undefined, 'info');
          loadActiveStaff();
        })
        .catch((err) => {
          showToast(err.message || 'Failed to remove account', undefined, 'error');
        });
    }
  };

  // Delete/Reject Pending Staff
  const handleDeletePending = (st: PendingStaff) => {
    if (window.confirm(`Reject and delete registration for pending staff ${st.full_name}?`)) {
      api.delete(`/staff/pending/${st.id}`)
        .then(() => {
          showToast('Pending registration rejected and removed.', undefined, 'info');
          setSelectedPendingIds(prev => prev.filter(id => id !== st.id));
          loadPendingStaff();
        })
        .catch((err) => {
          showToast(err.message || 'Failed to reject registration', undefined, 'error');
        });
    }
  };

  // Verify Pending Staff (Approve & Email)
  const handleVerifyPending = (st: PendingStaff) => {
    showToast(`Verifying ${st.full_name} and generating credentials...`, undefined, 'info');
    api.post(`/staff/pending/${st.id}/verify`)
      .then(() => {
        showToast(`Trainer ${st.full_name} verified! Welcome email sent.`, undefined, 'success');
        setSelectedPendingIds(prev => prev.filter(id => id !== st.id));
        loadAllData();
      })
      .catch((err) => {
        showToast(err.message || 'Failed to verify staff', undefined, 'error');
      });
  };

  // Bulk verify handlers
  const handleBulkSelection = (id: number) => {
    setSelectedPendingIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleSelectAllPending = () => {
    if (selectedPendingIds.length === pendingList.length) {
      setSelectedPendingIds([]);
    } else {
      setSelectedPendingIds(pendingList.map(x => x.id));
    }
  };

  const handleBulkVerify = () => {
    if (selectedPendingIds.length === 0) return;
    if (!window.confirm(`Verify and send credential emails to all ${selectedPendingIds.length} selected trainers?`)) return;

    setVerifyingBulk(true);
    api.post('/staff/pending/verify-bulk', { ids: selectedPendingIds })
      .then((res) => {
        showToast(res.message || 'Bulk verification complete!', undefined, 'success');
        setSelectedPendingIds([]);
        loadAllData();
      })
      .catch((err) => {
        showToast(err.message || 'Bulk verification failed', undefined, 'error');
      })
      .finally(() => setVerifyingBulk(false));
  };

  // Excel / CSV File Parsing Helper
  const parseRawTextData = (text: string) => {
    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    if (lines.length === 0) return [];
    
    // Detect column separator: tab or comma
    const firstLine = lines[0];
    const separator = firstLine.includes('\t') ? '\t' : ',';
    
    const parsedRows: any[] = [];
    let startIndex = 0;
    
    // Check if the first row is a header
    const cols = firstLine.split(separator).map(c => c.trim().toLowerCase());
    const isHeader = cols.some(c => c.includes('name') || c.includes('email') || c.includes('role') || c.includes('designation'));
    if (isHeader) {
      startIndex = 1;
    }
    
    for (let i = startIndex; i < lines.length; i++) {
      const rowCols = lines[i].split(separator).map(c => c.trim().replace(/^["']|["']$/g, ''));
      if (rowCols.length >= 2) {
        parsedRows.push({
          full_name: rowCols[0] || '',
          email: rowCols[1] || '',
          phone: rowCols[2] || '+91 98765 00000',
          designation: rowCols[3] || 'Trainer'
        });
      }
    }
    return parsedRows;
  };

  // Handle Drag & Drop / CSV Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        setPasteData(text);
        showToast('CSV/Text file parsed successfully! Review the data below.', undefined, 'success');
      }
    };
    reader.readAsText(file);
  };

  // Preview Import rows
  const handlePreviewImport = () => {
    const parsedRows = parseRawTextData(pasteData);
    if (parsedRows.length === 0) {
      showToast('No valid rows found in paste area or file.', undefined, 'error');
      return;
    }

    setValidatingImport(true);
    api.post('/staff/import-preview', { rows: parsedRows })
      .then(res => {
        setImportRows(res.previewRows || []);
        setImportStep('preview');
      })
      .catch((err) => {
        showToast(err.message || 'Failed to preview data', undefined, 'error');
      })
      .finally(() => setValidatingImport(false));
  };

  // Update specific field in preview grid
  const handlePreviewRowChange = (index: number, field: keyof ImportRow, value: string) => {
    const updated = [...importRows];
    updated[index] = {
      ...updated[index],
      [field]: value
    };
    setImportRows(updated);
  };

  // Re-run validation for preview rows (locally or via backend)
  const handleReValidateImport = () => {
    setValidatingImport(true);
    api.post('/staff/import-preview', { rows: importRows })
      .then(res => {
        setImportRows(res.previewRows || []);
        showToast('Validation updated successfully.', undefined, 'success');
      })
      .catch((err) => {
        showToast(err.message || 'Failed to validate data', undefined, 'error');
      })
      .finally(() => setValidatingImport(false));
  };

  // Submit and save import
  const handleCommitImport = () => {
    const invalidCount = importRows.filter(r => r.status === 'invalid').length;
    if (invalidCount > 0) {
      showToast(`Cannot import. Please fix or remove the ${invalidCount} invalid rows first.`, undefined, 'error');
      return;
    }

    setSubmitting(true);
    api.post('/staff/import-commit', { rows: importRows })
      .then(res => {
        showToast(res.message || 'Import completed successfully!', undefined, 'success');
        setImportModalOpen(false);
        setPasteData('');
        setImportStep('input');
        loadAllData();
      })
      .catch((err) => {
        showToast(err.message || 'Failed to save import', undefined, 'error');
      })
      .finally(() => setSubmitting(false));
  };

  // View Sent Email modal
  const openViewEmail = (email: SentEmail) => {
    setSelectedEmail(email);
    setViewEmailModalOpen(true);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 select-none px-4">
      {/* Top Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-purple-100 shadow-[0_4px_20px_-2px_rgba(106,27,154,0.03)]">
        <div>
          <h1 className="font-display font-black text-2xl sm:text-3xl text-slate-900 flex items-center gap-3">
            <UserCheck className="w-8 h-8 text-[#8E24AA]" />
            <span>Staff & Trainer Administration</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
            Register trainers, parse Excel imports, validate IDs, verify credentials, and review email dispatch.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setImportStep('input');
              setPasteData('');
              setImportRows([]);
              setImportModalOpen(true);
            }}
            className="px-4 py-2.5 rounded-xl bg-purple-50 text-[#6A1B9A] border border-purple-200 text-xs font-bold hover:bg-purple-100 flex items-center gap-2 transition-all shadow-sm"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Excel / CSV Import</span>
          </button>
          
          <button
            onClick={() => setCreateModalOpen(true)}
            className="px-5 py-2.5 rounded-xl bg-[#6A1B9A] hover:bg-[#8E24AA] text-white text-xs font-bold shadow-glow-purple flex items-center gap-2 transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add Trainer</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-purple-100 bg-white p-2 rounded-2xl border gap-2 shadow-sm">
        <button
          onClick={() => setActiveTab('active')}
          className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
            activeTab === 'active'
              ? 'bg-[#6A1B9A] text-white shadow-glow-purple'
              : 'text-slate-600 hover:bg-purple-50/50'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>Active Staff ({staffList.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('pending')}
          className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all relative ${
            activeTab === 'pending'
              ? 'bg-[#6A1B9A] text-white shadow-glow-purple'
              : 'text-slate-600 hover:bg-purple-50/50'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Pending Verification ({pendingList.length})</span>
          {pendingList.length > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white rounded-full text-[9px] flex items-center justify-center font-black animate-pulse">
              {pendingList.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('emails')}
          className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
            activeTab === 'emails'
              ? 'bg-[#6A1B9A] text-white shadow-glow-purple'
              : 'text-slate-600 hover:bg-purple-50/50'
          }`}
        >
          <Mail className="w-4 h-4" />
          <span>Sent Credentials Logs ({emailLogs.length})</span>
        </button>
      </div>

      {/* Tab Contents loading indicator */}
      {loading ? (
        <div className="min-h-[30vh] flex items-center justify-center bg-white border border-purple-100 rounded-3xl">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-10 h-10 text-[#6A1B9A] animate-spin" />
            <p className="text-xs text-slate-500 font-semibold">Loading data...</p>
          </div>
        </div>
      ) : (
        <>
          {/* TAB 1: ACTIVE STAFF */}
          {activeTab === 'active' && (
            <div className="bg-white rounded-3xl border border-purple-100 overflow-hidden shadow-[0_4px_20px_-2px_rgba(106,27,154,0.04)]">
              <div className="p-4 bg-purple-50/50 border-b border-purple-100 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">Instructors and rights list</span>
                <button onClick={loadActiveStaff} className="p-1.5 rounded-lg bg-white border border-purple-200 text-purple-700 hover:bg-purple-50">
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>
              {staffList.length === 0 ? (
                <div className="p-12 text-center text-slate-500 text-xs font-semibold">
                  No active trainers registered. Click "Add Trainer" to get started.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#F5EFFB] text-[#6A1B9A] uppercase font-bold border-b border-purple-100">
                      <tr>
                        <th className="p-4">Staff ID</th>
                        <th className="p-4">Trainer Name</th>
                        <th className="p-4">Designation</th>
                        <th className="p-4">Test Rights</th>
                        <th className="p-4">Status</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-purple-50">
                      {staffList.map(st => (
                        <tr key={st.id} className="hover:bg-purple-50/30 transition-colors">
                          <td className="p-4 font-mono font-bold text-[#6A1B9A]">{st.staff_id}</td>
                          <td className="p-4">
                            <p className="font-semibold text-slate-800">{st.full_name}</p>
                            <p className="text-[10px] text-slate-500 font-mono mt-0.5">{st.email}</p>
                          </td>
                          <td className="p-4 font-medium text-slate-600">{st.designation}</td>
                          <td className="p-4">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                              st.can_create_tests
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                : 'bg-slate-100 text-slate-800 border-slate-200'
                            }`}>
                              {st.can_create_tests ? 'Test Access' : 'No Test Access'}
                            </span>
                          </td>
                          <td className="p-4">
                            <button
                              onClick={() => toggleStatus(st)}
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase transition-all border ${
                                st.account_status === 'active'
                                  ? 'bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-200'
                                  : 'bg-rose-100 text-rose-800 border-rose-200 hover:bg-rose-200'
                              }`}
                            >
                              {st.account_status}
                            </button>
                          </td>
                          <td className="p-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => openEditStaff(st)}
                                className="p-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-[#6A1B9A] border border-purple-200"
                                title="Edit Trainer info"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>

                              <button
                                onClick={() => openChangePassword(st)}
                                className="p-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200"
                                title="Change Password"
                              >
                                <KeyRound className="w-3.5 h-3.5" />
                              </button>

                              <button
                                onClick={() => handleDeleteStaff(st)}
                                className="p-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200"
                                title="Delete Trainer Account"
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
              )}
            </div>
          )}

          {/* TAB 2: PENDING VERIFICATION */}
          {activeTab === 'pending' && (
            <div className="bg-white rounded-3xl border border-purple-100 overflow-hidden shadow-[0_4px_20px_-2px_rgba(106,27,154,0.04)] space-y-4">
              <div className="p-4 bg-purple-50/50 border-b border-purple-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-slate-700">Waiting for approval</span>
                  {selectedPendingIds.length > 0 && (
                    <span className="bg-purple-150 px-2 py-0.5 rounded text-[10px] text-[#6A1B9A] font-bold">
                      {selectedPendingIds.length} selected
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {selectedPendingIds.length > 0 && (
                    <button
                      onClick={handleBulkVerify}
                      disabled={verifyingBulk}
                      className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold shadow flex items-center gap-1.5 transition-all"
                    >
                      {verifyingBulk ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <Check className="w-3.5 h-3.5" />
                      )}
                      <span>Verify Selected ({selectedPendingIds.length})</span>
                    </button>
                  )}
                  <button onClick={loadPendingStaff} className="p-1.5 rounded-lg bg-white border border-purple-200 text-purple-700 hover:bg-purple-50">
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {pendingList.length === 0 ? (
                <div className="p-12 text-center text-slate-500 text-xs font-semibold">
                  No trainers waiting for verification. Accounts can be imported or added manually.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#F5EFFB] text-[#6A1B9A] uppercase font-bold border-b border-purple-100">
                      <tr>
                        <th className="p-4 w-10">
                          <input
                            type="checkbox"
                            className="rounded text-[#6A1B9A] focus:ring-[#6A1B9A] w-4 h-4 cursor-pointer"
                            checked={selectedPendingIds.length === pendingList.length && pendingList.length > 0}
                            onChange={handleSelectAllPending}
                          />
                        </th>
                        <th className="p-4">Generated ID</th>
                        <th className="p-4">Trainer Details</th>
                        <th className="p-4">Designation</th>
                        <th className="p-4">Contact</th>
                        <th className="p-4 text-right">Verification</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-purple-50">
                      {pendingList.map(st => (
                        <tr key={st.id} className="hover:bg-purple-50/30 transition-colors">
                          <td className="p-4">
                            <input
                              type="checkbox"
                              className="rounded text-[#6A1B9A] focus:ring-[#6A1B9A] w-4 h-4 cursor-pointer"
                              checked={selectedPendingIds.includes(st.id)}
                              onChange={() => handleBulkSelection(st.id)}
                            />
                          </td>
                          <td className="p-4 font-mono font-bold text-slate-700">
                            {st.staff_id}
                          </td>
                          <td className="p-4">
                            <p className="font-semibold text-slate-800">{st.full_name}</p>
                            <p className="text-[10px] text-slate-400 font-mono mt-0.5">Added on: {new Date(st.created_at).toLocaleDateString()}</p>
                          </td>
                          <td className="p-4 font-medium text-slate-600">{st.designation}</td>
                          <td className="p-4">
                            <p className="flex items-center gap-1.5 text-slate-600">
                              <Mail className="w-3.5 h-3.5 text-slate-400" />
                              <span>{st.email}</span>
                            </p>
                            <p className="flex items-center gap-1.5 text-slate-500 text-[10px] mt-0.5">
                              <Phone className="w-3 h-3 text-slate-400" />
                              <span>{st.phone}</span>
                            </p>
                          </td>
                          <td className="p-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleVerifyPending(st)}
                                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] flex items-center gap-1 transition-all shadow-sm"
                                title="Approve and send credentials email"
                              >
                                <Check className="w-3 h-3" />
                                <span>Verify & Approve</span>
                              </button>

                              <button
                                onClick={() => handleDeletePending(st)}
                                className="p-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200"
                                title="Reject and delete draft registration"
                              >
                                <XCircle className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: SENT EMAIL LOGS */}
          {activeTab === 'emails' && (
            <div className="bg-white rounded-3xl border border-purple-100 overflow-hidden shadow-[0_4px_20px_-2px_rgba(106,27,154,0.04)]">
              <div className="p-4 bg-purple-50/50 border-b border-purple-100 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">Audit logs of generated login credentials</span>
                <button onClick={loadEmailLogs} className="p-1.5 rounded-lg bg-white border border-purple-200 text-purple-700 hover:bg-purple-50">
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>
              {emailLogs.length === 0 ? (
                <div className="p-12 text-center text-slate-500 text-xs font-semibold">
                  No automated credentials emails logged yet. Emails will appear here after staff are verified.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#F5EFFB] text-[#6A1B9A] uppercase font-bold border-b border-purple-100">
                      <tr>
                        <th className="p-4">Log ID</th>
                        <th className="p-4">Recipient Email</th>
                        <th className="p-4">Subject</th>
                        <th className="p-4">Sent Time</th>
                        <th className="p-4 text-right">Preview Content</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-purple-50">
                      {emailLogs.map(log => (
                        <tr key={log.id} className="hover:bg-purple-50/30 transition-colors">
                          <td className="p-4 font-mono text-slate-500">#{log.id}</td>
                          <td className="p-4 font-bold text-slate-800">{log.recipient_email}</td>
                          <td className="p-4 text-slate-600">{log.subject}</td>
                          <td className="p-4 text-slate-500 font-mono">{new Date(log.sent_at).toLocaleString()}</td>
                          <td className="p-4 text-right">
                            <button
                              onClick={() => openViewEmail(log)}
                              className="px-2.5 py-1.5 rounded-lg bg-purple-50 hover:bg-purple-100 text-[#6A1B9A] border border-purple-200 inline-flex items-center gap-1 text-[10px] font-bold transition-all"
                            >
                              <Eye className="w-3 h-3" />
                              <span>View HTML Content</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* MODAL 1: CREATE TRAINER ACCOUNT (MANUAL) */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Register New Staff Trainer"
        subtitle="Manually add a trainer as verified active or pending review"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          {/* Active/Pending mode toggle */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Registration Method</label>
            <div className="grid grid-cols-2 gap-2 bg-[#F5EFFB] p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setCreateType('pending')}
                className={`py-2 text-[11px] font-bold rounded-lg transition-all ${
                  createType === 'pending'
                    ? 'bg-[#6A1B9A] text-white shadow-sm'
                    : 'text-[#6A1B9A] hover:bg-purple-100/50'
                }`}
              >
                Save as Pending Draft
              </button>
              <button
                type="button"
                onClick={() => setCreateType('active')}
                className={`py-2 text-[11px] font-bold rounded-lg transition-all ${
                  createType === 'active'
                    ? 'bg-[#6A1B9A] text-white shadow-sm'
                    : 'text-[#6A1B9A] hover:bg-purple-100/50'
                }`}
              >
                Send Credentials Instantly
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Full Name *</label>
            <input
              type="text"
              required
              value={formData.full_name}
              onChange={e => setFormData({ ...formData, full_name: e.target.value })}
              placeholder="e.g. Dr. Sarah Jenkins"
              className="w-full px-3.5 py-2.5 bg-[#F5EFFB] border border-purple-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#6A1B9A]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Email Address *</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                placeholder="trainer@mindmend.edu"
                className="w-full px-3.5 py-2.5 bg-[#F5EFFB] border border-purple-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#6A1B9A]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Designation *</label>
              <input
                type="text"
                required
                value={formData.designation}
                onChange={e => setFormData({ ...formData, designation: e.target.value })}
                placeholder="e.g. Lead Full-Stack Trainer"
                className="w-full px-3.5 py-2.5 bg-[#F5EFFB] border border-purple-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#6A1B9A]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Phone Mobile Number</label>
            <input
              type="text"
              value={formData.phone}
              onChange={e => setFormData({ ...formData, phone: e.target.value })}
              placeholder="e.g. +91 98765 43210"
              className="w-full px-3.5 py-2.5 bg-[#F5EFFB] border border-purple-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#6A1B9A]"
            />
          </div>

          {createType === 'active' && (
            <div className="p-3 bg-purple-50/50 rounded-xl border border-purple-100 space-y-3">
              <div>
                <label className="block text-xs font-bold text-[#6A1B9A] mb-1">Instructor Portal Password *</label>
                <input
                  type="text"
                  required
                  value={formData.password}
                  onChange={e => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Password length min 6"
                  className="w-full px-3.5 py-2.5 bg-white border border-purple-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#6A1B9A]"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="can_create_tests"
                  checked={formData.can_create_tests}
                  onChange={e => setFormData({ ...formData, can_create_tests: e.target.checked })}
                  className="rounded text-[#6A1B9A] focus:ring-[#6A1B9A] w-4 h-4 cursor-pointer"
                />
                <label htmlFor="can_create_tests" className="text-xs text-slate-700 font-semibold cursor-pointer">
                  Grant permission to create and evaluate tests
                </label>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-3">
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
              className="px-6 py-2.5 rounded-xl bg-[#6A1B9A] hover:bg-[#8E24AA] text-white text-xs font-bold shadow-glow-purple flex items-center gap-1.5"
            >
              {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>{submitting ? 'Creating...' : createType === 'active' ? 'Register & Email' : 'Add to Drafts'}</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL 2: BULK IMPORT STAFF (EXCEL/CSV/GOOGLE SHEETS COPY-PASTE) */}
      <Modal
        isOpen={importModalOpen}
        onClose={() => setImportModalOpen(false)}
        title="Import Trainer List"
        subtitle="Import staff data from Excel, Google Sheets, or a CSV file"
        className="max-w-4xl"
      >
        <div className="space-y-4">
          {importStep === 'input' ? (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-purple-50 p-4 rounded-2xl border border-purple-100">
                <div className="text-left">
                  <p className="text-xs font-bold text-slate-800">Option 1: Upload a CSV/Text File</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">Format: Name, Email, Phone, Designation (one per line)</p>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept=".csv,.txt"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 rounded-xl bg-white border border-purple-200 hover:bg-purple-50 text-[#6A1B9A] text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Select CSV File</span>
                  </button>
                </div>
              </div>

              <div className="space-y-1 text-left">
                <label className="block text-xs font-bold text-slate-700">Option 2: Paste Rows directly from Excel or Google Sheets</label>
                <p className="text-[10px] text-slate-500">Copy the data from Excel/Google Sheets columns (Full Name, Email, Phone, Designation) and paste below. Tab separators will be auto-parsed.</p>
                <textarea
                  value={pasteData}
                  onChange={(e) => setPasteData(e.target.value)}
                  placeholder={`John Doe\tjohn@mindmend.edu\t+919876543210\tLead Full-Stack Trainer\nAlex Rivera\talex.r@mindmend.edu\t+919876543211\tUX Designer`}
                  rows={8}
                  className="w-full px-4 py-3 bg-[#F5EFFB] border border-purple-200 rounded-2xl text-xs text-slate-800 font-mono focus:outline-none focus:border-[#6A1B9A]"
                />
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setImportModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePreviewImport}
                  disabled={validatingImport || !pasteData.trim()}
                  className="px-5 py-2.5 rounded-xl bg-[#6A1B9A] hover:bg-[#8E24AA] text-white text-xs font-bold shadow-glow-purple flex items-center gap-1.5"
                >
                  {validatingImport && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{validatingImport ? 'Analyzing data...' : 'Parse & Validate IDs'}</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-[#F5EFFB] p-3 rounded-xl border border-purple-100 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-slate-700">
                  <AlertCircle className="w-4 h-4 text-purple-700" />
                  <span>Please review and validate the proposed Staff IDs. You can click on cells to edit raw data.</span>
                </div>
                <button
                  onClick={handleReValidateImport}
                  disabled={validatingImport}
                  className="px-3 py-1 rounded-lg bg-white border border-purple-200 text-purple-800 text-[10px] font-bold flex items-center gap-1 hover:bg-purple-50"
                >
                  <RefreshCw className={`w-3 h-3 ${validatingImport ? 'animate-spin' : ''}`} />
                  <span>Re-Validate</span>
                </button>
              </div>

              <div className="overflow-x-auto max-h-[350px] border border-purple-100 rounded-2xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-purple-50 text-purple-800 font-bold sticky top-0 border-b border-purple-100 z-10">
                    <tr>
                      <th className="p-3">Status</th>
                      <th className="p-3">Generated ID</th>
                      <th className="p-3">Full Name</th>
                      <th className="p-3">Email Address</th>
                      <th className="p-3">Phone</th>
                      <th className="p-3">Designation</th>
                      <th className="p-3 text-right">Delete</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-purple-50 bg-white">
                    {importRows.map((row, idx) => (
                      <tr key={idx} className="hover:bg-purple-50/20">
                        <td className="p-3">
                          {row.status === 'valid' && (
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-0.5 w-fit">
                              <Check className="w-2.5 h-2.5" />
                              <span>Valid</span>
                            </span>
                          )}
                          {row.status === 'conflict' && (
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-rose-100 text-rose-800 border border-rose-200 flex items-center gap-0.5 w-fit" title={row.errorMsg}>
                              <AlertCircle className="w-2.5 h-2.5" />
                              <span>Conflict</span>
                            </span>
                          )}
                          {row.status === 'invalid' && (
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-rose-100 text-rose-800 border border-rose-200 flex items-center gap-0.5 w-fit" title={row.errorMsg}>
                              <XCircle className="w-2.5 h-2.5" />
                              <span>Invalid</span>
                            </span>
                          )}
                        </td>
                        <td className="p-3 font-mono font-bold text-[#6A1B9A]">
                          <input
                            type="text"
                            value={row.staff_id}
                            onChange={(e) => handlePreviewRowChange(idx, 'staff_id', e.target.value)}
                            className="bg-transparent hover:bg-slate-50 focus:bg-white border border-transparent focus:border-purple-300 rounded px-1.5 py-0.5 font-bold font-mono text-[#6A1B9A] text-xs w-28"
                          />
                        </td>
                        <td className="p-3">
                          <input
                            type="text"
                            value={row.full_name}
                            onChange={(e) => handlePreviewRowChange(idx, 'full_name', e.target.value)}
                            className="bg-transparent hover:bg-slate-50 focus:bg-white border border-transparent focus:border-purple-300 rounded px-1.5 py-0.5 text-slate-800 text-xs w-full"
                          />
                        </td>
                        <td className="p-3 font-mono">
                          <input
                            type="email"
                            value={row.email}
                            onChange={(e) => handlePreviewRowChange(idx, 'email', e.target.value)}
                            className="bg-transparent hover:bg-slate-50 focus:bg-white border border-transparent focus:border-purple-300 rounded px-1.5 py-0.5 font-mono text-slate-700 text-xs w-full"
                          />
                        </td>
                        <td className="p-3">
                          <input
                            type="text"
                            value={row.phone}
                            onChange={(e) => handlePreviewRowChange(idx, 'phone', e.target.value)}
                            className="bg-transparent hover:bg-slate-50 focus:bg-white border border-transparent focus:border-purple-300 rounded px-1.5 py-0.5 text-slate-600 text-xs w-28"
                          />
                        </td>
                        <td className="p-3">
                          <input
                            type="text"
                            value={row.designation}
                            onChange={(e) => handlePreviewRowChange(idx, 'designation', e.target.value)}
                            className="bg-transparent hover:bg-slate-50 focus:bg-white border border-transparent focus:border-purple-300 rounded px-1.5 py-0.5 text-slate-600 text-xs w-full"
                          />
                        </td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => setImportRows(prev => prev.filter((_, rIdx) => rIdx !== idx))}
                            className="p-1 rounded bg-rose-50 text-rose-600 hover:bg-rose-100"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500 font-semibold bg-slate-50 p-3 rounded-xl border">
                <div>
                  Total rows: <span className="text-slate-800 font-black">{importRows.length}</span> | 
                  Valid: <span className="text-emerald-700 font-black">{importRows.filter(r => r.status === 'valid').length}</span> | 
                  Errors: <span className="text-rose-700 font-black">{importRows.filter(r => r.status !== 'valid').length}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setImportStep('input')}
                    className="px-3.5 py-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-semibold"
                  >
                    Back to Edit Data
                  </button>
                  <button
                    onClick={handleCommitImport}
                    disabled={submitting || importRows.length === 0}
                    className="px-4 py-1.5 rounded-xl bg-[#6A1B9A] hover:bg-[#8E24AA] text-white font-bold shadow-sm"
                  >
                    {submitting ? 'Saving import...' : 'Submit & Save to Drafts'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </Modal>

      {/* MODAL 3: EDIT ACTIVE STAFF DETAILS */}
      <Modal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title="Edit Trainer Details"
        subtitle={`Trainer: ${editingStaff?.full_name} (${editingStaff?.staff_id})`}
      >
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Full Name *</label>
            <input
              type="text"
              required
              value={editFormData.full_name}
              onChange={e => setEditFormData({ ...editFormData, full_name: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-[#F5EFFB] border border-purple-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#6A1B9A]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Designation *</label>
              <input
                type="text"
                required
                value={editFormData.designation}
                onChange={e => setEditFormData({ ...editFormData, designation: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-[#F5EFFB] border border-purple-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#6A1B9A]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Phone Number</label>
              <input
                type="text"
                value={editFormData.phone}
                onChange={e => setEditFormData({ ...editFormData, phone: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-[#F5EFFB] border border-purple-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#6A1B9A]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-purple-50/50 p-3.5 rounded-xl border border-purple-100">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="edit_can_create_tests"
                checked={editFormData.can_create_tests}
                onChange={e => setEditFormData({ ...editFormData, can_create_tests: e.target.checked })}
                className="rounded text-[#6A1B9A] focus:ring-[#6A1B9A] w-4 h-4 cursor-pointer"
              />
              <label htmlFor="edit_can_create_tests" className="text-xs text-slate-700 font-semibold cursor-pointer">
                Can create and edit tests
              </label>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-xs font-bold text-slate-600">Account status:</label>
              <select
                value={editFormData.status}
                onChange={e => setEditFormData({ ...editFormData, status: e.target.value })}
                className="bg-white border border-purple-200 rounded-lg text-xs px-2.5 py-1 text-slate-800 focus:outline-none focus:border-[#6A1B9A]"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive (Suspended)</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setEditModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold hover:bg-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 rounded-xl bg-[#6A1B9A] hover:bg-[#8E24AA] text-white text-xs font-bold shadow-glow-purple flex items-center gap-1.5"
            >
              {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>{submitting ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL 4: PASSWORD RESET MODAL */}
      <Modal
        isOpen={passwordModalOpen}
        onClose={() => setPasswordModalOpen(false)}
        title="Reset Account Password"
        subtitle={`User: ${passwordTargetStaff?.full_name} (${passwordTargetStaff?.email})`}
      >
        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">New Password</label>
            <input
              type="password"
              required
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              placeholder="At least 6 characters"
              className="w-full px-3.5 py-2.5 bg-[#F5EFFB] border border-purple-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#6A1B9A]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Confirm New Password</label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              className="w-full px-3.5 py-2.5 bg-[#F5EFFB] border border-purple-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#6A1B9A]"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setPasswordModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submittingPassword}
              className="px-5 py-2.5 rounded-xl bg-[#6A1B9A] hover:bg-[#8E24AA] text-white text-xs font-bold shadow-glow-purple"
            >
              {submittingPassword ? 'Saving...' : 'Update Password'}
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL 5: VIEW SENT EMAIL HTML PREVIEW */}
      <Modal
        isOpen={viewEmailModalOpen}
        onClose={() => setViewEmailModalOpen(false)}
        title="Sent Credentials Email Audit"
        subtitle={`Audit Log for recipient: ${selectedEmail?.recipient_email}`}
        className="max-w-2xl"
      >
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between text-xs bg-slate-50 border p-3.5 rounded-2xl font-semibold text-slate-600 gap-2">
            <div>Subject: <span className="text-slate-800 font-bold">{selectedEmail?.subject}</span></div>
            <div>Sent at: <span className="text-slate-800 font-mono">{selectedEmail && new Date(selectedEmail.sent_at).toLocaleString()}</span></div>
          </div>
          
          <div className="border border-purple-100 rounded-2xl overflow-hidden bg-white max-h-[450px] overflow-y-auto">
            {selectedEmail ? (
              <div 
                className="p-4 bg-white"
                dangerouslySetInnerHTML={{ __html: selectedEmail.body_html }} 
              />
            ) : (
              <div className="p-8 text-center text-slate-400 text-xs">No email content loaded.</div>
            )}
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={() => setViewEmailModalOpen(false)}
              className="px-5 py-2.5 rounded-xl bg-[#6A1B9A] hover:bg-[#8E24AA] text-white text-xs font-bold transition-all"
            >
              Close Preview
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
