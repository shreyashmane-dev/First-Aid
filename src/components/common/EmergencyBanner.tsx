import React from 'react';
import { AlertTriangle, PhoneCall, MapPin } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

interface EmergencyBannerProps {
  onFindHospitals: () => void;
}

export const EmergencyBanner: React.FC<EmergencyBannerProps> = ({ onFindHospitals }) => {
  const { t, language } = useLanguage();

  return (
    <div className="bg-gradient-to-r from-red-600 via-rose-700 to-amber-600 text-white px-4 py-2.5 shadow-xl border-b border-red-500/40">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs sm:text-sm">
        <div className="flex items-center gap-2 font-medium">
          <span className="flex h-3 w-3 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-300"></span>
          </span>
          <AlertTriangle className="w-5 h-5 text-amber-200 shrink-0" />
          <span>
            <strong>{t('emergencyBannerTitle')}:</strong> {t('emergencyBannerText')}
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <a
            href="tel:108"
            className="flex items-center gap-1 px-3 py-1 bg-white text-red-700 hover:bg-red-50 font-bold rounded-lg transition-all shadow-md text-xs"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span>{language === 'mr' ? '108 वर कॉल करा' : 'Call 108'}</span>
          </a>
          <button
            onClick={onFindHospitals}
            className="flex items-center gap-1 px-3 py-1 bg-red-950/60 hover:bg-red-900/80 text-white border border-white/30 rounded-lg transition-all text-xs font-semibold"
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>{language === 'mr' ? 'जवळची रुग्णालये' : 'Nearby ERs'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
