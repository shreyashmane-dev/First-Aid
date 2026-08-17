import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { useLanguage } from '../../context/LanguageContext';
import type { Language } from '../../services/translations';
import type { BloodGroup } from '../../types';
import { X, HeartPulse, ShieldCheck, Plus, Trash2, Save, Globe, Check } from 'lucide-react';

interface MedicalProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const BLOOD_GROUPS: BloodGroup[] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export const MedicalProfileModal: React.FC<MedicalProfileModalProps> = ({ isOpen, onClose }) => {
  const { patientProfile, updatePatientProfile } = useAuth();
  const { medicalProfile, updateMedicalProfile } = useApp();
  const { language, setLanguage, t } = useLanguage();

  const [selectedLanguage, setSelectedLanguage] = useState<Language>(language);
  const [bloodGroup, setBloodGroup] = useState<BloodGroup>(medicalProfile.bloodGroup);
  const [allergies, setAllergies] = useState<string[]>(medicalProfile.allergies);
  const [newAllergy, setNewAllergy] = useState('');

  const [conditions, setConditions] = useState<string[]>(medicalProfile.medicalConditions);
  const [newCondition, setNewCondition] = useState('');

  const [medications, setMedications] = useState<string[]>(medicalProfile.medications);
  const [newMedication, setNewMedication] = useState('');

  const [emergencyName, setEmergencyName] = useState(patientProfile?.emergencyContact.name || '');
  const [emergencyPhone, setEmergencyPhone] = useState(patientProfile?.emergencyContact.phone || '');
  const [shareDoctor, setShareDoctor] = useState(patientProfile?.shareProfileWithDoctor ?? true);
  const [savedNotice, setSavedNotice] = useState(false);

  if (!isOpen) return null;

  const handleAddAllergy = () => {
    if (newAllergy.trim() && !allergies.includes(newAllergy.trim())) {
      setAllergies([...allergies, newAllergy.trim()]);
      setNewAllergy('');
    }
  };

  const handleRemoveAllergy = (index: number) => {
    setAllergies(allergies.filter((_, i) => i !== index));
  };

  const handleAddCondition = () => {
    if (newCondition.trim() && !conditions.includes(newCondition.trim())) {
      setConditions([...conditions, newCondition.trim()]);
      setNewCondition('');
    }
  };

  const handleRemoveCondition = (index: number) => {
    setConditions(conditions.filter((_, i) => i !== index));
  };

  const handleAddMedication = () => {
    if (newMedication.trim() && !medications.includes(newMedication.trim())) {
      setMedications([...medications, newMedication.trim()]);
      setNewMedication('');
    }
  };

