import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { X, Lock, Download, Trash2, ShieldCheck, AlertTriangle } from 'lucide-react';

interface PrivacyDataModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrivacyDataModal: React.FC<PrivacyDataModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, patientProfile, logout } = useAuth();
  const { medicalProfile, appointments, chatMessages } = useApp();

  const [deleteInput, setDeleteInput] = useState('');
  const [activeTab, setActiveTab] = useState<'privacy' | 'export' | 'delete'>('privacy');

  if (!isOpen) return null;

  const handleExportData = () => {
    const exportBundle = {
      exportTimestamp: new Date().toISOString(),
      userAccount: currentUser,
      patientProfile,
      medicalProfile,
      appointments,
      aiChatHistory: chatMessages
    };

    const blob = new Blob([JSON.stringify(exportBundle, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `FirstAidHospital_MyHealthData_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDeleteAccount = () => {
    if (deleteInput.toUpperCase() !== 'DELETE') return;

    localStorage.clear();
    logout();
    onClose();
    alert('Your account, medical profiles, and conversation records have been permanently deleted.');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white">Privacy Controls & Data Governance</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">HIPAA Data Export, Privacy Policy & Account Controls</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-2 gap-2 text-xs">
          <button
            onClick={() => setActiveTab('privacy')}
            className={`flex-1 py-2 rounded-xl font-bold transition-all cursor-pointer ${
              activeTab === 'privacy' ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-sm border border-slate-200 dark:border-transparent' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Privacy Policy
          </button>
          <button
            onClick={() => setActiveTab('export')}
            className={`flex-1 py-2 rounded-xl font-bold transition-all cursor-pointer ${
              activeTab === 'export' ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-sm border border-slate-200 dark:border-transparent' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Export My Data
          </button>
          <button
            onClick={() => setActiveTab('delete')}
            className={`flex-1 py-2 rounded-xl font-bold transition-all cursor-pointer ${
              activeTab === 'delete' ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-600/40' : 'text-slate-500 dark:text-slate-400 hover:text-rose-600'
            }`}
          >
            Delete Account
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-slate-700 dark:text-slate-300 text-xs leading-relaxed">
          {activeTab === 'privacy' && (
            <div className="space-y-4">
              <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-500/30 rounded-2xl p-4 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-xs">HIPAA Compliant Data Handling</h4>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5">
                    Your personal identifiable health information is encrypted at rest and in transit. We do not sell health data to third-party advertisers.
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-slate-900 dark:text-white text-xs">1. Information Collection</h4>
                <p className="text-slate-600 dark:text-slate-400">
                  We collect user-provided profile information including emergency contacts, blood group, medications, allergies, and symptom queries sent to AI triage services.
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-slate-900 dark:text-white text-xs">2. Doctor Access Authorization</h4>
                <p className="text-slate-600 dark:text-slate-400">
                  Your medical summary is only visible to licensed medical doctors with whom you book appointments, provided the "Share with Doctor" toggle is activated in your profile.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'export' && (
            <div className="space-y-4">
              <div className="bg-slate-50 dark:bg-slate-800/60 p-5 rounded-2xl border border-slate-200 dark:border-slate-700/80 space-y-3">
                <h4 className="font-bold text-slate-900 dark:text-white text-xs">Export Complete Health File</h4>
                <p className="text-slate-600 dark:text-slate-400 text-xs">
                  Download a structured JSON archive of all your emergency profile data, booked appointments, and AI triage conversation transcripts.
                </p>
                <button
                  onClick={handleExportData}
                  className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-sm transition-all cursor-pointer text-xs"
                >
                  <Download className="w-4 h-4" />
                  <span>Download My Health Records (.json)</span>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'delete' && (
            <div className="space-y-4">
              <div className="bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-500/40 rounded-2xl p-4 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="font-bold text-rose-800 dark:text-rose-200 text-xs">Danger Zone: Permanent Account Deletion</h4>
                  <p className="text-[11px] text-rose-700 dark:text-rose-300">
                    This action will immediately erase your account, medical emergency profile, appointments, and conversation logs. This cannot be undone.
                  </p>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Type <span className="font-mono text-rose-600 dark:text-rose-400">DELETE</span> to confirm:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={deleteInput}
                    onChange={(e) => setDeleteInput(e.target.value)}
                    placeholder="DELETE"
                    className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-slate-900 dark:text-white font-mono text-xs focus:outline-none focus:border-rose-500"
                  />
                  <button
                    onClick={handleDeleteAccount}
                    disabled={deleteInput.toUpperCase() !== 'DELETE'}
                    className="px-4 py-2 bg-rose-600 hover:bg-rose-700 disabled:opacity-40 text-white font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete All Data</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl transition-all cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
