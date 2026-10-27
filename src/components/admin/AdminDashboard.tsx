import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { AI_METRICS_LOG } from '../../services/aiOrchestrator';
import type { User, UserRole } from '../../types';
import {
  ShieldCheck,
  UserCheck,
  Building2,
  FileText,
  CheckCircle,
  XCircle,
  Plus,
  Cpu,
  Users,
  Search,
  Trash2,
  Edit,
  Stethoscope,
  User as UserIcon,
  Lock,
  Unlock,
  Phone,
  Mail
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const {
    doctors,
    verifyDoctor,
    hospitals,
    addHospital,
    auditLogs,
    users,
    updateUserRole,
    updateUserStatus,
    updateUserDetails,
    deleteUser,
    addUser
  } = useApp();

  const [activeTab, setActiveTab] = useState<'accounts' | 'verifications' | 'hospitals' | 'audit_logs' | 'ai_reports'>('accounts');

  // Account Filters & Search
  const [userSearch, setUserSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | UserRole>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'suspended'>('all');

  // Edit User Modal State
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');

  // Create User Modal State
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPhone, setNewUserPhone] = useState('');
  const [newUserRole, setNewUserRole] = useState<UserRole>('patient');

  // New Hospital Form State
  const [hospName, setHospName] = useState('');
  const [hospAddress, setHospAddress] = useState('');
  const [hospPhone, setHospPhone] = useState('');
  const [hospEmergency, setHospEmergency] = useState(true);

  const pendingDoctors = doctors.filter(d => d.verificationStatus === 'pending' || d.verificationStatus === 'under_review');
  const allDoctors = doctors;
  const totalCost = AI_METRICS_LOG.reduce((acc, m) => acc + m.estimatedCostUsd, 0);

  // Filter users
  const filteredUsers = users.filter(u => {
    const matchesSearch =
      u.displayName.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
      (u.phone && u.phone.includes(userSearch));
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || (u.status || 'active') === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleStartEdit = (user: User) => {
    setEditingUser(user);
    setEditName(user.displayName);
    setEditEmail(user.email);
    setEditPhone(user.phone || '');
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    updateUserDetails(editingUser.uid, {
      displayName: editName.trim(),
      email: editEmail.trim(),
      phone: editPhone.trim()
    });
    setEditingUser(null);
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName || !newUserEmail) return;

    const created: User = {
      uid: `usr_${Date.now()}`,
      displayName: newUserName.trim(),
      email: newUserEmail.trim(),
      phone: newUserPhone.trim(),
      role: newUserRole,
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    addUser(created);
    setIsAddUserOpen(false);
    setNewUserName('');
    setNewUserEmail('');
    setNewUserPhone('');
    setNewUserRole('patient');
  };

  const handleDeleteUserConfirm = (user: User) => {
    if (window.confirm(`Are you sure you want to permanently delete account for "${user.displayName}" (${user.email})?`)) {
      deleteUser(user.uid);
    }
  };

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
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm dark:shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 text-amber-700 dark:text-amber-400 text-xs font-semibold">
              <ShieldCheck className="w-4 h-4" /> System Administrator Operations Console
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">Admin Operations</h1>
            <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mt-1">
              Manage all patient and doctor accounts, verify medical licenses, configure hospitals, monitor AI metrics, and audit system logs.
            </p>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-2 pt-6 border-t border-slate-100 dark:border-slate-800 mt-6 overflow-x-auto">
          {/* USER ACCOUNTS TAB */}
          <button
            onClick={() => setActiveTab('accounts')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'accounts'
                ? 'bg-amber-500 text-slate-950 shadow-md scale-105'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Manage All Accounts ({users.length})</span>
          </button>

          {/* DOCTOR VERIFICATIONS TAB */}
          <button
            onClick={() => setActiveTab('verifications')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'verifications'
                ? 'bg-amber-500 text-slate-950 shadow-md scale-105'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>Doctor License Verification ({pendingDoctors.length} Pending)</span>
          </button>

          {/* HOSPITALS TAB */}
          <button
            onClick={() => setActiveTab('hospitals')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'hospitals'
                ? 'bg-amber-500 text-slate-950 shadow-md scale-105'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Hospital Listings ({hospitals.length})</span>
          </button>

          {/* AI ANALYTICS TAB */}
          <button
            onClick={() => setActiveTab('ai_reports')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'ai_reports'
                ? 'bg-amber-500 text-slate-950 shadow-md scale-105'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <Cpu className="w-4 h-4" />
            <span>AI Cost & Performance</span>
          </button>

          {/* AUDIT LOGS TAB */}
          <button
            onClick={() => setActiveTab('audit_logs')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'audit_logs'
                ? 'bg-amber-500 text-slate-950 shadow-md scale-105'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>System Audit Logs</span>
          </button>
        </div>
      </div>

      {/* 👥 TAB 1: ALL ACCOUNTS MANAGEMENT (NEW USER REQUIREMENT) */}
      {activeTab === 'accounts' && (
        <div className="space-y-6">
          {/* Header Controls Bar */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2.5">
                  <Users className="w-5 h-5 text-amber-500" />
                  <span>Platform Accounts Management</span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  View and manage all registered accounts on the app. Change roles, suspend/activate access, edit profiles, or delete users.
                </p>
              </div>

              <button
                onClick={() => setIsAddUserOpen(true)}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs rounded-2xl shadow-lg shadow-amber-500/20 transition-all cursor-pointer shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Create New Account</span>
              </button>
            </div>

            {/* Filter and Search Bar */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 pt-2">
              <div className="md:col-span-6 relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="Search accounts by name, email, or telephone..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Role filter */}
              <div className="md:col-span-3">
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white font-bold focus:outline-none focus:border-amber-500 cursor-pointer"
                >
                  <option value="all">All Roles ({users.length})</option>
                  <option value="patient">Patients ({users.filter(u => u.role === 'patient').length})</option>
                  <option value="doctor">Doctors ({users.filter(u => u.role === 'doctor').length})</option>
                  <option value="admin">Administrators ({users.filter(u => u.role === 'admin').length})</option>
                </select>
              </div>

              {/* Status filter */}
              <div className="md:col-span-3">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white font-bold focus:outline-none focus:border-amber-500 cursor-pointer"
                >
                  <option value="all">All Statuses</option>
                  <option value="active">Active Only</option>
                  <option value="suspended">Suspended Only</option>
                </select>
              </div>
            </div>
          </div>

          {/* Accounts List */}
          <div className="grid grid-cols-1 gap-4">
            {filteredUsers.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-10 text-center text-slate-500 dark:text-slate-400 text-xs border border-slate-200 dark:border-slate-800">
                No user accounts found matching current query and filters.
              </div>
            ) : (
              filteredUsers.map((user) => {
                const isSuspended = user.status === 'suspended';

                return (
                  <div
                    key={user.uid}
                    className={`bg-white dark:bg-slate-900 border rounded-3xl p-6 shadow-sm dark:shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all ${
                      isSuspended
                        ? 'border-rose-300 dark:border-rose-900/60 bg-rose-50/20'
                        : 'border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      {/* Avatar */}
                      <div className={`w-13 h-13 rounded-2xl flex items-center justify-center text-white font-black text-lg shadow-md shrink-0 ${
                        user.role === 'doctor'
                          ? 'bg-gradient-to-tr from-emerald-600 to-teal-500'
                          : user.role === 'admin'
                          ? 'bg-gradient-to-tr from-amber-600 to-orange-500'
                          : 'bg-gradient-to-tr from-indigo-600 to-blue-500'
                      }`}>
                        {user.role === 'doctor' ? (
                          <Stethoscope className="w-6 h-6" />
                        ) : user.role === 'admin' ? (
                          <ShieldCheck className="w-6 h-6" />
                        ) : (
                          <UserIcon className="w-6 h-6" />
                        )}
                      </div>

                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2.5">
                          <h3 className="font-bold text-slate-900 dark:text-white text-base">
                            {user.displayName}
                          </h3>

                          {/* Role Pill */}
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            user.role === 'doctor'
                              ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700'
                              : user.role === 'admin'
                              ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-700'
                              : 'bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-700'
                          }`}>
                            {user.role}
                          </span>

                          {/* Status Pill */}
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            isSuspended
                              ? 'bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-700'
                              : 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700'
                          }`}>
                            {isSuspended ? 'Suspended' : 'Active'}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                          <span className="flex items-center gap-1">
                            <Mail className="w-3.5 h-3.5 text-slate-400" />
                            {user.email}
                          </span>
                          {user.phone && (
                            <>
                              <span>•</span>
                              <span className="flex items-center gap-1 font-mono">
                                <Phone className="w-3.5 h-3.5 text-slate-400" />
                                {user.phone}
                              </span>
                            </>
                          )}
                          <span>•</span>
                          <span className="font-mono text-[11px] text-slate-400">UID: {user.uid}</span>
                        </div>
                      </div>
                    </div>

                    {/* ACTIONS TO HANDLE THE ACCOUNT */}
                    <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                      {/* Role Switcher Dropdown */}
                      <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
                        <span className="text-slate-400 text-[11px] font-bold">Role:</span>
                        <select
                          value={user.role}
                          onChange={(e) => updateUserRole(user.uid, e.target.value as UserRole)}
                          className="bg-transparent font-black text-slate-800 dark:text-white focus:outline-none cursor-pointer"
                        >
                          <option value="patient" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Patient</option>
                          <option value="doctor" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Doctor</option>
                          <option value="admin" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Admin</option>
                        </select>
                      </div>

                      {/* Suspend / Unsuspend */}
                      <button
                        onClick={() => updateUserStatus(user.uid, isSuspended ? 'active' : 'suspended')}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                          isSuspended
                            ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-300 hover:bg-emerald-100'
                            : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-300 hover:bg-amber-100'
                        }`}
                        title={isSuspended ? 'Reinstate user access' : 'Suspend account'}
                      >
                        {isSuspended ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                        <span>{isSuspended ? 'Unsuspend' : 'Suspend'}</span>
                      </button>

                      {/* Edit Details Button */}
                      <button
                        onClick={() => handleStartEdit(user)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-700 transition-all cursor-pointer"
                        title="Edit profile information"
                      >
                        <Edit className="w-3.5 h-3.5 text-indigo-500" />
                        <span>Edit</span>
                      </button>

                      {/* Delete User Button */}
                      <button
                        onClick={() => handleDeleteUserConfirm(user)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 dark:hover:bg-rose-900 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
                        title="Permanently delete user"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* 🩺 TAB 2: DOCTOR VERIFICATIONS (EXISTING FEATURE PRESERVED) */}
      {activeTab === 'verifications' && (
        <div className="space-y-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            <span>Doctor Verification Queue</span>
          </h2>

          <div className="grid grid-cols-1 gap-4">
            {allDoctors.map((doc) => (
              <div
                key={doc.doctorId}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm dark:shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6"
              >
                <div className="flex items-start gap-4">
                  <img
                    src={doc.photoUrl}
                    alt={doc.name}
                    className="w-14 h-14 rounded-2xl object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                  />
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-slate-900 dark:text-white text-base">{doc.name}</h3>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        doc.verificationStatus === 'verified'
                          ? 'bg-emerald-50 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30'
                          : 'bg-amber-50 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-500/30'
                      }`}>
                        {doc.verificationStatus}
                      </span>
                    </div>
                    <p className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold">{doc.specialization}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Medical License: <span className="font-mono text-amber-600 dark:text-amber-300 font-bold">{doc.licenseNumber}</span>
                    </p>
                    <p className="text-xs text-slate-400">{doc.professionalEmail} • {doc.professionalPhone}</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 shrink-0">
                  {doc.verificationStatus !== 'verified' && (
                    <button
                      onClick={() => verifyDoctor(doc.doctorId, 'verified')}
                      className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all cursor-pointer"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>Approve & Verify</span>
                    </button>
                  )}

                  {doc.verificationStatus === 'verified' && (
                    <button
                      onClick={() => verifyDoctor(doc.doctorId, 'suspended')}
                      className="flex items-center gap-1.5 px-4 py-2 bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 dark:hover:bg-rose-900 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-600/40 text-xs font-bold rounded-xl transition-all cursor-pointer"
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

      {/* 🏥 TAB 3: HOSPITALS (EXISTING FEATURE PRESERVED) */}
      {activeTab === 'hospitals' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Add Hospital Form */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm dark:shadow-xl space-y-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Plus className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Register New Hospital</span>
            </h2>

            <form onSubmit={handleAddHospital} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Hospital Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Apex Health Center"
                  value={hospName}
                  onChange={(e) => setHospName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Full Address</label>
                <input
                  type="text"
                  required
                  placeholder="Street, District..."
                  value={hospAddress}
                  onChange={(e) => setHospAddress(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Emergency Telephone</label>
                <input
                  type="text"
                  placeholder="+1 (555) 911-0000"
                  value={hospPhone}
                  onChange={(e) => setHospPhone(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="hospEr"
                  checked={hospEmergency}
                  onChange={(e) => setHospEmergency(e.target.checked)}
                  className="rounded bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-amber-600 focus:ring-amber-500"
                />
                <label htmlFor="hospEr" className="text-slate-700 dark:text-slate-300 font-medium">24/7 ER Trauma Unit Available</label>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl shadow-sm transition-all cursor-pointer"
              >
                Save Hospital Record
              </button>
            </form>
          </div>

          {/* Hospitals List */}
          <div className="lg:col-span-2 space-y-3">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Active Registered Hospitals ({hospitals.length})</h2>
            <div className="space-y-3">
              {hospitals.map((h) => (
                <div
                  key={h.hospitalId}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex items-center justify-between gap-4 text-xs shadow-sm"
                >
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-sm">{h.name}</h3>
                    <p className="text-slate-500 dark:text-slate-400">{h.address}</p>
                    <p className="text-emerald-600 dark:text-emerald-400 font-mono mt-0.5">Emergency Line: {h.emergencyPhone}</p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full font-bold ${
                    h.emergencyAvailable ? 'bg-red-50 dark:bg-red-600/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-500/30' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}>
                    {h.emergencyAvailable ? '24/7 ER' : 'Standard Clinic'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 🤖 TAB 4: AI REPORTS (EXISTING FEATURE PRESERVED) */}
      {activeTab === 'ai_reports' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-1">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Est. AI Monthly Cost</span>
              <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">${totalCost.toFixed(5)}</div>
            </div>
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-1">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Average Latency</span>
              <div className="text-2xl font-extrabold text-sky-600 dark:text-sky-400 font-mono">535 ms</div>
            </div>
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-1">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Orchestrator Uptime</span>
              <div className="text-2xl font-extrabold text-amber-600 dark:text-amber-400 font-mono">99.9%</div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm dark:shadow-xl space-y-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Cpu className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <span>Real-Time AI Request & Cost Log</span>
            </h2>

            <div className="space-y-2">
              {AI_METRICS_LOG.map((m) => (
                <div
                  key={m.id}
                  className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono"
                >
                  <div className="flex items-center gap-3">
                    <span className="px-2 py-0.5 bg-emerald-50 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 rounded font-bold">
                      {m.provider} ({m.model})
                    </span>
                    <span className="text-slate-600 dark:text-slate-300">Latency: {m.latencyMs}ms</span>
                    <span className="text-amber-600 dark:text-amber-400">Severity: {m.severity}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">${m.estimatedCostUsd.toFixed(5)}</span>
                    <span className="text-slate-400 block text-[10px]">{new Date(m.timestamp).toLocaleTimeString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 📜 TAB 5: AUDIT LOGS (EXISTING FEATURE PRESERVED) */}
      {activeTab === 'audit_logs' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm dark:shadow-xl space-y-4">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            <span>Audit Trail Logs ({auditLogs.length} Records)</span>
          </h2>

          <div className="space-y-2">
            {auditLogs.map((log) => (
              <div
                key={log.logId}
                className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs font-mono"
              >
                <div className="flex items-center gap-3">
                  <span className="px-2 py-0.5 bg-amber-50 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 rounded font-bold">
                    {log.action}
                  </span>
                  <span className="text-slate-700 dark:text-slate-300">
                    Target: {log.targetType} ({log.targetId})
                  </span>
                </div>
                <span className="text-slate-400">{new Date(log.timestamp).toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ✏️ MODAL: EDIT USER DETAILS */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-md p-6 space-y-5 text-xs text-slate-700 dark:text-slate-300 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-black text-slate-900 dark:text-white text-base">Edit Account Details</h3>
              <button
                onClick={() => setEditingUser(null)}
                className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Display Name</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-xl shadow-md transition-all cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ➕ MODAL: CREATE NEW ACCOUNT */}
      {isAddUserOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-md p-6 space-y-5 text-xs text-slate-700 dark:text-slate-300 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-black text-slate-900 dark:text-white text-base">Create Platform Account</h3>
              <button
                onClick={() => setIsAddUserOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. John Doe"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="user@example.com"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Phone Number</label>
                <input
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                  value={newUserPhone}
                  onChange={(e) => setNewUserPhone(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Account Role</label>
                <select
                  value={newUserRole}
                  onChange={(e) => setNewUserRole(e.target.value as UserRole)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white font-bold focus:outline-none focus:border-amber-500 cursor-pointer"
                >
                  <option value="patient">Patient</option>
                  <option value="doctor">Doctor</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsAddUserOpen(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-xl shadow-md transition-all cursor-pointer"
                >
                  Create Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