  const handleRemoveMedication = (index: number) => {
    setMedications(medications.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    // Update active language
    setLanguage(selectedLanguage);

    updateMedicalProfile({
      bloodGroup,
      allergies,
      medicalConditions: conditions,
      medications
    });

    updatePatientProfile({
      emergencyContact: {
        name: emergencyName,
        relationship: 'Primary Contact',
        phone: emergencyPhone
      },
      shareProfileWithDoctor: shareDoctor
    });

    setSavedNotice(true);
    setTimeout(() => {
      setSavedNotice(false);
      onClose();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-slate-900">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-950/60 border border-red-500/30 flex items-center justify-center text-red-400">
              <HeartPulse className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{t('patientMedicalProfile')}</h2>
              <p className="text-xs text-slate-400">{t('profileModalSubtitle')}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-slate-300 text-sm">
          {/* 🌐 Language Preference Toggle (1st is English, 2nd is Marathi) */}
          <div className="bg-gradient-to-r from-slate-800/90 to-indigo-950/40 p-4 rounded-2xl border border-indigo-500/30 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
                <Globe className="w-4 h-4 text-indigo-400" />
                <span>{t('languagePreference')}</span>
              </label>
              <span className="text-[11px] font-medium text-indigo-300">
                {selectedLanguage === 'en' ? 'English selected' : 'मराठी निवडली आहे'}
              </span>
            </div>

            {/* Toggle Buttons: 1st English, 2nd Marathi */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  setSelectedLanguage('en');
                  setLanguage('en');
                }}
                className={`py-3 px-4 rounded-xl text-xs font-extrabold border transition-all flex items-center justify-center gap-2 ${
                  selectedLanguage === 'en'
                    ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/40 scale-[1.02]'
                    : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white'
                }`}
              >
                {selectedLanguage === 'en' && <Check className="w-4 h-4 text-white" />}
                <span>1. English (EN)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSelectedLanguage('mr');
                  setLanguage('mr');
                }}
                className={`py-3 px-4 rounded-xl text-xs font-extrabold border transition-all flex items-center justify-center gap-2 ${
                  selectedLanguage === 'mr'
                    ? 'bg-rose-600 border-rose-500 text-white shadow-lg shadow-rose-600/40 scale-[1.02]'
                    : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white'
                }`}
              >
                {selectedLanguage === 'mr' && <Check className="w-4 h-4 text-white" />}
                <span>2. मराठी - Marathi (MR)</span>
              </button>
            </div>
          </div>

          {/* Blood Group */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
              {t('bloodGroup')}
            </label>
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
              {BLOOD_GROUPS.map((bg) => (
                <button
                  type="button"
                  key={bg}
                  onClick={() => setBloodGroup(bg)}
                  className={`py-2 rounded-xl text-xs font-extrabold border transition-all ${
                    bloodGroup === bg
                      ? 'bg-red-600 border-red-500 text-white shadow-lg shadow-red-600/40 scale-105'
                      : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {bg}
                </button>
              ))}
            </div>
          </div>

          {/* Allergies */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
              {t('knownAllergies')}
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder={t('addAllergyPlaceholder')}
                value={newAllergy}
                onChange={(e) => setNewAllergy(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddAllergy())}
                className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-rose-500"
              />
              <button
                type="button"
                onClick={handleAddAllergy}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl transition-all flex items-center gap-1"
              >
                <Plus className="w-4 h-4" /> {t('addBtn')}
              </button>
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              {allergies.map((allergy, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs"
                >
                  ⚠️ {allergy}
                  <button type="button" onClick={() => handleRemoveAllergy(i)}>
                    <Trash2 className="w-3.5 h-3.5 text-amber-400 hover:text-rose-400" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Chronic Conditions */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
              {t('medicalConditions')}
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder={t('addConditionPlaceholder')}
                value={newCondition}
                onChange={(e) => setNewCondition(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCondition())}
                className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-rose-500"
              />
              <button
                type="button"
                onClick={handleAddCondition}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs rounded-xl transition-all flex items-center gap-1"
              >
                <Plus className="w-4 h-4" /> {t('addBtn')}
              </button>
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              {conditions.map((cond, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-sky-500/20 text-sky-300 border border-sky-500/30 text-xs"
                >
                  🩺 {cond}
                  <button type="button" onClick={() => handleRemoveCondition(i)}>
                    <Trash2 className="w-3.5 h-3.5 text-sky-400 hover:text-rose-400" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Current Medications */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
              {t('currentMedications')}
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder={t('addMedicationPlaceholder')}
                value={newMedication}
                onChange={(e) => setNewMedication(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddMedication())}
                className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-rose-500"
              />
              <button
                type="button"
                onClick={handleAddMedication}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs rounded-xl transition-all flex items-center gap-1"
              >
                <Plus className="w-4 h-4" /> {t('addBtn')}
              </button>
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              {medications.map((med, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs"
                >
                  💊 {med}
                  <button type="button" onClick={() => handleRemoveMedication(i)}>
                    <Trash2 className="w-3.5 h-3.5 text-purple-400 hover:text-rose-400" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-800">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                {t('emergencyContactName')}
              </label>
              <input
                type="text"
                value={emergencyName}
                onChange={(e) => setEmergencyName(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-white text-xs focus:outline-none focus:border-rose-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                {t('emergencyContactPhone')}
              </label>
              <input
                type="text"
                value={emergencyPhone}
                onChange={(e) => setEmergencyPhone(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-white text-xs focus:outline-none focus:border-rose-500"
              />
            </div>
          </div>

          {/* Privacy Toggle */}
          <div className="bg-slate-800/60 rounded-2xl p-4 border border-slate-700/80 flex items-center justify-between">
            <div className="space-y-0.5 pr-2">
              <div className="font-bold text-white text-xs flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>{t('doctorAccessAuth')}</span>
              </div>
              <p className="text-[11px] text-slate-400">
                {t('doctorAccessDesc')}
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={shareDoctor}
                onChange={(e) => setShareDoctor(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
            </label>
          </div>
        </div>

        {/* Footer actions */}
        <div className="p-4 border-t border-slate-800 bg-slate-900 flex items-center justify-between">
          <div className="text-xs text-emerald-400 font-bold">
            {savedNotice ? t('profileSavedSuccess') : ''}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition-all"
            >
              {t('cancelBtn')}
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-2.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-red-600/30 transition-all flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>{t('saveProfileBtn')}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
