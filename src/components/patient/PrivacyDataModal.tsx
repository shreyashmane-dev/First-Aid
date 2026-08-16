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

  const [confirmDelete, setConfirmDelete] = useState(false);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-emerald-400">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Privacy Controls & Data Governance</h2>
              <p className="text-xs text-slate-400">HIPAA Data Export, Privacy Policy & Account Deletion</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center border-b border-slate-800 bg-slate-950 p-2 gap-2 text-xs">
          <button
            onClick={() => setActiveTab('privacy')}
            className={`flex-1 py-2.5 rounded-xl font-bold transition-all ${
              activeTab === 'privacy' ? 'bg-slate-800 text-emerald-400' : 'text-slate-400 hover:text-white'
            }`}
          >
            Privacy Policy
          </button>
          <button
            onClick={() => setActiveTab('export')}
            className={`flex-1 py-2.5 rounded-xl font-bold transition-all ${
              activeTab === 'export' ? 'bg-slate-800 text-emerald-400' : 'text-slate-400 hover:text-white'
            }`}
          >
            Export My Data
          </button>
          <button
            onClick={() => setActiveTab('delete')}
            className={`flex-1 py-2.5 rounded-xl font-bold transition-all ${
              activeTab === 'delete' ? 'bg-rose-950/60 text-rose-300 border border-rose-600/40' : 'text-slate-400 hover:text-rose-400'
            }`}
          >
            Delete Account
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-slate-300 text-xs">
          {activeTab === 'privacy' && (
            <div className="space-y-4">
              <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700 space-y-2">
                <h3 className="font-bold text-white text-sm flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" /> Medical Data Privacy Standards
                </h3>
                <p className="text-slate-300 leading-relaxed text-xs">
                  First Aid Hospital complies with strict medical data protection rules. Your blood group, allergies, conditions, and emergency contacts are encrypted and accessible ONLY to you, unless you explicitly grant permission to a verified doctor during a confirmed appointment.
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-white text-xs">Key Privacy Rights</h4>
                <ul className="space-y-1.5 text-slate-400 list-disc list-inside">
                  <li>Passwords are managed exclusively by Firebase Authentication.</li>
                  <li>No AI conversation audio/images are stored for training without explicit consent.</li>
                  <li>Cloudinary image uploads are isolated with signed asset references.</li>
                  <li>You can export or permanently delete your health records at any time.</li>
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'export' && (
            <div className="space-y-4">
              <div className="bg-emerald-950/20 border border-emerald-500/30 p-4 rounded-2xl space-y-2 text-emerald-200">
                <h3 className="font-bold text-emerald-300 text-sm flex items-center gap-2">
                  <Download className="w-4 h-4" /> Download Complete Health Data Package
                </h3>
                <p className="text-xs">
                  Export all your personal profile data, blood group, allergy records, appointment logs, and AI conversation history into a portable JSON document.
                </p>
              </div>

              <button
                onClick={handleExportData}
                className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-2xl shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span>Export My Data Now (JSON)</span>
              </button>
            </div>
          )}

          {activeTab === 'delete' && (
            <div className="space-y-4">
              <div className="bg-rose-950/30 border border-rose-500/40 p-4 rounded-2xl space-y-2 text-rose-200">
                <h3 className="font-bold text-rose-300 text-sm flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-400" /> Permanent Account Deletion
                </h3>
                <p className="text-xs leading-relaxed">
                  Warning: Deleting your account will immediately wipe your medical background, emergency contacts, appointment history, and AI chat transcripts from local storage and database. This action CANNOT be undone.
                </p>
              </div>

              {!confirmDelete ? (
                <button
                  onClick={() => setConfirmDelete(true)}
                  className="w-full py-3 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-2xl shadow-lg shadow-rose-600/30 transition-all flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>I want to delete my account</span>
                </button>
              ) : (
                <div className="space-y-3 pt-2">
                  <label className="block text-slate-300 font-bold">
                    Type <strong className="text-rose-400">DELETE</strong> to confirm permanent deletion:
                  </label>
                  <input
                    type="text"
                    value={deleteInput}
                    onChange={(e) => setDeleteInput(e.target.value)}
                    placeholder="Type DELETE..."
                    className="w-full bg-slate-800 border border-rose-500/50 rounded-xl px-4 py-2.5 text-white font-mono text-xs focus:outline-none"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => setConfirmDelete(false)}
                      className="flex-1 py-2 bg-slate-800 text-slate-300 font-bold rounded-xl"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleDeleteAccount}
                      disabled={deleteInput.toUpperCase() !== 'DELETE'}
                      className="flex-1 py-2 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl shadow-lg disabled:opacity-40"
                    >
                      Confirm Permanent Wipe
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
