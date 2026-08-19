import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import type { FirstAidArticle } from '../../types';
import {
  ShieldAlert,
  HeartPulse,
  Flame,
  Wind,
  Activity,
  UserX,
  Bandage,
  Sun,
  Search,
  CheckCircle2,
  AlertOctagon,
  PhoneCall,
  UserCheck
} from 'lucide-react';

interface FirstAidLibraryProps {
  onFindHospitals: () => void;
  selectedArticleId?: string | null;
}

export const FirstAidLibrary: React.FC<FirstAidLibraryProps> = ({ onFindHospitals, selectedArticleId }) => {
  const { firstAidArticles } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');

  const [activeArticle, setActiveArticle] = useState<FirstAidArticle | null>(() => {
    if (selectedArticleId) {
      return firstAidArticles.find(a => a.articleId === selectedArticleId) || firstAidArticles[0];
    }
    return firstAidArticles[0];
  });

  const categories = ['ALL', 'Emergency', 'Injury', 'Environmental', 'Animal/Bite'];

  const filteredArticles = firstAidArticles.filter(article => {
    const matchesCategory = categoryFilter === 'ALL' || article.category === categoryFilter;
    const matchesSearch =
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const renderIcon = (articleId: string) => {
    switch (articleId) {
      case 'fa_cpr':
        return <HeartPulse className="w-5 h-5 text-red-500 dark:text-red-400" />;
      case 'fa_snake_bite':
        return <ShieldAlert className="w-5 h-5 text-amber-500 dark:text-amber-400" />;
      case 'fa_heart_attack':
        return <Activity className="w-5 h-5 text-rose-500 dark:text-rose-400" />;
      case 'fa_choking':
        return <UserX className="w-5 h-5 text-orange-500 dark:text-orange-400" />;
      case 'fa_burns':
        return <Flame className="w-5 h-5 text-orange-500" />;
      case 'fa_asthma':
        return <Wind className="w-5 h-5 text-sky-500 dark:text-sky-400" />;
      case 'fa_heat_stroke':
        return <Sun className="w-5 h-5 text-amber-500 dark:text-yellow-400" />;
      default:
        return <Bandage className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />;
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm dark:shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 text-amber-700 dark:text-amber-400 text-xs font-semibold">
              <ShieldAlert className="w-4 h-4" /> Medically Reviewed Educational Content
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">First-Aid Educational Library</h1>
            <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm max-w-2xl">
              Step-by-step emergency response instructions for CPR, snake bites, heart attacks, burns, heat stroke, choking, asthma attacks, and physical injuries.
            </p>
          </div>

          <button
            onClick={onFindHospitals}
            className="flex items-center gap-2 px-5 py-3 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-md shadow-red-600/20 transition-all shrink-0 cursor-pointer"
          >
            <PhoneCall className="w-4 h-4" />
            <span>Emergency ER Map</span>
          </button>
        </div>

        {/* Search & Category Filter */}
        <div className="mt-6 flex flex-col sm:flex-row gap-3 pt-6 border-t border-slate-100 dark:border-slate-800">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search CPR, Snake bite, Burns, Heat stroke..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-4 py-2 text-slate-900 dark:text-white text-xs placeholder-slate-400 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  categoryFilter === cat
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Grid: Articles Sidebar & Active Reader */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Articles Index List */}
        <div className="lg:col-span-4 space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-1">
            Topics ({filteredArticles.length})
          </h2>
          <div className="space-y-2 max-h-[700px] overflow-y-auto pr-1">
            {filteredArticles.map((article) => {
              const isSelected = activeArticle?.articleId === article.articleId;
              return (
                <div
                  key={article.articleId}
                  onClick={() => setActiveArticle(article)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-amber-50/70 dark:bg-slate-800/90 border-amber-400 dark:border-amber-500 shadow-sm'
                      : 'bg-white dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/80'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0">
                      {renderIcon(article.articleId)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <h3 className={`text-xs font-bold truncate ${isSelected ? 'text-amber-800 dark:text-amber-400' : 'text-slate-900 dark:text-white'}`}>
                          {article.title}
                        </h3>
                        <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold shrink-0 ${
                          article.emergencyLevel === 'Critical'
                            ? 'bg-red-50 dark:bg-red-600/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-500/30'
                            : 'bg-amber-50 dark:bg-amber-600/20 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-500/30'
                        }`}>
                          {article.emergencyLevel}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">{article.summary}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Detailed Guide View */}
        <div className="lg:col-span-8">
          {activeArticle ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm dark:shadow-xl space-y-6">
              {/* Article Header */}
              <div className="space-y-4 pb-6 border-b border-slate-100 dark:border-slate-800">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase ${
                    activeArticle.emergencyLevel === 'Critical'
                      ? 'bg-red-50 dark:bg-red-600/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-500/40'
                      : 'bg-amber-50 dark:bg-amber-600/20 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-500/40'
                  }`}>
                    🚨 Emergency Level: {activeArticle.emergencyLevel}
                  </span>
                  <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                    <UserCheck className="w-4 h-4" />
                    <span>{activeArticle.reviewStatus}</span>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0">
                    {renderIcon(activeArticle.articleId)}
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">{activeArticle.title}</h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Category: {activeArticle.category} • Version {activeArticle.version}</p>
                  </div>
                </div>

                <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm leading-relaxed bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                  {activeArticle.summary}
                </p>
              </div>

              {/* Warning Signs */}
              <div className="space-y-2.5">
                <h3 className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider flex items-center gap-2">
                  <AlertOctagon className="w-4 h-4" /> Warning Signs & Symptoms
                </h3>
                <div className="bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-500/30 rounded-xl p-4 space-y-2">
                  {activeArticle.warningSigns.map((sign, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-amber-900 dark:text-amber-200">
                      <span className="text-amber-500 font-bold shrink-0">•</span>
                      <span>{sign}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Immediate Steps */}
              <div className="space-y-2.5">
                <h3 className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" /> Immediate First-Aid Action Steps
                </h3>
                <div className="space-y-2">
                  {activeArticle.immediateSteps.map((step, idx) => (
                    <div key={idx} className="flex items-start gap-3 bg-slate-50 dark:bg-slate-800/80 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700">
                      <div className="w-6 h-6 rounded-lg bg-emerald-100 dark:bg-emerald-600/20 text-emerald-700 dark:text-emerald-400 font-bold text-xs flex items-center justify-center border border-emerald-300 dark:border-emerald-500/30 shrink-0">
                        {idx + 1}
                      </div>
                      <p className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed pt-0.5">{step}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* DO NOT DO List */}
              <div className="space-y-2.5">
                <h3 className="text-xs font-bold text-rose-700 dark:text-rose-400 uppercase tracking-wider flex items-center gap-2">
                  <AlertOctagon className="w-4 h-4 text-rose-600 dark:text-rose-500" /> Critical Warnings (DO NOT DO)
                </h3>
                <div className="bg-rose-50/60 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-500/30 rounded-xl p-4 space-y-2">
                  {activeArticle.doNot.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-rose-900 dark:text-rose-200 font-medium">
                      <span className="text-rose-600 font-bold text-sm shrink-0">⛔</span>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Medical Reviewer Footer */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
                <div>
                  Medical Reviewer: <strong className="text-slate-900 dark:text-white">{activeArticle.reviewedBy}</strong>
                </div>
                <button
                  onClick={onFindHospitals}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg shadow-sm transition-all text-xs cursor-pointer"
                >
                  Locate Nearby Hospital ER
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center text-slate-400 shadow-sm">
              Select a first-aid guide from the index on the left.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
