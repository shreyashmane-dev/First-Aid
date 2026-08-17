import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { processAIChatMessage } from '../../services/aiOrchestrator';
import type { AIChatMessage } from '../../types';
import {
  Bot,
  Send,
  Trash2,
  Image as ImageIcon,
  ShieldAlert,
  PhoneCall,
  MapPin,
  BookOpen,
  AlertTriangle,
  RefreshCw,
  X
} from 'lucide-react';

interface AIAssistantProps {
  onFindHospitals: () => void;
  onReadFirstAid: (articleId?: string) => void;
}

export const AIAssistant: React.FC<AIAssistantProps> = ({ onFindHospitals, onReadFirstAid }) => {
  const { chatMessages, addChatMessage, clearChatHistory, medicalProfile } = useApp();
  const { patientProfile } = useAuth();
  const { language, t } = useLanguage();

  const [inputQuery, setInputQuery] = useState('');
  const [selectedModel, setSelectedModel] = useState<'Gemini' | 'OpenAI'>('Gemini');
  const [isProcessing, setIsProcessing] = useState(false);
  const [attachedImage, setAttachedImage] = useState<File | null>(null);
  const [attachedImagePreview, setAttachedImagePreview] = useState<string | null>(null);

  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isProcessing]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAttachedImage(file);
      setAttachedImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSend = async (queryText?: string) => {
    const textToSend = queryText || inputQuery;
    if (!textToSend.trim() && !attachedImage) return;

    const userMessage: AIChatMessage = {
      id: `msg_${Date.now()}`,
      sender: 'user',
      message: textToSend + (attachedImage ? ` [Attached photo: ${attachedImage.name}]` : ''),
      timestamp: new Date().toISOString()
    };

    addChatMessage(userMessage);
    setInputQuery('');
    setAttachedImage(null);
    setAttachedImagePreview(null);
    setIsProcessing(true);

    try {
      const aiResult = await processAIChatMessage(
        textToSend,
        selectedModel,
        patientProfile?.shareProfileWithDoctor ? medicalProfile : undefined,
        language
      );

      const aiMessage: AIChatMessage = {
        id: `msg_ai_${Date.now()}`,
        sender: 'ai',
        message: aiResult.message,
        model: aiResult.modelUsed,
        severity: aiResult.severity,
        emergency: aiResult.emergency,
        suggestedActions: aiResult.suggestedActions,
        steps: aiResult.steps,
        avoid: aiResult.avoid,
        timestamp: new Date().toISOString()
      };

      addChatMessage(aiMessage);
    } catch (err) {
      console.error('AI chat error:', err);
      addChatMessage({
        id: `msg_err_${Date.now()}`,
        sender: 'ai',
        message: language === 'mr'
          ? 'इंटरनेट कनेक्शनमध्ये समस्या आली आहे. तात्काळ वैद्यकीय मदतीसाठी १०८ वर संपर्क साधा.'
          : 'I am experiencing connectivity issues. For urgent health concerns, please call emergency 108 immediately.',
        severity: 'HIGH',
        emergency: true,
        suggestedActions: [
          { label: language === 'mr' ? '🚨 रुग्णवाहिका (108)' : '🚨 Call Emergency (108)', action: 'call_emergency', target: '108' }
        ],
        timestamp: new Date().toISOString()
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleActionClick = (action: any) => {
    if (action.action === 'call_emergency') {
      window.location.href = `tel:${action.target || '108'}`;
    } else if (action.action === 'find_hospital') {
      onFindHospitals();
    } else if (action.action === 'call_contact') {
      const phone = patientProfile?.emergencyContact.phone || '108';
      window.location.href = `tel:${phone}`;
    } else if (action.action === 'read_first_aid') {
      onReadFirstAid(action.target);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-cyan-500 flex items-center justify-center text-white shadow-lg shadow-emerald-600/30">
            <Bot className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-white">{t('aiTitle')}</h1>
              <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold font-mono">
                {selectedModel} Powered
              </span>
            </div>
            <p className="text-xs text-slate-400">{t('aiSubtitle')}</p>
          </div>
        </div>

        {/* Model Switcher & Clear Controls */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-800 p-1 rounded-xl border border-slate-700 text-xs">
            <button
              onClick={() => setSelectedModel('Gemini')}
              className={`px-3 py-1 rounded-lg font-bold transition-all ${
                selectedModel === 'Gemini' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              Gemini 1.5
            </button>
            <button
              onClick={() => setSelectedModel('OpenAI')}
              className={`px-3 py-1 rounded-lg font-bold transition-all ${
                selectedModel === 'OpenAI' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              OpenAI gpt-4o
            </button>
          </div>

          <button
            onClick={clearChatHistory}
            className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-rose-950/60 border border-slate-700 flex items-center justify-center text-slate-400 hover:text-rose-400 transition-colors"
            title={t('clearChat')}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Chat Area Container */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl h-[560px] flex flex-col shadow-2xl overflow-hidden">
        {/* Messages Body */}
        <div className="flex-1 p-6 overflow-y-auto space-y-6">
          {/* Medical Safety Disclaimer */}
          <div className="bg-amber-950/20 border border-amber-500/30 rounded-2xl p-4 flex items-start gap-3 text-xs text-amber-200">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <strong className="font-bold text-amber-300">
                {language === 'mr' ? 'सुरक्षा सूचना:' : 'Safety Notice:'}
              </strong>{' '}
              {t('aiDisclaimer')}
            </div>
          </div>

          {chatMessages.map((msg) => {
            const isAI = msg.sender === 'ai';
            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${isAI ? 'justify-start' : 'justify-end'}`}
              >
                {isAI && (
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-600 flex items-center justify-center text-white shrink-0 shadow-md">
                    <Bot className="w-5 h-5" />
                  </div>
                )}

                <div className={`max-w-2xl space-y-3 ${isAI ? 'w-full' : ''}`}>
                  <div
                    className={`p-5 rounded-3xl text-sm leading-relaxed ${
                      isAI
                        ? 'bg-slate-800/90 text-slate-100 border border-slate-700 shadow-xl'
                        : 'bg-rose-600 text-white shadow-lg shadow-rose-600/30 rounded-br-none'
                    }`}
                  >
                    {/* Severity Badge */}
                    {isAI && msg.severity && msg.severity !== 'LOW' && (
                      <div className="mb-3">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold uppercase ${
                            msg.severity === 'CRITICAL'
                              ? 'bg-red-600/30 text-red-300 border border-red-500/50 animate-pulse'
                              : 'bg-amber-600/30 text-amber-300 border border-amber-500/50'
                          }`}
                        >
                          <ShieldAlert className="w-3.5 h-3.5" />
                          {language === 'mr' ? `आणीबाणी पातळी: ${msg.severity}` : `Emergency Severity: ${msg.severity}`}
                        </span>
                      </div>
                    )}

                    <p className="whitespace-pre-line">{msg.message}</p>

                    {/* Step-by-step instructions if available */}
                    {msg.steps && msg.steps.length > 0 && (
                      <div className="mt-4 pt-3 border-t border-slate-700/80 space-y-2">
                        <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block">
                          {language === 'mr' ? 'तात्काळ करावयाच्या कृती (Immediate Steps):' : 'Immediate Action Steps:'}
                        </span>
                        <ul className="space-y-1.5 text-xs text-slate-200">
                          {msg.steps.map((step, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <span className="text-emerald-400 font-bold">•</span>
                              <span>{step}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Avoid list */}
                    {msg.avoid && msg.avoid.length > 0 && (
                      <div className="mt-3 pt-2 border-t border-slate-700/80 space-y-1">
                        <span className="text-xs font-bold text-rose-400 uppercase tracking-wider block">
                          {language === 'mr' ? 'काय करू नये (Do NOT Do):' : 'Do NOT Do:'}
                        </span>
                        <ul className="space-y-1 text-xs text-rose-200">
                          {msg.avoid.map((item, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <span>⛔</span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Suggested Action Cards */}
                  {isAI && msg.suggestedActions && msg.suggestedActions.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {msg.suggestedActions.map((action, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleActionClick(action)}
                          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5 ${
                            action.action === 'call_emergency'
                              ? 'bg-red-600 hover:bg-red-500 text-white shadow-red-600/40 animate-bounce'
                              : action.action === 'find_hospital'
                              ? 'bg-sky-600 hover:bg-sky-500 text-white'
                              : 'bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700'
                          }`}
                        >
                          {action.action === 'call_emergency' && <PhoneCall className="w-3.5 h-3.5" />}
                          {action.action === 'find_hospital' && <MapPin className="w-3.5 h-3.5" />}
                          {action.action === 'read_first_aid' && <BookOpen className="w-3.5 h-3.5" />}
                          <span>{action.label}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {isProcessing && (
            <div className="flex items-center gap-3 text-slate-400 text-xs italic">
              <div className="w-8 h-8 rounded-xl bg-slate-800 flex items-center justify-center text-emerald-400 animate-spin">
                <RefreshCw className="w-4 h-4" />
              </div>
              <span>{language === 'mr' ? 'एआय परिस्थितीचे विश्लेषण करत आहे...' : 'AI Safety Orchestrator analyzing situation...'}</span>
            </div>
          )}

          <div ref={chatBottomRef} />
        </div>

        {/* Input Bar */}
        <div className="p-4 bg-slate-900 border-t border-slate-800 space-y-3">
          {/* Image Attachment Preview */}
          {attachedImagePreview && (
            <div className="relative inline-block">
              <img
                src={attachedImagePreview}
                alt="Attachment"
                className="w-16 h-16 object-cover rounded-xl border border-slate-700"
              />
              <button
                onClick={() => {
                  setAttachedImage(null);
                  setAttachedImagePreview(null);
                }}
                className="absolute -top-2 -right-2 bg-rose-600 text-white rounded-full p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}

          {/* Quick Trigger Chips */}
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1 text-xs">
            <span className="text-slate-500 text-[11px] font-bold shrink-0">
              {language === 'mr' ? 'त्वरित प्रश्न:' : 'Quick Prompts:'}
            </span>
            <button
              onClick={() => handleSend(language === 'mr' ? 'बेशुद्ध व्यक्तीवर सीपीआर कसा करावा?' : 'What is the immediate CPR protocol for unconscious person?')}
              className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg whitespace-nowrap transition-colors border border-slate-700"
            >
              ❤️ {language === 'mr' ? 'सीपीआर पायऱ्या' : 'CPR Steps'}
            </button>
            <button
              onClick={() => handleSend(language === 'mr' ? 'पायाला विषारी साप चावला आहे, तात्काळ काय करावे?' : 'I was bitten by a snake on my leg! What should I do?')}
              className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-amber-300 rounded-lg whitespace-nowrap transition-colors border border-slate-700"
            >
              🐍 {language === 'mr' ? 'साप चावल्यास' : 'Snake Bite'}
            </button>
            <button
              onClick={() => handleSend(language === 'mr' ? 'छातीत तीव्र वेदना आणि घाम येत आहे.' : 'My relative has crushing chest pain and sweating.')}
              className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-rose-300 rounded-lg whitespace-nowrap transition-colors border border-slate-700"
            >
              🫀 {language === 'mr' ? 'छातीत वेदना' : 'Chest Pain'}
            </button>
          </div>

          <div className="flex items-center gap-2">
            <label className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-2xl cursor-pointer border border-slate-700 transition-colors">
              <ImageIcon className="w-4 h-4" />
              <input type="file" accept="image/*" onChange={handleImageSelect} className="hidden" />
            </label>

            <input
              type="text"
              placeholder={t('aiPlaceholder')}
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              className="flex-1 bg-slate-800 border border-slate-700 rounded-2xl px-4 py-3 text-white text-xs placeholder-slate-400 focus:outline-none focus:border-emerald-500"
            />

            <button
              onClick={() => handleSend()}
              disabled={isProcessing}
              className="px-5 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-2xl shadow-lg shadow-emerald-600/30 transition-all flex items-center gap-1.5 disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">{t('sendBtn')}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
