import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { AI_METRICS_LOG } from '../../services/aiOrchestrator';
import {
  ShieldCheck,
  UserCheck,
  Building2,
  FileText,
  CheckCircle,
  XCircle,
  Plus,
  Cpu
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { doctors, verifyDoctor, hospitals, addHospital, auditLogs } = useApp();

  const [activeTab, setActiveTab] = useState<'verifications' | 'hospitals' | 'audit_logs' | 'ai_reports'>('verifications');

  // New Hospital Form
  const [hospName, setHospName] = useState('');
  const [hospAddress, setHospAddress] = useState('');
  const [hospPhone, setHospPhone] = useState('');
  const [hospEmergency, setHospEmergency] = useState(true);

  const pendingDoctors = doctors.filter(d => d.verificationStatus === 'pending' || d.verificationStatus === 'under_review');
  const allDoctors = doctors;

  const totalCost = AI_METRICS_LOG.reduce((acc, m) => acc + m.estimatedCostUsd, 0);

  const handleAddHospital = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hospName || !hospAddress) return;

    addHospital({
      name: hospName,
      description: 'Newly registered hospital facility added by System Administrator.',
      address: hospAddress,
      latitude: 28.6200,
      longitude: 77.2100,
      phone: hospPhone || '+1 (555) 911-0000',
      emergencyPhone: hospPhone || '112 / 108',
      emergencyAvailable: hospEmergency,
      services: ['24/7 Trauma Care', 'General Medicine'],
      departments: ['Emergency', 'General Surgery'],
      imageUrls: ['https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?auto=format&fit=crop&w=800&q=80'],
      rating: 5.0,
      verificationStatus: 'verified'
    });

    setHospName('');
    setHospAddress('');
    setHospPhone('');
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold">
              <ShieldCheck className="w-4 h-4" /> System Administrator Operations
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">Admin Console</h1>
            <p className="text-slate-400 text-xs sm:text-sm mt-1">
              Verify medical credentials, manage hospital listings, monitor AI API costs/latency, and audit security logs.
            </p>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-2 pt-6 border-t border-slate-800 mt-6 overflow-x-auto">
          <button
            onClick={() => setActiveTab('verifications')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'verifications'
                ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/30'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>Doctor License Verification ({pendingDoctors.length} Pending)</span>
          </button>

          <button
            onClick={() => setActiveTab('hospitals')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'hospitals'
                ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/30'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Hospital Listings ({hospitals.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('ai_reports')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'ai_reports'
                ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/30'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Cpu className="w-4 h-4" />
            <span>AI Cost & Performance Analytics</span>
          </button>

          <button
            onClick={() => setActiveTab('audit_logs')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'audit_logs'
                ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/30'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>System Audit Logs</span>
          </button>
        </div>
      </div>

      {/* Tab Body */}
      {activeTab === 'verifications' && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-amber-400" />
            <span>Doctor Verification Queue</span>
          </h2>

          <div className="grid grid-cols-1 gap-4">
            {allDoctors.map((doc) => (
              <div
                key={doc.doctorId}
                className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6"
              >
                <div className="flex items-start gap-4">
                  <img
                    src={doc.photoUrl}
                    alt={doc.name}
                    className="w-14 h-14 rounded-2xl object-cover border border-slate-700 shrink-0"
                  />
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-white text-base">{doc.name}</h3>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        doc.verificationStatus === 'verified'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}>
                        {doc.verificationStatus}
                      </span>
                    </div>
                    <p className="text-xs text-indigo-400 font-semibold">{doc.specialization}</p>
                    <p className="text-xs text-slate-400">
                      Medical License: <span className="font-mono text-amber-300 font-bold">{doc.licenseNumber}</span>
                    </p>
                    <p className="text-xs text-slate-400">{doc.professionalEmail} • {doc.professionalPhone}</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 shrink-0">
                  {doc.verificationStatus !== 'verified' && (
                    <button
                      onClick={() => verifyDoctor(doc.doctorId, 'verified')}
                      className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-2xl shadow-lg shadow-emerald-600/30 transition-all"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>Approve & Verify</span>
                    </button>
                  )}

                  {doc.verificationStatus === 'verified' && (
                    <button
                      onClick={() => verifyDoctor(doc.doctorId, 'suspended')}
                      className="flex items-center gap-1.5 px-4 py-2 bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-600/40 text-xs font-bold rounded-2xl transition-all"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Suspend License</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'hospitals' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Add Hospital Form */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Plus className="w-4 h-4 text-emerald-400" />
              <span>Register New Hospital</span>
            </h2>

            <form onSubmit={handleAddHospital} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">Hospital Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Apex Health Center"
                  value={hospName}
                  onChange={(e) => setHospName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Full Address</label>
                <input
                  type="text"
                  required
                  placeholder="Street, District..."
                  value={hospAddress}
                  onChange={(e) => setHospAddress(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Emergency Telephone</label>
                <input
                  type="text"
                  placeholder="+1 (555) 911-0000"
                  value={hospPhone}
                  onChange={(e) => setHospPhone(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="hospEr"
                  checked={hospEmergency}
                  onChange={(e) => setHospEmergency(e.target.checked)}
                  className="rounded bg-slate-800 border-slate-700 text-amber-500 focus:ring-amber-500"
                />
                <label htmlFor="hospEr" className="text-slate-300 font-medium">24/7 ER Trauma Unit Available</label>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold rounded-xl shadow-md transition-all"
              >
                Save Hospital Record
              </button>
            </form>
          </div>

          {/* Hospitals List */}
          <div className="lg:col-span-2 space-y-3">
            <h2 className="text-base font-bold text-white">Active Registered Hospitals ({hospitals.length})</h2>
            <div className="space-y-3">
              {hospitals.map((h) => (
                <div
                  key={h.hospitalId}
                  className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex items-center justify-between gap-4 text-xs"
                >
                  <div>
                    <h3 className="font-bold text-white text-sm">{h.name}</h3>
                    <p className="text-slate-400">{h.address}</p>
                    <p className="text-emerald-400 font-mono mt-0.5">Emergency Line: {h.emergencyPhone}</p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full font-bold ${
                    h.emergencyAvailable ? 'bg-red-600/20 text-red-400 border border-red-500/30' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {h.emergencyAvailable ? '24/7 ER' : 'Standard Clinic'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'ai_reports' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-1">
              <span className="text-xs text-slate-400 font-medium">Est. AI Monthly Cost</span>
              <div className="text-2xl font-extrabold text-emerald-400 font-mono">${totalCost.toFixed(5)}</div>
            </div>
            <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-1">
              <span className="text-xs text-slate-400 font-medium">Average Latency</span>
              <div className="text-2xl font-extrabold text-sky-400 font-mono">535 ms</div>
            </div>
            <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-1">
              <span className="text-xs text-slate-400 font-medium">Orchestrator Uptime</span>
              <div className="text-2xl font-extrabold text-amber-400 font-mono">99.9%</div>
            </div>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Cpu className="w-5 h-5 text-emerald-400" />
              <span>Real-Time AI Request & Cost Log</span>
            </h2>

            <div className="space-y-2">
              {AI_METRICS_LOG.map((m) => (
                <div
                  key={m.id}
                  className="bg-slate-800/60 p-3.5 rounded-2xl border border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono"
                >
                  <div className="flex items-center gap-3">
                    <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 rounded font-bold">
                      {m.provider} ({m.model})
                    </span>
                    <span className="text-slate-300">Latency: {m.latencyMs}ms</span>
                    <span className="text-amber-400">Severity: {m.severity}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-emerald-400 font-bold">${m.estimatedCostUsd.toFixed(5)}</span>
                    <span className="text-slate-500 block text-[10px]">{new Date(m.timestamp).toLocaleTimeString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'audit_logs' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-amber-400" />
            <span>Audit Trail Logs ({auditLogs.length} Records)</span>
          </h2>

          <div className="space-y-2">
            {auditLogs.map((log) => (
              <div
                key={log.logId}
                className="bg-slate-800/60 p-3.5 rounded-2xl border border-slate-700 flex items-center justify-between text-xs font-mono"
              >
                <div className="flex items-center gap-3">
                  <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 rounded font-bold">
                    {log.action}
                  </span>
                  <span className="text-slate-300">
                    Target: {log.targetType} ({log.targetId})
                  </span>
                </div>
                <span className="text-slate-500">{new Date(log.timestamp).toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
